const { prisma } = require('../prisma/prisma-client');

const PostController = {
  createPost: async (req, res) => {
    const { content } = req.body;

    const authorId = req.user.userId;

    if (!content) {
      return res.status(400).json({ error: 'Please, fill in all the fields. All the fields are required!' });
    }

    try {
      const post = await prisma.post.create({
        data: {
          content,
          authorId
        },
      });

      res.json(post);
    } catch (error) {
      console.error("Error in createPost:", error);

      res.status(500).json({ error: 'There was an error creating the post' });
    }
  },

  getAllPosts: async (req, res) => {
    res.send('Get all post')
  },

  getPostById: async (req, res) => {
    res.send('get all posts')
 },


  deletePost: async (req, res) => {
   res.send('delete post')
  }
};

module.exports = PostController