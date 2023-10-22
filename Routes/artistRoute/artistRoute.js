import express from 'express'


const artistRoute=express()
import { registration,googleRegister,artistLogin,verification,passwordMail,checkpassword,profileDetails,addProfile,editProfile,postImages } from '../../Controller/artistController/artistController.js'
import upload from '../../MiddleWares/multer.js'



artistRoute.post('/artist/signup',registration)
artistRoute.post('/artist/gsignup',googleRegister)
artistRoute.post('/artist/login',artistLogin)
artistRoute.post('/passwordMail',passwordMail)
artistRoute.post('/checkpassword',checkpassword)
artistRoute.get('/artist/:id/verify/:token',verification)
artistRoute.put('/addProfile/:id',upload.single('dp'),addProfile)

artistRoute.put('/editProfile/:id',upload.single('dp'),editProfile)
artistRoute.put('/postImages/:id',upload.array("images",3),postImages)

artistRoute.get('/profiledetails/:id',profileDetails)
artistRoute.post('/addProfile',addProfile)






export default artistRoute