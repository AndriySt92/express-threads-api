const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require('fs');
const { prisma } = require("../prisma/prisma-client");
const Jdenticon = require('jdenticon');

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body

    // Checked if the all fields is filled in 
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Pleace, fill in all the fields. All the fields are required!' })
    }

    try {
      // Checked if user with such email already exist 
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ error: 'User with such email already exist' })
      }

      // Hashed name
      const hashedPassword = await bcrypt.hash(password, 10)

      // Generated avatar for user
      const png = Jdenticon.toPng(name, 200)
      const avatarName = `${name}_${Date.now()}.png`
      const avatarPath = path.join(__dirname, '/../uploads', avatarName)
      fs.writeFileSync(avatarPath, png)

      // Created user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      })

      res.json(user)
    } catch (error) {
      console.error('Error in register:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
  login: async (req, res) => {
    res.send('Login ok')
  },
  getUserById: async (req, res) => {
    res.send('GetUserById ok')
  },
  updateUser: async (req, res) => {
    res.send('UpdateUser ok')
  },
  current: async (req, res) => {
    res.send('Current ok')
  },
}

module.exports = UserController
