import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    default: '',
  },
  ingredients: [{
    type: String,
    required: true,
  }],
  instructions: [{
    type: String,
    required: true,
  }],
  imageUrl: {
    type: String,
    required: false,
    default: '',
  },
  prepTime: {
    type: Number,
    required: true,
  },
  cookTime: {
    type: Number,
    required: true,
  },
  cuisineType: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema); 