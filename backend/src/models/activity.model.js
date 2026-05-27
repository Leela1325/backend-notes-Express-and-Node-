import mongoose from "mongoose";

const activity = new mongoose.Schema({
  eventname: String,
  eventdesc: String,
  timestamp: Date,
});

export const Activity = mongoose.model("Activity", activity);
 