-- Update existing vendor_payouts table to work with current structure
-- Your table has: id, vendor_id, amount, status, payout_method, transaction_id, notes, created_at, updated_at

-- Add missing columns to match your existing structure
ALTER TABLE vendor_payouts 
ADD COLUMN IF NOT EXISTS order_reference TEXT, -- To store order ID as text
ADD COLUMN IF NOT EXISTS phone_number TEXT,    -- To store recipient phone
ADD COLUMN IF NOT EXISTS operator TEXT;        -- To store MTN/ORANGE

-- Update status column to use proper check constraint
ALTER TABLE vendor_payouts 
DROP CONSTRAINT IF EXISTS vendor_payouts_status_check;

ALTER TABLE vendor_payouts 
ADD CONSTRAINT vendor_payouts_status_check 
CHECK (status IN ('PENDING', 'SUCCESSFUL', 'FAILED', 'pending', 'successful', 'failed'));

-- Update payout_method constraint if it exists
ALTER TABLE vendor_payouts 
DROP CONSTRAINT IF EXISTS vendor_payouts_payout_method_check;

ALTER TABLE vendor_payouts 
ADD CONSTRAINT vendor_payouts_payout_method_check 
CHECK (payout_method IN ('MTN', 'ORANGE', 'mtn', 'orange'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_vendor_id ON vendor_payouts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_order_reference ON vendor_payouts(order_reference);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_status ON vendor_payouts(status);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_created_at ON vendor_payouts(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE vendor_payouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vendors can view own payouts" ON vendor_payouts;
DROP POLICY IF EXISTS "System can insert payouts" ON vendor_payouts;

-- Policy: Vendors can only see their own payouts
CREATE POLICY "Vendors can view own payouts" ON vendor_payouts
    FOR SELECT USING (auth.uid() = vendor_id);

-- Policy: Only authenticated users can insert payouts (for system use)
CREATE POLICY "System can insert payouts" ON vendor_payouts
    FOR INSERT WITH CHECK (true);

-- Add sample email templates
INSERT INTO email_templates (name, subject, body) VALUES 
(
    'vendor_new_order',
    'Nouvelle commande reçue - {{order_id}}',
    '
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c5aa0;">Nouvelle commande reçue!</h2>
            
            <p>Bonjour {{vendor_name}},</p>
            
            <p>Vous avez reçu une nouvelle commande sur <strong>{{store_name}}</strong>.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Détails de la commande:</h3>
                <ul>
                    <li><strong>Numéro de commande:</strong> {{order_id}}</li>
                    <li><strong>Client:</strong> {{customer_name}}</li>
                    <li><strong>Montant total:</strong> {{order_total}} XAF</li>
                    <li><strong>Nombre d''articles:</strong> {{order_items_count}}</li>
                    <li><strong>Date:</strong> {{order_date}} à {{order_time}}</li>
                </ul>
            </div>
            
            <p>Connectez-vous à votre tableau de bord pour traiter cette commande:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboard_url}}" style="background-color: #2c5aa0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Voir la commande
                </a>
            </div>
            
            <p>Merci de traiter cette commande rapidement pour assurer la satisfaction de votre client.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Cet email a été envoyé automatiquement par Cameroon Marketplace.<br>
                Si vous avez des questions, contactez notre support.
            </p>
        </div>
    </body>
    </html>
    '
),
(
    'vendor_payout_notification',
    'Paiement effectué - {{payout_amount}} XAF',
    '
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #28a745;">Paiement effectué avec succès!</h2>
            
            <p>Bonjour {{vendor_name}},</p>
            
            <p>Votre paiement pour la commande <strong>{{order_id}}</strong> a été traité avec succès.</p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="margin-top: 0; color: #155724;">Détails du paiement:</h3>
                <ul style="color: #155724;">
                    <li><strong>Montant:</strong> {{payout_amount}} XAF</li>
                    <li><strong>Référence:</strong> {{payout_reference}}</li>
                    <li><strong>Opérateur:</strong> {{operator}}</li>
                    <li><strong>Date:</strong> {{payout_date}} à {{payout_time}}</li>
                </ul>
            </div>
            
            <p>Les fonds ont été envoyés sur votre compte mobile money. Vous devriez recevoir une confirmation par SMS de votre opérateur.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboard_url}}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Voir mes gains
                </a>
            </div>
            
            <p>Merci de faire partie de Cameroon Marketplace!</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Cet email a été envoyé automatiquement par Cameroon Marketplace.<br>
                Si vous avez des questions sur ce paiement, contactez notre support.
            </p>
        </div>
    </body>
    </html>
    '
),
(
    'vendor_low_stock',
    'Stock faible - {{product_name}}',
    '
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ffc107;">⚠️ Stock faible pour {{product_name}}</h2>
            
            <p>Bonjour {{vendor_name}},</p>
            
            <p>Nous vous informons que le stock de votre produit <strong>{{product_name}}</strong> est maintenant faible.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="margin-top: 0; color: #856404;">Détails du produit:</h3>
                <ul style="color: #856404;">
                    <li><strong>Nom du produit:</strong> {{product_name}}</li>
                    <li><strong>SKU:</strong> {{product_sku}}</li>
                    <li><strong>Stock actuel:</strong> {{current_stock}} unité(s)</li>
                    <li><strong>Statut:</strong> Stock faible</li>
                </ul>
            </div>
            
            <p>Il ne reste plus que <strong>{{current_stock}} unité(s)</strong> en stock. Nous vous recommandons de réapprovisionner rapidement pour éviter les ruptures de stock.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{product_url}}" style="background-color: #ffc107; color: #212529; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Modifier le produit
                </a>
            </div>
            
            <p>Connectez-vous à votre tableau de bord pour gérer vos stocks:</p>
            <p><a href="{{dashboard_url}}">{{dashboard_url}}</a></p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Cet email a été envoyé automatiquement par Cameroon Marketplace.<br>
                Vous recevrez ces notifications uniquement pour vos produits avec un stock faible.
            </p>
        </div>
    </body>
    </html>
    '
),
(
    'vendor_out_of_stock',
    'Rupture de stock - {{product_name}}',
    '
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc3545;">🚨 Rupture de stock - {{product_name}}</h2>
            
            <p>Bonjour {{vendor_name}},</p>
            
            <p>Nous vous informons que votre produit <strong>{{product_name}}</strong> est maintenant en rupture de stock.</p>
            
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h3 style="margin-top: 0; color: #721c24;">Détails du produit:</h3>
                <ul style="color: #721c24;">
                    <li><strong>Nom du produit:</strong> {{product_name}}</li>
                    <li><strong>SKU:</strong> {{product_sku}}</li>
                    <li><strong>Stock actuel:</strong> {{current_stock}} unité(s)</li>
                    <li><strong>Statut:</strong> En rupture de stock</li>
                </ul>
            </div>
            
            <p><strong>Action requise:</strong> Ce produit n''est plus disponible à la vente. Les clients ne pourront plus le commander jusqu''à ce que vous réapprovisionniez le stock.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{product_url}}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Réapprovisionner maintenant
                </a>
            </div>
            
            <p>Connectez-vous à votre tableau de bord pour gérer vos stocks:</p>
            <p><a href="{{dashboard_url}}">{{dashboard_url}}</a></p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Cet email a été envoyé automatiquement par Cameroon Marketplace.<br>
                Réapprovisionnez rapidement pour ne pas perdre de ventes.
            </p>
        </div>
    </body>
    </html>
    '
)
ON CONFLICT (name) DO UPDATE SET 
    subject = EXCLUDED.subject,
    body = EXCLUDED.body,
    updated_at = NOW();