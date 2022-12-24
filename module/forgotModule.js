const login = require("../Schema/loginSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { ObjectId } = require("mongodb");

///forgot password

exports.forgot = async (req, res) => {
  const { email } = req.body;
  //console.log(email);
  try {
    const existuser = await login.findOne({ email: req.body.email });
    // console.log(existuser);
    if (!existuser) {
      return res.status(400).send({ msg: "Email not found" });
    }
    const secret = process.env.SECRET_KEY + existuser.password;
    const payload = {
      email: existuser.email,
      id: existuser._id,
    };

    //User exist and now create a one time link valid for 15 minutes
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    console.log(token);
    const link = `http://localhost:4000/reset/${existuser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mgdhanesh98@gmail.com",
        pass: "szqlearjiwuqybxk",
      },
    });
    var mailOptions = {
      from: "mgdhanesh98@gmail.com",
      to: `${existuser.email}`,
      subject: "Password reset link",
      html: `We have received your request for reset password. Click this link to reset your password.<br>
                    <a href = ${link}>Click Here</a><br>
                    <p>This link is valid for 15 minutes from your request initiation for password recovery.</p>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent:" + info.res);
      }
    });
    res.send({ message: "Email sent successfully" });
  } catch (err) {
    return res.status(400).send(err);
  }
};

//reset password

exports.resetpassword = async (req, res) => {
  const { id, token } = req.params;
  //check if this id exist in database
  const existuser = await login.findOne({ _id: ObjectId(id) });

  // console.log(existuser);
  if (!existuser) {
    return res.status(400).send({ msg: "Link expried" });
  }
  const secret = process.env.SECRET_KEY + existuser.password;
  try {
    const verify = jwt.verify(token, secret);
    res.send("Verified");
  } catch (err) {
    return res.status(400).send(err);
  }
};

exports.resetpassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  try {
    //check if this id exist in database
    const existuser = await login.findOne({ _id: ObjectId(id) });
    if (!existuser) {
      return res.status(400).send({ msg: "User Not Exist" });
    }
    const secret = process.env.SECRET_KEY + existuser.password;

    const checkpassword = (password, confirmpassword) => {
      return password !== confirmpassword ? false : true;
    };
    const isSameePassword = checkpassword(
      req.body.password,
      req.body.confirmpassword
    );
    if (!isSameePassword) {
      return res.status(400).send({ msg: "password doesnot match backend" });
    } else {
      delete req.body.confirmpassword;
      const verify = jwt.verify(token, secret);
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const updatePassword = await login.updateOne(
        { _id: ObjectId(id) },
        { $set: { password: encryptedPassword } }
      );
      console.log(updatePassword);

      res.send({ message: "Password updated" });
    }
  } catch (err) {
    return res.status(400).send({ msg: "Something went wrong" });
  }
};
