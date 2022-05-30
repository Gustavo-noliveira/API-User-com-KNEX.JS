const knex = require("../database/connection")
const bcrypt = require("bcrypt")
const { use } = require("../routes/routes")
const PasswordToken = require("./PasswordToken")

class User {

  async findAll() {
    try {
      var result = await knex.select("id", "name", "email", "role").table("users")
      return result
    } catch (err) {
      console.log(err)
      return [];
    }

  }

  async findById(id) {
    try {
      var result = await knex.select("id", "name", "email", "role").where({ id: id }).table("users")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
      return undefined;
    }
  }

  async findByEmail(email) {
    try {
      var result = await knex.select("id", "name", "password", "email", "role").where({ email: email }).table("users")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
      return undefined;
    }
  }

  async new(email, password, name) {

    try {

      var hash = await bcrypt.hash(password, 10)
      await knex.insert({ email, password: hash, name, role: 0 }).table('users')
    } catch (err) {
      console.log(err)
    }

  }

  async findEmail(email) {
    try {
      const haveEmail = await knex.select("*").from("users").where({ email: email })
      if (haveEmail.length > 0) {
        return true
      } else {
        return false
      }
    } catch (err) {
      console.log(err)
    }

  }

  async update(id, email, name, role) {
    var user = await this.findById(id)

    if (user != undefined) {
      var editUser = {};
      if (email = !undefined) { //Verificando se o email existe
        if (email != user.email) { //Verificando se o email não é o mesmo do atual
          var result = await this.findEmail(email)
          if (result == false) { // Email não existe no BD
            editUser.email = email
          } else { //Email existe no bdd

          }
        } else { // Caso o email seja o mesmo do atual
          return { status: false, err: "O email já está cadastrado" }
        }
      }

      if (name != undefined) {
        editUser.name = name;
      }

      if (role != undefined) {
        editUser.role = role;
      }

      try {
        await knex.update(editUser).where({ id: id }).table("users")
        return { status: true }
      } catch (err) {
        return { status: false, err: err }
      }


    } else { // Caso o email não exista
      return { status: false, err: "O usuario não existe" }
    }
  }

  async delete(id) {
    var user = await this.findById(id);
    if (user != undefined) {
      try {
        await knex.delete().where({ id: id }).table("users")
        return { status: true }
      } catch (err) {
        return { status: false, err: err }
      }
    } else { //Não existe o id
      return { status: false, err: "O Usuario não existe" }
    }
  }

  async changePassword(newPassword, id, token) {
    var hash = await bcrypt.hash(newPassword, 10)
    await knex.update({ password: hash }).where({ id: id }).table("users")
    await PasswordToken.setUsed(token)
  }
}



module.exports = new User()