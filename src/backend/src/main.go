package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/webhood-io/backend/webhood"
)

func main() {
	app := pocketbase.New()

	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir: "pb_migrations",
	})

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate:  true, // auto creates migration files when making collection changes
		TemplateLang: migratecmd.TemplateLangJS,
		Dir:          "pb_migrations",
	})

	create_token_cmd := webhood.CreateScannerToken(app)
	create_token_cmd.Flags().StringP("scannerid", "i", "", "scanner id")
	create_token_cmd.MarkFlagRequired("scannerid")
	create_token_cmd.Flags().StringP("username", "u", "", "scanner name (optional)")
	app.RootCmd.AddCommand(create_token_cmd)

	create_user_cmd := webhood.CreateUserCmd(app)
	create_user_cmd.Flags().StringP("username", "u", "", "username")
	create_user_cmd.Flags().StringP("password", "p", "", "password")
	create_user_cmd.Flags().StringP("email", "e", "", "email (optional)")
	create_user_cmd.MarkFlagRequired("username")
	create_user_cmd.MarkFlagRequired("password")
	app.RootCmd.AddCommand(create_user_cmd)

	create_scanner_cmd := webhood.CreateScanner(app)
	create_scanner_cmd.Flags().StringP("username", "u", "", "friendly name")
	create_scanner_cmd.MarkFlagRequired("username")
	app.RootCmd.AddCommand(create_scanner_cmd)

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.AddRoute(echo.Route{
			Method: http.MethodPost,
			Path:   "/api/token/:id",
			Handler: func(c echo.Context) error {
				recordId := c.PathParam("id")
				if recordId == "" {
					return apis.NewNotFoundError("", nil)
				}
				authRecord, fetchErr := app.Dao().FindRecordById("api_tokens", recordId)
				if fetchErr != nil {
					println("Error fetching auth record: " + fetchErr.Error())
					return (fetchErr)
				}
				token, tokenFetchErr := webhood.NewScannerAuthToken(app, authRecord)
				if tokenFetchErr != nil {
					println("Error creating token: " + tokenFetchErr.Error())
					return (tokenFetchErr)
				}
				// if not error
				return c.JSON(http.StatusOK, map[string]any{
					"token": token,
					"id":    authRecord.Id,
					// return current datetime + ScannerAuthTokenValidDuration in RFC3339 format
					"expires": time.Now().Add(time.Second * webhood.ScannerAuthTokenValidDuration).Format(time.RFC3339),
				})
			},
			Middlewares: []echo.MiddlewareFunc{
				apis.ActivityLogger(app),
				webhood.RequireCustomRoleAuth("admin"),
			},
		})
		e.Router.AddRoute(webhood.ScansGetScreenshotRoute(app))
		e.Router.AddRoute(webhood.ScansGetByIdRoute(app))
		e.Router.AddRoute(webhood.ScansPostRoute(app))
		e.Router.AddRoute(webhood.ScansGetRoute(app))
		e.Router.AddRoute(webhood.CreateScannerTokenRoute(app))
		return nil
	})
	// Add metadata to scans record on after it has been created
	app.OnRecordAfterCreateRequest("scans").Add(func(e *core.RecordCreateEvent) error {
		record, _ := e.HttpContext.Get("authRecord").(*models.Record)
		var initiatedByType string
		if record.TableName() == "users" {
			initiatedByType = "user"
		} else {
			initiatedByType = "api"
		}
		e.Record.Set("scandata", map[string]map[string]string{"meta": {"initiatedBy": record.Username(), "initiatedByType": initiatedByType}})
		dao := app.Dao()
		//save
		err := dao.SaveRecord(e.Record)
		if err != nil {
			fmt.Println("Error saving record")
		}
		return nil
	})
	// When scanner record is created, create api token record (auth)
	app.OnRecordAfterCreateRequest("scanners").Add(func(e *core.RecordCreateEvent) error {
		scannerRecord := e.Record
		_, error := webhood.CreateScannerMatchingApiToken(app, scannerRecord)
		if error != nil {
			println("Error creating scanner: " + error.Error())
			return error
		}
		return nil
	})
	// When scanner is deleted, delete api token
	app.OnRecordBeforeDeleteRequest("scanners").Add(func(e *core.RecordDeleteEvent) error {
		scannerRecord := e.Record
		dao := app.Dao()
		apiTokenRecord, err := dao.FindRecordById("api_tokens", scannerRecord.Id)
		if err != nil {
			return err
		}
		if apiTokenRecord == nil {
			return errors.New("could not find apitoken")
		}
		deleteErr := dao.DeleteRecord(apiTokenRecord)
		if deleteErr != nil {
			println("Error deleting scanner: " + deleteErr.Error())
			return deleteErr
		}
		return nil
	})
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
