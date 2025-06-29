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
        // Create default templates if needed
        this.createDefaultTemplates();
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
  
  // Send order confirmation email to customer in French
  async sendOrderConfirmationEmail(customerId, orderId, orderData) {
    try {
      // Get customer profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', customerId)
        .single();
      
      if (profileError || !profile) {
        console.error('Customer profile not found:', profileError);
        return false;
      }

      // French email template for order confirmation
      const emailSubject = `Confirmation de votre commande #${orderId}`;
      const emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Confirmation de commande</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
            .content { padding: 20px 0; }
            .order-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .footer { border-top: 1px solid #ddd; padding-top: 20px; text-align: center; color: #666; }
            .btn { background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Merci pour votre commande !</h1>
            </div>
            
            <div class="content">
              <p>Bonjour ${profile.name || 'Cher(e) client(e)'},</p>
              
              <p>Nous avons bien reçu votre commande et elle est maintenant <strong>en cours de traitement</strong>.</p>
              
              <div class="order-details">
                <h3>Détails de votre commande :</h3>
                <p><strong>Numéro de commande :</strong> #${orderId}</p>
                <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                <p><strong>Montant total :</strong> ${orderData.totalAmount ? new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(orderData.totalAmount) : 'N/A'}</p>
                <p><strong>Méthode de paiement :</strong> ${orderData.paymentMethod === 'mtn_mobile_money' ? 'MTN Mobile Money' : orderData.paymentMethod === 'orange_money' ? 'Orange Money' : orderData.paymentMethod}</p>
              </div>
              
              <p>Votre commande sera traitée dans les plus brefs délais. Vous recevrez une notification dès qu'elle sera expédiée.</p>
              
              <p>Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.</p>
              
              <p>Merci de faire confiance à notre marketplace camerounaise !</p>
            </div>
            
            <div class="footer">
              <p>Cameroon Marketplace</p>
              <p>Votre marketplace local de confiance</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Send email
      const mailOptions = {
        from: {
          name: 'Cameroon Marketplace',
          address: process.env.SMTP_FROM || process.env.SMTP_USER
        },
        to: profile.email,
        subject: emailSubject,
        html: emailBody,
        text: `Bonjour ${profile.name || 'Cher(e) client(e)'},\n\nNous avons bien reçu votre commande #${orderId} et elle est maintenant en cours de traitement.\n\nMontant total: ${orderData.totalAmount ? new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(orderData.totalAmount) : 'N/A'}\n\nMerci de faire confiance à notre marketplace camerounaise!\n\nCameroon Marketplace`
      };
      
      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);
        return true;
      } else {
        console.log('Email transporter not configured, email not sent');
        return false;
      }
      
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }

  // Create default email templates if they don't exist
  async createDefaultTemplates() {
    try {
      const templates = [
        {
          name: 'order_confirmation',
          subject: 'Order Confirmation - #{{order_id}}',
          body: `
            <h2>Thank you for your order!</h2>
            <p>Dear {{customer_name}},</p>
            <p>Your order <strong>#{{order_id}}</strong> has been confirmed and payment has been received.</p>
            
            <h3>Order Details:</h3>
            <ul>
              <li><strong>Order Date:</strong> {{order_date}} at {{order_time}}</li>
              <li><strong>Payment Method:</strong> {{payment_method}}</li>
              <li><strong>Total Amount:</strong> {{order_total}} FCFA</li>
              <li><strong>Status:</strong> {{order_status}}</li>
            </ul>
            
            <p>You can track your order status at: <a href="{{tracking_url}}">{{tracking_url}}</a></p>
            
            <p>Thank you for choosing Cameroon Marketplace!</p>
            <p>Best regards,<br>The Cameroon Marketplace Team</p>
          `,
          language: 'en'
        },
        {
          name: 'vendor_new_order',
          subject: 'New Order Received - #{{order_id}}',
          body: `
            <h2>New Order Notification</h2>
            <p>Dear {{vendor_name}},</p>
            <p>You have received a new order for {{store_name}}!</p>
            
            <h3>Order Details:</h3>
            <ul>
              <li><strong>Order ID:</strong> #{{order_id}}</li>
              <li><strong>Customer:</strong> {{customer_name}}</li>
              <li><strong>Items:</strong> {{order_items_count}} item(s)</li>
              <li><strong>Total Amount:</strong> {{order_total}} FCFA</li>
              <li><strong>Order Date:</strong> {{order_date}} at {{order_time}}</li>
            </ul>
            
            <p>Please log in to your vendor dashboard to process this order: <a href="{{dashboard_url}}">{{dashboard_url}}</a></p>
            
            <p>Best regards,<br>The Cameroon Marketplace Team</p>
          `,
          language: 'en'
        }
      ];

      for (const template of templates) {
        // Check if template exists
        const { data: existing } = await supabase
          .from('email_templates')
          .select('id')
          .eq('name', template.name)
          .eq('language', template.language)
          .single();

        if (!existing) {
          await supabase
            .from('email_templates')
            .insert(template);
          console.log(`Created email template: ${template.name}`);
        }
      }
    } catch (error) {
      console.error('Error creating default email templates:', error);
    }
  }

  // Generic method to send any email
  async sendEmail(to, subject, htmlBody, textBody = null) {
    try {
      const mailOptions = {
        from: {
          name: 'Axis Shop',
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