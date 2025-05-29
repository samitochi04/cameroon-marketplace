const productService = require('../services/product.service');

// Vendor product management
exports.createProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { name, description, price, salePrice, stockQuantity, categoryId, images } = req.body;

    const product = await productService.createProduct({
      vendorId,
      name,
      description,
      price,
      salePrice,
      stockQuantity,
      categoryId,
      images,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;
    const { name, description, price, salePrice, stockQuantity, categoryId, images, status } = req.body;

    const product = await productService.updateProduct(id, vendorId, {
      name,
      description,
      price,
      salePrice,
      stockQuantity,
      categoryId,
      images,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

exports.getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { status } = req.query;
    
    const products = await productService.getProductsByVendor(vendorId, status || 'all');

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get vendor products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message,
    });
  }
};

exports.publishProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;

    const product = await productService.publishProduct(id, vendorId);

    return res.status(200).json({
      success: true,
      message: 'Product published successfully',
      data: product,
    });
  } catch (error) {
    console.error('Publish product error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to publish product',
      error: error.message,
    });
  }
};

exports.archiveProduct = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { id } = req.params;

    const product = await productService.archiveProduct(id, vendorId);

    return res.status(200).json({
      success: true,
      message: 'Product archived successfully',
      data: product,
    });
  } catch (error) {
    console.error('Archive product error:', error);
    
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to archive product',
      error: error.message,
    });
  }
};

// Public product routes
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message,
    });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await productService.getProductBySlug(slug);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message,
    });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const products = await productService.getProductsByCategory(categoryId);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message,
    });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const products = await productService.searchProducts(query);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Search products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message,
    });
  }
};