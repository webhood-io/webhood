package webhood

import (
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/types"
	"github.com/spf13/cast"
)

var fields = []string{
	"id",
	"slug",
	"url",
	"status",
	"created",
	"updated",
	"error",
	"html",
	"screenshots",
	"done_at",
	"final_url",
}

func RequireCustomRoleAuth(roleName string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
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

func WebhoodApiMiddleware(app core.App) []echo.MiddlewareFunc {
	return []echo.MiddlewareFunc{
		apis.ActivityLogger(app),
		RequireCustomRoleAuth("scanner"), // TODO: role auths
	}
}

type scanRecord struct {
	/*
			id: data.id,
		    slug: data.slug,
		    url: data.url,
		    status: data.status,
		    created: data.created,
		    updated: data.updated,
		    error: data.error,
		    html: data.html,
		    screenshots: data.screenshots,
		    done_at: data.done_at,
		    final_url: data.final_url,
	*/
	Id          string                  `db:"id" json:"id"`
	Slug        string                  `db:"slug" json:"slug"`
	Url         string                  `db:"url" json:"url"`
	Status      string                  `db:"status" json:"status"`
	Created     string                  `db:"created" json:"created"`
	Updated     string                  `db:"updated" json:"updated"`
	Error       string                  `db:"error" json:"error"`
	Html        types.JsonArray[string] `db:"html" json:"html"`
	Screenshots types.JsonArray[string] `db:"screenshots" json:"screenshots"`
	DoneAt      string                  `db:"done_at" json:"done_at"`
	FinalUrl    string                  `db:"final_url" json:"final_url"`
}

func ScansGetRoute(app core.App) echo.Route {
	return echo.Route{
		Method: http.MethodGet,
		Path:   "/api/beta/scans",
		Handler: func(c echo.Context) error {
			dao := app.Dao()
			collection, err := dao.FindCollectionByNameOrId("scans")
			if err != nil || collection == nil {
				return apis.NewNotFoundError("", err)
			}
			status := c.QueryParam("status")
			limit := c.QueryParam("limit")
			requestInfo := apis.RequestInfo(c)

			if requestInfo.Admin == nil && collection.ListRule == nil {
				// only admins can access if the rule is nil
				return apis.NewForbiddenError("Only admins can perform this action.", nil)
			}

			query := dao.DB().Select(
				fields...,
			).From(collection.Name).OrderBy("created DESC")
			// if status is not empty

			if status != "" {
				query = query.Where(dbx.HashExp{"status": status})
			}
			// if limit is not empty
			if limit != "" {
				query = query.Limit(cast.ToInt64(limit))
			}
			records := []scanRecord{}
			query.All(&records)

			return c.JSON(http.StatusOK, records)
		},
		Middlewares: WebhoodApiMiddleware(app),
	}
}

func ScansPostRoute(app core.App) echo.Route {
	return echo.Route{
		Method: http.MethodPost,
		Path:   "/api/beta/scans",
		Handler: func(c echo.Context) error {
			dao := app.Dao()
			collection, err := dao.FindCollectionByNameOrId("scans")
			if err != nil || collection == nil {
				return apis.NewNotFoundError("", err)
			}
			record := models.NewRecord(collection)

			form := forms.NewRecordUpsert(app, record)

			form.LoadRequest(c.Request(), "")
			var hostname string
			u, err := url.Parse(form.Data()["url"].(string))
			if err != nil {
				log.Fatal(err)
				hostname = ""
			} else {
				hostname = u.Hostname()
			}
			form.LoadData(map[string]any{
				"slug":   hostname + "-" + cast.ToString(time.Now().Unix()),
				"status": "pending",
			})
			// validate and submit (internally it calls app.Dao().SaveRecord(record) in a transaction)
			if err := form.Submit(); err != nil {
				log.Println("Error creating record: " + err.Error())
				return apis.NewApiError(401, "Error creating record.", nil)
			}
			query := app.Dao().DB().Select(
				fields...,
			).From("scans").Where(dbx.HashExp{"id": record.Id})
			recordResult := scanRecord{}
			query.One(&recordResult)

			c.Response().Header().Set("Location", "/api/beta/scans/"+record.Id)
			return c.JSON(http.StatusAccepted, recordResult)
		},
		Middlewares: WebhoodApiMiddleware(app),
	}
}

func ScansGetByIdRoute(app core.App) echo.Route {
	return echo.Route{
		Method: http.MethodGet,
		Path:   "/api/beta/scans/:id",
		Handler: func(c echo.Context) error {
			recordId := c.PathParam("id")
			if recordId == "" {
				return apis.NewNotFoundError("", nil)
			}
			query := app.Dao().DB().Select(
				fields...,
			).From("scans").Where(dbx.HashExp{"id": recordId})
			record := scanRecord{}
			query.One(&record)
			// if record is not found
			if record.Id == "" {
				return apis.NewNotFoundError("", nil)
			}
			if record.Status == "pending" || record.Status == "running" {
				c.Response().Header().Set("Location", "/api/beta/scans/"+record.Id)
				return c.JSON(http.StatusAccepted, record)
			} else {
				return c.JSON(http.StatusOK, record)
			}
		},
		Middlewares: WebhoodApiMiddleware(app),
	}
}

func ScansGetScreenshotRoute(app core.App) echo.Route {
	return echo.Route{
		Method: http.MethodGet,
		Path:   "/api/beta/scans/:id/screenshot",
		Handler: func(c echo.Context) error {
			recordId := c.PathParam("id")
			if recordId == "" {
				return apis.NewNotFoundError("", nil)
			}
			record, fetchErr := app.Dao().FindRecordById("scans", recordId)
			if fetchErr != nil {
				println("Error fetching scan record: " + fetchErr.Error())
				return (fetchErr)
			}
			baseFilesPath := record.BaseFilesPath()
			screenshotUrl := record.Get("screenshots").([]string)[0]
			originalPath := baseFilesPath + "/" + screenshotUrl
			servedPath := originalPath
			servedName := screenshotUrl

			fs, err := app.NewFilesystem()
			if err != nil {
				return apis.NewBadRequestError("Filesystem initialization failure.", err)
			}
			defer fs.Close()

			c.Response().Header().Del("X-Frame-Options")

			if err := fs.Serve(c.Response(), c.Request(), servedPath, servedName); err != nil {
				return apis.NewNotFoundError("", err)
			}
			return nil
		},
		Middlewares: WebhoodApiMiddleware(app),
	}
}
