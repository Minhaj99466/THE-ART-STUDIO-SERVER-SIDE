import Chat from "../../Model/chatModel.js";
import Message from '../../Model/message.js'
import User from "../../Model/userModel.js";

export const accessChat = async (req, res) => {
  console.log("inside access chat");
  const { userId, artistId } = req.body;
  console.log(userId,"UserIDDDD", artistId,"ArtistIDDDDDD");

  if (!artistId) {
    console.log("User not found");
    return res.status(400);
  }

  try {
    // Find a chat where the doctor's ID matches doctorId and the user's ID matches userId
    let isChat = await Chat.findOne({
      "users.artist": artistId,
      "users.user": userId,
    })
      .populate("users.user", "-password") // Populate the "user" references
      .populate("users.artist", "-password") // Populate the "doctor" references
      .populate("latestMessage");
    console.log(isChat,"isCha");
    // If a chat exists, send it
    if (isChat) {
      console.log(isChat);
      res.status(200).json(isChat);
    } else {
      // If a chat doesn't exist, create a new one
      const chatData = {
        chatName: "sender",
        users: {
            artist: artistId,
          user: userId,
        },
      };

      const createdChat = await Chat.create(chatData);
      console.log(createdChat);

      // Populate the "users" field in the created chat

      const FullChat = await Chat.findOne({ _id: createdChat._id })
        .populate("users.user", "-password")
        .populate("users.artist", "-password")
        .populate("latestMessage")
        .populate({
          path: "latestMessage",
          populate: {
            path: "sender.artist" ? "sender.artist" : "sender.user",
            select: "-password",
          },
        });
      console.log(FullChat, "full");
      res.status(200).json(FullChat);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const sendMessage = async (req, res) => {
    try {
        console.log("Message Send Controller Reached");
      const { content, chatId, userId } = req.body;
      if (!content || !chatId) {
        console.log('Invalid parameters');
        return res.status(400);
      }
      console.log(userId);
      const newMessage = {
        sender: { user: userId },
        content: content,
        chat: chatId,
      };
  
      let message = await Message.create(newMessage);
  
      message = await message.populate('sender.user', 'name')
      message = await message.populate('chat')
  
      message = await User.populate(message, [
        {
          path: 'chat.users.user',
          select: 'name email',
        }
      ]);
  
      console.log(message, 'message');
  
      let data=await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message,
      }, { new: true });
      console.log(data);
  
      res.json(message);
    } catch (error) {
      console.log(error.message);
    }
  };

  export const artistMessage = async (req, res) => {
    console.log("artistMessage Controller");
    console.log(req.body);
    try {
      const { content, chatId, userId } = req.body;
      if (!content || !chatId) {
        console.log('Invalid parameters');
        return res.status(400);
      }
      console.log(userId,"userId logged Console");
      const newMessage = {
        sender: { artist: userId },
        content: content,
        chat: chatId,
      };
  
      let message = await Message.create(newMessage);
  
      message = await message.populate('sender.artist', 'name')
      message = await message.populate('chat')
  
      message = await User.populate(message, [
        {
          path: 'chat.users.artist',
          select: 'name email',
        }
      ])
  
      console.log(message, 'message');
  
      let data=await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message,
      }, { new: true });
      console.log(data,"message created artist");
  
      res.json(message);
    } catch (error) {
      console.log(error.message);
    }
  };
  export const allMessages=async(req,res)=>{
    try {
        const message=await Message.find({chat:req.params.chatId}).populate('sender.user','name email').populate('sender.artist', 'name')
        res.json(message)
    } catch (error) {
        console.log(error.message);
    }
}