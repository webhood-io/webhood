migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dkhxu2yf",
    "name": "screenshots",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "image/png"
      ],
      "thumbs": [
        "96x0",
        "256x0",
        "960x0"
      ],
      "maxSelect": 99,
      "maxSize": 5242880,
      "protected": true
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dkhxu2yf",
    "name": "screenshots",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [
        "image/png"
      ],
      "thumbs": [],
      "maxSelect": 99,
      "maxSize": 5242880,
      "protected": true
    }
  }))

  return dao.saveCollection(collection)
})
