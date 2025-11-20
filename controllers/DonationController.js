const Donation = require('../models/Donation');

// CREATE Donation
exports.createDonation = async (req, res) => {
  try {
    const donation = await Donation.create(req.body);
    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating donation" });
  }
};

// GET All Donations
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({ order: [['id', 'DESC']] });
    res.json({ success: true, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching donations" });
  }
};

// GET Donation by ID
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching donation" });
  }
};

// UPDATE Donation
exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    await donation.update(req.body);
    res.json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating donation" });
  }
};

// DELETE Donation
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    await donation.destroy();
    res.json({ success: true, message: "Donation deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting donation" });
  }
};
