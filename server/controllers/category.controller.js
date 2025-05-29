const categoryService = require('../services/category.service');

exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

    const category = await categoryService.createCategory({
      name,
      description,
      parentId,
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;

    const category = await categoryService.updateCategory(id, {
      name,
      description,
      parentId,
    });

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await categoryService.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get all categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message,
    });
  }
};

exports.getTopLevelCategories = async (req, res) => {
  try {
    const categories = await categoryService.getTopLevelCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get top level categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get top level categories',
      error: error.message,
    });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subcategories = await categoryService.getSubcategories(id);

    return res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get subcategories',
      error: error.message,
    });
  }
};