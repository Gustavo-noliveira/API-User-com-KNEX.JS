var express = require("express")
var app = express();
var router = express.Router();
var HomeController = require("../controllers/HomeController");
const UserController = require("../controllers/UserController")
const AdminAuth = require("../middlware/AdminAuth")

router.get('/', HomeController.index);
router.post('/user', UserController.create)
router.get("/user", AdminAuth, UserController.index)
router.get("/userId/:id", UserController.findUser)
router.put("/user", UserController.edit)
router.delete("/user/:id", UserController.remove)
router.post("/recoverpassword", UserController.recoverPassword)
router.post("/changepassword", UserController.changePassword)
router.post("/login", UserController.login)
module.exports = router;