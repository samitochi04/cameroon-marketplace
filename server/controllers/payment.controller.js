const paymentService = require('../services/payment.service');

// Initialize payment
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, customer, description, metadata, vendorId } = req.body;
    
    if (!amount || !customer || !vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for payment initialization',
      });
    }

    const payment = await paymentService.initiateTransaction({
      amount,
      customer,
      description,
      metadata,
      vendorId
    });

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message,
    });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    
    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference is required',
      });
    }

    const payment = await paymentService.verifyTransaction(reference);

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
};

// Handle webhook from Cinetpay
exports.handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook authenticity
    // (Cinetpay webhooks should be verified with appropriate security checks)
    
    // Process webhook data
    if (webhookData.status === 'ACCEPTED') {
      await paymentService.verifyTransaction(webhookData.transaction_id);
    }

    // Always return 200 to acknowledge receipt of webhook
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Still return 200 to acknowledge receipt, but log the error
    return res.status(200).json({ received: true });
  }
};

// Register vendor with Cinetpay
exports.registerVendor = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const vendorData = {
      id: vendorId,
      ...req.body
    };
    
    const result = await paymentService.registerVendorWithCinetpay(vendorData);

    return res.status(200).json({
      success: true,
      message: 'Vendor registered successfully with Cinetpay',
      data: result,
    });
  } catch (error) {
    console.error('Register vendor with Cinetpay error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register vendor with Cinetpay',
      error: error.message,
    });
  }
};

// Get vendor payment information
exports.getVendorPaymentInfo = async (req, res) => {
  try {
    const vendorId = req.user.id;
    
    // Get earnings history
    const earningsHistory = await paymentService.getVendorEarningsHistory(vendorId);
    
    // Get payout history
    const payoutHistory = await paymentService.getVendorPayoutHistory(vendorId);
    
    // Get transaction history
    const transactionHistory = await paymentService.getVendorTransactionHistory(vendorId);
    
    // Calculate earnings and commission stats
    const totalEarnings = transactionHistory.reduce((sum, tx) => 
      tx.status === 'successful' ? sum + Number(tx.vendor_amount) : sum, 0
    );
    
    const totalCommission = transactionHistory.reduce((sum, tx) => 
      tx.status === 'successful' ? sum + Number(tx.commission) : sum, 0
    );
    
    return res.status(200).json({
      success: true,
      data: {
        earningsHistory,
        payoutHistory,
        transactionHistory,
        stats: {
          totalEarnings,
          totalCommission,
          transactionCount: transactionHistory.filter(tx => tx.status === 'successful').length,
          pendingPayouts: payoutHistory.filter(p => p.status === 'pending').length
        }
      },
    });
  } catch (error) {
    console.error('Get vendor payment info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get vendor payment information',
      error: error.message,
    });
  }
};

// Update vendor payment settings
exports.updateVendorPaymentSettings = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bankName, accountNumber, accountHolderName, payoutFrequency, payoutThreshold, paymentMethods } = req.body;
    
    // Update vendor payment settings in database
    const { data, error } = await supabase
      .from('vendors')
      .update({
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
        payout_frequency: payoutFrequency,
        payout_threshold: payoutThreshold,
        payment_methods: paymentMethods,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;
    
    return res.status(200).json({
      success: true,
      message: 'Payment settings updated successfully',
      data,
    });
  } catch (error) {
    console.error('Update vendor payment settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment settings',
      error: error.message,
    });
  }
};
