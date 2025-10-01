const mongoose = require('mongoose');

// Helper function to normalize phone numbers
const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\.]/g, '');
};

// Helper function to validate Sri Lankan phone numbers
const isValidSriLankanPhone = (phone) => {
  const cleanPhone = normalizePhone(phone);
  
  // Sri Lankan local format: 0XXXXXXXXX (10 digits, starts with 0, second digit 1-9)
  const localFormat = /^0[1-9]\d{8}$/;
  
  // Sri Lankan international format: +94XXXXXXXXX (country code +94 followed by 9 digits)
  const internationalFormat = /^\+94[1-9]\d{8}$/;
  
  // Other international formats (basic validation)
  const generalInternational = /^\+[1-9]\d{6,14}$/;
  
  return localFormat.test(cleanPhone) || 
         internationalFormat.test(cleanPhone) || 
         generalInternational.test(cleanPhone);
};

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return false;
        
        const isValid = isValidSriLankanPhone(v);
        
        if (!isValid) {
          console.log(`❌ Phone validation failed for: "${v}" (normalized: "${normalizePhone(v)}")`);
        }
        
        return isValid;
      },
      message: function(props) {
        const normalized = normalizePhone(props.value);
        return `Phone number "${props.value}" is invalid. Expected formats: 
        • Sri Lankan local: 0771234567, 077-123-4567, (077) 123 4567
        • International: +94771234567, +1234567890
        (Received normalized: "${normalized}")`;
      }
    }
  },
  email: {

    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Email is optional, but if provided, must be valid
        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  nic: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true, // Allows multiple documents with null/undefined NIC
    validate: {
      validator: function(v) {
        // NIC is optional, but if provided, must be valid format
        return !v || /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(v);
      },
      message: 'Please enter a valid NIC number (9 digits + V/X or 12 digits)'
    }
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastOrderDate: {
    type: Date
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

// Indexes for better query performance
customerSchema.index({ phone: 1 }, { unique: true });
customerSchema.index({ nic: 1 }, { sparse: true, unique: true });
customerSchema.index({ email: 1 }, { sparse: true });
customerSchema.index({ name: 'text' });

// Pre-save middleware to normalize phone number
customerSchema.pre('save', function(next) {
  if (this.phone) {
    // Normalize phone number by removing formatting
    this.phone = normalizePhone(this.phone);
    console.log(`📱 Normalized phone number: "${this.phone}"`);
  }
  next();
});

// Pre-validation middleware for better error handling
customerSchema.pre('validate', function(next) {
  if (this.phone) {
    console.log(`🔍 Validating phone: "${this.phone}" (original format)`);
  }
  next();
});

// Virtual for customer status
customerSchema.virtual('customerStatus').get(function() {
  if (this.totalOrders === 0) return 'New Customer';
  if (this.totalOrders >= 10) return 'VIP Customer';
  if (this.totalOrders >= 5) return 'Regular Customer';
  return 'Occasional Customer';
});

// Method to find customer by phone or NIC
customerSchema.statics.findByPhoneOrNIC = function(phone, nic) {
  const query = { $or: [] };
  
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    query.$or.push({ phone: normalizedPhone });
  }
  
  if (nic) {
    query.$or.push({ nic: nic.toUpperCase() });
  }
  
  return query.$or.length > 0 ? this.findOne(query) : null;
};

// Method to validate phone format (for external use)
customerSchema.statics.validatePhoneFormat = function(phone) {
  return isValidSriLankanPhone(phone);
};

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);