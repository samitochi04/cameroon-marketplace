const axios = require('axios');
require('dotenv').config();

exports.createCinetpayPayment = async (paymentInfo) => {
    try {
        // Log what we're sending
        console.log('Initiating Cinetpay payment with:', paymentInfo);
        
        const {
            transaction_id,
            amount,
            customer_name,
            customer_email,
            customer_phone_number,
            payment_method
        } = paymentInfo;
        
        const apiKey = process.env.CINETPAY_API_KEY;
        const siteId = process.env.CINET_SITE_ID;
        
        if (!apiKey || !siteId) {
            console.warn('Missing Cinetpay credentials. Using development mode.');
            // Return mock data for development
            return {
                payment_token: `dev_token_${Date.now()}`,
                payment_url: `https://checkout.cinetpay.com/payment/${Date.now()}`,
                status: 'CREATED'
            };
        }
        
        const payload = {
            apikey: apiKey,
            site_id: siteId,
            transaction_id: transaction_id.toString(),
            amount: Number(amount),
            currency: 'XAF',
            description: 'Payment for order #' + transaction_id,
            return_url: process.env.FRONTEND_URL + '/order-confirmation/' + transaction_id,
            notify_url: process.env.BACKEND_URL + '/webhooks/cinetpay',
            customer_name: customer_name || 'Customer',
            customer_email: customer_email || 'customer@example.com',
            customer_phone_number: customer_phone_number || '',
            // Add payment method hint if specified
            channels: payment_method === 'mtn_mobile_money' ? 'MOBILE_MONEY_CM' :
                      payment_method === 'orange_money' ? 'ORANGE_MONEY' :
                      payment_method === 'credit_card' ? 'CREDIT_CARD' : '',
            alternative_currency: '',
            lang: 'fr'
        };

        console.log('Sending to Cinetpay:', payload);
        
        const response = await axios.post(
            'https://api-checkout.cinetpay.com/v2/payment',
            payload
        );
        
        console.log('Cinetpay response:', response.data);
        
        if (response.data && response.data.code === '201') {
            return {
                payment_token: response.data.data.payment_token,
                payment_url: response.data.data.payment_url,
                status: 'CREATED'
            };
        } else {
            throw new Error('Cinetpay payment creation failed: ' + JSON.stringify(response.data));
        }
    } catch (error) {
        console.error('Error creating Cinetpay payment:', error);
        // Provide fallback for development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Using mock payment data for development');
            return {
                payment_token: `mock_token_${Date.now()}`,
                payment_url: `http://localhost:5173/payment-simulator?order=${paymentInfo.transaction_id}`,
                status: 'CREATED'
            };
        }
        throw error;
    }
};