const express = require('express');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/orderRoutes');
const cinetpayWebhook = require('./webhooks/cinetpayWebhook');
const paymentRoutes = require('./routes/payment.routes'); // Add this line

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes); // Add this line
app.use('/webhooks/cinetpay', cinetpayWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));