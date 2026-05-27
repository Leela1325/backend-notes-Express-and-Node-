import mongoose from "mongoose"
const sales=mongoose.Schema({
    productid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    productname:String,
    categoryid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    timestamp:Date,
    quantity:Number,
    avgprice:Number

})
export const Sales=mongoose.model("Sales",sales,"sales")