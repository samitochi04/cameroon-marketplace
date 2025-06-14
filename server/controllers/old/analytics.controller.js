const analyticsService = require('../../services/old/analytics.service');

// Admin analytics endpoints
exports.getPlatformSummary = async (req, res) => {
  try {
    const summary = await analyticsService.getPlatformSummary();

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get platform summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get platform summary',
      error: error.message,
    });
  }
};

exports.getSalesOverTime = async (req, res) => {
  try {
    const { period } = req.query;
    
    const data = await analyticsService.getSalesOverTime(period);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get sales over time error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get sales data',
      error: error.message,
    });
  }
};

exports.getTopSellingProducts = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const data = await analyticsService.getTopSellingProducts(parseInt(limit) || 10);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get top selling products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get top selling products',
      error: error.message,
    });
  }
};

// Vendor analytics endpoints
exports.getVendorSummary = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    const summary = await analyticsService.getVendorSummary(vendorId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get vendor summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor summary',
      error: error.message,
    });
  }
};

exports.getVendorSalesOverTime = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { period } = req.query;
    
    const data = await analyticsService.getVendorSalesOverTime(vendorId, period);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get vendor sales over time error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get sales data',
      error: error.message,
    });
  }
};

exports.getVendorTopProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { limit } = req.query;
    
    const data = await analyticsService.getVendorTopProducts(vendorId, parseInt(limit) || 5);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get vendor top products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get top products',
      error: error.message,
    });
  }
};