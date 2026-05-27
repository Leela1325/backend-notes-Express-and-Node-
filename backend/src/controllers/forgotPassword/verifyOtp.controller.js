import Otp from "../../models/otp.model.js";
import jwt from "jsonwebtoken"
const verifyOtp  = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).send({ msg: "email and otp are required" });
        }

        const otpDoc = await Otp.findOne({ email });

        if (!otpDoc) {
            return res.status(400).send({ msg: "otp expired or invalid" });
        }

        // Manual expiry check — TTL index isn't real-time
        const ageInMs = Date.now() - otpDoc.issuedAt.getTime();
        if (ageInMs > 5 * 60 * 1000) {
            await Otp.deleteOne({ email });
            return res.status(400).send({ msg: "otp expired" });
        }

        // Compare as strings (handles if frontend sends number)
        if (otp.toString() !== otpDoc.otp) {
            return res.status(400).send({ validated: false });
        }

        // OTP correct — issue a short-lived reset token
        const resetToken = jwt.sign(
            { email, purpose: "password-reset" },
            process.env.mySecretKey,
            { expiresIn: "10m" }
        );

        // OTP did its job — delete so it can't be reused
        await Otp.deleteOne({ email });

        res.status(200).send({ validated: true, resetToken });
    } catch (err) {
        console.error(err);
        res.status(500).send({ msg: "server error" });
    }
}

export default verifyOtp