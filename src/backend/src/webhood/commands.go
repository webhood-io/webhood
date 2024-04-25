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

func CreateScannerMatchingApiToken(app core.App, scannerRecord *models.Record) (*models.Record, error) {
	dao := app.Dao()
	apiTokensCollection, error := dao.FindCollectionByNameOrId("api_tokens")
	if error != nil {
		println("Error fetching collection: " + error.Error())
		return nil, error
	}
	apiTokenRecord := models.NewRecord(apiTokensCollection)
	apiTokenRecord.Set("id", scannerRecord.Id)       // id is mirrored
	apiTokenRecord.Set("username", scannerRecord.Id) // username is required
	apiTokenRecord.Set("role", "scanner")
	apiTokenRecord.Set("config", scannerRecord.Id)
	apiTokenRecord.RefreshTokenKey() // tokenKey is unique for some reason, so we need to refresh it to make it unique (i.e. not null which is not unique)

	saveError := dao.SaveRecord(apiTokenRecord)
	if saveError != nil {
		return nil, saveError
	}
	return apiTokenRecord, nil
}

func CreateScannerToken(app core.App) *cobra.Command {
	return &cobra.Command{
		Use: "create_scanner_token",
		Run: func(command *cobra.Command, args []string) {
			scannerId, _ := command.Flags().GetString("scannerid")
			username, _ := command.Flags().GetString("username")
			authRecord := &models.Record{}
			fetchErr := error(nil)
			dao := app.Dao()
			if username != "" {
				scannerRecord, err := dao.FindFirstRecordByData("scanners", "name", username)
				if err != nil {
					println("Could not find the scanner by username" + err.Error())
					return
				}
				authRecord, fetchErr = app.Dao().FindRecordById("api_tokens", scannerRecord.Id)
			} else {
				authRecord, fetchErr = app.Dao().FindRecordById("api_tokens", scannerId)
			}

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

func CreateScanner(app core.App) *cobra.Command {
	return &cobra.Command{
		Use: "create_scanner",
		Run: func(command *cobra.Command, args []string) {
			username := command.Flag("username").Value.String()
			dao := app.Dao()
			// Check if scanner already exists
			scannerAlreadyExists, _ := dao.FindFirstRecordByData("scanners", "name", username)
			if scannerAlreadyExists != nil {
				println("Scanner already exists with username: " + username)
				return
			}
			// Create Scanner config
			scannersCollection, error := dao.FindCollectionByNameOrId("scanners")
			if error != nil {
				println("Error fetching collection: " + error.Error())
				return
			}
			configRecord := models.NewRecord(scannersCollection)
			configRecord.Set("config", "{}")
			configRecord.Set("name", username)

			saveError := dao.SaveRecord(configRecord)
			if saveError != nil {
				println("Error creating scanner: " + saveError.Error())
				return
			}

			CreateScannerMatchingApiToken(app, configRecord)
			println("New scanner config with id: " + configRecord.Id)

			println("New scanner created with id: "+configRecord.Id, "and username: "+username)
		},
	}
}
