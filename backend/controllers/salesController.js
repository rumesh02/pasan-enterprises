const Machine = require('../models/Machine');
const Customer = require('../models/Customer');
const PastOrder = require('../models/PastOrder');
const { findOrCreateCustomer, updateCustomerStats } = require('./customersController');
const { updateMachineStock } = require('./machinesController');

// @desc    Process a sale
// @route   POST /api/sales
// @access  Public
const processSale = async (req, res) => {
  const session = await require('mongoose').startSession();
  
  try {
    session.startTransaction();
    
    const { 
      customerInfo, 
      items, 
      extras = [], 
      notes = '',
      processedBy = 'System',
      vatRate = 15,
      discountPercentage = 0
    } = req.body;

    // Validate required fields
    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone are required'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Validate and process items
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.machineId || !item.quantity || item.quantity <= 0) {
        throw new Error('Invalid item data: machineId and quantity are required');
      }

      // Get machine details
      const machine = await Machine.findById(item.machineId).session(session);
      if (!machine) {
        throw new Error(`Machine not found: ${item.machineId}`);
      }

      // Check stock availability
      if (machine.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${machine.name}. Available: ${machine.quantity}, Requested: ${item.quantity}`);
      }

      // Get per-item VAT percentage (default 18% if not provided)
      const itemVatPercentage = item.vatPercentage !== undefined ? item.vatPercentage : 18;
      
      // Get warranty months (default 12 if not provided)
      const warrantyMonths = item.warrantyMonths !== undefined ? item.warrantyMonths : 12;

      // The machine.price stored in database already includes VAT
      // Calculate VAT amount: VAT = (VAT% / 100) × Total Price
      const vatAmountPerUnit = (itemVatPercentage / 100) * machine.price;
      
      // Calculate base price: Base Price = Total Price - VAT Amount
      const basePricePerUnit = machine.price - vatAmountPerUnit;
      
      // Calculate item subtotal (base price × quantity, without VAT)
      const itemSubtotal = basePricePerUnit * item.quantity;
      
      // Calculate total VAT for this item
      const itemVatAmount = vatAmountPerUnit * item.quantity;
      
      // Calculate total with VAT for this item
      const itemTotalWithVAT = machine.price * item.quantity;
      
      subtotal += itemSubtotal;

      processedItems.push({
        machineId: machine._id,
        itemId: machine.itemId,
        name: machine.name,
        category: machine.category,
        quantity: item.quantity,
        unitPrice: machine.price, // Store the full price (includes VAT)
        vatPercentage: itemVatPercentage,
        vatAmount: itemVatAmount,
        warrantyMonths: warrantyMonths,
        subtotal: itemSubtotal, // Base price * quantity (without VAT)
        totalWithVAT: itemTotalWithVAT
      });

      // Update machine stock
      machine.quantity -= item.quantity;
      await machine.save({ session });
    }

    // Process extras
    const processedExtras = extras.map(extra => {
      if (!extra.description || extra.amount === undefined || extra.amount < 0) {
        throw new Error('Extra charge must have description and valid amount');
      }
      return {
        description: extra.description.trim(),
        amount: parseFloat(extra.amount)
      };
    });

    const extrasTotal = processedExtras.reduce((sum, extra) => sum + extra.amount, 0);
    
    // Calculate total VAT from all items (already calculated per item)
    const totalVatAmount = processedItems.reduce((sum, item) => sum + item.vatAmount, 0);
    
    // Calculate total before discount (subtotal + VAT)
    const totalBeforeDiscount = subtotal + totalVatAmount;
    
    // Calculate discount amount
    const discountAmount = (totalBeforeDiscount * discountPercentage) / 100;
    
    // Calculate final total
    const finalTotal = totalBeforeDiscount - discountAmount + extrasTotal;
    
    const total = subtotal + extrasTotal; // Keep for backward compatibility

    // Find or create customer
    const customer = await findOrCreateCustomer(customerInfo);

    // Create order
    const order = new PastOrder({
      customerId: customer._id,
      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || customer.email,
        nic: customerInfo.nic || customer.nic
      },
      items: processedItems,
      extras: processedExtras,
      subtotal,
      vatRate: vatRate, // Keep for reference (not used in calculation anymore)
      vatAmount: totalVatAmount,
      totalBeforeDiscount,
      discountPercentage,
      discountAmount,
      extrasTotal,
      total,
      finalTotal,
      notes: notes.trim(),
      processedBy
    });

    await order.save({ session });

    // Update customer statistics (use finalTotal for accurate stats)
    await updateCustomerStats(customer._id, finalTotal);

    // Commit transaction
    await session.commitTransaction();

    // Populate the order for response
    const populatedOrder = await PastOrder.findById(order._id)
      .populate('customerId', 'name phone email')
      .populate('items.machineId', 'itemId name category');

    res.status(201).json({
      success: true,
      message: 'Sale processed successfully',
      data: {
        order: populatedOrder,
        orderSummary: {
          orderId: order.orderId,
          itemCount: processedItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          vatRate, // Keep for reference
          vatAmount: totalVatAmount,
          totalBeforeDiscount,
          discountPercentage,
          discountAmount,
          extrasTotal,
          total,
          finalTotal,
          customer: {
            name: customer.name,
            phone: customer.phone
          }
        }
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    
    console.error('❌ Error processing sale:', error);
    
    if (error.name === 'ValidationError') {
      // Detailed validation error reporting
      const validationErrors = {};
      const errorMessages = [];
      
      Object.keys(error.errors).forEach(field => {
        const fieldError = error.errors[field];
        validationErrors[field] = {
          message: fieldError.message,
          value: fieldError.value,
          kind: fieldError.kind
        };
        errorMessages.push(`${field}: ${fieldError.message}`);
      });
      
      console.error('📋 Validation errors:', validationErrors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: `Field validation failed: ${errorMessages.join('; ')}`,
        errors: validationErrors,
        errorCount: errorMessages.length
      });
    }
    
    if (error.code === 11000) {
      // Handle duplicate key error (unique constraint)
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field} error`,
        details: `A customer with this ${field} already exists`,
        field,
        value: error.keyValue[field]
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message || 'Error processing sale',
      details: 'Check server logs for more information'
    });
  } finally {
    session.endSession();
  }
};

