import jwt from "jsonwebtoken";

function authentication(req, res, next) {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      const payload = jwt.verify(token, process.env.mySecretKey);
      
      req.user = payload;
      next();
    }
    else {
      res.status(401).send({ msg: "token missing" });
    }
  } catch (err) {
    res.status(401).send({ msg: "invalid credentials" });
  }
}

export default authentication;
