package main

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tokens"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/spf13/cobra"
)

func NewScannerAuthToken(app core.App, record *models.Record) (string, error) {
	if !record.Collection().IsAuth() {
		return "", errors.New("The record is not from an auth collection.")
	}
	record.RefreshTokenKey() // invalidate old tokens every time new token is generated
	app.Dao().SaveRecord(record)

	return security.NewToken(
		jwt.MapClaims{
			"id":           record.Id,
			"type":         tokens.TypeAuthRecord,
			"collectionId": record.Collection().Id,
		},
		(record.TokenKey() + app.Settings().RecordAuthToken.Secret),
		ScannerAuthTokenValidDuration,
	)
}

// RequireAdminAuth middleware requires a request to have
// a valid admin Authorization header.
func RequireCustomAdminRoleAuth() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			record, _ := c.Get("authRecord").(*models.Record)
			if record == nil {
				return apis.NewUnauthorizedError("The request requires valid authorization token to be set.", nil)
			}
			if record.Get("role").(string) != "admin" {
				return apis.NewUnauthorizedError("The request requires valid admin authorization token to be set.", nil)
			}

			return next(c)
		}
	}
}

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

	app.RootCmd.AddCommand(&cobra.Command{
		Use: "create_scanner_token",
		Run: func(command *cobra.Command, args []string) {
			authRecord, fetchErr := app.Dao().FindRecordById("api_tokens", "mzven27v6pg29mx")
			if fetchErr != nil {
				println("Error fetching auth record: " + fetchErr.Error())
				return
			}
			token, tokenFetchErr := NewScannerAuthToken(app, authRecord)
			if tokenFetchErr != nil {
				println("Error creating token: " + tokenFetchErr.Error())
				return
			}
			print("SCANNER_TOKEN=" + token + "\n")
		},
	})
	create_user_cmd := &cobra.Command{
		Use: "create_user",
		Run: func(command *cobra.Command, args []string) {
			username, _ := command.Flags().GetString("username")
			password, _ := command.Flags().GetString("password")
			email, _ := command.Flags().GetString("email")
			dao := app.Dao()
			collection, error := dao.FindCollectionByNameOrId("users")
			if error != nil {
				println("Error fetching collection: " + error.Error())
				return
			}
			record := models.NewRecord(collection)

			record.Set("username", username)
			record.SetPassword(password)
			record.Set("role", "admin")
			// set email if provided
			if email != "" {
				record.Set("email", email)
			}
			record.RefreshTokenKey()

			saveError := dao.SaveRecord(record)
			if saveError != nil {
				println("Error creating user: " + saveError.Error())
				return
			}
			println("New user created with id: " + record.Id)
		},
	}
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
				token, tokenFetchErr := NewScannerAuthToken(app, authRecord)
				if tokenFetchErr != nil {
					println("Error creating token: " + tokenFetchErr.Error())
					return (tokenFetchErr)
				}
				// if not error
				return c.JSON(http.StatusOK, map[string]any{
					"token": token,
					"id":    authRecord.Id,
					// return current datetime + ScannerAuthTokenValidDuration in RFC3339 format
					"expires": time.Now().Add(time.Second * ScannerAuthTokenValidDuration).Format(time.RFC3339),
				})
			},
			Middlewares: []echo.MiddlewareFunc{
				apis.ActivityLogger(app),
				RequireCustomAdminRoleAuth(),
			},
		})

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
