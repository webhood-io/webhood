migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("api_tokens")
  const obj = new Record(collection)

  obj.set('id', 'mzven27v6pg29mx')
  obj.set('username', 'scanner1')
  obj.set("role", "scanner")

  return dao.saveRecord(obj)
  }, (db) => {
    const dao = new Dao(db)

    const obj = dao.findRecordById("api_tokens", "mzven27v6pg29mx")
  
    return dao.deleteRecord(obj)
  }
)
