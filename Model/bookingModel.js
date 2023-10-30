import mongoose from "mongoose";
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
   
    artistId:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
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
    totalDays:{
        type:String,
        default:"pending",
    },
    status:{
        type:String,
        default:"Pending"
    }
});
export default mongoose.model("booking", bookingSchema);
