
import express from 'express'
import env from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'



import userRoute from './Routes/userRoute/userRoute.js'
import artistRoute from './Routes/artistRoute/ArtistRoute.js'
import adminRoute from './Routes/adminRoute/adminRoute.js'


const app=express()
env.config()



mongoose.connect('mongodb://127.0.0.1:27017/THEARTSTUDIO')


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors(
    ({
        origin:['http://localhost:5173'],
        methods:["GET","POST","PUT","PATCH"],
        credentials:true
    })
))


app.use('/',userRoute)
app.use('/artist',artistRoute)
app.use('/admin',adminRoute)



app.listen(process.env.port,()=>{
    console.log("server is running",process.env.port);
})