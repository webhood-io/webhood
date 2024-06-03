package webhood

import (
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
)

func RequireCustomRoleAuth(roleName string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Allow admin to pass
			admin, _ := c.Get("admin").(*models.Admin)
			if admin != nil {
				return next(c)
			}
			// Else check for the role
			record, _ := c.Get("authRecord").(*models.Record)
			if record == nil {
				return apis.NewUnauthorizedError("The request requires valid authorization token to be set.", nil)
			}
			if record.Get("role").(string) != roleName {
				return apis.NewUnauthorizedError("The request requires valid role authorization token to be set.", nil)
			}

			return next(c)
		}
	}
}

func LoadScanRecordContext(app core.App) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			recordId := c.PathParam("id")
			if recordId == "" {
				return apis.NewNotFoundError("", nil)
			}
			record, fetchErr := app.Dao().FindRecordById("scans", recordId)
			if fetchErr != nil {
				return fetchErr
			}
			c.Set("scanRecord", record)
			return next(c)
		}
	}
}
