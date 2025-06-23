# Required Dependencies

Add these dependencies to your package.json:

```bash
npm install nodemailer jsonwebtoken
```

Or add to your package.json dependencies:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.8",
    "jsonwebtoken": "^9.0.2",
    "axios": "^1.6.0",
    "@supabase/supabase-js": "^2.38.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  }
}
```

## Complete Setup Steps:

### 1. Run the Database Migration
Execute the SQL migration in your Supabase SQL editor:
```sql
-- This will add the missing columns to your existing vendor_payouts table
```

### 2. Update Your .env File
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase_dashboard

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@cameroonmarketplace.com

# Campay Configuration
CAMPAY_BASE_URL=https://demo.campay.net
CAMPAY_TOKEN=your_campay_token

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Server
```bash
npm install
npm start
```

### 4. Test the System
1. Create an order through your frontend
2. Update an order item status to 'processing' as a vendor
3. Check that payout is recorded in vendor_payouts table
4. Verify email notifications are sent

## Your Table Structure is Now:
- `id` (uuid) - Primary key
- `vendor_id` (uuid) - References vendors table
- `amount` (numeric) - Payout amount
- `status` (text) - pending/successful/failed
- `payout_method` (text) - MTN/ORANGE
- `transaction_id` (text) - Campay reference
- `notes` (text) - Additional notes
- `order_reference` (text) - **NEW** - Order ID as text
- `phone_number` (text) - **NEW** - Recipient phone
- `operator` (text) - **NEW** - MTN/ORANGE
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

This matches your existing structure and adds the necessary fields for the payout system!