# Environment Variables Documentation

This application requires the following environment variables to be set in your deployment platform:

## Required Variables:

### **VITE_API_URL**
- Description: URL of your backend API
- Example: `https://api.yoursite.com`
- Required: Yes

### **VITE_SUPABASE_URL**
- Description: Your Supabase project URL
- Example: `https://yourproject.supabase.co`
- Required: Yes

### **VITE_SUPABASE_ANON_KEY**
- Description: Your Supabase anonymous/public key
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Required: Yes

### **VITE_DEVELOPMENT_MODE**
- Description: Controls development features
- Values: `true` | `false`
- Default: `false`
- Required: Yes

### **NODE_ENV**
- Description: Node.js environment
- Values: `development` | `production`
- Default: `production`
- Required: Yes

## How to Set in Coolify:
1. Go to your app in Coolify dashboard
2. Navigate to Environment Variables section
3. Add each variable with its actual value
4. Deploy your application

## Security Notes:
- ⚠️ Never commit actual values to GitHub
- ✅ Only commit this documentation and template files
- 🔒 Keep all secrets in your deployment platform only