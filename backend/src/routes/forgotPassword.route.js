
import express from "express";
import sendOtp from "../controllers/forgotPassword/sendOtp.controller.js";
import verifyOtp from "../controllers/forgotPassword/verifyOtp.controller.js";
import changePassword from "../controllers/forgotPassword/changePassword.controller.js";


const router = express.Router();


router.post("/sendOtp",sendOtp );


router.post("/verifyOtp", verifyOtp );


router.post("/changePassword", changePassword);

export default router;