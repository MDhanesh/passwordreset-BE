const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongo = require("./connect");
const registerRouter = require("./router/registerRouter");

//.env
dotenv.config();
mongo();

///
const app = express();
app.use(cors());
app.use(express.json());

///register
app.use("/register", registerRouter);

//listening port
app.listen(process.env.PORT);
