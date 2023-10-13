import express from 'express'

const adminRoute=express()
import { login,manageUsers,manageAction } from '../../Controller/adminController/adminController.js'


adminRoute.post('/admin/login',login)
adminRoute.get('/admin/users',manageUsers)
adminRoute.patch('/admin/manageuser',manageAction)

export default adminRoute