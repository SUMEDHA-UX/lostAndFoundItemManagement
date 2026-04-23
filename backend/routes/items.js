const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// GET /api/items/search?name=xyz
// Define search BEFORE /:id to prevent "search" being treated as an id
router.get('/search', auth, async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const items = await Item.find({
      itemName: { $regex: name, $options: 'i' }
    }).populate('postedBy', 'name email');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/items
router.post('/', auth, async (req, res) => {
  const { itemName, description, type, location, date, contactInfo } = req.body;

  try {
    const newItem = new Item({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      postedBy: req.user.id
    });

    const item = await newItem.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items
router.get('/', auth, async (req, res) => {
  try {
    const items = await Item.find().populate('postedBy', 'name email').sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/items/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/items/:id
router.put('/:id', auth, async (req, res) => {
  const { itemName, description, type, location, date, contactInfo } = req.body;

  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: { itemName, description, type, location, date, contactInfo } },
      { returnDocument: 'after' }
    );

    res.json(item);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