// @desc    Validate sale data before processing
// @route   POST /api/sales/validate
// @access  Public
const validateSale = async (req, res) => {
  try {
    const { customerInfo, items, extras = [] } = req.body;

    // Validation results
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {}
    };

    // Validate customer info
    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      validation.isValid = false;
      validation.errors.push('Customer name and phone are required');
    }

    // Validate items
    if (!items || items.length === 0) {
      validation.isValid = false;
      validation.errors.push('At least one item is required');
      return res.json({ success: true, data: validation });
    }

    let subtotal = 0;
    const itemValidation = [];

    for (const item of items) {
      const itemCheck = {
        machineId: item.machineId,
        isValid: true,
        errors: [],
        warnings: []
      };

      if (!item.machineId || !item.quantity || item.quantity <= 0) {
        itemCheck.isValid = false;
        itemCheck.errors.push('Machine ID and valid quantity are required');
        validation.isValid = false;
      } else {
        // Check machine availability
        const machine = await Machine.findById(item.machineId);
        if (!machine) {
          itemCheck.isValid = false;
          itemCheck.errors.push('Machine not found');
          validation.isValid = false;
        } else {
          itemCheck.machineName = machine.name;
          itemCheck.unitPrice = machine.price;
          itemCheck.availableStock = machine.quantity;
          
          if (machine.quantity < item.quantity) {
            itemCheck.isValid = false;
            itemCheck.errors.push(`Insufficient stock. Available: ${machine.quantity}, Requested: ${item.quantity}`);
            validation.isValid = false;
          } else {
            const itemSubtotal = machine.price * item.quantity;
            subtotal += itemSubtotal;
            itemCheck.subtotal = itemSubtotal;

            // Low stock warning
            if (machine.quantity - item.quantity <= 5) {
              itemCheck.warnings.push(`Stock will be low after sale: ${machine.quantity - item.quantity} remaining`);
              validation.warnings.push(`${machine.name} will have low stock after this sale`);
            }
          }
        }
      }

      itemValidation.push(itemCheck);
    }

    // Validate extras
    const extrasTotal = extras.reduce((sum, extra) => {
      if (extra.description && extra.amount >= 0) {
        return sum + parseFloat(extra.amount);
      }
      return sum;
    }, 0);

    // Summary
    validation.summary = {
      itemCount: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      uniqueItems: items.length,
      subtotal,
      extrasTotal,
      total: subtotal + extrasTotal
    };

    validation.itemValidation = itemValidation;

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Error validating sale:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating sale data',
      error: error.message
    });
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats
// @access  Public
const getSalesStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Daily stats
    const dailyStats = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" }
        }
      }
    ]);

    // Weekly stats
    const weeklyStats = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$total" }
        }
      }
    ]);

    // Monthly stats
    const monthlyStats = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$total" }
        }
      }
    ]);

    // Top selling items this month
    const topItems = await PastOrder.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            machineId: "$items.machineId",
            name: "$items.name"
          },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        daily: dailyStats[0] || { totalSales: 0, totalRevenue: 0, averageOrderValue: 0 },
        weekly: weeklyStats[0] || { totalSales: 0, totalRevenue: 0 },
        monthly: monthlyStats[0] || { totalSales: 0, totalRevenue: 0 },
        topItems
      }
    });

  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales statistics',
      error: error.message
    });
  }
};

module.exports = {
  processSale,
  validateSale,
  getSalesStats
};