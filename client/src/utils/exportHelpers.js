/**
 * Utility functions for exporting data to various formats
 */

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Object} options - Export options
 */
export const exportToCsv = (data, filename = 'export', options = {}) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }
  const {
    delimiter = ',',
    includeHeaders = true,
  } = options;

  try {
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Escape CSV values
    const escapeValue = (value) => {
      if (value === null || value === undefined) return '';
      
      const stringValue = String(value);
      
      // If value contains delimiter, newlines, or quotes, wrap in quotes and escape quotes
      if (stringValue.includes(delimiter) || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    };

    // Build CSV content
    let csvContent = '';
    
    // Add headers if requested
    if (includeHeaders) {
      csvContent += headers.map(header => escapeValue(header)).join(delimiter) + '\n';
    }
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        
        // Handle date formatting
        if (value instanceof Date) {
          value = value.toISOString().split('T')[0];
        } else if (typeof value === 'string' && isDateString(value)) {
          value = new Date(value).toISOString().split('T')[0];
        }
        
        return escapeValue(value);
      });
      
      csvContent += values.join(delimiter) + '\n';
    });

    // Create and trigger download
    downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
    
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
};

/**
 * Export data to JSON format
 * @param {Array|Object} data - Data to export
 * @param {string} filename - Name of the file (without extension)
 * @param {boolean} pretty - Whether to format JSON with indentation
 */
export const exportToJson = (data, filename = 'export', pretty = true) => {
  if (!data) {
    console.warn('No data to export');
    return;
  }

  try {
    const jsonContent = pretty 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    
    downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
    
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Failed to export data to JSON');
  }
};

/**
 * Export data to Excel-compatible format (Tab-separated values)
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 */
export const exportToExcel = (data, filename = 'export') => {
  exportToCsv(data, filename, { delimiter: '\t' });
};

/**
 * Create and trigger file download
 * @param {string} content - File content
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 */
const downloadFile = (content, filename, mimeType) => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Check if a string represents a date
 * @param {string} str - String to check
 * @returns {boolean} True if the string is a valid date
 */
const isDateString = (str) => {
  // Check for common date formats
  const datePattern = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{4}\/\d{2}\/\d{2}/;
  return datePattern.test(str) && !isNaN(Date.parse(str));
};

/**
 * Format data for export with common transformations
 * @param {Array} data - Raw data array
 * @param {Object} formatOptions - Formatting options
 * @returns {Array} Formatted data array
 */
export const formatDataForExport = (data, formatOptions = {}) => {
  const {
    dateFields = [],
    currencyFields = [],
    excludeFields = [],
    customFormatters = {}
  } = formatOptions;

  return data.map(item => {
    const formattedItem = {};
    
    Object.keys(item).forEach(key => {
      // Skip excluded fields
      if (excludeFields.includes(key)) return;
      
      let value = item[key];
      
      // Apply custom formatter if available
      if (customFormatters[key]) {
        value = customFormatters[key](value);
      }
      // Format date fields
      else if (dateFields.includes(key) && value) {
        value = new Date(value).toLocaleDateString();
      }
      // Format currency fields
      else if (currencyFields.includes(key) && typeof value === 'number') {
        value = new Intl.NumberFormat('fr-CM', {
          style: 'currency',
          currency: 'XAF',
          maximumFractionDigits: 0
        }).format(value);
      }
      
      formattedItem[key] = value;
    });
    
    return formattedItem;
  });
};

/**
 * Export orders data with proper formatting
 * @param {Array} orders - Orders array
 * @param {string} filename - Export filename
 */
export const exportOrdersData = (orders, filename = 'orders-export') => {
  const formattedOrders = formatDataForExport(orders, {
    dateFields: ['createdAt', 'updatedAt'],
    currencyFields: ['totalAmount', 'subtotal', 'shippingCost', 'tax'],
    excludeFields: ['items', 'user', 'vendor'], // Exclude complex nested objects
    customFormatters: {
      status: (status) => status?.charAt(0).toUpperCase() + status?.slice(1) || '',
      paymentStatus: (status) => status?.charAt(0).toUpperCase() + status?.slice(1) || '',
      paymentMethod: (method) => method?.charAt(0).toUpperCase() + method?.slice(1) || ''
    }
  });

  exportToCsv(formattedOrders, filename);
};

/**
 * Export products data with proper formatting
 * @param {Array} products - Products array
 * @param {string} filename - Export filename
 */
export const exportProductsData = (products, filename = 'products-export') => {
  const formattedProducts = formatDataForExport(products, {
    dateFields: ['createdAt', 'updatedAt'],
    currencyFields: ['price', 'salePrice'],
    excludeFields: ['images', 'vendor', 'category'], // Exclude complex objects
    customFormatters: {
      status: (status) => status?.charAt(0).toUpperCase() + status?.slice(1) || '',
      vendor: (vendor) => vendor?.storeName || vendor?.name || '',
      category: (category) => category?.name || ''
    }
  });

  exportToCsv(formattedProducts, filename);
};

/**
 * Export vendors data with proper formatting
 * @param {Array} vendors - Vendors array
 * @param {string} filename - Export filename
 */
export const exportVendorsData = (vendors, filename = 'vendors-export') => {
  const formattedVendors = formatDataForExport(vendors, {
    dateFields: ['createdAt', 'updatedAt'],
    excludeFields: ['logoUrl', 'bannerUrl'], // Exclude image URLs
    customFormatters: {
      status: (status) => status?.charAt(0).toUpperCase() + status?.slice(1) || '',
      commissionRate: (rate) => `${rate || 0}%`
    }
  });

  exportToCsv(formattedVendors, filename);
};