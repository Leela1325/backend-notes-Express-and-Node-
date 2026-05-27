import mongoose from "mongoose";
const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Category name is required"],
        trim:true
    },
    zoneid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Zone',
        required:[true,"Zone id is required"]
    },
    description:{
        type:String,
        default:' ',
        trim:true
    }
})
export const Category=mongoose.model("Category",categorySchema)