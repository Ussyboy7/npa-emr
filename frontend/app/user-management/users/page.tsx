"use client";
import React, { useState, useMemo } from 'react';
import { Users, Search, Filter, Plus, Edit, Trash2, Eye, EyeOff, X, AlertTriangle, CheckSquare, Square } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  modules: string[];
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
  displayName: string;
}

interface Module {
  id: string;
  name: string;
}

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      username: 'dr.smith',
      email: 'smith@hospital.com',
      fullName: 'Dr. John Smith',
      role: 'doctor',
      modules: ['medical-records', 'consultation', 'pharmacy'],
      status: 'active',
      lastLogin: '2024-08-26T10:30:00Z',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      username: 'nurse.johnson',
      email: 'johnson@hospital.com',
      fullName: 'Sarah Johnson',
      role: 'nurse',
      modules: ['nursing', 'medical-records'],
      status: 'active',
      lastLogin: '2024-08-26T09:15:00Z',
      createdAt: '2024-02-20T10:00:00Z'
    },
    {
      id: 3,
      username: 'admin.wilson',
      email: 'wilson@hospital.com',
      fullName: 'Mike Wilson',
      role: 'admin',
      modules: ['user-management', 'laboratory'],
      status: 'active',
      lastLogin: '2024-08-26T08:45:00Z',
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 4,
      username: 'receptionist.brown',
      email: 'brown@hospital.com',
      fullName: 'Lisa Brown',
      role: 'receptionist',
      modules: ['consultation'],
      status: 'inactive',
      lastLogin: '2024-08-20T16:20:00Z',
      createdAt: '2024-03-01T10:00:00Z'
    }
  ]);

  const [roles] = useState<Role[]>([
    { id: 1, name: 'doctor', displayName: 'Doctor' },
    { id: 2, name: 'nurse', displayName: 'Nurse' },
    { id: 3, name: 'admin', displayName: 'Administrator' },
    { id: 4, name: 'receptionist', displayName: 'Receptionist' }
  ]);

  const [modules] = useState<Module[]>([
    { id: 'medical-records', name: 'Medical Records' },
    { id: 'nursing', name: 'Nursing' },
    { id: 'consultation', name: 'Consultation' },
    { id: 'pharmacy', name: 'Pharmacy' },
    { id: 'laboratory', name: 'Laboratory' },
    { id: 'user-management', name: 'User Management' }
  ]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: '',
    modules: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [users, searchTerm, filterRole, filterStatus]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      errors.username = 'Username must contain only letters, numbers, dots, underscores, and hyphens';
    } else if (!selectedItem && users.some(u => u.username === formData.username)) {
      errors.username = 'Username already exists';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (!selectedItem && users.some(u => u.email === formData.email)) {
      errors.email = 'Email already exists';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    if (formData.modules.length === 0) {
      errors.modules = 'At least one module must be selected';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (item: User | null = null) => {
    setSelectedItem(item);
    setShowModal(true);
    setFormErrors({});
    
    if (item) {
      setFormData({
        username: item.username,
        email: item.email,
        fullName: item.fullName,
        role: item.role,
        modules: item.modules,
        status: item.status
      });
    } else {
      setFormData({
        username: '',
        email: '',
        fullName: '',
        role: '',
        modules: [],
        status: 'active'
      });
    }
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (selectedItem) {
        setUsers(users.map(user => 
          user.id === selectedItem.id 
            ? { ...user, ...formData }
            : user
        ));
        showNotification('success', 'User updated successfully');
      } else {
        const newUser: User = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        showNotification('success', 'User created successfully');
      }
      setShowModal(false);
    } catch (error) {
      showNotification('error', 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    setShowDeleteConfirm(null);
    setSelectedUsers(selectedUsers.filter(id => id !== userId));
    showNotification('success', 'User deleted successfully');
  };

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    setUsers(users.map(user => 
      selectedUsers.includes(user.id) 
        ? { ...user, status }
        : user
    ));
    setSelectedUsers([]);
    showNotification('success', `${selectedUsers.length} users ${status === 'active' ? 'activated' : 'deactivated'}`);
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    const user = users.find(u => u.id === userId);
    const newStatus = user?.status === 'active' ? 'inactive' : 'active';
    showNotification('success', `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const getRoleDisplayName = (roleName: string): string => {
    const role = roles.find(r => r.name === roleName);
    return role ? role.displayName : roleName;
  };

  const getModuleName = (moduleId: string): string => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : moduleId;
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && showModal) {
      setShowModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" onKeyDown={handleKeyDown}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage users in the EMR system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Content Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Users</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {filteredUsers.length} of {users.length} users
                  {selectedUsers.length > 0 && (
                    <span className="ml-2 text-blue-600">({selectedUsers.length} selected)</span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {selectedUsers.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkStatusChange('active')}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Activate Selected
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('inactive')}
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Deactivate Selected
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleOpenModal()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Add new user"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, username, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Search users"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-gray-400" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Filter by role"
                  >
                    <option value="all">All Roles</option>
                    {roles.map(role => (
                      <option key={role.name} value={role.name}>{role.displayName}</option>
                    ))}
                  </select>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleAllUsers}
                      className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      aria-label={selectedUsers.length === filteredUsers.length ? 'Deselect all users' : 'Select all users'}
                    >
                      {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserSelection(user.id)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        aria-label={`${selectedUsers.includes(user.id) ? 'Deselect' : 'Select'} ${user.fullName}`}
                      >
                        {selectedUsers.includes(user.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <code className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                          @{user.username}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.modules.map(moduleId => (
                          <span 
                            key={moduleId} 
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            title={getModuleName(moduleId)}
                          >
                            {getModuleName(moduleId)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
                        }`}
                        aria-label={`Toggle user status. Currently ${user.status}`}
                      >
                        {user.status === 'active' ? (
                          <>
                            <Eye className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Edit ${user.fullName}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Delete ${user.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first user.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedItem ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.fullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Dr. John Smith"
                      aria-describedby={formErrors.fullName ? 'fullName-error' : undefined}
                    />
                    {formErrors.fullName && (
                      <p id="fullName-error" className="mt-1 text-xs text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.username ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., dr.smith"
                      aria-describedby={formErrors.username ? 'username-error' : undefined}
                    />
                    {formErrors.username && (
                      <p id="username-error" className="mt-1 text-xs text-red-600">{formErrors.username}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., smith@hospital.com"
                    aria-describedby={formErrors.email ? 'email-error' : undefined}
                  />
                  {formErrors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.role ? 'border-red-300' : 'border-gray-300'
                      }`}
                      aria-describedby={formErrors.role ? 'role-error' : undefined}
                    >
                      <option value="">Select a role</option>
                      {roles.map(role => (
                        <option key={role.name} value={role.name}>{role.displayName}</option>
                      ))}
                    </select>
                    {formErrors.role && (
                      <p id="role-error" className="mt-1 text-xs text-red-600">{formErrors.role}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Module Access <span className="text-red-500">*</span>
                  </label>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border rounded-md ${
                    formErrors.modules ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    {modules.map(module => (
                      <label key={module.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.modules.includes(module.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, modules: [...formData.modules, module.id]});
                            } else {
                              setFormData({...formData, modules: formData.modules.filter(m => m !== module.id)});
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {/* No icon available for module */}
                        <span className="text-sm text-gray-700">{module.name}</span>
                      </label>
                    ))}
                  </div>
                  {formErrors.modules && (
                    <p className="mt-2 text-xs text-red-600">{formErrors.modules}</p>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;