migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jhgy6ntr",
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
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jhgy6ntr",
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
        "done"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
