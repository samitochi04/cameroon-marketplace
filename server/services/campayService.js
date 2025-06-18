const axios = require('axios');
require('dotenv').config();

const CAMPAY_BASE_URL = process.env.CAMPAY_BASE_URL || 'https://demo.campay.net';

exports.createCampayPayment = async (paymentInfo) => {
    try {
        console.log('Initiating Campay payment with:', paymentInfo);
        
        const {
            transaction_id,
            amount,
            phone_number,
            description,
            external_reference
        } = paymentInfo;
        
        const token = process.env.CAMPAY_TOKEN;
        
        if (!token) {
            console.warn('Missing Campay token. Using development mode.');
            // Return mock data for development
            return {
                reference: `dev_ref_${Date.now()}`,
                status: 'PENDING',
                code: `CP${Date.now()}`,
                operator: 'MTN'
            };
        }
        
        // For demo environment, limit amount to 100 XAF
        let adjustedAmount = Number(amount);
        if (CAMPAY_BASE_URL.includes('demo') && adjustedAmount > 100) {
            console.log(`Demo mode: Adjusting amount from ${adjustedAmount} to 100 XAF`);
            adjustedAmount = 100;
        }
        
        // Validate phone number format (should start with 237)
        let formattedPhone = phone_number;
        if (typeof phone_number === 'string') {
            // Remove any non-digit characters except +
            const cleaned = phone_number.replace(/[^\d+]/g, '');
            
            // If it starts with +237, remove the +
            if (cleaned.startsWith('+237')) {
                formattedPhone = cleaned.substring(1);
            }
            // If it doesn't start with 237, add it
            else if (!cleaned.startsWith('237')) {
                formattedPhone = `237${cleaned}`;
            }
            else {
                formattedPhone = cleaned;
            }
        }
        
        const payload = {
            amount: adjustedAmount.toString(),
            from: formattedPhone,
            description: description || `Payment for order #${transaction_id}`,
            external_reference: external_reference || transaction_id.toString()
        };

        console.log('Sending to Campay:', payload);
        
        const response = await axios.post(
            `${CAMPAY_BASE_URL}/api/collect/`,
            payload,
            {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Campay response:', response.data);
        
        if (response.data && response.data.reference) {
            return {
                reference: response.data.reference,
                status: response.data.status || 'PENDING',
                code: response.data.code,
                operator: response.data.operator,
                ussd_code: response.data.ussd_code
            };
        } else {
            throw new Error('Campay payment creation failed: ' + JSON.stringify(response.data));
        }
    } catch (error) {
        console.error('Error creating Campay payment:', error);
        console.error('Error response data:', error.response?.data);
        
        // Provide fallback for development or demo limitations
        if (process.env.NODE_ENV !== 'production' || error.response?.data?.error_code === 'ER201') {
            console.log('Using mock payment data for development or demo limitation');
            return {
                reference: `mock_ref_${Date.now()}`,
                status: 'PENDING',
                code: `CP${Date.now()}`,
                operator: 'MTN'
            };
        }
        throw error;
    }
};

exports.checkPaymentStatus = async (reference) => {
    try {
        const token = process.env.CAMPAY_TOKEN;
        
        if (!token || reference.startsWith('mock_') || reference.startsWith('dev_')) {
            console.warn('Missing Campay token or mock reference. Using development mode.');
            return {
                reference,
                status: 'SUCCESSFUL',
                operator: 'MTN'
            };
        }
        
        const response = await axios.get(
            `${CAMPAY_BASE_URL}/api/transaction/${reference}/`,
            {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Campay status response:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('Error checking Campay payment status:', error);
        
        // Fallback for development or mock references
        if (process.env.NODE_ENV !== 'production' || reference.startsWith('mock_') || reference.startsWith('dev_')) {
            return {
                reference,
                status: 'SUCCESSFUL',
                operator: 'MTN'
            };
        }
        throw error;
    }
};

exports.getTransactionHistory = async (startDate, endDate) => {
    try {
        const token = process.env.CAMPAY_TOKEN;
        
        if (!token) {
            throw new Error('Missing Campay token');
        }
        
        const payload = {
            start_date: startDate, // Format: YYYY-MM-DD
            end_date: endDate
        };
        
        const response = await axios.post(
            `${CAMPAY_BASE_URL}/api/history/`,
            payload,
            {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching Campay transaction history:', error);
        throw error;
    }
};
