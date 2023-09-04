migrate((db) => {
  const collection = new Collection({
    "id": "08gx30km4eghscl",
    "created": "2023-05-02 19:03:11.623Z",
    "updated": "2023-05-02 19:03:11.623Z",
    "name": "api_tokens",
    "type": "auth",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "8rphw9ci",
        "name": "role",
        "type": "select",
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "scanner",
            "api_user"
          ]
        }
      },
      {
        "system": false,
        "id": "nl9rbqwn",
        "name": "expires",
        "type": "date",
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.role = 'admin'",
    "viewRule": "@request.auth.id = id || @request.auth.role = 'admin'",
    "createRule": "@request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'",
    "options": {
      "allowEmailAuth": false,
      "allowOAuth2Auth": false,
      "allowUsernameAuth": false,
      "exceptEmailDomains": [],
      "manageRule": "@request.auth.role = 'admin'",
      "minPasswordLength": 8,
      "onlyEmailDomains": [],
      "requireEmail": false
    }
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("08gx30km4eghscl");

  return dao.deleteCollection(collection);
})
