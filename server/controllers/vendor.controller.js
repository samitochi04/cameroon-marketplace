const vendorService = require('../services/vendor.service');

exports.registerVendor = async (req, res) => {
  try {
    const { storeName, description } = req.body;
    const userId = req.user.id;

    // Create vendor
    const vendor = await vendorService.createVendor({
      id: userId,
      storeName,
      description,
      logoUrl: req.body.logoUrl || null,
      bannerUrl: req.body.bannerUrl || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Vendor registered successfully, awaiting approval',
      data: vendor,
    });
  } catch (error) {
    console.error('Register vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Vendor registration failed',
      error: error.message,
    });
  }
};

exports.getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const vendor = await vendorService.getVendorById(vendorId);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor profile',
      error: error.message,
    });
  }
};

exports.updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const vendor = await vendorService.updateVendor(vendorId, {
      storeName: req.body.storeName,
      description: req.body.description,
      logoUrl: req.body.logoUrl,
      bannerUrl: req.body.bannerUrl,
    });

    return res.status(200).json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: vendor,
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update vendor profile',
      error: error.message,
    });
  }
};

// Admin endpoints for vendor management
exports.getPendingVendors = async (req, res) => {
  try {
    const vendors = await vendorService.getPendingVendors();

    return res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    console.error('Get pending vendors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get pending vendors',
      error: error.message,
    });
  }
};

exports.approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.approveVendor(id);

    return res.status(200).json({
      success: true,
      message: 'Vendor approved successfully',
      data: vendor,
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve vendor',
      error: error.message,
    });
  }
};

exports.rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await vendorService.rejectVendor(id);

    return res.status(200).json({
      success: true,
      message: 'Vendor rejected successfully',
      data: vendor,
    });
  } catch (error) {
    console.error('Reject vendor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject vendor',
      error: error.message,
    });
  }
};