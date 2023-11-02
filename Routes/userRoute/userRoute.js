import express from 'express'
const userRoute=express()
import  {allArtists,singleArtistDetails,suggestArtist,filteredData,BookingSlot,DateCheck,payment}  from '../../Controller/userController/userController.js';
import {registration,googleRegister,userLogin,verification, passwordMail,checkpassword} from '../../Controller/userController/userAuthController.js'





userRoute.post('/signup',registration)
userRoute.post('/gsignup',googleRegister)
userRoute.post('/login',userLogin)
userRoute.get('/:id/verify/:token',verification)
userRoute.post('/passwordMail',passwordMail)
userRoute.post('/checkpassword',checkpassword)
userRoute.get('/allArtists',allArtists)
userRoute.get('/artistDetails/:id',singleArtistDetails)
userRoute.get('/suggetionArtist/:id',suggestArtist)
userRoute.get('/filteredArtist/:category/:search/:value',filteredData)
userRoute.post('/bookartist',BookingSlot)
userRoute.get('/checkdate/:from/:to/:id',DateCheck)
userRoute.post('/payment/:id/:total',payment)
// userRoute.post('/paymentsSuccess',paymentSuccess)




export default userRoute;