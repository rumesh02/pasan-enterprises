const mongoose = require('mongoose');

// Schema for individual items in an order
const orderItemSchema = new mongoose.Schema({
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  }
}, { _id: false }); // Don't create separate _id for sub-documents

// Schema for extra charges
const extraChargeSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Extra charge description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Extra charge amount is required'],
    min: [0, 'Extra charge amount cannot be negative']
  }
}, { _id: false });

// Main PastOrder schema
const pastOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: function() {
      // Generate order ID: ORD-YYYYMMDD-XXXXX
      const date = new Date();
      const dateStr = date.getFullYear().toString() + 
                     (date.getMonth() + 1).toString().padStart(2, '0') + 
                     date.getDate().toString().padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
      return `ORD-${dateStr}-${randomNum}`;
    }
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  // Store customer snapshot at time of order (for historical accuracy)
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    nic: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  items: [orderItemSchema],
  extras: [extraChargeSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  extrasTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Partial', 'Refunded'],
    default: 'Paid'
  },
  orderStatus: {
    type: String,
    enum: ['Completed', 'Processing', 'Cancelled', 'Returned'],
    default: 'Completed'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  processedBy: {
    type: String,
    trim: true,
    default: 'System'
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

// Indexes for better query performance
pastOrderSchema.index({ customerId: 1 });
pastOrderSchema.index({ orderId: 1 }, { unique: true });
pastOrderSchema.index({ createdAt: -1 });
pastOrderSchema.index({ 'customerInfo.phone': 1 });
pastOrderSchema.index({ 'customerInfo.name': 'text' });

// Pre-save middleware to calculate totals
pastOrderSchema.pre('save', function(next) {
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.extrasTotal = this.extras.reduce((sum, extra) => sum + extra.amount, 0);
  this.total = this.subtotal + this.extrasTotal;
  
  console.log(`💰 Order totals calculated - Subtotal: ${this.subtotal}, Extras: ${this.extrasTotal}, Total: ${this.total}`);
  console.log(`🆔 Order ID: ${this.orderId}`);
  
  next();
});

// Virtual for order summary
pastOrderSchema.virtual('orderSummary').get(function() {
  const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
  return {
    itemCount,
    uniqueItems: this.items.length,
    hasExtras: this.extras.length > 0,
    formattedTotal: `Rs. ${this.total.toFixed(2)}`
  };
});

// Virtual for customer display name
pastOrderSchema.virtual('customerDisplay').get(function() {
  return `${this.customerInfo.name} (${this.customerInfo.phone})`;
});

// Static method to get orders by date range
pastOrderSchema.statics.getOrdersByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ createdAt: -1 });
};

// Static method to get customer's order history
pastOrderSchema.statics.getCustomerOrders = function(customerId) {
  return this.find({ customerId }).sort({ createdAt: -1 });
};

// Ensure virtual fields are serialized
pastOrderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('PastOrder', pastOrderSchema);