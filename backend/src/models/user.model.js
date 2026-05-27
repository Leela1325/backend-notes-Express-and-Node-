import mongoose , {Schema} from "mongoose";

const userSchema = new Schema({
    name : {
        type : String ,
        required : [true,"user name is required"],
        trim : true
    } ,
    email : {
        type : String ,
        unique : true ,
        lowercase : true,
        required: [true , "email is required" ] ,
        trim : true
    } ,
    password : {
        type : String ,
        required : [true , "password is required"] ,
        trim : true
    },
    role : {
        type : String ,
        enum : ["admin" , "staff"] ,
        default : "staff"
    }

})

const User = mongoose.model("user" , userSchema) ;

export default User ;

 