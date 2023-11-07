import express from 'express'

const adminRoute=express()
import { login,manageUsers,manageAction,manageArtist,manageArtistAction,notVerified,verifyArtist, getArtist } from '../../Controller/adminController/adminController.js'
import { adminAuth } from '../../MiddleWares/Auth.js'


adminRoute.post('/admin/login',login)
adminRoute.get('/admin/users/:search/:value',adminAuth,manageUsers)
adminRoute.get('/admin/artist/:search/:value',adminAuth,manageArtist)
adminRoute.patch('/admin/manageuser',adminAuth,manageAction)
adminRoute.patch('/admin/manageartist',adminAuth,manageArtistAction)
adminRoute.get("/getArtist/:id",adminAuth,getArtist);
adminRoute.get("/notVerified",adminAuth,notVerified);
adminRoute.put("/verify/:id",adminAuth,verifyArtist);


export default adminRoute