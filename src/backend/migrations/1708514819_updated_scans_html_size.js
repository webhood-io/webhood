migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5kqujuy9",
    "name": "html",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 99,
      "maxSize": 20000000,
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
    "id": "5kqujuy9",
    "name": "html",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 99,
      "maxSize": 5242880,
      "protected": true
    }
  }))

  return dao.saveCollection(collection)
})
