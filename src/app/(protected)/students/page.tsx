'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MoreVertical, 
  Search, 
  UserPlus, 
  X, 
  Save, 
  Trash2, 
  Hash,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';

export default function UserManagementPage() {
  const { profile } = useAuth();
  
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    name: '',
    password: '',
    role: 'student',
    status: 'active',
    program: '',
    label: 'Student Workspace'
  });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      id: `student-${Date.now()}`,
      username: '',
      email: '',
      name: '',
      password: 'Student@123',
      role: 'student',
      status: 'active',
      program: '',
      label: 'Student Workspace'
    });
    setError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      id: user.id || '',
      username: user.username || '',
      email: user.email || '',
      name: user.name || user.displayName || '',
      password: '', // Don't show password
      role: user.role,
      status: user.status || 'active',
      program: user.program || '',
      label: user.label || 'Student Workspace'
    });
    setError(null);
    setIsEditModalOpen(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          displayName: formData.name // Compatibility
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAddModalOpen(false);
        fetchUsers();
      } else {
        setError(data.error || 'Failed to add student');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use profile API or a dedicated update API
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          uid: selectedUser.uid,
          displayName: formData.name // Compatibility
        })
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'admin' && profile?.role !== 'teacher') {
    return <div className="p-8 text-center font-bold text-red-500">Access Denied</div>;
  }

  const filteredUsers = users.filter(u => 
    (u.name || u.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-academy-orange-600 uppercase tracking-widest mb-1">Administrative Center</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Management</h1>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-academy-orange-600 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-academy-orange-100 hover:bg-academy-orange-700 transition-all"
        >
          <UserPlus size={18} />
          <span>Add Student</span>
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by name, ID or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[24px] focus:ring-2 focus:ring-academy-orange-600 shadow-sm text-sm font-medium"
        />
      </div>

      <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr 
                  key={user._id} 
                  onClick={() => handleOpenEdit(user)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-slate-900 text-[13px]">{user.name || user.displayName || user.username}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{user.id || user.username}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      user.status === 'active' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="p-10">
                <header className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {isAddModalOpen ? 'Add New Student' : 'Edit Member Profile'}
                  </h2>
                  <button 
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                    }} 
                    className="p-2 bg-slate-50 text-slate-400 rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </header>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <form onSubmit={isAddModalOpen ? handleAddUser : handleUpdateUser} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">ID / Roll Number</label>
                       <input 
                         required
                         type="text"
                         value={isAddModalOpen ? formData.username : formData.id}
                         onChange={(e) => setFormData({...formData, username: e.target.value, id: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[13px] font-bold"
                         placeholder="e.g. student-101"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Role</label>
                       <select 
                         value={formData.role}
                         onChange={(e) => setFormData({...formData, role: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[13px] font-bold"
                       >
                         <option value="student">Student</option>
                         <option value="teacher">Teacher</option>
                         <option value="admin">Admin</option>
                       </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Full Name</label>
                     <input 
                       required
                       type="text" 
                       value={formData.name}
                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[13px] font-bold"
                       placeholder="e.g. Riya Sharma"
                     />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Email</label>
                     <input 
                       required
                       type="email" 
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[13px] font-bold"
                       placeholder="student@example.com"
                     />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">
                      {isAddModalOpen ? 'Password' : 'Change Password (leave blank to keep current)'}
                    </label>
                    <input 
                      required={isAddModalOpen}
                      type="password" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[13px] font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Program</label>
                       <input 
                         type="text" 
                         value={formData.program}
                         onChange={(e) => setFormData({...formData, program: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[13px] font-bold"
                         placeholder="e.g. Class 10"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">Status</label>
                       <select 
                         value={formData.status}
                         onChange={(e) => setFormData({...formData, status: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-[13px] font-bold"
                       >
                         <option value="active">Active</option>
                         <option value="inactive">Inactive</option>
                       </select>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-slate-200"
                    >
                      {loading ? 'Processing...' : (isAddModalOpen ? 'Create Student' : 'Save Member Info')}
                    </button>

                    {isEditModalOpen && (
                      <button 
                        type="button"
                        onClick={() => handleDeleteUser(selectedUser._id)}
                        disabled={loading}
                        className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-100 transition-colors"
                      >
                        Delete Member Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
