import User from './_models/User.js';
import Payment from './_models/Payment.js';
import { protect, admin } from './_middleware/auth.js';
import connectDB from './_lib/db.js';

const getPath = (url) => {
  if (!url) return '/';
  let path = url.split('?')[0];
  if (path.startsWith('/api/payments')) {
    path = path.substring(13);
  }
  return path || '/';
};

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('DB Error:', error.message);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  const { method } = req;
  const path = getPath(req.url);

  try {
    // GET /api/payments?month=4&year=2026
    if (method === 'GET' && (path === '/' || path === '')) {
      const authError = await protect(req, res);
      if (authError) return authError;

      const adminError = admin(req, res);
      if (adminError) return adminError;

      const { month, year, search } = req.query;
      
      if (!month || !year) {
        return res.status(400).json({ message: 'Month and year are required' });
      }

      // Query all students
      let query = { role: 'student' };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const students = await User.find(query).select('name email isVerified createdAt').sort('-createdAt');
      
      // Query payments for the given month/year
      const payments = await Payment.find({ 
        month: parseInt(month), 
        year: parseInt(year) 
      });

      const paymentMap = {};
      payments.forEach(p => {
        paymentMap[p.student.toString()] = p;
      });

      // Combine
      const studentsWithPayments = students.map(student => {
        const payment = paymentMap[student._id.toString()];
        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          isVerified: student.isVerified,
          joinedAt: student.createdAt,
          paymentStatus: payment ? payment.status : 'unpaid',
          paidDate: payment ? payment.paidDate : null
        };
      });

      return res.json(studentsWithPayments);
    }

    // POST /api/payments
    // Body: { studentId, month, year, status }
    if (method === 'POST' && (path === '/' || path === '')) {
      const authError = await protect(req, res);
      if (authError) return authError;

      const adminError = admin(req, res);
      if (adminError) return adminError;

      const { studentId, month, year, status } = req.body;

      if (!studentId || !month || !year || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (status === 'unpaid') {
        // Remove the payment record
        await Payment.findOneAndDelete({ student: studentId, month, year });
        return res.json({ message: 'Payment status updated to unpaid' });
      } else if (status === 'paid') {
        // Upsert the payment record
        const payment = await Payment.findOneAndUpdate(
          { student: studentId, month, year },
          { status: 'paid', paidDate: new Date() },
          { new: true, upsert: true }
        );
        return res.json({ message: 'Payment status updated to paid', payment });
      }

      return res.status(400).json({ message: 'Invalid status' });
    }

    return res.status(404).json({ message: 'Endpoint not found' });
  } catch (error) {
    console.error('Payment API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
