import { supabase } from '@/lib/supabase';

/**
 * Check vendor approval status and return appropriate message
 * @param {string} userId The user ID to check
 * @returns {Promise<{ isApproved: boolean, isPending: boolean, isRejected: boolean, message: string }>}
 */
export const checkVendorStatus = async (userId) => {
  try {
    // Get vendor record
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      throw error;
    }
    
    if (!vendor) {
      return {
        isApproved: false,
        isPending: false,
        isRejected: false,
        message: 'Vendor profile not found. Please contact support.'
      };
    }
    
    const status = vendor.status;
    
    switch (status) {
      case 'approved':
        return {
          isApproved: true,
          isPending: false,
          isRejected: false,
          message: 'Your vendor account is approved.'
        };
      case 'pending':
        return {
          isApproved: false,
          isPending: true,
          isRejected: false,
          message: 'Your vendor application is pending review. You will be notified once approved.'
        };
      case 'rejected':
        return {
          isApproved: false,
          isPending: false,
          isRejected: true,
          message: 'Your vendor application was not approved. Please contact support for more details.'
        };
      default:
        return {
          isApproved: false,
          isPending: false,
          isRejected: false,
          message: 'Unknown status. Please contact support.'
        };
    }
  } catch (error) {
    console.error('Error checking vendor status:', error);
    return {
      isApproved: false,
      isPending: false,
      isRejected: false,
      message: 'Error checking vendor status. Please try again later.'
    };
  }
};

/**
 * Create a vendor profile for a user if it doesn't exist already
 * @param {string} userId The user ID
 * @param {object} vendorData Basic vendor data
 * @returns {Promise<boolean>} Whether profile was created
 */
export const ensureVendorProfile = async (userId, vendorData = {}) => {
  try {
    // Check if vendor profile exists
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (vendor) {
      return true; // Profile already exists
    }
    
    // Create vendor profile if it doesn't exist
    const { error } = await supabase
      .from('vendors')
      .insert([{
        id: userId,
        store_name: vendorData.store_name || `Store ${vendorData.name || 'New Vendor'}`,
        description: vendorData.description || 'New vendor store',
        status: 'pending'
      }]);
      
    if (error) {
      console.error('Error creating vendor profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring vendor profile:', error);
    return false;
  }
};
