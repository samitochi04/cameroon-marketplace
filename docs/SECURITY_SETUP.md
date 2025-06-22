# Cameroon Marketplace - Backend Security Setup

## Required Environment Variables

Create a `.env` file in your server directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Campay Configuration (for payments)
CAMPAY_BASE_URL=https://demo.campay.net
CAMPAY_TOKEN=your_campay_token

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@cameroonmarketplace.com

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000
```

## Security Best Practices Implemented

### 1. Authentication & Authorization
- **JWT Token Verification**: All sensitive routes verify Supabase JWT tokens
- **Role-based Access Control**: Separate middleware for vendors and customers
- **User Session Validation**: Tokens are verified against the database
- **Route Protection**: Payment and vendor routes require authentication

### 2. Input Validation & Sanitization
- **Request Validation**: All inputs are validated before processing
- **SQL Injection Prevention**: Using Supabase's parameterized queries
- **XSS Prevention**: HTML content is sanitized in email templates
- **CORS Configuration**: Properly configured for your frontend domain

### 3. Payment Security
- **Vendor Ownership Verification**: Vendors can only update their own orders
- **Amount Calculation**: Using base_price to exclude commissions
- **Transaction Logging**: All payouts are recorded with references
- **Error Handling**: Graceful fallbacks for payment failures

### 4. Email Security
- **Template-based Emails**: Using database templates prevents injection
- **Placeholder Sanitization**: All user data is sanitized before insertion
- **Rate Limiting**: Consider implementing email rate limiting
- **SMTP Authentication**: Secure email server configuration

### 5. Database Security
- **Row Level Security (RLS)**: Implemented for sensitive tables
- **Foreign Key Constraints**: Maintain data integrity
- **Indexed Queries**: Optimized for performance
- **Audit Trails**: Timestamps on all operations

## API Endpoints

### Authentication Required
All endpoints require `Authorization: Bearer <token>` header

### Vendor Endpoints
```
PUT /api/vendor/order-items/:itemId/status
- Updates order item status
- Triggers payout if status changes to 'processing'
- Sends email notification

GET /api/vendor/earnings
- Returns vendor earnings summary
```

### Payment Endpoints
```
POST /api/payments/initialize
- Initializes payment (customers only)

POST /api/payments/verify
- Verifies payment status

GET /api/payments/status/:reference
- Gets payment status
```

## How the Payment Flow Works

### 1. Order Creation
1. Customer places order
2. Order items are created with vendor_id
3. Email notifications sent to all vendors

### 2. Order Processing
1. Vendor updates order item status to 'processing'
2. System calculates vendor earnings (base_price × quantity)
3. Payout is sent to vendor's mobile money account
4. Email notification sent to vendor
5. Overall order status updated if all items have same status

### 3. Security Checks
- Verify vendor owns the product before allowing status update
- Validate payment method is configured
- Log all transactions for audit purposes
- Graceful error handling without exposing sensitive data

## Deployment Security Checklist

### Production Environment
- [ ] Change all default passwords
- [ ] Use HTTPS only
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Configure monitoring and logging
- [ ] Set up SSL certificates
- [ ] Use environment-specific API keys
- [ ] Implement request size limits

### Monitoring & Logging
- [ ] Log all authentication attempts
- [ ] Monitor payment transactions
- [ ] Track email delivery status
- [ ] Set up error alerting
- [ ] Regular security audits

## Common Security Issues to Avoid

1. **Never expose JWT secrets** in client-side code
2. **Validate all user inputs** before processing
3. **Use HTTPS** for all production traffic
4. **Rate limit** API endpoints to prevent abuse
5. **Sanitize email content** to prevent XSS
6. **Log security events** for audit purposes
7. **Keep dependencies updated** for security patches
8. **Use prepared statements** for database queries

## Testing Security

```bash
# Test authentication
curl -H "Authorization: Bearer invalid_token" http://localhost:3000/api/vendor/earnings

# Test authorization
curl -H "Authorization: Bearer customer_token" http://localhost:3000/api/vendor/earnings

# Test input validation
curl -X PUT -H "Content-Type: application/json" \
  -d '{"status": "invalid_status"}' \
  http://localhost:3000/api/vendor/order-items/123/status
```

## Email Templates

The system uses database-stored email templates with placeholders:
- `{{vendor_name}}` - Vendor's name
- `{{order_id}}` - Order ID
- `{{payout_amount}}` - Payout amount
- `{{phone_number}}` - (Hidden for security)

Templates are in French for Cameroon market and include HTML formatting.