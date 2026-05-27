import mongoose from "mongoose";
 
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required"]
    },
    otp: {
        type: String,
        required: [true, "otp is required"]
    },
    issuedAt: {
        type: Date,
        required: true
    }
});
 
otpSchema.index({ issuedAt: 1 }, { expireAfterSeconds: 90 });
 
const Otp = mongoose.model("otp", otpSchema);
 
export default Otp;
 