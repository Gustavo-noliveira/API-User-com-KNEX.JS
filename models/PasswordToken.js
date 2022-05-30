var knex = require("../database/connection")
var User = require('./User')

class PasswordToken {

  async create(email) {
    var user = await User.findByEmail(email);
    if (user != undefined) {
      try {
        var token = Date.now()
        await knex.insert({
          user_id: user.id,
          used: 0,
          token: token
        }).table("passwordtokens");

        return { status: true, token: token }
      } catch (err) {
        console.log(err)
        return { status: false, err: err }
      }

    } else { // Statua nao existe 
      return { status: false, err: "O email não existe no BD" }
    }
  }

  async validate(token) {
    try {
      var result = await knex.select().where({ token: token }).table("passwordtokens")
      if (result.length > 0) {
        var tk = result[0];

        if (tk.used) { //TOKEN FOI USADO
          return { status: false }
        } else { //TOKEN NAO FOI USADO
          return { status: true, token: tk }
        }
      } else { //Token não existe
        return { status: false }
      }
    } catch (err) {
      return false
    }

  }

  async setUsed(token) {
    await knex.update({ used: 1 }).where({ token: token }).table("passwordtokens")
  }
}

module.exports = new PasswordToken()