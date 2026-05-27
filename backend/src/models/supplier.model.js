import mongoose from "mongoose";

const supplierSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'Supplier name is required'],
        trim:true
    },
    contact:{
        type:String,
        required:[true, "Contact number is required"],
        trim:true,
        minlength:9,
        maxlength:[10,'Contact number should be exactly 10 digits'],
 
    },
    address:{
        type:String,
        required:[true,'Address is required'],
        minlength:[5, 'Address should be atleast 5 characters'],
        trim:true,
    },
    performance:{
        type:String,
        required:[true,'Performance is required'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        trim:true
    },
    zoneid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Zone',
        required:[true, 'Zone id is required'],
    },
    categoryid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:[true,'Category id is required'],
    },
    active:{
        type:Boolean,
        default:false,
    },
    rating:{
        type:Number,
        default:3,
        min:1,
        max:5
    },
    productids:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'Product',
    },
});


export const Supplier=mongoose.model('Supplier',supplierSchema);