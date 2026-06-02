const { Message, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer'); // Optional: for email notifications

// Create a new message (public endpoint)
const createMessage = async (req, res) => {
  try {
    const { name, email, address, subject, contactMethod, message, phoneNumber } = req.body;
    
    // Validate phone number if contact method requires it
    if ((contactMethod === 'phone' || contactMethod === 'whatsapp') && !phoneNumber) {
      return errorResponse(res, 'Phone number is required for this contact method', 400);
    }
    
    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const messageData = await Message.create({
      name,
      email,
      address,
      subject,
      contactMethod,
      message,
      phoneNumber: phoneNumber || null,
      ipAddress,
      userAgent,
      status: 'unread'
    });
    
    // Optional: Send email notification to admin
    await sendEmailNotification(messageData);
    
    return successResponse(res, messageData, 'Message sent successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Optional: Send email notification function
const sendEmailNotification = async (message) => {
  try {
    // Configure your email transporter
    // This is optional - configure based on your email service
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.SMTP_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message: ${message.subject}`,
      html: `
        <h3>New Message from ${message.name}</h3>
        <p><strong>Email:</strong> ${message.email}</p>
        <p><strong>Phone:</strong> ${message.phoneNumber || 'N/A'}</p>
        <p><strong>Subject:</strong> ${message.subject}</p>
        <p><strong>Message:</strong> ${message.message}</p>
      `
    });
    */
  } catch (error) {
    console.error('Email notification failed:', error.message);
  }
};

// Get all messages (admin only)
const getAllMessages = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      contactMethod,
      startDate, 
      endDate,
      search,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const where = { isDeleted: false };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (contactMethod) where.contactMethod = contactMethod;
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
        { message: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const offset = (page - 1) * limit;
    const messages = await Message.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'repliedUser',
        attributes: ['id', 'name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // Get statistics
    const stats = await getMessageStats();
    
    return successResponse(res, {
      total: messages.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(messages.count / limit),
      data: messages.rows,
      stats
    }, 'Messages fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get message statistics
const getMessageStats = async () => {
  const unreadCount = await Message.count({ where: { status: 'unread', isDeleted: false } });
  const readCount = await Message.count({ where: { status: 'read', isDeleted: false } });
  const repliedCount = await Message.count({ where: { status: 'replied', isDeleted: false } });
  const urgentCount = await Message.count({ where: { priority: 'urgent', isDeleted: false } });
  const todayCount = await Message.count({
    where: {
      createdAt: {
        [Op.gte]: new Date().setHours(0, 0, 0, 0)
      },
      isDeleted: false
    }
  });
  
  return {
    unread: unreadCount,
    read: readCount,
    replied: repliedCount,
    urgent: urgentCount,
    today: todayCount,
    total: unreadCount + readCount + repliedCount
  };
};

// Get message by ID
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id, {
      include: [{
        model: User,
        as: 'repliedByUser',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    if (!message || message.isDeleted) {
      return errorResponse(res, 'Message not found', 404);
    }
    
    // Mark as read if it's unread
    if (message.status === 'unread') {
      await message.update({ status: 'read' });
    }
    
    return successResponse(res, message, 'Message fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Update message status
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;
    
    const message = await Message.findByPk(id);
    if (!message || message.isDeleted) {
      return errorResponse(res, 'Message not found', 404);
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    
    await message.update(updateData);
    
    return successResponse(res, message, 'Message status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Reply to message
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;
    const userId = req.user.id;
    
    if (!replyMessage) {
      return errorResponse(res, 'Reply message is required', 400);
    }
    
    const message = await Message.findByPk(id);
    if (!message || message.isDeleted) {
      return errorResponse(res, 'Message not found', 404);
    }
    
    await message.update({
      status: 'replied',
      repliedBy: userId,
      repliedAt: new Date(),
      replyMessage: replyMessage
    });
    
    // Optional: Send reply email to the user
    await sendReplyEmail(message, replyMessage);
    
    const updatedMessage = await Message.findByPk(id, {
      include: [{
        model: User,
        as: 'repliedByUser',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    return successResponse(res, updatedMessage, 'Reply sent successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Send reply email (optional)
const sendReplyEmail = async (message, replyText) => {
  try {
    // Configure your email transporter
    // This is optional - configure based on your email service
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_FROM}>`,
      to: message.email,
      subject: `Re: ${message.subject}`,
      html: `
        <h3>Response to your message</h3>
        <p>Dear ${message.name},</p>
        <p>Thank you for contacting us. Here's our response:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
          ${replyText}
        </div>
        <p>Original message:</p>
        <div style="background-color: #e8e8e8; padding: 15px; border-radius: 5px;">
          ${message.message}
        </div>
        <br/>
        <p>Best regards,<br/>MAHA SHREE RUDRA SAMSTHANAM FOUNDATION</p>
      `
    });
    */
  } catch (error) {
    console.error('Reply email failed:', error.message);
  }
};

// Delete message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);
    
    if (!message || message.isDeleted) {
      return errorResponse(res, 'Message not found', 404);
    }
    
    await message.update({
      isDeleted: true,
      deletedAt: new Date()
    });
    
    return successResponse(res, null, 'Message deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Permanent delete message (admin only)
const permanentDeleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);
    
    if (!message) {
      return errorResponse(res, 'Message not found', 404);
    }
    
    await message.destroy();
    return successResponse(res, null, 'Message permanently deleted');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Bulk delete messages
const bulkDeleteMessages = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide an array of message IDs', 400);
    }
    
    const updated = await Message.update(
      { isDeleted: true, deletedAt: new Date() },
      { where: { id: { [Op.in]: ids }, isDeleted: false } }
    );
    
    return successResponse(res, { deletedCount: updated[0] }, `${updated[0]} messages deleted successfully`);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Bulk update status
const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, 'Please provide an array of message IDs', 400);
    }
    
    if (!status) {
      return errorResponse(res, 'Please provide status to update', 400);
    }
    
    const updated = await Message.update(
      { status },
      { where: { id: { [Op.in]: ids } } }
    );
    
    return successResponse(res, { updatedCount: updated[0] }, `${updated[0]} messages updated successfully`);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get messages by email
const getMessagesByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    const messages = await Message.findAndCountAll({
      where: { email, isDeleted: false },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    return successResponse(res, {
      total: messages.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: messages.rows
    }, 'Messages fetched successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Get unread messages count (for dashboard)
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.count({ 
      where: { status: 'unread', isDeleted: false }
    });
    
    const urgentCount = await Message.count({
      where: { 
        priority: 'urgent', 
        status: ['unread', 'read'],
        isDeleted: false 
      }
    });
    
    return successResponse(res, { unread: count, urgent: urgentCount }, 'Unread count fetched');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Export messages to CSV
const exportMessagesToCSV = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const where = { isDeleted: false };
    
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const messages = await Message.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    // Create CSV
    const csvHeaders = ['ID', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Contact Method', 'Status', 'Priority', 'Created At', 'Replied At'];
    const csvRows = messages.map(msg => [
      msg.id,
      msg.name,
      msg.email,
      msg.phoneNumber || '',
      msg.subject,
      msg.message.replace(/,/g, ';'), // Escape commas
      msg.contactMethod,
      msg.status,
      msg.priority,
      msg.createdAt,
      msg.repliedAt || ''
    ]);
    
    const csvContent = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=messages_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  replyToMessage,
  deleteMessage,
  permanentDeleteMessage,
  bulkDeleteMessages,
  bulkUpdateStatus,
  getMessagesByEmail,
  getUnreadCount,
  exportMessagesToCSV
};