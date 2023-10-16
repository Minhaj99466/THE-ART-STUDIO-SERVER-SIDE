import express from 'express'

const artistRoute=express()
import { registration,googleRegister,artistLogin,verification } from '../../Controller/artistController/artistController.js'

artistRoute.post('/artist/signup',registration)
artistRoute.post('/artist/gsignup',googleRegister)
artistRoute.post('/artist/login',artistLogin)
// adminRoute.get('/artist/profiledetails',manageArtist)

artistRoute.get('/artist/:id/verify/:token',verification)




export default artistRoute