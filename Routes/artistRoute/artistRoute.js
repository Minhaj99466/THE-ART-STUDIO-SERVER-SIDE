import express from 'express'


const artistRoute=express()
import { registration,googleRegister,artistLogin,verification,passwordMail,checkpassword,profileDetails,addProfile } from '../../Controller/artistController/artistController.js'

artistRoute.post('/artist/signup',registration)
artistRoute.post('/artist/gsignup',googleRegister)
artistRoute.post('/artist/login',artistLogin)
artistRoute.post('/passwordMail',passwordMail)
artistRoute.post('/checkpassword',checkpassword)
artistRoute.get('/artist/:id/verify/:token',verification)

artistRoute.get('/profiledetails/:id',profileDetails)
artistRoute.post('/addProfile',addProfile)






export default artistRoute