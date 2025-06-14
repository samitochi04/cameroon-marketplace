const { v4: uuidv4 } = require('uuid');
const Product = require('../models/product.model');
const slugify = require('../utils/slugify');

class ProductService {
  async createProduct(data) {
    try {
      const product = new Product({
        id: uuidv4(),
        vendor_id: data.vendorId,
        name: data.name,
        slug: slugify(data.name),
        description: data.description,
        price: data.price,
        sale_price: data.salePrice,
        stock_quantity: data.stockQuantity,
        status: data.status || 'draft',
        category_id: data.categoryId,
        images: data.images || [],
        created_at: new Date().toISOString(),
      });

      return await product.save();
    } catch (error) {
      console.error('Product service - Create product error:', error);
      throw error;
    }
  }

  async updateProduct(id, vendorId, data) {
    try {
      const product = await Product.findById(id);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if the product belongs to the vendor
      if (product.vendorId !== vendorId) {
        throw new Error('Unauthorized: Product does not belong to this vendor');
      }

      // Update product properties
      Object.assign(product, {
        name: data.name || product.name,
        slug: data.name ? slugify(data.name) : product.slug,
        description: data.description || product.description,
        price: data.price !== undefined ? data.price : product.price,
        salePrice: data.salePrice !== undefined ? data.salePrice : product.salePrice,
        stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : product.stockQuantity,
        status: data.status || product.status,
        categoryId: data.categoryId || product.categoryId,
        images: data.images || product.images,
      });

      return await product.save();
    } catch (error) {
      console.error('Product service - Update product error:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      return await Product.findById(id);
    } catch (error) {
      console.error('Product service - Get product error:', error);
      throw error;
    }
  }

  async getProductBySlug(slug) {
    try {
      return await Product.findBySlug(slug);
    } catch (error) {
      console.error('Product service - Get product by slug error:', error);
      throw error;
    }
  }

  async getProductsByVendor(vendorId, status = 'published') {
    try {
      return await Product.findByVendor(vendorId, status);
    } catch (error) {
      console.error('Product service - Get products by vendor error:', error);
      throw error;
    }
  }

  async getProductsByCategory(categoryId, status = 'published') {
    try {
      return await Product.findByCategory(categoryId, status);
    } catch (error) {
      console.error('Product service - Get products by category error:', error);
      throw error;
    }
  }

  async searchProducts(query) {
    try {
      return await Product.search(query);
    } catch (error) {
      console.error('Product service - Search products error:', error);
      throw error;
    }
  }

  async publishProduct(id, vendorId) {
    try {
      const product = await Product.findById(id);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if the product belongs to the vendor
      if (product.vendorId !== vendorId) {
        throw new Error('Unauthorized: Product does not belong to this vendor');
      }

      return await product.publish();
    } catch (error) {
      console.error('Product service - Publish product error:', error);
      throw error;
    }
  }

  async archiveProduct(id, vendorId) {
    try {
      const product = await Product.findById(id);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if the product belongs to the vendor
      if (product.vendorId !== vendorId) {
        throw new Error('Unauthorized: Product does not belong to this vendor');
      }

      return await product.archive();
    } catch (error) {
      console.error('Product service - Archive product error:', error);
      throw error;
    }
  }

  // Additional methods as needed
}

module.exports = new ProductService();