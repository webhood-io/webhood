migrate((db) => {
    const collection = new Collection({
      "id": "p52hzwk25m1kxy8",
      "created": "2024-02-20 12:48:50.607Z",
      "updated": "2024-02-20 12:48:50.607Z",
      "name": "scanstats",
      "type": "view",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "slatvton",
          "name": "count_items",
          "type": "number",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "noDecimal": false
          }
        },
        {
          "system": false,
          "id": "iuj4eroc",
          "name": "status",
          "type": "select",
          "required": false,
          "presentable": false,
          "unique": false,
          "options": {
            "maxSelect": 1,
            "values": [
              "pending",
              "running",
              "error",
              "done",
              "queued"
            ]
          }
        }
      ],
      "indexes": [],
      "listRule": "@request.auth.id != ''",
      "viewRule": "@request.auth.id != ''",
      "createRule": null,
      "updateRule": null,
      "deleteRule": null,
      "options": {
        "query": "SELECT COUNT(id) as count_items, status, (ROW_NUMBER() OVER()) as id\nFROM scans\nGROUP BY status"
      }
    });
  
    return Dao(db).saveCollection(collection);
  }, (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("p52hzwk25m1kxy8");
  
    return dao.deleteCollection(collection);
  })
  