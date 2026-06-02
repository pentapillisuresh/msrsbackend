const { Donation, Transaction, Category,sequelize } = require('../models');
const razorpay = require('../config/razorpay');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const crypto = require('crypto');
const { UUID } = require('sequelize');

// Create donation and Razorpay order
const createDonation = async (req, res) => {
  try {
    const donationData = req.body;
    
    // Create Razorpay order
    const options = {
      amount: donationData.donationAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    
    // Create donation record
    const donation = await Donation.create({
      ...donationData,
      status: 'pending'
    });
    
    // Create transaction record
    const transaction = await Transaction.create({
      donationId: donation.id,
      razorpayOrderId: order.id,
      amount: donationData.donationAmount,
      currency: 'INR',
      status: 'created',
      receipt: order.receipt
    });
    
    return successResponse(res, {
      donation,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    }, 'Donation created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const createDonationFromAdmin = async (req, res) => {
  try {
    const donationData = req.body;
        
    // Create donation record
    const donation = await Donation.create({
      ...donationData,
      status: 'pending'
    });
    
    // Create transaction record
    const transaction = await Transaction.create({
      donationId: donation.id,
      razorpayOrderId: Math.floor(
        100000000 + Math.random() * 900000000
      ).toString(),
      amount: donationData.donationAmount,
      currency: "INR",
      status: "created",
      receipt: Math.floor(
        100000000 + Math.random() * 900000000
      ).toString(),
    });
        
    return successResponse(res, {
      donation,
      transaction: transaction.id,
      currency: transaction.currency
    }, 'Donation created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const updateDonationStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const donation = await Donation.findByPk(id);

    if (!donation) {
      return errorResponse(res, 'Donation not found', 404);
    }

    await donation.update({ status });

    return successResponse(
      res,
      { donation },
      'Donation updated successfully',
      200
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    const transaction = await Transaction.findOne({
      where: { razorpayOrderId: razorpay_order_id },
      include: [{ model: Donation }]
    });
    
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }
    
    if (expectedSignature === razorpay_signature) {
      await transaction.update({
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid'
      });
      
      await transaction.Donation.update({ status: 'completed' });
      
      return successResponse(res, {
        transactionId: transaction.id,
        paymentId: razorpay_payment_id
      }, 'Payment verified successfully');
    } else {
      await transaction.update({ status: 'failed' });
      await transaction.Donation.update({ status: 'failed' });
      return errorResponse(res, 'Invalid payment signature', 400);
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get all donations
const getAllDonations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const offset = (page - 1) * limit;
    const donations = await Donation.findAndCountAll({
      where,
      include: [{ model: Transaction }, { model: Category }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: donations.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: donations.rows
    }, 'Donations fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get donation by ID
const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findByPk(id, {
      include: [{ model: Transaction }, { model: Category }]
    });
    
    if (!donation) {
      return errorResponse(res, 'Donation not found', 404);
    }
    return successResponse(res, donation, 'Donation fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get donation statistics
const getDonationStats = async (req, res) => {
  try {
    const totalDonations = await Donation.sum('donationAmount', { where: { status: 'completed' } });
    const monthlyDonations = await Donation.findAll({
      where: { status: 'completed' },
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('donationAmount')), 'total']
      ],
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'DESC']],
      limit: 12
    });
    
    return successResponse(res, {
      totalAmount: totalDonations || 0,
      monthlyStats: monthlyDonations
    }, 'Donation stats fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createDonation,
  verifyPayment,
  createDonationFromAdmin,
  updateDonationStatusById,
  getAllDonations,
  getDonationById,
  getDonationStats
};