const mongoose = require("mongoose");

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Succesfully");
  } catch(error) {
    console.error(error.message);
    throw (error);
  }
}

module.exports = connectDatabase;
