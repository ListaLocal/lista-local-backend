const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

app.use(bodyParser.json());

app.use(express.json());

app.use(cors());

const PORT = process.env.PORT || 3000;

// conexão com o banco

const db = require("./DB/db");

db();

// Definir o esquema do modelo para os dados do usuário
const UsuarioSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  companyName: String,
  cnpj: String,
  whatsapp: String,
  address: String,
  instagram: String,
});
const Usuario = mongoose.model("Usuario", UsuarioSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rotas CRUD

// Rota para criar um novo usuário
app.post("/api/usuarios", async (req, res) => {
  const {
    username,
    email,
    password,
    companyName,
    cnpj,
    whatsapp,
    address,
    instagram,
  } = req.body;

  try {
    // Verificar se o usuário já existe
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Este email já está cadastrado" });
    }

    // Criptografar a senha usando bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // O segundo argumento é o "salt rounds", que determina a força do hash

    const newUser = new Usuario({
      username,
      email,
      password: hashedPassword,
      companyName,
      cnpj,
      whatsapp,
      address,
      instagram,
    });
    await newUser.save();
    res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Read
app.get("/usuarios", (req, res) => {
  Usuario.find()
    .then((usuarios) => res.json(usuarios))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Read one user
app.get("/usuarios/:id", (req, res) => {
  Usuario.findOne()
    .then((usuarios) => res.json(usuarios))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Update
app.put("/usuarios/:id", (req, res) => {
  Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((usuario) => res.json(usuario))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Delete
app.delete("/usuarios/:id", (req, res) => {
  Usuario.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "usuario deletado com sucesso" }))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// ////////////

// Rota de login
app.post("/usuarios/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Encontrar usuário pelo email
    const user = await Usuario.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Comparar a senha fornecida com a senha armazenada
    if (password !== user.password) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    // Login bem-sucedido
    res.json({ message: "Login bem-sucedido!" });
  } catch (error) {
    console.error("Erro ao efetuar login:", error);
    res.status(500).json({ error: "Erro ao efetuar login." });
  }
});

app.listen(PORT, () => console.log(`Api rodando na porta ${PORT}`));