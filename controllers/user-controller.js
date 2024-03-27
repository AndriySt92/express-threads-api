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
    const { id } = req.params
    const { email, name, dateOfBirth, bio, location } = req.body

    let filePath

    if (req.file && req.file.path) {
      filePath = req.file.path
    }
    // Check if the user updates own informations
    if (id !== req.user.userId) {
      return res
        .status(403)
        .json({ error: 'No access. You can update only your personal profile.' })
    }

    try {
      // user updates email
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: { email },
        })

        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({ error: 'User with such email already exist' })
        }
      }
      // user updates the other fields. Note - undefined means field still the same.
      const user = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
          dateOfBirth: dateOfBirth || undefined,
          bio: bio || undefined,
          location: location || undefined,
        },
      })
      res.json(user)
    } catch (error) {
      console.log('error', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  current: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          followers: {
            include: {
              follower: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(400).json({ error: 'Could not find user!' })
      }

      const { password, ...userInfo} = {user}

      return res.status(200).json(userInfo)
    } catch (error) {
      console.log('err', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },
}

module.exports = UserController
