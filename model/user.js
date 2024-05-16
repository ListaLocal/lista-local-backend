const mongoose = require("mongoose")
const UsuarioSchema = new mongoose.Schema({
  username: String,
  cnpj: String,
  fantasyName: String,
  email: { type: String, unique: true },
  password: String,
  
  whatsapp: String,
  newWhatsapp: String,
  instagram: String,
  cep: String,
  logradouro: String,
  numero: String,
  bairro: String,
  complemento: String,
  
  
});
const Usuario = mongoose.model("Usuario", UsuarioSchema);

module.exports = Usuario;
