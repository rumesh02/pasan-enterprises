const Customer = require('../models/Customer');
const PastOrder = require('../models/PastOrder');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Public
const getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nic: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Execute query with pagination
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      count: customers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: customers
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Public
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer's order history
    const orders = await PastOrder.find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        customer,
        recentOrders: orders
      }
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Public
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, nic, address } = req.body;

    // Check if customer already exists by phone or NIC
    const existingCustomer = await Customer.findByPhoneOrNIC(phone, nic);
    
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer already exists with this phone number or NIC'
      });
    }

    // Create new customer
    const customer = new Customer({
      name,
      phone,
      email,
      nic,
      address
    });

    const savedCustomer = await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer added successfully',
      data: savedCustomer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Public
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, email, nic, address } = req.body;

    // Check if phone or NIC is being updated and if it already exists
    if (phone || nic) {
      const existingCustomer = await Customer.findOne({
        $and: [
          { _id: { $ne: req.params.id } },
          { $or: [
            phone ? { phone: phone.replace(/[\s\-\(\)]/g, '') } : {},
            nic ? { nic: nic.toUpperCase() } : {}
          ].filter(obj => Object.keys(obj).length > 0) }
        ]
      });
      
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Another customer already exists with this phone number or NIC'
        });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, email, nic, address },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Public
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has orders
    const orderCount = await PastOrder.countDocuments({ customerId: customer._id });
    
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer with existing orders. Customer has ${orderCount} order(s).`
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Customer deleted successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Find or create customer (used internally by sales)
// @access  Private
const findOrCreateCustomer = async (customerData) => {
  try {
    const { name, phone, email, nic, address } = customerData;

    // First try to find existing customer by phone or NIC
    let customer = await Customer.findByPhoneOrNIC(phone, nic);

    if (customer) {
      // Update customer info if needed
      let needsUpdate = false;
      
      if (name && customer.name !== name) {
        customer.name = name;
        needsUpdate = true;
      }
      
      if (email && customer.email !== email) {
        customer.email = email;
        needsUpdate = true;
      }
      
      if (nic && customer.nic !== nic.toUpperCase()) {
        customer.nic = nic.toUpperCase();
        needsUpdate = true;
      }
      
      // Update address if provided
      if (address && customer.address !== address) {
        customer.address = address;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await customer.save();
      }
      
      return customer;
    }

    // Create new customer if not found
    customer = new Customer({
      name,
      phone,
      email,
      nic,
      address
    });

    await customer.save();
    return customer;
  } catch (error) {
    throw error;
  }
};

// @desc    Update customer statistics after order
// @access  Private
const updateCustomerStats = async (customerId, orderTotal) => {
  try {
    const customer = await Customer.findById(customerId);
    
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += orderTotal;
      customer.lastOrderDate = new Date();
      await customer.save();
    }
  } catch (error) {
    console.error('Error updating customer stats:', error);
  }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Public
const getCustomerStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const topCustomers = await Customer.find()
      .sort({ totalSpent: -1 })
      .limit(5)
      .select('name phone totalOrders totalSpent');

    res.json({
      success: true,
      data: {
        totalCustomers,
        newCustomers,
        topCustomers
      }
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  findOrCreateCustomer,
  updateCustomerStats,
  getCustomerStats
};