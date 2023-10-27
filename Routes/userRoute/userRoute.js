import express from 'express'
const userRoute=express()
import  {registration,googleRegister,userLogin,verification, passwordMail,checkpassword,allArtists,singleArtistDetails,suggestArtist}  from '../../Controller/userController/userController.js';





userRoute.post('/signup',registration)
userRoute.post('/gsignup',googleRegister)
userRoute.post('/login',userLogin)
userRoute.get('/:id/verify/:token',verification)
userRoute.post('/passwordMail',passwordMail)
userRoute.post('/checkpassword',checkpassword)
userRoute.get('/allArtists',allArtists)
userRoute.get('/artistDetails/:id',singleArtistDetails)
userRoute.get('/suggetionArtist/:id',suggestArtist)



export default userRoute;