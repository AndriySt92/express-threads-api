const { prisma } = require('../prisma/prisma-client')

const CommentController = {
  createComment: async (req, res) => {
    try {
      const { postId, content } = req.body
      const userId = req.user.userId

      if (!postId || !content) {
        return res
          .status(400)
          .json({ error: 'Please, fill in all the fields. All the fields are required!' })
      }

      const comment = await prisma.comment.create({
        data: {
          postId,
          userId,
          content,
        },
      })

      res.json(comment)
    } catch (error) {
      console.error('Error creating comment:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  deleteComment: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.userId

      // Check if comment exists
      const comment = await prisma.comment.findUnique({ where: { id } })

      if (!comment) {
        return res.status(404).json({ error: 'Комментарий не найден' })
      }

      // Check if the user is the owner of the comment
      if (comment.userId !== userId) {
        return res.status(403).json({ error: 'Вы не авторизованы для удаления этого комментария' })
      }

      // Delete the comment
      await prisma.comment.delete({ where: { id } })

      res.json(comment)
    } catch (error) {
      console.error('Error deleting comment:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  },

  updateComment: async (req, res) => {
    const { id } = req.params
    const { content } = req.body

    if (!content) {
      res.status(404).json({ error: 'Please, fill in content field!' })
    }

    try {
      const comment = await prisma.comment.findUnique({ where: { id } })

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' })
      }

      if (comment.userId !== req.user.userId) {
        return res.status(403).json({ error: 'No access. You can update only your comment.' })
      }

      const updatedComment = await prisma.comment.update({
        where: { id },
        data: {
          content,
        },
      })

      res.status(200).json(updatedComment)
    } catch (error) {
      console.error('Update comment error', error)

      res.status(500).json({ error: 'Internal server error' })
    }
  },
}

module.exports = CommentController
