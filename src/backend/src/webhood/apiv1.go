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
	"github.com/pocketbase/pocketbase/resolvers"
	"github.com/pocketbase/pocketbase/tools/search"
	"github.com/pocketbase/pocketbase/tools/types"
	"github.com/spf13/cast"
)

type scansApi struct {
	app core.App
}

var v1fields = []string{
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
	"scandata",
	"options",
}

type scanRecordV1 struct {
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
			options: data.options,
			scandata: data.scandata,
	*/
	Id          string                  `db:"id" json:"id"`
	Slug        string                  `db:"slug" json:"slug"`
	Url         string                  `db:"url" json:"url"`
	Status      string                  `db:"status" json:"status"`
	Created     string                  `db:"created" json:"created"`
	Updated     string                  `db:"updated" json:"updated"`
	Error       string                  `db:"error" json:"errorMessage"`
	Html        types.JsonArray[string] `db:"html" json:"html"`
	Screenshots types.JsonArray[string] `db:"screenshots" json:"screenshots"`
	Files       types.JsonArray[string] `db:"files" json:"files"`
	DoneAt      string                  `db:"done_at" json:"done_at"`
	FinalUrl    string                  `db:"final_url" json:"final_url"`
	Options     types.JsonMap           `db:"options" json:"options"`
	ScanData    types.JsonMap           `db:"scandata" json:"scanData"`
}

func BindScansApiV1(app core.App, rg *echo.Group) {
	api := scansApi{app: app}

	subGroup := rg.Group(
		"/v1",
		apis.ActivityLogger(app),
	)

	subGroup.GET("/scans", api.list, apis.RequireRecordAuth("users", "api_tokens"), RequireCustomRoleAuth("scanner"))
	subGroup.GET("/scans/:id/trace", api.trace, LoadScanRecordContext(app), apis.RequireRecordAuth("users", "api_tokens"), RequireCustomRoleAuth("scanner"))
	subGroup.GET("/scans/:id/html", api.html, LoadScanRecordContext(app), apis.RequireRecordAuth("users", "api_tokens"), RequireCustomRoleAuth("scanner"))
	subGroup.GET("/scans/:id/screenshot", api.screenshot, LoadScanRecordContext(app), apis.RequireRecordAuth("users", "api_tokens"), RequireCustomRoleAuth("scanner"))
	subGroup.GET("/scans/:id", api.get, apis.RequireRecordAuth("users", "api_tokens"), RequireCustomRoleAuth("scanner"))
	subGroup.POST("/scans", api.post, apis.RequireRecordAuth("users", "api_tokens"), RequireCustomRoleAuth("scanner"))
}

func (api *scansApi) list(c echo.Context) error {
	dao := api.app.Dao()
	collection, err := dao.FindCollectionByNameOrId("scans")
	if err != nil || collection == nil {
		return apis.NewNotFoundError("", err)
	}
	limit := c.QueryParam("limit")
	offset := c.QueryParam("offset")
	sort := c.QueryParam("sort")
	filter := c.QueryParam("filter")
	requestInfo := apis.RequestInfo(c)

	if requestInfo.Admin == nil && collection.ListRule == nil {
		// only admins can access if the rule is nil
		return apis.NewForbiddenError("Only admins can perform this action.", nil)
	}
	resolver := resolvers.NewRecordFieldResolver(
		dao,
		collection,
		nil,
		true,
	)

	query := dao.DB().Select(
		v1fields...,
	).From(collection.Name)

	if filter != "" {
		expr, err := search.FilterData(filter).BuildExpr(resolver)
		if err != nil {
			return apis.NewBadRequestError("Invalid filter expression.", err)
		}
		query.AndWhere(expr)
	}
	if sort != "" {
		for _, sortField := range search.ParseSortFromString(sort) {
			expr, err := sortField.BuildExpr(resolver)
			if err != nil {
				return apis.NewBadRequestError("Invalid sort expression.", err)
			}
			if expr != "" {
				query.AndOrderBy(expr)
			}
		}
	}

	resolver.UpdateQuery(query)

	if cast.ToInt(offset) > 0 {
		query.Offset(cast.ToInt64(offset))
	}

	if cast.ToInt(limit) > 0 {
		query.Limit(cast.ToInt64(limit))
	}

	records := []scanRecordV1{}
	query.All(&records)

	return c.JSON(http.StatusOK, records)
}

