const UsuarioSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  companyName: String,
  cnpj: String,
  whatsapp: String,
  address: String,
  instagram: String,
});
const Usuario = mongoose.model("Usuario", UsuarioSchema);

module.exports = Usuario;
