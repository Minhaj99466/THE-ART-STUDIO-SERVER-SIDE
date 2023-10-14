import express from 'express'

const adminRoute=express()
import { login,manageUsers,manageAction,manageArtist,manageArtistAction } from '../../Controller/adminController/adminController.js'


adminRoute.post('/admin/login',login)
adminRoute.get('/admin/users',manageUsers)
adminRoute.get('/admin/artist',manageArtist)
adminRoute.patch('/admin/manageuser',manageAction)
adminRoute.patch('/admin/manageartist',manageArtistAction)

export default adminRoute