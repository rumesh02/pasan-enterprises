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
  // Per-item VAT percentage (default 18%)
  vatPercentage: {
    type: Number,
    default: 18,
    min: [0, 'VAT percentage cannot be negative'],
    max: [100, 'VAT percentage cannot exceed 100']
  },
  // Per-item VAT amount
  vatAmount: {
    type: Number,
    default: 0,
    min: [0, 'VAT amount cannot be negative']
  },
  // Warranty in months (default 12 months)
  warrantyMonths: {
    type: Number,
    default: 12,
    min: [0, 'Warranty months cannot be negative']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  // Total price including VAT for this item
  totalWithVAT: {
    type: Number,
    default: 0,
    min: [0, 'Total with VAT cannot be negative']
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
  vatRate: {
    type: Number,
    default: 15, // 15% VAT
    min: 0,
    max: 100
  },
  vatAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBeforeDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    default: 0,
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
  finalTotal: {
    type: Number,
    required: true,
    min: [0, 'Final total cannot be negative']
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
  // Calculate per-item VAT and totals
  this.items.forEach(item => {
    // The unitPrice stored already includes VAT
    // Calculate VAT amount: VAT = (VAT% / 100) × Unit Price
    const vatAmountPerUnit = (item.vatPercentage / 100) * item.unitPrice;
    
    // Calculate base price: Base Price = Unit Price - VAT
    const basePricePerUnit = item.unitPrice - vatAmountPerUnit;
    
    // Calculate subtotal for this item (base price × quantity, without VAT)
    item.subtotal = basePricePerUnit * item.quantity;
    
    // Calculate total VAT amount for this item
    item.vatAmount = vatAmountPerUnit * item.quantity;
    
    // Total with VAT is simply unitPrice × quantity
    item.totalWithVAT = item.unitPrice * item.quantity;
  });
  
  // Calculate subtotal from items (base prices only, no VAT)
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  
  // Calculate total VAT from all items
  this.vatAmount = this.items.reduce((sum, item) => sum + item.vatAmount, 0);
  
  // Calculate total before discount (subtotal + VAT)
  this.totalBeforeDiscount = this.subtotal + this.vatAmount;
  
  // Calculate discount amount
  this.discountAmount = (this.totalBeforeDiscount * this.discountPercentage) / 100;
  
  // Calculate extras total
  this.extrasTotal = this.extras.reduce((sum, extra) => sum + extra.amount, 0);
  
  // Calculate total (for backward compatibility)
  this.total = this.subtotal + this.extrasTotal;
  
  // Calculate final total (totalBeforeDiscount - discount + extras)
  this.finalTotal = this.totalBeforeDiscount - this.discountAmount + this.extrasTotal;
  
  console.log(`💰 Order totals calculated:`);
  console.log(`   Subtotal (Base Prices): ${this.subtotal}`);
  console.log(`   Total VAT: ${this.vatAmount}`);
  console.log(`   Total Before Discount: ${this.totalBeforeDiscount}`);
  console.log(`   Discount (${this.discountPercentage}%): ${this.discountAmount}`);
  console.log(`   Extras: ${this.extrasTotal}`);
  console.log(`   Final Total: ${this.finalTotal}`);
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