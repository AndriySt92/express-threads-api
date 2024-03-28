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
    const { id } = req.params
    const userId = req.user.userId

    try {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          comments: {
            include: {
              user: true,
            },
          },
          likes: true,
          author: true,
        }, // Include related posts
      })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const postWithLikeInfo = {
        ...post,
        likedByUser: post.likes.some((like) => like.userId === userId),
      }

      res.json(postWithLikeInfo)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  deletePost: async (req, res) => {
    const { id } = req.params

    // Проверка, что пользователь удаляет свой пост
    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (post.authorId !== req.user.userId) {
      return res.status(403).json({ error: 'No access. You can delete only your post.' })
    }

    try {
      const transaction = await prisma.$transaction([
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
      ])

      res.json(transaction)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  },
  updatePost: async (req, res) => {
    const { id } = req.params
    const { content } = req.body

    if (!content) {
      res.status(404).json({ error: 'Please, fill in content field!' })
    }

    try {
      const post = await prisma.post.findUnique({ where: { id } })

      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      if (post.authorId !== req.user.userId) {
        return res.status(403).json({ error: 'No access. You can update only your post.' })
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          content,
        },
      })

      res.status(200).json(updatedPost)
    } catch (error) {
      console.error('Update post error', error)

      res.status(500).json({ error: 'Internal server error' })
    }
  },
}

module.exports = PostController
