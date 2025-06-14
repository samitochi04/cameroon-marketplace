const express = require('express');
const router = express.Router();
const supabase = require('../supabase/supabaseClient');

router.post('/', async (req, res) => {
  const { transaction_id, status } = req.body;

  if (status === 'ACCEPTED') {
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', transaction_id);
  }

  res.status(200).send('OK');
});

module.exports = router;
