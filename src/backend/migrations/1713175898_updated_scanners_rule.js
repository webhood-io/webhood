migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4mw0oi15o9akrgh")

  // when isCloudManaged is set, admin users cannot modify isCloudManaged field.
  collection.updateRule = "(@request.data.isCloudManaged = null || @request.data.isCloudManaged = isCloudManaged) && @request.auth.role = 'admin'"
  collection.createRule = "@request.auth.role = 'admin'"
  collection.deleteRule = "(@request.data.isCloudManaged = null || @request.data.isCloudManaged = isCloudManaged) && @request.auth.role = 'admin'"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("4mw0oi15o9akrgh")

  collection.updateRule = "@request.auth.role = 'admin'"
  collection.createRule = null
  collection.deleteRule = null

  return dao.saveCollection(collection)
})
