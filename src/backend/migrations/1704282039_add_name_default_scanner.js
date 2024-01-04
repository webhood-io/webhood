migrate((db) => {
    const dao = new Dao(db)
    const obj = dao.findRecordById("api_tokens", "mzven27v6pg29mx")

    obj.set('name', 'internal scanner')
  
    return dao.saveRecord(obj)
    }, (db) => {
      const dao = new Dao(db)
  
      const obj = dao.findRecordById("api_tokens", "mzven27v6pg29mx")
      obj.set('name', null)

      return dao.saveRecord(obj)
    }
  )
  