migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4mw0oi15o9akrgh")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kd1hgvnt",
    "name": "name",
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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4mw0oi15o9akrgh")

  // remove
  collection.schema.removeField("kd1hgvnt")

  return dao.saveCollection(collection)
})
