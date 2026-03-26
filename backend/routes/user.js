import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { User, Notification } from '../models/index.js';

const router = express.Router();

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
