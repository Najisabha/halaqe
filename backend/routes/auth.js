import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Barber } from '../models/index.js';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register
router.post('/register', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstname').notEmpty().withMessage('First name is required'),
  body('lastname').notEmpty().withMessage('Last name is required'),
  body('phonenumber').notEmpty().withMessage('Phone number is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('birthDate').isDate().withMessage('Valid birth date is required'),
  body('gender').isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
  body('type').isIn(['USER', 'BARBER', 'PROVIDER']).withMessage('Invalid user type')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      firstname, lastname, email, password, countryCode, phonenumber,
      city, area, address, birthDate, gender, type,
      idDocumentUrl, professionLicenseUrl, salonType
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      where: { 
        email 
      } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'البريد الإلكتروني مستخدم بالفعل' 
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      countryCode: countryCode || '+970',
      phonenumber,
      city,
      area,
      address,
      birthDate,
      gender: gender.toUpperCase(),
      type: type.toUpperCase(),
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires
    });

    // If user is barber, create barber profile
    if (type.toUpperCase() === 'BARBER' || type.toUpperCase() === 'PROVIDER') {
      await Barber.create({
        userId: user.id,
        salonType: salonType?.toUpperCase() || 'FREELANCE',
        idDocumentUrl: idDocumentUrl || '',
        professionLicenseUrl: professionLicenseUrl || '',
        isApproved: false
      });
    }

    // TODO: Send verification email
    console.log(`Verification code for ${email}: ${verificationCode}`);

    res.status(201).json({
      success: true,
      message: 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في التسجيل' 
    });
  }
});

// Verify Email
router.post('/verify-email', [
  body('email').isEmail(),
  body('code').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, code } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'المستخدم غير موجود' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'البريد الإلكتروني مفعل بالفعل' 
      });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'رمز التحقق غير صحيح' 
      });
    }

    if (new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ 
        success: false, 
        message: 'رمز التحقق منتهي الصلاحية' 
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'تم التحقق من البريد الإلكتروني بنجاح',
      data: {
        token,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          type: user.type,
          balance: user.balance,
          points: user.points
        }
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في التحقق من البريد الإلكتروني' 
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Barber,
        as: 'barberProfile',
        required: false
      }]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'يرجى التحقق من بريدك الإلكتروني أولاً' 
      });
    }

    // Check if barber is approved
    if (user.type === 'BARBER' && user.barberProfile && !user.barberProfile.isApproved) {
      return res.status(401).json({ 
        success: false, 
        message: 'حسابك قيد المراجعة. يرجى انتظار موافقة الإدارة',
        barberApproved: false
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        type: user.type,
        balance: user.balance,
        points: user.points,
        profileImage: user.profileImage,
        barberApproved: user.barberProfile?.isApproved || true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في تسجيل الدخول' 
    });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail()
], async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // TODO: Send reset email
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إرسال رابط إعادة تعيين كلمة المرور' 
    });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token
      }
    });

    if (!user || new Date() > user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        message: 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية'
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطأ في إعادة تعيين كلمة المرور' 
    });
  }
});

export default router;
