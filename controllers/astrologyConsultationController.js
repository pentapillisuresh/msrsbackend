const AstrologyConsultation = require('../models/AstrologyConsultation');

// Create a new consultation
exports.createConsultation = async (req, res) => {
  try {
    const consultation = await AstrologyConsultation.create(req.body);
    res.status(201).json({ message: 'Consultation booked successfully', consultation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all consultations
exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await AstrologyConsultation.findAll();
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get consultation by ID
exports.getConsultationById = async (req, res) => {
  try {
    const consultation = await AstrologyConsultation.findByPk(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    res.status(200).json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update consultation
exports.updateConsultation = async (req, res) => {
  try {
    const [updated] = await AstrologyConsultation.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) return res.status(404).json({ message: 'Consultation not found' });
    const updatedConsultation = await AstrologyConsultation.findByPk(req.params.id);
    res.status(200).json({ message: 'Consultation updated', updatedConsultation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete consultation
exports.deleteConsultation = async (req, res) => {
  try {
    const deleted = await AstrologyConsultation.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) return res.status(404).json({ message: 'Consultation not found' });
    res.status(200).json({ message: 'Consultation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
