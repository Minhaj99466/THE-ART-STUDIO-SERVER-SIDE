import express from 'express'
const userRoute=express()
import  {allArtists,singleArtistDetails,suggestArtist,filteredData,BookingSlot,DateCheck,payment,orderDetails,cancelBooking}  from '../../Controller/userController/userController.js';
import {registration,googleRegister,userLogin,verification, passwordMail,checkpassword} from '../../Controller/userController/userAuthController.js'
import { userAuth } from '../../MiddleWares/Auth.js';






userRoute.post('/signup',registration)
userRoute.post('/gsignup',googleRegister)
userRoute.post('/login',userLogin)
userRoute.get('/:id/verify/:token',verification)
userRoute.post('/passwordMail',passwordMail)
userRoute.post('/checkpassword',checkpassword)
userRoute.get('/allArtists',userAuth,allArtists)
userRoute.get('/artistDetails/:id',userAuth,singleArtistDetails)
userRoute.get('/suggetionArtist/:id',userAuth,suggestArtist)
userRoute.get('/filteredArtist/:category/:search/:value',userAuth,filteredData)
userRoute.post('/bookartist',userAuth,BookingSlot)
userRoute.get('/checkdate/:from/:to/:id',userAuth,DateCheck)
userRoute.post('/payment/:id/:total',userAuth,payment)
userRoute.get('/getOrderData/:id',userAuth,orderDetails)
userRoute.post('/cancelBooking',userAuth,cancelBooking)




export default userRoute;