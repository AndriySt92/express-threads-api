var express = require('express')
var router = express.Router()
const multer = require('multer')
const { UserController } = require('../controllers')

const uploadDestination = 'uploads'

// Show where keep image files
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage: storage })

/* GET home page. */
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/users/:id', UserController.getUserById)
router.get('/current', UserController.current)
router.put('/users/:id', UserController.updateUser)

module.exports = router
