const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')
const { prisma } = require('../prisma/prisma-client')
const Jdenticon = require('jdenticon')
const jwt = require('jsonwebtoken')

const UserController = {
  register: async (req, res) => {
    const { email, password, name } = req.body

    // Checked if the all fields is filled in
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: 'Please, fill in all the fields. All the fields are required!' })
    }

    try {
      // Checked if user with such email already exist
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ error: 'User with such email already exist' })
      }

      // Hashed password
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
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Please, fill in all the fields. All the fields are required!' })
    }

    try {
      // Find the user
      const user = await prisma.user.findUnique({ where: { email } })

      if (!user) {
        return res.status(400).json({ error: 'Incorrect password or login!' })
      }

      // Check the password
      const valid = await bcrypt.compare(password, user.password)

      if (!valid) {
        return res.status(400).json({ error: 'Incorrect password or login!' })
      }

      // Generate a JWT
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY)

      res.json({ token })
    } catch (error) {
      console.error('Error in login:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
  getUserById: async (req, res) => {
    const { id } = req.params
    const userId = req.user.userId

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          followers: true,
          following: true,
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Ckeck if current user follow for user
      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId: id }],
        },
      })

      res.json({ ...user, isFollowing: Boolean(isFollowing) })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  },
  updateUser: async (req, res) => {
    res.send('UpdateUser ok')
  },
  current: async (req, res) => {
    res.send('Current ok')
  },
}

module.exports = UserController
