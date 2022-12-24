const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const login = require("../Schema/loginSchema");

exports.signup = async (req, res) => {
  try {
    const existuser = await login.findOne({ email: req.body.email });
    //if existUser
    if (existuser)
      return res.status(400).send({ msg: "you are an exist user" });

    //password & confirm password validation
    const isSameePassword = checkpassword(
      req.body.password,
      req.body.confirmpassword
    );
    if (!isSameePassword) {
      return res.status(400).send({ msg: "password doesnot match" });
    } else delete req.body.confirmpassword;
    //password hash
    const randomString = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, randomString);
    //save in DB
    console.log(req.body);
    const UserData = new login({ ...req.body, role: "member" });
    // console.log(UserData);
    await UserData.save((err, data) => {
      if (err) {
        return res.status(400).send({
          message: "Error while adding new employee. Please check the data",
        });
      }
      res.status(201).send({
        user: data.email,
        message: "Employee has been added successfully.",
      });
    });
  } catch (err) {
    console.log(err, "signupmodule");
    return res.status(400).send(err);
  }
};
const checkpassword = (password, confirmpassword) => {
  return password !== confirmpassword ? false : true;
};
///\\\\\\

//signin
exports.signin = async (req, res) => {
  try {
    //email validation
    const existuser = await login.findOne({ email: req.body.email });
    // console.log(existuser);
    if (!existuser) {
      return res
        .status(400)
        .send({ msg: "you are not an exist user. Please signup" });
    }
    //password vaild or not

    const isSamePassword = await bcrypt.compare(
      req.body.password,
      existuser.password
    );
    if (!isSamePassword)
      return res.status(400).send({ msg: "password doesn't match" });

    //token creation
    const token = jwt.sign({ existuser }, process.env.SECERT_KEY, {
      expiresIn: "1hr",
    });
    res.send(token);
  } catch (error) {
    console.log(error);
  }
};
