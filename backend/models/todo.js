const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: { //  Title requires a string with min/max limits.
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  done: {
    type: Boolean,
    default: false
  },
  owner: { // Owner must be a valid MongoDB ObjectId referencing a User
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

// Index for faster queries by owner
todoSchema.index({ owner: 1, createdAt: -1 });

// Instance method to get safe todo data (if needed)
todoSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    title: this.title,
    done: this.done,
    owner: this.owner,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Todo', todoSchema);