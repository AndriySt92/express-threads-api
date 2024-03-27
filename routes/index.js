var express = require('express')
var router = express.Router()
const multer = require('multer')

const uploadDestination = 'uploads';

// Show where keep image files
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

/* GET home page. */
router.get('/register', function (req, res) {
  res.send('register and hello')
})

module.exports = router
