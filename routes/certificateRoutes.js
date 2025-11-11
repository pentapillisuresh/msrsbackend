// routes/certificateRoutes.js
const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Volunteer = require('../models/Volunteer');

// ✅ CREATE Certificate
router.post('/', async (req, res) => {
  try {
    const { volunteerId, eventName, issuedDate, certificateNumber, description, issuedBy, fileUrl } = req.body;

    const volunteer = await Volunteer.findByPk(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    const certificate = await Certificate.create({
      volunteerId,
      eventName,
      issuedDate,
      certificateNumber,
      description,
      issuedBy,
      fileUrl
    });

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ READ All Certificates
router.get('/', async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      include: {
        model: Volunteer,
        as: 'volunteer',
        attributes: ['id', 'name', 'email']
      }
    });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ READ Certificate by ID
router.get('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findByPk(req.params.id, {
      include: {
        model: Volunteer,
        as: 'volunteer',
        attributes: ['id', 'name', 'email']
      }
    });
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ UPDATE Certificate
router.put('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findByPk(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    await certificate.update(req.body);
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE Certificate
router.delete('/:id', async (req, res) => {
  try {
    const certificate = await Certificate.findByPk(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificate not found' });

    await certificate.destroy();
    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
