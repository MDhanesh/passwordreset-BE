const mongoose = require("mongoose");

db = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connection Success");
  } catch (error) {
    console.log("DB CONNECTION ERROR", error);
  }
};

module.exports = db;
