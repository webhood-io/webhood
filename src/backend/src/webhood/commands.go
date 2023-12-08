package webhood

import (
	"errors"

	"github.com/golang-jwt/jwt/v4"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tokens"
	"github.com/pocketbase/pocketbase/tools/security"
	"github.com/spf13/cobra"
)

func NewScannerAuthToken(app core.App, record *models.Record) (string, error) {
	if !record.Collection().IsAuth() {
		return "", errors.New("the record is not from an auth collection")
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

func CreateUserCmd(app core.App) *cobra.Command {
	return &cobra.Command{
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
}

func CreateScannerToken(app core.App) *cobra.Command {
	return &cobra.Command{
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
	}
}