func serveFile(c echo.Context, app core.App, baseFilesPath string, fileUrl string) error {
	originalPath := baseFilesPath + "/" + fileUrl
	servedPath := originalPath
	servedName := fileUrl

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
}

func (api *scansApi) trace(c echo.Context) error {
	record := c.Get("scanRecord").(*models.Record)
	baseFilesPath := record.BaseFilesPath()

	fileUrls := record.Get("html").([]string)
	if len(fileUrls) != 2 {
		return apis.NewNotFoundError("Trace is not available for this scan", nil)
	}
	fileUrl := fileUrls[1]
	return serveFile(c, api.app, baseFilesPath, fileUrl)
}

func (api *scansApi) html(c echo.Context) error {
	record := c.Get("scanRecord").(*models.Record)
	baseFilesPath := record.BaseFilesPath()

	fileUrls := record.Get("html").([]string)
	if len(fileUrls) < 1 {
		return apis.NewNotFoundError("HTML is not available for this scan", nil)
	}
	fileUrl := fileUrls[0]
	return serveFile(c, api.app, baseFilesPath, fileUrl)
}

func (api *scansApi) screenshot(c echo.Context) error {
	record := c.Get("scanRecord").(*models.Record)
	baseFilesPath := record.BaseFilesPath()

	fileUrls := record.Get("screenshots").([]string)
	if len(fileUrls) < 1 {
		return apis.NewNotFoundError("Screenshot is not available for this scan", nil)
	}
	fileUrl := fileUrls[0]
	return serveFile(c, api.app, baseFilesPath, fileUrl)
}

func (api *scansApi) post(c echo.Context) error {
	app := api.app
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
		log.Println("Error parsing url: " + err.Error())
		hostname = ""
	} else {
		hostname = u.Hostname()
	}
	form.LoadData(map[string]any{
		"slug":   hostname + "-" + cast.ToString(time.Now().Unix()),
		"status": "pending",
	})

	event := new(core.RecordCreateEvent)
	event.HttpContext = c
	event.Collection = collection
	event.Record = record

	// validate and submit (internally it calls app.Dao().SaveRecord(record) in a transaction)
	if err := form.Submit(); err != nil {
		log.Println("Error creating record: " + err.Error())
		return apis.NewApiError(401, "Error creating record.", nil)
	}
	app.OnRecordAfterCreateRequest().Trigger(event, func(e *core.RecordCreateEvent) error {
		return nil
	})
	query := app.Dao().DB().Select(
		v1fields...,
	).From("scans").Where(dbx.HashExp{"id": record.Id})
	recordResult := scanRecordV1{}
	query.One(&recordResult)

	c.Response().Header().Set("Location", "/api/beta/scans/"+record.Id)
	return c.JSON(http.StatusAccepted, recordResult)
}

func (api *scansApi) get(c echo.Context) error {
	app := api.app
	recordId := c.PathParam("id")
	if recordId == "" {
		return apis.NewNotFoundError("", nil)
	}
	query := app.Dao().DB().Select(
		fields...,
	).From("scans").Where(dbx.HashExp{"id": recordId})
	record := scanRecord{}
	query.One(&record)
	if record.Id == "" {
		return apis.NewNotFoundError("", nil)
	}
	if record.Status == "pending" || record.Status == "running" {
		c.Response().Header().Set("Location", "/api/beta/scans/"+record.Id)
		return c.JSON(http.StatusAccepted, record)
	} else {
		return c.JSON(http.StatusOK, record)
	}
}
