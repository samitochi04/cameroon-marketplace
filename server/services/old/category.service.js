const { v4: uuidv4 } = require('uuid');
const Category = require('../models/category.model');
const slugify = require('../utils/slugify');

class CategoryService {
  async createCategory(data) {
    try {
      const category = new Category({
        id: uuidv4(),
        name: data.name,
        slug: slugify(data.name),
        description: data.description,
        parent_id: data.parentId || null,
        created_at: new Date().toISOString(),
      });

      return await category.save();
    } catch (error) {
      console.error('Category service - Create category error:', error);
      throw error;
    }
  }

  async updateCategory(id, data) {
    try {
      const category = await Category.findById(id);
      if (!category) {
        throw new Error('Category not found');
      }

      // Update category properties
      Object.assign(category, {
        name: data.name || category.name,
        slug: data.name ? slugify(data.name) : category.slug,
        description: data.description || category.description,
        parentId: data.parentId !== undefined ? data.parentId : category.parentId,
      });

      return await category.save();
    } catch (error) {
      console.error('Category service - Update category error:', error);
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      return await Category.findById(id);
    } catch (error) {
      console.error('Category service - Get category error:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug) {
    try {
      return await Category.findBySlug(slug);
    } catch (error) {
      console.error('Category service - Get category by slug error:', error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      return await Category.findAll();
    } catch (error) {
      console.error('Category service - Get all categories error:', error);
      throw error;
    }
  }

  async getTopLevelCategories() {
    try {
      return await Category.findByParentId(null);
    } catch (error) {
      console.error('Category service - Get top level categories error:', error);
      throw error;
    }
  }

  async getSubcategories(parentId) {
    try {
      return await Category.findByParentId(parentId);
    } catch (error) {
      console.error('Category service - Get subcategories error:', error);
      throw error;
    }
  }

  // Additional methods as needed
}

module.exports = new CategoryService();