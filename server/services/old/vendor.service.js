const supabase = require('../config/supabase');
const Vendor = require('../models/vendor.model');

class VendorService {
  async createVendor(vendorData) {
    try {
      const vendor = new Vendor({
        id: vendorData.id,
        store_name: vendorData.storeName,
        description: vendorData.description,
        logo_url: vendorData.logoUrl,
        banner_url: vendorData.bannerUrl,
        created_at: new Date().toISOString(),
      });
      
      return await vendor.save();
    } catch (error) {
      console.error('Vendor service - Create vendor error:', error);
      throw error;
    }
  }

  async getVendorById(id) {
    try {
      return await Vendor.findById(id);
    } catch (error) {
      console.error('Vendor service - Get vendor error:', error);
      throw error;
    }
  }

  async updateVendor(id, data) {
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      // Update vendor properties
      Object.assign(vendor, {
        storeName: data.storeName || vendor.storeName,
        description: data.description || vendor.description,
        logoUrl: data.logoUrl || vendor.logoUrl,
        bannerUrl: data.bannerUrl || vendor.bannerUrl,
      });

      return await vendor.save();
    } catch (error) {
      console.error('Vendor service - Update vendor error:', error);
      throw error;
    }
  }

  async approveVendor(id) {
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      return await vendor.updateStatus('approved');
    } catch (error) {
      console.error('Vendor service - Approve vendor error:', error);
      throw error;
    }
  }

  async rejectVendor(id) {
    try {
      const vendor = await Vendor.findById(id);
      if (!vendor) {
        throw new Error('Vendor not found');
      }

      return await vendor.updateStatus('rejected');
    } catch (error) {
      console.error('Vendor service - Reject vendor error:', error);
      throw error;
    }
  }

  async getPendingVendors() {
    try {
      return await Vendor.findByStatus('pending');
    } catch (error) {
      console.error('Vendor service - Get pending vendors error:', error);
      throw error;
    }
  }

  // Additional methods as needed
}

module.exports = new VendorService();