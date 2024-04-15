const mongoose = require("mongoose")
const LoginSchema = new mongoose.Schema({
  
  password: String,
  
  
});
const Login = mongoose.model("Login", LoginSchema);

module.exports = Login;