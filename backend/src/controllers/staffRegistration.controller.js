import crypto from "crypto";
import RegistrationToken from "../models/registrationToken.model.js";
import mailSender from "../utils/mailSender.js";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

const createStaffToken = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.trim().toLowerCase();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: "User with this email already exists.",
      });
    }

    const existing = await RegistrationToken.findOne({ email });
    if (existing) {
      return res.status(409).json({
        message:
          "Token already generated for this email. Use /resend-token if needed.",
      });
    }

    const plainToken = crypto.randomBytes(4).toString("hex");
    const hashedToken = await bcrypt.hash(plainToken, 10);

    const savedDoc = await RegistrationToken.create({
      email,
      token: hashedToken,
    });

    const isDev = process.env.NODE_ENV !== "production";

    try {
      await mailSender(email, plainToken, false);
      return res.status(201).json({
        message: "Token sent successfully to your email",
      });
    } catch (mailError) {
      console.error("Email send failed:", mailError);

      if (isDev) {
        // Token already saved in DB, expose it for dev
        return res.status(201).json({
          message: "Token sent successfully to your email",
          devFallback: true,
          token: plainToken,
        });
      }

      // Production: clean up and fail
      await RegistrationToken.deleteOne({ _id: savedDoc._id });
      return res.status(502).json({
        message: "Failed to send verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const resendToken = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.trim().toLowerCase();

    const existing = await RegistrationToken.findOne({ email });
    if (!existing) {
      return res.status(404).json({
        message: "No invitation found for this email. Use /create-user first.",
      });
    }

    const oldHash = existing.token;
    const oldCreatedAt = existing.createdAt;

    const plainToken = crypto.randomBytes(4).toString("hex");
    const hashedToken = await bcrypt.hash(plainToken, 10);

    existing.token = hashedToken;
    existing.createdAt = new Date();
    await existing.save();

    const isDev = process.env.NODE_ENV !== "production";

    try {
      await mailSender(email, plainToken, false);
      return res.status(200).json({
        message: "Token resent successfully to your email",
      });
    } catch (mailError) {
      console.error("Email send failed:", mailError);

      if (isDev) {
        return res.status(200).json({
          message: "Token resent successfully to your email",
          devFallback: true,
          token: plainToken,
        });
      }

      // Production: rollback to old token and fail
      existing.token = oldHash;
      existing.createdAt = oldCreatedAt;
      await existing.save();
      return res.status(502).json({
        message: "Failed to resend verification email. Please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export { createStaffToken, resendToken };