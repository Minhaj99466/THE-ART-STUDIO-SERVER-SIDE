import mongoose from "mongoose";
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
   
    artistId: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
      },
      userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
      },
    fromDate:{
        type:String,
        required:true
    },
    toDate:{
        type:String,
        required:true,
    },
    totalAmount:{
        type:String,
        
    },
    totalDays:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        default:"Pending"
    }
});
 const Booking= mongoose.model("booking", bookingSchema);
 export default Booking