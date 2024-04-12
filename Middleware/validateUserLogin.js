const jwt = require('jsonwebtoken');

// Chave secreta para verificar os tokens
const secretKey = process.env.JWT_SECRET || 'estado';

// Middleware para autenticar tokens JWT
const authMiddleware = async (req, res, next) => {
  // Obtenha o token JWT do cabeçalho da requisição
  const token = req.headers['authorization'];

  // Se o token não for fornecido, retorne um erro
  if (!token) {
    return res.status(401).send('Token JWT não fornecido');
  }

  try {
    // Verifique o token JWT usando a chave secreta
    const decoded = jwt.verify(token, secretKey);

    // Obtenha o ID do usuário do payload do token
    const userId = decoded.userId;

    // Adicione o ID do usuário à requisição para uso posterior
    req.userId = userId;

    // Permita que a requisição continue
    next();
  } catch (error) {
    // Se o token for inválido, retorne um erro
    return res.status(401).send('Token JWT inválido');
  }
};

module.exports = authMiddleware;