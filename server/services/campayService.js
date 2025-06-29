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
            
            // Detect operator from phone number for mock response
            const phoneToCheck = phone_number.replace(/\D/g, '').replace(/^237/, '');
            const firstTwoDigits = phoneToCheck.substring(0, 2);
            const firstDigit = phoneToCheck.substring(0, 1);
            
            let mockOperator = 'MTN'; // Default
            
            // Orange prefixes: 55-59, 69, 9
            if (['55', '56', '57', '58', '59', '69'].includes(firstTwoDigits) || firstDigit === '9') {
                mockOperator = 'ORANGE';
            }
            // MTN prefixes: 50-54, 65, 67, 68, 7, 8
            else if (['50', '51', '52', '53', '54', '65', '67', '68'].includes(firstTwoDigits) || ['7', '8'].includes(firstDigit)) {
                mockOperator = 'MTN';
            }
            
            // Return mock data for development
            return {
                reference: `dev_ref_${Date.now()}`,
                status: 'PENDING',
                code: `CP${Date.now()}`,
                operator: mockOperator,
                ussd_code: mockOperator === 'MTN' ? '*126#' : '#144#'
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
            amount: adjustedAmount,  // Campay expects integer, not string
            from: formattedPhone,
            description: description || `Payment for order #${transaction_id}`,
            external_reference: external_reference || transaction_id.toString()
        };

        console.log('Sending to Campay:', payload);
        console.log('Using token:', token ? token.substring(0, 10) + '...' : 'No token');
        
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
        
        console.log('Campay response status:', response.status);
        console.log('Campay response data:', response.data);
        
        if (response.data && response.data.reference) {
            return {
                reference: response.data.reference,
                status: response.data.status || 'PENDING',
                code: response.data.code,
                operator: response.data.operator,
                ussd_code: response.data.ussd_code
            };
        } else {
            console.error('Campay payment creation failed:', response.data);
            throw new Error(`Campay payment failed: ${response.data.message || JSON.stringify(response.data)}`);
        }
    } catch (error) {
        console.error('Error creating Campay payment:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        
        // Provide meaningful error messages based on Campay error codes
        if (error.response?.data?.error_code) {
            const errorCode = error.response.data.error_code;
            switch (errorCode) {
                case 'ER101':
                    throw new Error('Invalid phone number. Please ensure it starts with 237 and is a valid Cameroon number.');
                case 'ER102':
                    throw new Error('Unsupported phone number. Only MTN and Orange numbers are accepted.');
                case 'ER201':
                    throw new Error('Invalid amount. Please use a valid amount (demo limit: 100 XAF).');
                case 'ER301':
                    throw new Error('Insufficient balance in payment system.');
                default:
                    throw new Error(`Payment failed: ${error.response.data.message || errorCode}`);
            }
        }
        
        // Provide fallback for development or demo limitations
        if (process.env.NODE_ENV !== 'production' || error.response?.data?.error_code === 'ER201') {
            console.log('Using mock payment data for development or demo limitation');
            
            // Detect operator from phone number for mock response
            const phoneToCheck = phone_number.replace(/\D/g, '').replace(/^237/, '');
            const firstTwoDigits = phoneToCheck.substring(0, 2);
            const firstDigit = phoneToCheck.substring(0, 1);
            
            let mockOperator = 'MTN'; // Default
            
            // Orange prefixes: 55-59, 69, 9
            if (['55', '56', '57', '58', '59', '69'].includes(firstTwoDigits) || firstDigit === '9') {
                mockOperator = 'ORANGE';
            }
            // MTN prefixes: 50-54, 65, 67, 68, 7, 8
            else if (['50', '51', '52', '53', '54', '65', '67', '68'].includes(firstTwoDigits) || ['7', '8'].includes(firstDigit)) {
                mockOperator = 'MTN';
            }
            
            return {
                reference: `mock_ref_${Date.now()}`,
                status: 'PENDING',
                code: `CP${Date.now()}`,
                operator: mockOperator,
                ussd_code: mockOperator === 'MTN' ? '*126#' : '#144#'
            };
        }
        throw error;
    }
};

exports.checkPaymentStatus = async (reference) => {
    try {
        const token = process.env.CAMPAY_TOKEN;
        
        console.log('Checking payment status for reference:', reference);
        console.log('Campay token present:', !!token);
        
        if (!token || reference.startsWith('mock_') || reference.startsWith('dev_')) {
            console.warn('Missing Campay token or mock reference. Using development mode.');
            const mockResult = {
                reference,
                status: 'SUCCESSFUL',
                operator: 'MTN'
            };
            console.log('Returning mock successful payment:', mockResult);
            return mockResult;
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
            // Simulate successful payment after some time for realistic testing
            const mockResult = {
                reference,
                status: 'SUCCESSFUL',
                operator: 'MTN' // Default to MTN for mock responses
            };
            console.log('Returning mock successful payment:', mockResult);
            return mockResult;
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
