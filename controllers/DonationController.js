const Donation = require('../models/Donation');
const Razorpay = require('razorpay');
const QRCode = require('qrcode');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CREATE Donation
exports.createDonation = async (req, res) => {
  try {
    const donation = await Donation.create({
      ...req.body,
      status: 'pending'
    });
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

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', donationId } = req.body;
    
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency,
      receipt: `receipt_${donationId}_${Date.now()}`,
      notes: {
        donationId: donationId.toString()
      }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ success: false, message: "Error creating payment order" });
  }
};

// Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;
    
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment verified successfully
      const donation = await Donation.findByPk(donationId);
      if (donation) {
        await donation.update({
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          status: 'completed',
          paymentMethod: 'online',
          transactionDate: new Date()
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        donation 
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

// Generate QR Code for UPI Payment
exports.generateQRCode = async (req, res) => {
  try {
    const { amount, donationId, upiId = process.env.UPI_ID } = req.body;
    
    const upiString = `upi://pay?pa=${upiId}&pn=Temple%20Foundation&am=${amount}&cu=INR&tn=Donation%20${donationId}`;
    
    const qrCode = await QRCode.toDataURL(upiString);
    
    // Update donation with UPI details
    await Donation.update({
      paymentMethod: 'upi',
      status: 'pending'
    }, { where: { id: donationId } });
    
    res.json({
      success: true,
      qrCode,
      upiString,
      upiId
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ success: false, message: "Error generating QR code" });
  }
};

// Mark UPI Payment as Completed
exports.markUPIPaymentCompleted = async (req, res) => {
  try {
    const { donationId, upiTransactionId } = req.body;
    
    const donation = await Donation.findByPk(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: "Donation not found" });
    }

    await donation.update({
      status: 'completed',
      upiTransactionId: upiTransactionId,
      transactionDate: new Date()
    });

    res.json({ 
      success: true, 
      message: 'UPI payment marked as completed',
      donation 
    });
  } catch (error) {
    console.error('UPI payment update error:', error);
    res.status(500).json({ success: false, message: "Error updating UPI payment" });
  }
};

// Get Payment Summary
exports.getPaymentSummary = async (req, res) => {
  try {
    const totalDonations = await Donation.count();
    const completedDonations = await Donation.count({ where: { status: 'completed' } });
    const pendingDonations = await Donation.count({ where: { status: 'pending' } });
    const totalAmount = await Donation.sum('amount', { where: { status: 'completed' } });

    res.json({
      success: true,
      data: {
        totalDonations,
        completedDonations,
        pendingDonations,
        totalAmount: totalAmount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payment summary" });
  }
};