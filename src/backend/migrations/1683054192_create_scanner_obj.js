migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("scanners")
  const obj = new Record(collection)

  obj.set('config', '{}')
  obj.set('id', '0lk9lksaydebgvx')

  return dao.saveRecord(obj)
  }, (db) => {
    const dao = new Dao(db)

    const obj = dao.findRecordById("scanners", "0lk9lksaydebgvx")
  
    return dao.deleteRecord(obj)
  }
)
