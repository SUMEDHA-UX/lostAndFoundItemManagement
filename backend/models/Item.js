const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Lost', 'Found'], required: true },
  location: { type: String, required: true },
  date: { type: Date, default: Date.now },
  contactInfo: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Item', ItemSchema);
