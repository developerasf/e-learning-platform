import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Trash2, ArrowLeft, Loader2, Mail, User, Shield, Calendar, UserPlus } from 'lucide-react';

const AdminUsers = memo(() => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const token = localStorage.getItem('token');
    fetch('/api/users?page=1&limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auth/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      const newUser = await res.json();
      setUsers([newUser, ...users]);
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role: 'student' });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/auth/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setUsers(users.filter(u => u._id !== id));
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage all registered users</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg cursor-pointer"
          >
            {showForm ? <Users className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {/* Add User Form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-500" />
              Create New User
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="w-full pl-12 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" className="w-full pl-12 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Password</label>
                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Role</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500">
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 cursor-pointer">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg">No users found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center text-white font-bold">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                            <Shield className="w-3 h-3" />
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {u._id !== user?._id ? (
                            <button onClick={() => handleDelete(u._id)} className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm transition cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          ) : <span className="text-slate-400 text-sm">You</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                {users.map(u => (
                  <div key={u._id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{u.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{u.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700'}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                      {u._id !== user?._id && (
                        <button onClick={() => handleDelete(u._id)} className="text-red-600 dark:text-red-400 hover:text-red-800 text-sm font-medium cursor-pointer">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

AdminUsers.displayName = 'AdminUsers';
export default AdminUsers;