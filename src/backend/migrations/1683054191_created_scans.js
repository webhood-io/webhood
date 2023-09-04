migrate((db) => {
  const collection = new Collection({
    "id": "xeb56gcfepjsjb4",
    "created": "2023-05-02 19:03:11.624Z",
    "updated": "2023-05-02 19:03:11.624Z",
    "name": "scans",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "j4i7ejyr",
        "name": "done_at",
        "type": "date",
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "lw2qo7wp",
        "name": "error",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "5kqujuy9",
        "name": "html",
        "type": "file",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 99,
          "maxSize": 5242880,
          "mimeTypes": [],
          "thumbs": [],
          "protected": true
        }
      },
      {
        "system": false,
        "id": "4z3wftha",
        "name": "final_url",
        "type": "url",
        "required": false,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "system": false,
        "id": "wvjfijb0",
        "name": "slug",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "jhgy6ntr",
        "name": "status",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "pending",
            "running",
            "error",
            "done"
          ]
        }
      },
      {
        "system": false,
        "id": "yncjxasc",
        "name": "url",
        "type": "url",
        "required": false,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "system": false,
        "id": "dkhxu2yf",
        "name": "screenshots",
        "type": "file",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 99,
          "maxSize": 5242880,
          "mimeTypes": [
            "image/png"
          ],
          "thumbs": [],
          "protected": true
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_QVLLCWB` ON `scans` (`slug`)"
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.id != ''",
    "updateRule": "@request.auth.id != ''",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4");

  return dao.deleteCollection(collection);
})
