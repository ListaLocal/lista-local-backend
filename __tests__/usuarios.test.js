const request = require("supertest");
const app = require("../server");
const Usuario = require("../model/user");
const bcrypt = require("bcryptjs");

jest.mock("../model/user.js");
jest.mock("bcryptjs");

describe("/api/usuarios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um novo usuário", async () => {
    bcrypt.hash.mockResolvedValue("hashedSenha");
    Usuario.findOne.mockResolvedValue(null);
    Usuario.prototype.save.mockResolvedValue();

    const newUser = {
      username: "novoUsuario",
      cnpj: "12345678901234",
      email: "teste@exemplo.com",
      fantasyName: "Fantasia",
      password: "senhaSegura123",
      confirmPassword: "senhaSegura123",
    };

    const response = await request(app).post("/api/usuarios").send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Usuário cadastrado com sucesso");
  });

  it("deve retornar erro se o email já estiver cadastrado", async () => {
    Usuario.findOne.mockResolvedValue({ email: "teste@exemplo.com" });

    const newUser = {
      username: "novoUsuario",
      cnpj: "12345678901234",
      email: "teste@exemplo.com",
      fantasyName: "Fantasia",
      password: "senhaSegura123",
      confirmPassword: "senhaSegura123",
    };

    const response = await request(app).post("/api/usuarios").send(newUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Este email já está cadastrado");
  });
});
