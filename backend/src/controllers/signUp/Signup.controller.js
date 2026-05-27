import User from "../../models/user.model.js";
import RegistrationToken from "../../models/registrationToken.model.js";
import bcrypt from "bcrypt";

const Signup = async (req, res) => {
  try {
    const { name, email, password, token } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // 1. check if a user already exists with this email
    const userExist = await User.findOne({ email: normalizedEmail });
    if (userExist) {
      return res.status(400).send({ msg: "Email already exists" });
    }

    // 2. check if the (email, token) pair exists in RegistrationToken
    const tokenDoc = await RegistrationToken.findOne({
      email: normalizedEmail,
    });
    const isTokenValid =
      tokenDoc && (await bcrypt.compare(token, tokenDoc.token));
    console.log("tokenDoc:", tokenDoc);
    console.log("isTokenValid:", isTokenValid);
    if (!isTokenValid) {
      return res.status(400).send({ msg: "Invalid or expired signup token" });
    }

    // 3. hash password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "staff",
    });

    // 4. delete the used token so it cannot be reused
    await RegistrationToken.deleteOne({ _id: tokenDoc._id });

    res.status(201).send({ msg: "New user created" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "Server error" });
  }
};

export default Signup;
