const User = require("../models/User")
const PasswordToken = require("../models/PasswordToken")
const jwt = require("jsonwebtoken");
const { use } = require("../routes/routes");
var bcrypt = require("bcrypt")

var secret = "asdoasokasdoasdok123"

class UserController {
  async index(req, res) {
    var users = await User.findAll();
    res.json(users)
  }

  async findUser(req, res) {
    var id = req.params.id;
    var user = await User.findById(id)
    if (user == undefined) {
      res.status(404)
      res.send({ msg: "O ID não existe" })
    }
    res.json(user)
  }

  async create(req, res) {
    var { email, name, password } = req.body
    if (email == undefined) {
      res.status(403)
      res.json({ err: "O email é invalido" })
      return;
    } else if (password == undefined) {
      res.status(403)
      res.json({ err: "A senha é invalida" })
    } else {
      var emailExists = await User.findEmail(email);
      if (emailExists) {
        res.status(406);
        res.json({ err: "O e-mail já está cadastrado" })
        return
      } else {
        await User.new(email, password, name)
        res.status(200)
        res.send("Tudo ok")
      }


    }

  }

  async edit(req, res) {
    var { id, name, role, email } = req.body;
    var result = await User.update(id, email, name, role)
    if (result != undefined) {
      if (result.status) {
        res.send("Tudo ok")
      } else {
        res.status(406);
        res.json(result.err);
      }
    } else {
      res.status(406)
      res.send("Ocorreu um erro no servidor!")
    }
  }

  async remove(req, res) {
    var id = req.params.id
    var result = await User.delete(id);

    if (result.status) {
      res.status(200)
      res.send("Deletado com sucessp")
    } else {
      res.status(406)
      res.send(result.err)
    }
  }

  async recoverPassword(req, res) {
    var email = req.body.email;

    var result = await PasswordToken.create(email)

    if (result.status) {
      console.log(result.token)
      res.status(200)
      res.json(result.token);
    } else {
      res.status(406)
      res.send(result.err)
    }
  }

  async changePassword(req, res) {
    var token = req.body.token;
    var password = req.body.password;
    var isTokenValid = await PasswordToken.validate(token)

    if (isTokenValid.status) {
      await User.changePassword(password, isTokenValid.token.user_id, isTokenValid.token.token)
      res.status(200)
      res.send("senha alterada")
    } else {
      res.status(406)
      res.send("Token invalido")
    }
  }

  async login(req, res) {
    var { email, password } = req.body

    var user = await User.findByEmail(email);

    if (user != undefined) {
      var resultado = await bcrypt.compare(password, user.password)
      if (resultado) {
        var token = jwt.sign({ email: user.email, role: user.role }, secret)
        res.json({ token: token })
      } else {
        res.status(406)
        res.send("Senha incorreta")
      }
    } else { //Nao existe email
      res.json({ status: false })
    }
  }
}

module.exports = new UserController