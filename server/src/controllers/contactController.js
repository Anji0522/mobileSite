import { ContactMessage } from '../models/ContactMessage.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const contact = await ContactMessage.create({
    name,
    email,
    phone: phone || '',
    subject,
    message,
  });

  return sendSuccess(
    res,
    contact,
    'Thank you for contacting MobiVerse India. Our team will respond within 24 hours.',
    201
  );
});

export const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
  return sendSuccess(res, messages, 'Contact messages retrieved.');
});

export const updateMessageStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, replyNotes } = req.body;

  const message = await ContactMessage.findById(id);
  if (!message) return next(new AppError('Message not found.', 404));

  if (status) message.status = status;
  if (replyNotes) message.replyNotes = replyNotes;
  await message.save();

  return sendSuccess(res, message, 'Message updated.');
});
