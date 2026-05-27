import mongoose from "mongoose";

const registrationTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "email is required"],
  },
  token: {
    type: String,
    required: [true, "token is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

registrationTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const RegistrationToken = mongoose.model(
  "RegistrationToken",
  registrationTokenSchema,
);

export default RegistrationToken;
