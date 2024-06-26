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

//  importando o modelo de login do back
const Login = require('./model/LoginBack');

Login();

// 
// Servindo o arquivo index.html na rota raiz
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Rota para cadastrar password com hash
app.post('/registerLoginBack', async (req, res) => {
  const { password } = req.body;

  // Verifica se o campo de password está vazio
  if (!password) {
    return res.status(400).send('O campo de senha não pode estar vazio.');
  }

  // Verifica se o password se tem menos de 5 caracteres
  if (password.length < 5) {
    return res.status(400).send('A senha deve ter pelo menos 5 caracteres.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const login = new Login({ password: hashedPassword });
    await login.save();
    res.status(201).send('Senha cadastrada com sucesso!');
  } catch (error) {
    res.status(500).send('Erro ao cadastrar senha');
  }
});

// Rota para verificar e redirecionar após o login
app.post('/loginApi', async (req, res) => {
  const { password } = req.body;
  try {
    const login = await Login.findOne();
    const match = await bcrypt.compare(password, login.password);
    if (match) {
      res.json({ redirectUrl: '/' }); // Substitua com a rota para onde você deseja redirecionar
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Rota para ler os password salvos
// app.get("/registerLoginBack", (req, res) => {
//   Login.find()
//     .then((logins) => res.json(logins))
//     .catch((err) => res.status(400).json({ error: err.message }));
// });

// Rota para Deletar o password
app.delete("/registerLoginBack/:id", (req, res) => {
  Login.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "password deletado com sucesso" }))
    .catch((err) => res.status(400).json({ error: err.message }));
});
// final da parte do login da api


// Middleware de validação para o registro de usuários
const validateUserRegistration = [
  check("email").isEmail({}),
  check("password").isLength({ min: 6 }),
];

// Importando o modelo de usuário
const Usuario = require("./model/user");

Usuario();



//  checar email
app.get('/check-email/:email', async (req, res) => {
  const email = req.params.email;

  try {
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Erro ao verificar o email:', error);
    res.status(500).json({ message: 'Erro ao verificar o email.' });
  }
});

// end check email

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

  const { username, cnpj, email, fantasyName, password } =
    req.body;

  // Verificar se algum dos campos está vazio
  if (
    !username ||
    !cnpj ||
    !email ||
    !fantasyName ||
    !password 
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

// Delete one user
app.delete("/api/usuarios/:id", (req, res) => {
  Usuario.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "usuario deletado com sucesso" }))
    .catch((err) => res.status(400).json({ error: err.message }));
});

// 
// Rota para deletar todos os usuários
app.delete('/delete-all-users', async (req, res) => {
  try {
    // Deleta todos os usuários do banco de dados
    await Usuario.deleteMany({});
    res.status(200).json({ message: 'Todos os usuários foram deletados com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar todos os usuários:', error);
    res.status(500).json({ message: 'Erro ao deletar todos os usuários.' });
  }
});
// 
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


app.listen(PORT, () => console.log(`Api rodando na porta ${PORT}`));
