const express = require('express');
const router = express.Router();
const { Post, User, Tag, PostImage, Comment } = require('../models');

router.get('/', async (req, res) => {
  const where = req.query.userId ? { UserId: req.query.userId } : {};
  const posts = await Post.findAll({ where, include: [User, Tag, PostImage,Comment] });
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  const post = await Post.findByPk(req.params.id, { include: [User, Tag, PostImage,Comment] });
  post ? res.json(post) : res.status(404).json({ error: 'Post no encontrado' });
});

router.post('/', async (req, res) => {
  const { description, userId, tagIds = [], tagNames = [] } = req.body;
  if (!description || !userId) return res.status(400).json({ error: 'Faltan datos' });

  try {
    const nuevo = await Post.create({ description, UserId: userId });

    let idsFinales = [...tagIds];

    if (tagNames.length > 0) {
      for (const nombre of tagNames) {
        const nombreLimpio = nombre.trim().toLowerCase();
        if (!nombreLimpio) continue;

        const [tag] = await Tag.findOrCreate({
          where: { name: nombreLimpio }
        });

        idsFinales.push(tag.id);
      }
    }

    if (idsFinales.length > 0) await nuevo.setTags(idsFinales);

    const creado = await Post.findByPk(nuevo.id, { include: [Tag] });
    res.status(201).json(creado);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear post', details: e.message });
  }
});

module.exports = router;