import mongoose from "mongoose";
const ticket=new mongoose.Schema({

    productid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    productName:String,
    requestedQuantity:Number,
    createdAt:Date,
    status:String,
    updatedat:Date
})
export const Ticket = mongoose.model("Ticket", ticket);