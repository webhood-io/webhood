migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("08gx30km4eghscl")

  collection.options = {
    "allowEmailAuth": false,
    "allowOAuth2Auth": false,
    "allowUsernameAuth": false,
    "exceptEmailDomains": [],
    "manageRule": "@request.auth.role = 'admin'",
    "minPasswordLength": 8,
    "onlyEmailDomains": [],
    "onlyVerified": false,
    "requireEmail": false
  }

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wrdpd08g",
    "name": "config",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "4mw0oi15o9akrgh",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("08gx30km4eghscl")

  collection.options = {
    "allowEmailAuth": false,
    "allowOAuth2Auth": false,
    "allowUsernameAuth": false,
    "exceptEmailDomains": [],
    "manageRule": "@request.auth.role = 'admin'",
    "minPasswordLength": 8,
    "onlyEmailDomains": [],
    "requireEmail": false
  }

  // remove
  collection.schema.removeField("wrdpd08g")

  return dao.saveCollection(collection)
})
