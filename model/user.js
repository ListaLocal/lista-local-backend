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
const User = mongoose.model("User", UsuarioSchema);

module.exports = User;
