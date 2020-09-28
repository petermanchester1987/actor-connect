const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // get token from header
  const token = req.header("x-auth-token");

  //check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorisation denied" });
  }

  //verify token

  try {
    //decodes the token using the headers token and the secret in the config
    // const decoded = jwt.verify(token, config.get("jwtSecret"));
    // //set req.user with the decoded user in the token
    // req.user = decoded.user;
    // //call next like any middleware
    // next();

    jwt.verify(token, config.get("jwtSecret"), (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: "Token is not valid" });
      } else {
        req.user = decoded.user;
        next();
      }
    });
  } catch (err) {
    console.error("Middleware Error");
    res.status(500).json({ msg: "Server Error" });
  }
};
