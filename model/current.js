const mongoose = require('mongoose');

const CurrentSchema = new mongoose.Schema({
  whatsapp: String,
  newWhatsapp: String,
  instagram: String,
  cep: String,
  logradouro: String,
  numero: String,
  bairro: String,
  complemento: String,
  imagem: String // campo para armazenar o caminho da imagem
});

const Current = mongoose.model("Current", CurrentSchema);

module.exports = Current;