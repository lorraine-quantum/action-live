const route = require("express").Router();
const {editUser, deleteUser}=require('../controllers/modifyUserC')

route.put('/edit-user',editUser)
route.delete('/delete-user/:id',deleteUser)

module.exports=route