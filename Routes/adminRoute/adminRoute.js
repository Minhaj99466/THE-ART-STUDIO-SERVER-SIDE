import express from 'express'

const adminRoute=express()
import { login,manageUsers,manageAction,manageArtist,manageArtistAction,notVerified,verifyArtist, getArtist } from '../../Controller/adminController/adminController.js'
import { adminAuth } from '../../MiddleWares/Auth.js'


adminRoute.post('/admin/login',login)
adminRoute.get('/admin/users',adminAuth,manageUsers)
adminRoute.get('/admin/artist',manageArtist)
adminRoute.patch('/admin/manageuser',manageAction)
adminRoute.patch('/admin/manageartist',manageArtistAction)
adminRoute.get("/getArtist/:id",getArtist);
adminRoute.get("/notVerified",notVerified);
adminRoute.put("/verify/:id",verifyArtist);


export default adminRoute