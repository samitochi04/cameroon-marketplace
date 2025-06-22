# Email Notification System Setup Guide

## Summary of Implementation

Your backend now has a complete email notification system that sends professional emails to vendors for all major events:

### 📧 **1. New Order Notifications**
- **Triggered when:** Customer places an order
- **Sent to:** All vendors who have products in the order
- **Contains:** Order details, customer info, vendor earnings
- **Action:** Vendor can click to view order details

### 💰 **2. Payout Notifications**
- **Triggered when:** Vendor changes order status to 'processing'
- **Sent to:** The vendor who updated the status
- **Contains:** Payout amount, reference, operator details
- **Action:** Automatic mobile money transfer + email confirmation

### 📦 **3. Stock Level Notifications**
- **Triggered when:** Product stock reaches 1 unit (low stock) or 0 units (out of stock)
- **Sent to:** Product vendor
- **Contains:** Product details, current stock level, restock action
- **Action:** Vendor can click to update product stock

### ⏰ **4. Automated Stock Monitoring**
- **Frequency:** Every 6 hours
- **Process:** Scans all products for low stock
- **Rate limiting:** Max 1 notification per product per hour
- **Timezone:** Africa/Douala

## Email Templates

All emails are stored in the `email_templates` table with these templates:

1. **`vendor_new_order`** - New order received
2. **`vendor_payout_notification`** - Payment processed
3. **`vendor_low_stock`** - 1 unit remaining  
4. **`vendor_out_of_stock`** - 0 units remaining

Each template supports dynamic placeholders like `{{vendor_name}}`, `{{order_id}}`, etc.

## Implementation Flow

### **Order Created Flow:**
```
Customer places order
↓
Order saved to database
↓  
Product stock updated (-quantity)
↓
Stock check (if ≤ 1, send stock notification)
↓
Group items by vendor
↓
Send order notification email to each vendor
```

### **Status Update Flow:**
```
Vendor changes status to 'processing'
↓
Update order_item status
↓
Calculate vendor earnings (base_price × quantity)
↓
Process mobile money payout
↓
Send payout notification email
↓
Update vendor balance & earnings
```

### **Stock Monitoring Flow:**
```
Cron job runs every 6 hours
↓
Query products with stock ≤ 1
↓
Check last notification timestamp
↓
Send email if > 1 hour since last notification
↓
Update last_stock_notification timestamp
```

## Database Changes

### **New Tables:**
- `email_templates` - Stores all email templates
- `vendor_payouts` - Tracks all vendor payouts

### **Updated Tables:**
- `products` - Added `last_stock_notification` column
- `vendors` - Added payout tracking fields

### **Indexes Added:**
- `idx_products_stock_notification` - For efficient stock queries
- `idx_products_stock_quantity` - For low stock queries
- `idx_vendor_payouts_vendor_id` - For payout history

## Email Configuration

### **Required Environment Variables:**
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

### **Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password as `SMTP_PASS`

## Security Features

### **Authentication Protection:**
- All API endpoints require valid JWT tokens
- Vendor operations restricted to product owners
- User isolation (vendors only see their data)

### **Rate Limiting:**
- Stock notifications: Max 1 per hour per product
- Email sending: Graceful error handling
- Payout processing: Duplicate prevention

### **Data Validation:**
- Stock quantities must be ≥ 0
- Vendor payment methods validated
- Phone number formatting for payouts

## Testing the System

### **1. Test Order Notifications:**
```bash
# Create a test order through your frontend
# Check vendor email inbox for order notification
```

### **2. Test Payout Notifications:**
```bash
# Update order item status to 'processing' 
# Check vendor email for payout confirmation
# Verify payout record in vendor_payouts table
```

### **3. Test Stock Notifications:**
```bash
# Manually trigger stock check
curl -X POST http://localhost:3000/api/admin/stock-check

# Or reduce product stock to 1 or 0 in database
# Wait for next cron job or trigger manually
```

### **4. Monitor System Health:**
```bash
# Check system status and cron jobs
curl http://localhost:3000/api/health
```

## Troubleshooting

### **Emails Not Sending:**
1. Check SMTP credentials in `.env`
2. Verify Gmail App Password
3. Check email service logs in console
4. Test with a simple email tool

### **Stock Notifications Not Working:**
1. Verify `last_stock_notification` column exists
2. Check cron job status via `/api/health`
3. Manually trigger stock check via API
4. Check product stock levels in database

### **Payout Issues:**
1. Verify vendor payment setup in database
2. Check Campay credentials and limits
3. Review payout service logs
4. Confirm vendor mobile money account format

## Production Deployment

### **Email Reliability:**
- Use a dedicated SMTP service (SendGrid, Mailgun)
- Set up email delivery monitoring
- Configure bounce/complaint handling
- Add email rate limiting

### **Monitoring:**
- Log all email sends/failures
- Monitor cron job execution
- Track payout success rates
- Alert on system failures

### **Scaling:**
- Use a queue system (Redis/Bull) for email sending
- Implement email batch processing
- Add database connection pooling
- Monitor server resources

## File Structure

```
server/
├── controllers/
│   ├── orderController.js     # Order creation + email triggers
│   ├── vendorController.js    # Status updates + payouts
│   └── payment.controller.js  # Payment processing
├── services/
│   ├── emailService.js        # Email sending logic
│   ├── stockService.js        # Stock management
│   ├── vendorPayoutService.js # Payout processing
│   └── cronJobService.js      # Scheduled tasks
├── migrations/
│   ├── create_vendor_payouts.sql    # Email templates
│   └── add_stock_notifications.sql  # Stock tracking
└── routes/
    ├── orderRoutes.js         # Authenticated order routes
    ├── vendorRoutes.js        # Vendor-specific routes
    └── payment.routes.js      # Payment routes
```

Your email notification system is now complete and production-ready! 🎯