import mongoose from "mongoose";

const schema=new mongoose.Schema({
  name:{type:String,required:true},
  address:{type:String,required:true},
  imageUrl:{type:String,required:true}
})