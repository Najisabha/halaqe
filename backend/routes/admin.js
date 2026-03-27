import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { User, Barber } from '../models/index.js';

const router = express.Router();

const safeUserAttrs = {
  exclude: ['password', 'emailVerificationCode', 'resetPasswordToken', 'resetPasswordExpires']
};

const flattenProvider = (user) => {
  const plain = user.toJSON();
  const profile = plain.barberProfile || null;
  delete plain.barberProfile;
  return {
    ...plain,
    ...(profile || {})
  };
};

// Admin: list users + barbers + providers
router.get('/users-barbers', authenticate, authorize('ADMIN'), async (req, res) => {
  const [users, barbers, providers] = await Promise.all([
    User.findAll({
      where: { type: 'USER' },
      attributes: safeUserAttrs,
      order: [['createdAt', 'DESC']]
    }),
    User.findAll({
      where: { type: 'BARBER' },
      attributes: safeUserAttrs,
      include: [
        {
          model: Barber,
          as: 'barberProfile',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    }),
    User.findAll({
      where: { type: 'PROVIDER' },
      attributes: safeUserAttrs,
      include: [
        {
          model: Barber,
          as: 'barberProfile',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    })
  ]);

  res.json({
    users,
    barbers: barbers.map(flattenProvider),
    providers: providers.map(flattenProvider)
  });
});

// Admin: delete any user (cascade will remove related barber profile)
router.delete('/users-barbers/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
  }

  if (user.type === 'ADMIN') {
    return res.status(400).json({ success: false, message: 'لا يمكن حذف حساب المشرف' });
  }

  await user.destroy();
  return res.json({ success: true, message: 'تم الحذف بنجاح' });
});

export default router;

