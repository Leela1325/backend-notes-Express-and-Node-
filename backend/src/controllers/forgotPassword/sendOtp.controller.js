import Otp from "../../models/otp.model.js";
import User from "../../models/user.model.js";
import crypto from "crypto";
import mailSender from "../../utils/mailSender.js";

const sendOtp = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).send({ msg: "email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
     
      return res.status(200).send({ sent: "success" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp, issuedAt: new Date() });

    const isDev = process.env.NODE_ENV !== "production";

    try {
      await mailSender(email, otp, true);
      // Mail sent — never expose OTP to client
      return res.status(200).send({ sent: "success" });
    } catch (mailError) {
      console.error("Mail send failed:", mailError.message);

      if (isDev) {
        // Dev fallback: OTP is already saved in DB, expose it so dev can continue
        return res.status(200).send({
          sent: "success",
          devFallback: true,
          otp,
        });
      }

      // Production: clean up the saved OTP and report failure
      await Otp.deleteMany({ email });
      return res.status(502).send({
        msg: "Failed to send OTP. Please try again.",
      });
    }
  } catch (err) {
    console.log("failed to send mail", err.message);
    res.status(500).send({ msg: "server error", error: err.message });
  }
};

export default sendOtp;