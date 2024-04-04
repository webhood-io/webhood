migrate((db) => {
  const dao = new Dao(db)
  const totalAdmins = dao.totalAdmins()
  if (totalAdmins > 0) {
    return
  }

  const admin = new Admin()
  admin.email = "admin@localhost"
  admin.password = [...Array(30)].map(() => (Math.random() +1).toString(36)[2]).join('')

  return dao.saveAdmin(admin)
}, (db) => {
  const dao = new Dao(db)
  const admin = dao.findAdminByEmail("admin@localhost")
  if(!admin) {
    return
  }
  return dao.deleteAdmin(admin)
})
