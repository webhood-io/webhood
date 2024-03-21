migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ph9beqde",
    "name": "files",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 99,
      "maxSize": 50000000,
      "protected": true
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // remove
  collection.schema.removeField("ph9beqde")

  return dao.saveCollection(collection)
})
