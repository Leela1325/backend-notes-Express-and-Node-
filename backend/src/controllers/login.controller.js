import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
  try {
    let { email, password } = req.body;
     
    const user = await User.findOne({ email : email.toLowerCase().trim() });
    if (user) {
      const passwordComprasion = await bcrypt.compare(password, user.password);
      if (passwordComprasion) {
        const payload = { name: user.name, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.mySecretKey , {expiresIn : "2h"});
        res.status(200).send({  token  , user : { name : user.name , email : user.email , role : user.role }  });
      } else {
        res.status(400).send({ msg: "invalid credentials" });
      }
    } else {
      res.status(400).send({ msg: "invalid credentials" });
    }
  } catch (err) {
    res.status(500).send({ msg: "server error" , error : err.message });
  }
}

export default login