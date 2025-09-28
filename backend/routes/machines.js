const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');

// @route   GET /api/machines
// @desc    Get all machines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find().sort({ dateAdded: -1 });
    res.json({
      success: true,
      count: machines.length,
      data: machines
    });
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/machines/:id
// @desc    Get single machine by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      data: machine
    });
  } catch (error) {
    console.error('Error fetching machine:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/machines/item/:itemId
// @desc    Get machine by itemId
// @access  Public
router.get('/item/:itemId', async (req, res) => {
  try {
    const machine = await Machine.findOne({ itemId: req.params.itemId });
    
    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      data: machine
    });
  } catch (error) {
    console.error('Error fetching machine by itemId:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/machines
// @desc    Create new machine
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { itemId, name, category, description, price, quantity } = req.body;

    // Check if machine with itemId already exists
    const existingMachine = await Machine.findOne({ itemId });
    if (existingMachine) {
      return res.status(400).json({
        success: false,
        message: 'Machine with this Item ID already exists'
      });
    }

    // Create new machine
    const machine = new Machine({
      itemId,
      name,
      category,
      description,
      price,
      quantity
    });

    const savedMachine = await machine.save();

    res.status(201).json({
      success: true,
      message: 'Machine added successfully',
      data: savedMachine
    });
  } catch (error) {
    console.error('Error creating machine:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/machines/:id
// @desc    Update machine
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const { itemId, name, category, description, price, quantity } = req.body;

    // Check if itemId is being updated and if it already exists
    if (itemId) {
      const existingMachine = await Machine.findOne({ 
        itemId, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingMachine) {
        return res.status(400).json({
          success: false,
          message: 'Machine with this Item ID already exists'
        });
      }
    }

    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { itemId, name, category, description, price, quantity },
      { new: true, runValidators: true }
    );

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      message: 'Machine updated successfully',
      data: machine
    });
  } catch (error) {
    console.error('Error updating machine:', error);
    
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
        message: 'Machine not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   DELETE /api/machines/:id
// @desc    Delete machine
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    res.json({
      success: true,
      message: 'Machine deleted successfully',
      data: machine
    });
  } catch (error) {
    console.error('Error deleting machine:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/machines/search/:query
// @desc    Search machines by name or description
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    
    const machines = await Machine.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
        { itemId: { $regex: searchQuery, $options: 'i' } }
      ]
    }).sort({ dateAdded: -1 });

    res.json({
      success: true,
      count: machines.length,
      data: machines
    });
  } catch (error) {
    console.error('Error searching machines:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/machines/category/:category
// @desc    Get machines by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const machines = await Machine.find({ 
      category: req.params.category 
    }).sort({ dateAdded: -1 });

    res.json({
      success: true,
      count: machines.length,
      data: machines
    });
  } catch (error) {
    console.error('Error fetching machines by category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;