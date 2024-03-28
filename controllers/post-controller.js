const { prisma } = require('../prisma/prisma-client')

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body

    const authorId = req.user.userId

    if (!content) {
      return res
        .status(400)
        .json({ error: 'Please, fill in all the fields. All the fields are required!' })
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId,
        },
      })

      res.json(post)
    } catch (error) {
      console.error('Error in createPost:', error)

      res.status(500).json({ error: 'There was an error creating the post' })
    }
  },

  getAllPosts: async (req, res) => {
    const userId = req.user.userId

    try {
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          author: true,
          comments: true,
        },
        orderBy: {
          createdAt: 'desc', // 'desc' means to show the newest posts first
        },
      })

      const postsWithLikeInfo = posts.map((post) => ({
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }))

      res.json(postsWithLikeInfo)
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' })
    }
  },
  getPostById: async (req, res) => {
    res.send('get all posts')
  },

  deletePost: async (req, res) => {
    res.send('delete post')
  },
}

module.exports = PostController
