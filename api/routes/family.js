const express = require('express');
const router = express.Router();
const dataStore = require('../store/dataStore');

// Join a family
router.post('/join', (req, res) => {
  try {
    const { userId, familyId } = req.body;

    if (!userId || !familyId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, familyId'
      });
    }

    dataStore.joinFamily(userId, familyId);

    res.json({
      success: true,
      message: 'Joined family successfully',
      familyId
    });
  } catch (error) {
    console.error('Error joining family:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get family members
router.get('/:familyId/members', (req, res) => {
  try {
    const { familyId } = req.params;
    const members = dataStore.getFamilyMembers(familyId);

    res.json({
      familyId,
      count: members.length,
      members
    });
  } catch (error) {
    console.error('Error getting family members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
