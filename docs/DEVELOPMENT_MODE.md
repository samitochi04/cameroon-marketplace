# Development Mode Configuration

## Overview
The application supports both development and production payment modes to facilitate testing without processing real payments.

## Environment Variables

### Backend (.env)
```bash
# Set to true for development mode (simulated payments)
# Set to false for production mode (real payments via Campay)
DEVELOPMENT_MODE=true
```

### Frontend (.env)
```bash
# Set to true for development mode (bypasses payment UI)
# Set to false for production mode (shows payment processing)
VITE_DEVELOPMENT_MODE=true
```

## How It Works

### Development Mode (DEVELOPMENT_MODE=true)
- **Backend**: Orders are created with `payment_status: 'completed'` and `payment_method: 'simulated_payment'`
- **Frontend**: After order creation, users are redirected directly to order confirmation
- **No real payment processing** occurs
- **Useful for**: Testing order flow, development, staging environments

### Production Mode (DEVELOPMENT_MODE=false)
- **Backend**: Orders are created with `payment_status: 'pending'` and `payment_method: 'campay'`
- **Frontend**: After order creation, users are redirected to payment processing page
- **Real payment processing** via Campay integration
- **Useful for**: Live production environment

## Usage

### For Development/Testing:
1. Set `DEVELOPMENT_MODE=true` in server/.env
2. Set `VITE_DEVELOPMENT_MODE=true` in frontend/.env
3. Orders will be processed without payment

### For Production:
1. Set `DEVELOPMENT_MODE=false` in server/.env  
2. Set `VITE_DEVELOPMENT_MODE=false` in frontend/.env
3. Configure proper Campay credentials
4. Orders will require real payment processing

## Important Notes
- Always use `DEVELOPMENT_MODE=false` in production
- Ensure Campay credentials are properly configured for production
- Test the payment flow thoroughly before going live
- Monitor order statuses to ensure proper payment processing