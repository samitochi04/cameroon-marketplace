-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed')),
    refund_method VARCHAR(20) NOT NULL DEFAULT 'automatic' CHECK (refund_method IN ('automatic', 'manual')),
    processed_by UUID REFERENCES profiles(id), -- Admin who processed manual refund
    processed_at TIMESTAMPTZ,
    payment_reference VARCHAR(255), -- Reference from payment processor
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_customer_id ON refunds(customer_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);

-- Add customer email templates
INSERT INTO email_templates (name, subject, body) VALUES 
(
    'customer_order_accepted',
    'Commande acceptée - #{{order_id}}',
    '
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #28a745;">✅ Votre commande a été acceptée!</h2>
            
            <p>Bonjour {{customer_name}},</p>
            
            <p>Excellente nouvelle! Votre commande <strong>#{{order_id}}</strong> a été acceptée par le vendeur et est maintenant en cours de traitement.</p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="margin-top: 0; color: #155724;">Détails de la commande:</h3>
                <ul style="color: #155724;">
                    <li><strong>Numéro de commande:</strong> {{order_id}}</li>
                    <li><strong>Date de commande:</strong> {{order_date}}</li>
                    <li><strong>Montant total:</strong> {{order_total}} XAF</li>
                    <li><strong>Statut:</strong> En cours de traitement</li>
                </ul>
            </div>
            
            <p>Le vendeur prépare maintenant votre commande pour l''expédition. Vous recevrez une autre notification par email dès que votre commande sera expédiée.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Suivre ma commande
                </a>
            </div>
            
            <p>Merci de votre achat sur Cameroon Marketplace!</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Si vous avez des questions, contactez-nous à {{support_email}}<br>
                Cet email a été envoyé automatiquement par Cameroon Marketplace.
            </p>
        </div>
    </body>
    </html>
    '
),
(
    'customer_order_delivered',
    'Commande livrée - #{{order_id}}',
    '
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007bff;">📦 Votre commande a été livrée!</h2>
            
            <p>Bonjour {{customer_name}},</p>
            
            <p>Votre commande <strong>#{{order_id}}</strong> a été marquée comme livrée par le vendeur.</p>
            
            <div style="background-color: #cce7ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
                <h3 style="margin-top: 0; color: #004085;">Détails de la livraison:</h3>
                <ul style="color: #004085;">
                    <li><strong>Numéro de commande:</strong> {{order_id}}</li>
                    <li><strong>Date de commande:</strong> {{order_date}}</li>
                    <li><strong>Montant total:</strong> {{order_total}} XAF</li>
                    <li><strong>Statut:</strong> Livrée</li>
                </ul>
            </div>
            
            <p>Nous espérons que vous êtes satisfait(e) de votre achat. Si vous avez des questions ou des préoccupations concernant votre commande, n''hésitez pas à nous contacter.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Voir ma commande
                </a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404;">
                    <strong>💭 Votre avis compte!</strong><br>
                    Laissez un avis sur les produits que vous avez reçus pour aider d''autres clients.
                </p>
            </div>
            
            <p>Merci d''avoir choisi Cameroon Marketplace!</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Si vous avez des questions, contactez-nous à {{support_email}}<br>
                Cet email a été envoyé automatiquement par Cameroon Marketplace.
            </p>
        </div>
    </body>
    </html>
    '
),
(
    'customer_order_cancelled',
    'Commande annulée et remboursée - #{{order_id}}',
    '
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc3545;">❌ Votre commande a été annulée</h2>
            
            <p>Bonjour {{customer_name}},</p>
            
            <p>Nous vous informons que votre commande <strong>#{{order_id}}</strong> a été annulée et qu''un remboursement complet a été traité.</p>
            
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h3 style="margin-top: 0; color: #721c24;">Détails de l''annulation:</h3>
                <ul style="color: #721c24;">
                    <li><strong>Numéro de commande:</strong> {{order_id}}</li>
                    <li><strong>Date de commande:</strong> {{order_date}}</li>
                    <li><strong>Montant remboursé:</strong> {{refund_amount}} XAF</li>
                    <li><strong>Raison:</strong> {{refund_reason}}</li>
                    <li><strong>Durée d''attente:</strong> {{vendor_delay_days}} jours</li>
                </ul>
            </div>
            
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                <h3 style="margin-top: 0; color: #0c5460;">💰 Remboursement automatique</h3>
                <p style="color: #0c5460; margin: 0;">
                    Votre commande a été automatiquement annulée car elle est restée en attente pendant plus de 3 jours. 
                    Le montant complet de <strong>{{refund_amount}} XAF</strong> sera recrédité sur votre méthode de paiement originale sous 3-5 jours ouvrables.
                </p>
            </div>
            
            <p>Nous nous excusons sincèrement pour ce désagrément. Cette politique de remboursement automatique est en place pour protéger nos clients contre les retards excessifs.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{tracking_url}}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Voir ma commande
                </a>
            </div>
            
            <p>N''hésitez pas à passer une nouvelle commande. Nous ferons de notre mieux pour vous offrir une meilleure expérience.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                Si vous avez des questions sur ce remboursement, contactez-nous à {{support_email}}<br>
                Cet email a été envoyé automatiquement par Cameroon Marketplace.
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

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_refunds_updated_at 
    BEFORE UPDATE ON refunds 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();