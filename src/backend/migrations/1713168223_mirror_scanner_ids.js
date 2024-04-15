/// <reference path="../src/pb_data/types.d.ts" />
/* Change all api_token items to match their config (i.e. scanners) id 
This is done so that callers will easily find api_token matching scanner id
*/
migrate((db) => {
  const dao = new Dao(db)
  records = dao.findRecordsByFilter("api_tokens", "config!=null")
  records.forEach(record => {
    const configId = record.get("config")
    db.newQuery(`UPDATE api_tokens SET id = '${configId}' WHERE id = '${record.id}'`)
    .execute()
  }); 
  return
}, (db) => {
  return 
})
