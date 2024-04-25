/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4mw0oi15o9akrgh")

  // add apiToken
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wivrctle",
    "name": "apiToken",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // add useCloudApi
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ngmdde6i",
    "name": "useCloudApi",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // add isCloudManaged
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "5jtbirvi",
    "name": "isCloudManaged",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4mw0oi15o9akrgh")

  // remove
  collection.schema.removeField("wivrctle")
  collection.schema.removeField("5jtbirvi")
  collection.schema.removeField("ngmdde6i")

  return dao.saveCollection(collection)
})
