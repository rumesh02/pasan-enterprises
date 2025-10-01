const express = require('express');
const router = express.Router();
const {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  getMachineCategories
} = require('../controllers/machinesController');

// @route   GET /api/machines/categories
// @desc    Get machine categories
// @access  Public
router.get('/categories', getMachineCategories);

// @route   GET /api/machines
// @desc    Get all machines
// @access  Public
router.get('/', getAllMachines);

// @route   GET /api/machines/:id
// @desc    Get single machine by ID
// @access  Public
router.get('/:id', getMachineById);

// @route   POST /api/machines
// @desc    Create new machine
// @access  Public
router.post('/', createMachine);

// @route   PUT /api/machines/:id
// @desc    Update machine
// @access  Public
router.put('/:id', updateMachine);

// @route   DELETE /api/machines/:id
// @desc    Delete machine
// @access  Public
router.delete('/:id', deleteMachine);

module.exports = router;