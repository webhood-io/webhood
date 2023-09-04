migrate((db) => {
  const collection = new Collection({
    "id": "4mw0oi15o9akrgh",
    "created": "2023-05-02 19:03:11.623Z",
    "updated": "2023-05-02 19:03:11.623Z",
    "name": "scanners",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "kut374js",
        "name": "config",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": null,
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("4mw0oi15o9akrgh");

  return dao.deleteCollection(collection);
})
