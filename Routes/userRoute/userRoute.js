import express from 'express'
const userRoute=express()
import  {allArtists,singleArtistDetails,suggestArtist,filteredData,BookingSlot,DateCheck,payment,orderDetails,cancelBooking, fetchChats, searchUsers,userwallet,walletPay}  from '../../Controller/userController/userController.js';
import {registration,googleRegister,userLogin,verification, passwordMail,checkpassword} from '../../Controller/userController/userAuthController.js'
import { userAuth } from '../../MiddleWares/Auth.js';
import { accessChat, allMessages, sendMessage } from '../../Controller/chatController.js/chatController.js';






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
userRoute.get('/userwallet',userAuth,userwallet)
userRoute.post('/payWallet',userAuth,walletPay)

userRoute.post('/accesschat',accessChat)
userRoute.get('/fetchchat/:userId',fetchChats)
userRoute.get('/usersearch',searchUsers)
userRoute.post('/message',sendMessage)
userRoute.get('/message/:chatId',allMessages)




export default userRoute;