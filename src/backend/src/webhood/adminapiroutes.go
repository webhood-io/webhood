package webhood

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

func WebhoodAdminApiMiddleware(app core.App) []echo.MiddlewareFunc {
	return []echo.MiddlewareFunc{
		apis.ActivityLogger(app),
		apis.RequireRecordAuth("users"),
		RequireCustomRoleAuth("admin"),
	}
}
func CreateScannerTokenRoute(app core.App) echo.Route {
	return echo.Route{
		Method: http.MethodPost,
		Path:   "/api/beta/admin/scanner/:id/token",
		Handler: func(c echo.Context) error {
			recordId := c.PathParam("id")
			dao := app.Dao()
			authRecord, fetchErr := dao.FindRecordById("api_tokens", recordId)
			if fetchErr != nil {
				return apis.NewNotFoundError("could not find scanner", nil)
			}
			token, tokenFetchErr := NewScannerAuthToken(app, authRecord)
			if tokenFetchErr != nil {
				println("Error creating token: " + tokenFetchErr.Error())
				return apis.NewApiError(http.StatusInternalServerError, "could not create token", nil)
			}
			return c.JSON(http.StatusOK, map[string]string{"token": token})
		},
		Middlewares: WebhoodAdminApiMiddleware(app),
	}
}
