const nodemailer = require('nodemailer');
const supabase = require('../supabase/supabaseClient');
require('dotenv').config();

class EmailService {
  constructor() {
    // Configure nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email transporter configuration error:', error);
      } else {
        console.log('Email server is ready to send messages');
      }
    });
  }
  
  // Get email template from database
  async getEmailTemplate(templateName) {
    try {
      const { data: template, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', templateName)
        .single();
      
      if (error || !template) {
        console.error(`Email template '${templateName}' not found:`, error);
        return null;
      }
      
      return template;
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  }
  
  // Replace placeholders in email template
  replacePlaceholders(template, data) {
    let subject = template.subject;
    let body = template.body;
    
    // Replace placeholders like {{vendor_name}}, {{order_id}}, etc.
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = data[key] || '';
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return { subject, body };
  }
  
  // Send email to vendor when new order is received
  async sendNewOrderNotification(vendorId, orderId, orderData) {
    try {
      // Get vendor details
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('store_name')
        .eq('id', vendorId)
        .single();
      
      if (vendorError || !vendor) {
        console.error('Vendor not found for notification:', vendorError);
        return false;
      }
      
      // Get vendor email from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', vendorId)
        .single();
      
      if (profileError || !profile) {
        console.error('Vendor profile not found:', profileError);
        return false;
      }
      
      // Get email template
      const template = await this.getEmailTemplate('vendor_new_order');
      if (!template) {
        console.error('New order email template not found');
        return false;
      }
      
      // Prepare template data
      const templateData = {
        vendor_name: profile.name || vendor.store_name || 'Vendor',
        store_name: vendor.store_name || 'Your Store',
        order_id: orderId,
        customer_name: orderData.customer_name || 'Customer',
        order_total: orderData.total_amount || 0,
        order_items_count: orderData.items_count || 0,
        order_date: new Date().toLocaleDateString('fr-CM'),
        order_time: new Date().toLocaleTimeString('fr-CM'),
        dashboard_url: `${process.env.FRONTEND_URL}/vendor-portal/orders/${orderId}`
      };
      
      // Replace placeholders
      const { subject, body } = this.replacePlaceholders(template, templateData);
      
      // Send email
      const mailOptions = {
        from: {
          name: 'Cameroon Marketplace',
          address: process.env.SMTP_FROM || process.env.SMTP_USER
        },
        to: profile.email,
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('New order notification sent:', info.messageId);
      
      return true;
    } catch (error) {
      console.error('Error sending new order notification:', error);
      return false;
    }
  }
    // Send email to vendor when order status changes to processing and payout is sent
  async sendPayoutNotification(vendorId, orderId, payoutData) {
    try {
      // Get vendor details
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('store_name')
        .eq('id', vendorId)
        .single();
      
      if (vendorError || !vendor) {
        console.error('Vendor not found for payout notification:', vendorError);
        return false;
      }
      
      // Get vendor email from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', vendorId)
        .single();
      
      if (profileError || !profile) {
        console.error('Vendor profile not found:', profileError);
        return false;
      }
      
      // Get email template
      const template = await this.getEmailTemplate('vendor_payout_notification');
      if (!template) {
        console.error('Payout notification email template not found');
        return false;
      }
      
      // Prepare template data
      const templateData = {
        vendor_name: profile.name || vendor.store_name || 'Vendor',
        store_name: vendor.store_name || 'Your Store',
        order_id: orderId,
        payout_amount: payoutData.amount || 0,
        payout_reference: payoutData.reference || 'N/A',
        phone_number: payoutData.phone_number || 'N/A',
        operator: payoutData.operator || 'Mobile Money',
        payout_date: new Date().toLocaleDateString('fr-CM'),
        payout_time: new Date().toLocaleTimeString('fr-CM'),
        dashboard_url: `${process.env.FRONTEND_URL}/vendor-portal/earnings`
      };
      
      // Replace placeholders
      const { subject, body } = this.replacePlaceholders(template, templateData);
      
      // Send email
      const mailOptions = {
        from: {
          name: 'Cameroon Marketplace',
          address: process.env.SMTP_FROM || process.env.SMTP_USER
        },
        to: profile.email,
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Payout notification sent:', info.messageId);
      
      return true;
    } catch (error) {
      console.error('Error sending payout notification:', error);
      return false;
    }
  }
    // Send email to vendor when product stock is low (1 left) or out of stock (0 left)
  async sendStockNotification(vendorId, productId, currentStock) {
    try {
      // Get vendor details
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('store_name')
        .eq('id', vendorId)
        .single();
      
      if (vendorError || !vendor) {
        console.error('Vendor not found for stock notification:', vendorError);
        return false;
      }
      
      // Get vendor email from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', vendorId)
        .single();
      
      if (profileError || !profile) {
        console.error('Vendor profile not found:', profileError);
        return false;
      }
      
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, sku')
        .eq('id', productId)
        .single();
      
      if (productError || !product) {
        console.error('Product not found for stock notification:', productError);
        return false;
      }
      
      // Determine template name based on stock level
      const templateName = currentStock === 0 ? 'vendor_out_of_stock' : 'vendor_low_stock';
      
      // Get email template
      const template = await this.getEmailTemplate(templateName);
      if (!template) {
        console.error(`Stock notification template '${templateName}' not found`);
        return false;
      }
      
      // Prepare template data
      const templateData = {
        vendor_name: profile.name || vendor.store_name || 'Vendor',
        store_name: vendor.store_name || 'Your Store',
        product_name: product.name,
        product_sku: product.sku || 'N/A',
        current_stock: currentStock,
        stock_status: currentStock === 0 ? 'out of stock' : 'low stock',
        product_url: `${process.env.FRONTEND_URL}/vendor-portal/products/edit/${productId}`,
        dashboard_url: `${process.env.FRONTEND_URL}/vendor-portal/products`
      };
      
      // Replace placeholders
      const { subject, body } = this.replacePlaceholders(template, templateData);
      
      // Send email
      const mailOptions = {
        from: {
          name: 'Cameroon Marketplace',
          address: process.env.SMTP_FROM || process.env.SMTP_USER
        },
        to: profile.email,
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Stock notification sent (${currentStock} units left):`, info.messageId);
      
      return true;
    } catch (error) {
      console.error('Error sending stock notification:', error);
      return false;
    }
  }
  
  // Send notification when payout fails
  async sendPayoutFailureNotification(vendorId, orderId, payoutData) {
    try {
      // Get vendor details
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('store_name')
        .eq('id', vendorId)
        .single();
      
      if (vendorError || !vendor) {
        console.error('Vendor not found for payout failure notification:', vendorError);
        return false;
      }
      
      // Get vendor email from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', vendorId)
        .single();
      
      if (profileError || !profile) {
        console.error('Vendor profile not found:', profileError);
        return false;
      }
      
      // Get email template (fallback to generic if specific template doesn't exist)
      let template = await this.getEmailTemplate('vendor_payout_failure_notification');
      if (!template) {
        template = await this.getEmailTemplate('vendor_payout_notification');
        if (!template) {
          console.error('No suitable email template found for payout failure notification');
          
          // Send a basic notification even without template
          const info = await this.transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: profile.email,
            subject: `Payment Processing Failed - Order #${orderId.slice(0, 8)}`,
            html: `<div>
              <h1>Payment Processing Failed</h1>
              <p>Dear ${profile.name || 'Vendor'},</p>
              <p>We encountered an issue while processing your payment of ${payoutData.amount} XAF for order #${orderId.slice(0, 8)}.</p>
              <p>Our team has been notified and is working to resolve this issue. The order status has been updated, but the payment will need to be reprocessed.</p>
              <p>Error details: ${payoutData.error || 'Unknown error'}</p>
              <p>Order Item ID: ${payoutData.orderItemId || 'Not available'}</p>
              <p>Thank you for your patience.</p>
            </div>`
          });
          
          console.log(`Payout failure notification sent without template: ${info.messageId}`);
          return true;
        }
      }
      
      // Prepare template data
      const templateData = {
        VENDOR_NAME: profile.name || 'Valued Vendor',
        STORE_NAME: vendor.store_name || 'Your Store',
        ORDER_ID: orderId.slice(0, 8),
        AMOUNT: payoutData.amount,
        ERROR_MESSAGE: payoutData.error || 'Unknown payment processing error',
        ORDER_ITEM_ID: payoutData.orderItemId || 'Not available',
        DATE: new Date().toLocaleDateString('fr-CM')
      };
      
      // Replace placeholders
      const htmlContent = this.replacePlaceholders(template.html_content, templateData);
      const subject = this.replacePlaceholders(template.subject, templateData);
      
      // Send email
      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: profile.email,
        subject: subject,
        html: htmlContent
      });
      
      console.log(`Payout failure notification sent: ${info.messageId}`);
      return true;
      
    } catch (error) {
      console.error('Failed to send payout failure notification:', error);
      return false;
    }
  }
  
  // Send email to customer when order status changes
  async sendCustomerOrderStatusNotification(customerId, orderId, newStatus, orderData = {}) {
    try {
      // Get customer email from profiles
      const { data: customer, error: customerError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customer) {
        console.error('Customer not found for status notification:', customerError);
        return false;
      }
      
      // Determine template name based on status
      let templateName = '';
      switch (newStatus) {
        case 'processing':
          templateName = 'customer_order_accepted';
          break;
        case 'delivered':
          templateName = 'customer_order_delivered';
          break;
        case 'cancelled':
          templateName = 'customer_order_cancelled';
          break;
        default:
          console.log(`No customer notification template for status: ${newStatus}`);
          return false;
      }
      
      // Get email template
      const template = await this.getEmailTemplate(templateName);
      if (!template) {
        console.error(`Customer notification template '${templateName}' not found`);
        return false;
      }
      
      // Prepare template data
      const templateData = {
        customer_name: customer.name || 'Customer',
        order_id: orderId,
        order_status: newStatus,
        order_date: orderData.order_date || new Date().toLocaleDateString('fr-CM'),
        order_total: orderData.order_total || 0,
        tracking_url: `${process.env.FRONTEND_URL}/account/orders/${orderId}`,
        support_email: process.env.SMTP_FROM || 'support@cameroonmarketplace.com',
        refund_amount: orderData.refund_amount || 0,
        refund_reason: orderData.refund_reason || '',
        vendor_delay_days: orderData.vendor_delay_days || 0
      };
      
      // Replace placeholders
      const { subject, body } = this.replacePlaceholders(template, templateData);
      
      // Send email
      const mailOptions = {
        from: {
          name: 'Cameroon Marketplace',
          address: process.env.SMTP_FROM || process.env.SMTP_USER
        },
        to: customer.email,
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Customer status notification sent (${newStatus}):`, info.messageId);
      
      return true;
    } catch (error) {
      console.error('Error sending customer status notification:', error);
      return false;
    }
  }
  
  // Generic method to send any email
  async sendEmail(to, subject, htmlBody, textBody = null) {
    try {
      const mailOptions = {
        from: {
          name: 'Cameroon Marketplace',
          address: process.env.SMTP_FROM || process.env.SMTP_USER
        },
        to: to,
        subject: subject,
        html: htmlBody,
        text: textBody || htmlBody.replace(/<[^>]*>/g, '')
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();