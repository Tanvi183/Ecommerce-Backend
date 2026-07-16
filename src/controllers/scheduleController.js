const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private/Admin
const getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new schedule
// @route   POST /api/schedules
// @access  Private/Admin
const createSchedule = async (req, res) => {
  try {
    const { title, type, date, startTime, endTime } = req.body;
    
    if (!title || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const schedule = await prisma.schedule.create({
      data: {
        title,
        type: type || 'meeting',
        date: new Date(date),
        startTime,
        endTime
      }
    });
    
    res.status(201).json({ success: true, data: schedule, message: 'Schedule created successfully' });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a schedule
// @route   DELETE /api/schedules/:id
// @access  Private/Admin
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await prisma.schedule.findUnique({ where: { id: req.params.id } });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    await prisma.schedule.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a schedule
// @route   PUT /api/schedules/:id
// @access  Private/Admin
const updateSchedule = async (req, res) => {
  try {
    const { title, type, date, startTime, endTime } = req.body;
    
    let schedule = await prisma.schedule.findUnique({ where: { id: req.params.id } });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: {
        title: title || schedule.title,
        type: type || schedule.type,
        date: date ? new Date(date) : schedule.date,
        startTime: startTime || schedule.startTime,
        endTime: endTime || schedule.endTime,
      }
    });

    res.json({ success: true, data: schedule, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
