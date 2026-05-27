import User from "../../models/user.model.js";
const validateEmail = async (req, res) => {
    try {
        const email = req.query.email?.toLowerCase().trim();
        
        if (!email) {
            return res.status(400).send({ msg: "email is required" });
        }
        
        const user = await User.findOne({ email });
        if(user)
        {
          res.status(200).send({exists : true}) ;
        }
        else
        {
          res.status(200).send({exists : false}) ;
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send({ msg: "server error" });
    }
}

export default validateEmail