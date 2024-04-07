const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const multer = require('multer');
const path = require('path');
const { check, validationResult } = require("express-validator");

const app = express();

// Middleware para analisar corpos de solicitação
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(cors());

const PORT = process.env.PORT || 3000;

// conexão com o banco

const db = require("./DB/db");

db();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const API_PASSWORD = process.env.API_PASSWORD;
// Rota de autenticação na página inicial
// Rota para a página inicial
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Rota para autenticar a senha
app.post("/", (req, res) => {
  const { password } = req.body;

  if (password === process.env.API_PASSWORD) {
    // Senha correta, conceda acesso à API
    res.status(200).send("Acesso concedido à API");
  } else {
    // Senha incorreta, negue o acesso
    res.status(401).send("Credenciais inválidas");
  }
});

// Middleware de validação para o registro de usuários
const validateUserRegistration = [
  check("email").isEmail({}),
  check("password").isLength({ min: 6 }),
];

// Importando o modelo de usuário
const Usuario = require("./model/user");

Usuario();

//  importando o modelo de usuario current
const Current = require('./model/current');

Current();

// Rotas CRUD
// Função para criar o hash da senha
async function hashSenha(senha) {
  const saltRounds = 10;
  const hashedSenha = await bcrypt.hash(senha, saltRounds);
  return hashedSenha;
}

// Rota para criar um novo usuário
app.post("/api/usuarios", validateUserRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, cnpj, email, fantasyName, password, confirmPassword } =
    req.body;

  // Verificar se algum dos campos está vazio
  if (
    !username ||
    !cnpj ||
    !email ||
    !fantasyName ||
    !password ||
    !confirmPassword
  ) {
    return res
      .status(400)
      .json({ error: "Por favor, preencha todos os campos obrigatórios." });
  }

  // Verificar se o username tem pelo menos 10 caracteres
  if (username.length < 10) {
    return res
      .status(400)
      .json({ error: "O username deve ter pelo menos 10 caracteres." });
  }

  // Verificar se o cnpj tem 14 caracteres
  if (cnpj.length < 14) {
    return res.status(400).json({ error: "O cnpj deve ter 14 caracteres." });
  }

  // Verificar se o fantasyName tem pelo menos 5 caracteres
  if (fantasyName.length < 5) {
    return res
      .status(400)
      .json({ error: "O fantasyName deve ter pelo menos 5 caracteres." });
  }

  // Verificar se a senha e a confirmação de senha coincidem
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ error: "As senhas password e confirmPassword não coincidem." });
  }

  // Criar hash da senha
  const hashedPassword = await hashSenha(password);

  try {
    // Verificar se o usuário já existe
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Este email já está cadastrado" });
    }


    const newUser = new Usuario({      
      username,
      cnpj,
      fantasyName,
      email,
      password: hashedPassword,
      confirmPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Read
app.get("/api/usuarios", (req, res) => {
  Usuario.find()
    .then((usuarios) => res.json(usuarios))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Read one user
app.get("/api/usuarios/:id", (req, res) => {
  Usuario.findOne()
    .then((usuarios) => res.json(usuarios))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Update
app.put("/api/usuarios/:id", (req, res) => {
  Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((usuario) => res.json(usuario))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Delete
app.delete("/api/usuarios/:id", (req, res) => {
  Usuario.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "usuario deletado com sucesso" }))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// ////////////
// Middleware de validação para o login de usuários
const validateUserLogin = [
  check("email").isEmail(),
  check("password").isLength({ min: 6 }),
];

// Rota de login
app.post("/api/usuarios/login", validateUserLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Encontre o usuário no banco de dados
    const user = await Usuario.findOne({ email });

    if (!user) {
      return res.status(401).send("Credenciais inválidas");
    }

    // Verifique se a senha corresponde ao hash no banco de dados
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).send("Credenciais inválidas");
    }

    // Se as credenciais estiverem corretas, o login é bem-sucedido
    return res.status(200).send("Login bem-sucedido");
  } catch (error) {
    console.error("Erro ao fazer login", error);
    return res.status(500).send("Erro interno do servidor");
  }
});

//  page currentUpdateCompany

// Configuração do Multer para salvar as imagens no diretório "uploads"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// Rota para cadastro de usuário
app.post('/api/usuarios/login/current', upload.single('imagem'), async (req, res) => {
  try {
    // Extrair dados do corpo da requisição
    const { whatsapp, newWhatsapp, instagram, cep, logradouro, numero, bairro, complemento } = req.body;

    // Verificar se algum campo obrigatório está vazio
    if (!whatsapp || !newWhatsapp || !instagram || !cep || !logradouro || !numero || !bairro|| !complemento) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se a imagem foi enviada
    const imagem = req.file ? req.file.path : null;

    const newCurrent = new Current({
      whatsapp,
      newWhatsapp,
      instagram,
      cep,
      logradouro,
      numero,
      bairro,
      complemento,
      imagem
    });

    await newCurrent.save();

    res.status(201).json({ message: 'Formulario atualizado', user: newCurrent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Read one user
app.get("/api/usuarios/login/current/:id", (req, res) => {
  Current.findOne()
    .then((usuarios) => res.json(usuarios))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Read
app.get("/api/usuarios/login/current", (req, res) => {
  Current.find()
    .then((currents) => res.json(currents))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Update
app.put("/api/usuarios/login/current/:id", (req, res) => {
  Current.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((current) => res.json(current))
    .catch((err) => res.status(400).json({ error: err.message }));
});
// Delete
app.delete("/api/usuarios/login/current/:id", (req, res) => {
  Current.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "usuario deletado com sucesso" }))
    .catch((err) => res.status(400).json({ error: err.message }));
});




app.listen(PORT, () => console.log(`Api rodando na porta ${PORT}`));
