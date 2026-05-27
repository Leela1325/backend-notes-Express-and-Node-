import User from "../../models/user.model.js"
import bcrypt from "bcrypt" ;
import jwt from "jsonwebtoken"
const changePassword =  async (req, res) => {
    try {
        const { resetToken, password } = req.body;

        if (!resetToken || !password) {
            return res.status(400).send({ msg: "resetToken and password are required" });
        }

        // Verify the reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.mySecretKey);
        } catch (err) {
            return res.status(401).send({ msg: "invalid or expired token" });
        }

        // Make sure this token was specifically for password reset
        // (so a login JWT can't be misused here)
        if (decoded.purpose !== "password-reset") {
            return res.status(403).send({ msg: "invalid token" });
        }

        const email = decoded.email;

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.updateOne(
            { email },
            { password: hashedPassword }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ msg: "user not found" });
        }

        res.status(200).send({ msg: "password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ msg: "server error" });
    }
}


export default changePassword