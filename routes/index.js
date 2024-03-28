var express = require('express')
var router = express.Router()
const multer = require('multer')
const { UserController, PostController } = require('../controllers')
const { authenticateToken } = require('../middleware/auth')

const uploadDestination = 'uploads'

// Show where keep image files
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage: storage })

/* Users routers. */
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/users/:id', authenticateToken, UserController.getUserById)
router.get('/current', authenticateToken, UserController.current)
router.put('/users/:id', authenticateToken, UserController.updateUser)

// Posts routers
router.post("/posts", authenticateToken, PostController.createPost);
router.get("/posts", authenticateToken, PostController.getAllPosts);
router.get("/posts/:id", authenticateToken, PostController.getPostById);
router.delete("/posts/:id", authenticateToken, PostController.deletePost);
router.patch("/posts/:id", authenticateToken, PostController.updatePost);

module.exports = router
