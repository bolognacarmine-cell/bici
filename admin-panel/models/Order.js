const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, default: '' },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
      },
    ],
    total: { type: Number, default: 0 },
    status: { type: String, default: 'paid' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Order', OrderSchema)

