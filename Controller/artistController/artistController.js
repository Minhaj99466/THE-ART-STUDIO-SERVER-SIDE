
import {
  uploadToCloudinary,
  MultiUploadCloudinary
} from "../../utils/cloudinary.js";
import Artist from "../../Model/artistModel.js";




export const profileDetails=async (req,res)=>{
  try {
    const id=req.params.id
    const profileData=await Artist.findOne({email:id})

    if(!profileData){return res.status(400).json({message:"no profile"})}
    return res.status(200).json({message:"user profile",profileData})
  } catch (error) {
    console.log(error);
  }
}


export const addProfile=async(req,res)=>{
  try {
    const artistId=req.params.id
    console.log(req.body);
    const {
      category,
      experience,
      place,
      number,
      fees,
      description,
    } = req.body;
    const uploadedImages = await uploadToCloudinary(
      req.file.path,
      "dp"
    );

    const updatedArtist = await Artist.updateOne(
      { email: artistId },
      {
        $set: {
          category: category,
          experience: experience,
          place: place,
          mobile: number,
          description: description,
          fees: fees,
          displaypicture: uploadedImages.url,
          requested: true,
          is_profile:true
        },
      }
    );
    if (updatedArtist) {
      return res.status(200).json({created:true, data: updatedArtist, message: "updated" });
    } else {
      return res.status(200).json({ message: "updation failed" });
    }

  } catch (error) {
    console.log(error);
  }
}

export const editProfile=async (req,res)=>{
 
      try {
        const artistId=req.params.id
        const {
          name,
          category,
          experience,
          number,
          description,
          fees,
        } = req.body;
        const uploadedImages = await uploadToCloudinary(
          req.file.path,
          "dp"
        );
    
        const updatedArtist = await Artist.updateOne(
          { email: artistId },
          {
            $set: {
              name:name,
              category: category,
              experience: experience,
              mobile: number,
              description: description,
              fees: fees,
              displaypicture: uploadedImages.url,
              requested: true,
              is_profile:true
            },
          }
        );
        if (updatedArtist) {
          return res.status(200).json({created:true, data: updatedArtist, message: "updated" });
        } else {
          return res.status(200).json({ message: "updation failed" });
        }
    
  } catch (error) {
    console.log(error);
  }
}



export const postImages=async (req,res)=>{
 
  try {
    const artistId=req.params.id

    const uploadedImages = await MultiUploadCloudinary(
      req.files,
      "images"
    );
    const updatedArtist = await Artist.updateOne(
      { email: artistId },
      {
        $push: {
          posts: { $each: uploadedImages },
        },
        $set: {
          is_posts: true,
        },
      }
    );
    if (updatedArtist) {
      return res.status(200).json({created:true, data: updatedArtist, message: "updated" });
    } else {
      return res.status(500).json({ message: "updation failed" });
    }
 
} catch (error) {
console.log(error);
}
}