import express from "express";

import {
  createStaffToken,
  resendToken,
} from "../controllers/staffRegistration.controller.js";
import authentication from "../middlewares/authentication.middleware.js";
import Signup from "../controllers/signUp/Signup.controller.js";
import validateEmail from "../controllers/signUp/validateEmail.controller.js";
import me from "../controllers/signUp/me.controller.js";
const router = express.Router();

router.post("/Signup", Signup);

router.get("/validate-email", validateEmail);

router.get("/me", authentication, me);

router.post("/generate-staff-token", createStaffToken);
router.post("/resend-staff-token", resendToken);

export default router;
