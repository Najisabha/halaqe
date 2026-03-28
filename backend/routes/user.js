import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { User, Notification } from '../models/index.js';

const router = express.Router();

const toClientNotification = (n) => {
  const plain = n.toJSON ? n.toJSON() : n;
  const type = String(plain.type || '').toUpperCase();
  const mappedType =
    type === 'APPOINTMENT' ? 'appointment' :
    type === 'REVIEW' ? 'rating' :
    type === 'SYSTEM' ? 'info' :
    type === 'PROMOTION' ? 'info' :
    type === 'PAYMENT' ? 'payment' :
    'info';

  return {
    id: plain.id,
    userId: plain.userId,
    title: plain.title,
    message: plain.message,
    type: mappedType,
    read: Boolean(plain.isRead),
    createdAt: plain.createdAt,
    actionUrl: plain.actionUrl ?? null
  };
};

// Get user navbar data
router.get('/navbar', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get unread notifications count
    const notificationCount = await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      balance: req.user.balance,
      notification: notificationCount,
      moneyreceived: 0 // TODO: implement money received logic
    });
  } catch (error) {
    console.error('Navbar data error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب البيانات'
    });
  }
});

// Get user notifications
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    return res.json(notifications.map(toClientNotification));
  } catch (error) {
    console.error('Notifications error:', error);
    return res.status(500).json({ message: 'خطأ في تحميل الإشعارات' });
  }
});

// Mark a notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({ where: { id, userId } });
    if (!notification) {
      return res.status(404).json({ message: 'الإشعار غير موجود' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return res.json(toClientNotification(notification));
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'فشل تحديث الإشعار' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    await Notification.update(
      { isRead: true, readAt: now },
      { where: { userId, isRead: false } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return res.status(500).json({ message: 'فشل تحديث الإشعارات' });
  }
});

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        email: req.user.email,
        phonenumber: req.user.phonenumber,
        city: req.user.city,
        area: req.user.area,
        address: req.user.address,
        birthDate: req.user.birthDate,
        gender: req.user.gender,
        type: req.user.type,
        profileImage: req.user.profileImage,
        balance: req.user.balance,
        points: req.user.points
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الملف الشخصي'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const {
      firstname, lastname, phonenumber, city, area, address, profileImage
    } = req.body;

    const user = req.user;

    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (phonenumber) user.phonenumber = phonenumber;
    if (city) user.city = city;
    if (area) user.area = area;
    if (address) user.address = address;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phonenumber: user.phonenumber,
        city: user.city,
        area: user.area,
        address: user.address,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الملف الشخصي'
    });
  }
});

export default router;
