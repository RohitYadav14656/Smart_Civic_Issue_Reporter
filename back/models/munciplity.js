import mongoose from 'mongoose'

const newschema=new mongoose.Schema({
  username:{
    type:String
  },
  pincode:{
    type:Number
  },
  password:{
    type:String
  }
})

const munciplitydata = mongoose.model("Munciplity", newschema);

export default munciplitydata;