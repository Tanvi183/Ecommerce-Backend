const express = require('express');
const router = express.Router();
const { getSchedules, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getSchedules)
  .post(protect, admin, createSchedule);

router.route('/:id')
  .put(protect, admin, updateSchedule)
  .delete(protect, admin, deleteSchedule);

module.exports = router;
