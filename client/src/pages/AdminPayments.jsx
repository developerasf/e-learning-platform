import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Calendar, CheckCircle, Clock, Search, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminPayments = memo(() => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() === 0 ? 12 : currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear());

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('month', month);
      params.append('year', year);
      if (search) params.append('search', search);

      const res = await fetch(`/api/payments?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [month, year]); // run when month or year changes

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const togglePayment = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, month, year, status: newStatus })
      });
      
      if (res.ok) {
        toast.success(`Payment marked as ${newStatus}`);
        setStudents(prev => prev.map(s => {
          if (s._id === studentId) {
            return { 
              ...s, 
              paymentStatus: newStatus,
              paidDate: newStatus === 'paid' ? new Date().toISOString() : null
            };
          }
          return s;
        }));
      } else {
        toast.error('Failed to update payment');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating payment');
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-violet-600" />
                Payments Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Track and update student monthly payments
              </p>
            </div>
            
            <div className="flex bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="bg-transparent border-none text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer font-medium px-4"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <div className="w-px bg-slate-200 dark:bg-slate-700 my-2"></div>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="bg-transparent border-none text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer font-medium px-4"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <form onSubmit={handleSearch} className="flex gap-4 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Loading payments...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg">No students found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">Student Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">Paid Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600 dark:text-slate-300 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map(student => (
                    <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {student.paymentStatus === 'paid' && student.paidDate ? new Date(student.paidDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          student.paymentStatus === 'paid' 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {student.paymentStatus === 'paid' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {student.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => togglePayment(student._id, student.paymentStatus)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                            student.paymentStatus === 'paid'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                          }`}
                        >
                          Mark as {student.paymentStatus === 'paid' ? 'Unpaid' : 'Paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AdminPayments.displayName = 'AdminPayments';
export default AdminPayments;
