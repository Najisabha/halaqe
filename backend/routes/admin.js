import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { User, Barber, Notification } from '../models/index.js';

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

// Admin: get own notifications (same schema as user)
router.get('/notifications', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    return res.json(notifications.map(toClientNotification));
  } catch (error) {
    console.error('Admin notifications error:', error);
    return res.status(500).json({ message: 'خطأ في تحميل الإشعارات' });
  }
});

router.put('/notifications/:id/read', authenticate, authorize('ADMIN'), async (req, res) => {
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
    console.error('Admin mark notification read error:', error);
    return res.status(500).json({ message: 'فشل تحديث الإشعار' });
  }
});

router.put('/notifications/read-all', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    await Notification.update(
      { isRead: true, readAt: now },
      { where: { userId, isRead: false } }
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Admin mark all notifications read error:', error);
    return res.status(500).json({ message: 'فشل تحديث الإشعارات' });
  }
});

export default router;

