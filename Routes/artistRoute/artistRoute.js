import express from 'express'


const artistRoute=express()
import { profileDetails,addProfile,editProfile,postImages  } from '../../Controller/artistController/artistController.js'

import upload from '../../MiddleWares/multer.js'
import { artistLogin, checkpassword, googleRegister, passwordMail, registration, verification } from '../../Controller/artistController/authController.js'


import { artistAuth } from '../../MiddleWares/Auth.js'
import { dateNotification,changeBookingStatus,allOrders } from '../../Controller/artistController/slotController.js'








artistRoute.post('/artist/signup',registration)
artistRoute.post('/artist/gsignup',googleRegister)
artistRoute.post('/artist/login',artistLogin)
artistRoute.post('/passwordMail',passwordMail)
artistRoute.post('/checkpassword',checkpassword)
artistRoute.get('/artist/:id/verify/:token',verification)

artistRoute.put('/addProfile/:id',artistAuth,upload.single('dp'),addProfile)
artistRoute.put('/editProfile/:id',artistAuth,upload.single('dp'),editProfile)
artistRoute.put('/postImages/:id',artistAuth,upload.array("images",3),postImages)

artistRoute.get('/profiledetails/:id',artistAuth,profileDetails)
artistRoute.post('/addProfile',artistAuth,addProfile)

artistRoute.get('/datenotification',artistAuth,dateNotification)
artistRoute.put('/updatebooking',artistAuth,changeBookingStatus)
artistRoute.get('/getAllOrders',artistAuth,allOrders)







export default artistRoute