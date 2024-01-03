migrate((db) => {
  const dao = new Dao(db)
  const obj = dao.findRecordById("api_tokens", "mzven27v6pg29mx")
  obj.set('config', '0lk9lksaydebgvx')


  return dao.saveRecord(obj)
  }, (db) => {
    const dao = new Dao(db)

    const obj = dao.findRecordById("api_tokens", "mzven27v6pg29mx")
  
    return dao.set(obj, 'config', null)
  }
)
