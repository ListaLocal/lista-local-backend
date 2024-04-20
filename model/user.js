const mongoose = require("mongoose")
const UsuarioSchema = new mongoose.Schema({
  username: String,
  cnpj: String,
  fantasyName: String,
  email: { type: String, unique: true },
  password: String,
  
  
});
const Usuario = mongoose.model("Usuario", UsuarioSchema);

module.exports = Usuario;
