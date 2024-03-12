migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qswfr5ky",
    "name": "scandata",
    "type": "json",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSize": 2000000
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xeb56gcfepjsjb4")

  // remove
  collection.schema.removeField("qswfr5ky")

  return dao.saveCollection(collection)
})
