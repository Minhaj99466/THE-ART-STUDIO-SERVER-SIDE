
import express from 'express'
import env from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'

import { Server } from 'socket.io';



import userRoute from './Routes/userRoute/userRoute.js'
import artistRoute from './Routes/artistRoute/artistRoute.js'
import adminRoute from './Routes/adminRoute/adminRoute.js'


const app=express()
env.config()



mongoose.connect(process.env.MONGODB)


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors(
    ({
        origin:[process.env.CLIENTADDRESS,'http://localhost:5173/'],
        methods:["GET","POST","PUT","PATCH"],
        credentials:true
    })
))


app.use('/',userRoute)
app.use('/artist',artistRoute)
app.use('/admin',adminRoute)



const server=app.listen(process.env.port,()=>{
    console.log("server is running",process.env.port);
})


const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: ['http://localhost:5173']
    }
  });
  io.on("connection",(socket)=>{
    console.log('connected to socket.io');
    socket.on("setup",(userData)=>{
      socket.join(userData._id)
      socket.emit('connected')
    })
  
    socket.on('join chat',(room)=>{
      socket.join(room)
      console.log('user joined in the room: '+room);
    })
  
    socket.on('typing',(room)=>socket.in(room).emit('typing'))
    socket.on('stop typing',(room)=>socket.in(room).emit('stop typing'))
  
    socket.on('new message', (newMessageRecieved) => {
      const chat = newMessageRecieved.chat;
      console.log(newMessageRecieved.sender);
    
      const userKeys = Object.keys(chat.users);
    
      userKeys.forEach((userKey) => {
        const user = chat.users[userKey];
        const senderUserId = newMessageRecieved.sender.user
          ? newMessageRecieved.sender.user._id
          : newMessageRecieved.sender.artist._id;
    
        if (userKey !== senderUserId) {
          console.log(user);
          let access = user.user ? user.artist : user.user;
          console.log(access);
          socket.to(access).emit("message received", newMessageRecieved);
        }
      });
    });
    
  
  })