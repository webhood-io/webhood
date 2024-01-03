package main

import (
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/webhood-io/backend/webhood"
)

// RequireAdminAuth middleware requires a request to have
// a valid admin Authorization header.

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
	create_token_cmd.Flags().StringP("scannerid", "i", "", "scanner id (optional)")
	app.RootCmd.AddCommand(create_token_cmd)
	create_user_cmd := webhood.CreateUserCmd(app)
	create_user_cmd.Flags().StringP("username", "u", "", "username")
	create_user_cmd.Flags().StringP("password", "p", "", "password")
	create_user_cmd.Flags().StringP("email", "e", "", "email (optional)")
	create_user_cmd.MarkFlagRequired("username")
	create_user_cmd.MarkFlagRequired("password")
	app.RootCmd.AddCommand(create_user_cmd)

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
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
