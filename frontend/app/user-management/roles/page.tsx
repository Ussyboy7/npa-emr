"use client";
import React, { useState, useMemo } from 'react';
import { Shield, Plus, Edit, Trash2, X, Search, Filter, AlertTriangle, CheckSquare, Square } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  permissions: Record<string, Permission[]>;
  userCount: number;
  createdAt: string;
  updatedAt?: string;
}

interface Module {
  id: string;
  name: string;
  icon: string;
}

type Permission = 'view' | 'create' | 'edit' | 'delete' | 'export';

const RolesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Role | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: 'doctor',
      displayName: 'Doctor',
      description: 'Medical practitioners with full patient access and treatment authority',
      permissions: {
        'medical-records': ['view', 'create', 'edit'],
        'consultation': ['view', 'create', 'edit', 'delete'],
        'pharmacy': ['view', 'create', 'edit'],
        'laboratory': ['view', 'create', 'edit']
      },
      userCount: 15,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'nurse',
      displayName: 'Nurse',
      description: 'Nursing staff with patient care access and vital signs monitoring',
      permissions: {
        'medical-records': ['view'],
        'nursing': ['view', 'create', 'edit'],
        'consultation': ['view', 'edit'],
        'laboratory': ['view']
      },
      userCount: 28,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 3,
      name: 'admin',
      displayName: 'Administrator',
      description: 'System administrators with full access to user and system management',
      permissions: {
        'user-management': ['view', 'create', 'edit', 'delete'],
        'medical-records': ['view', 'export'],
        'consultation': ['view', 'export'],
        'pharmacy': ['view', 'export'],
        'laboratory': ['view', 'export'],
        'nursing': ['view', 'export']
      },
      userCount: 5,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 4,
      name: 'receptionist',
      displayName: 'Receptionist',
      description: 'Front desk staff with appointment management and basic patient information access',
      permissions: {
        'consultation': ['view', 'create', 'edit'],
        'medical-records': ['view']
      },
      userCount: 12,
      createdAt: '2024-01-15T10:00:00Z'
    }
  ]);

  const [modules] = useState<Module[]>([
    { id: 'medical-records', name: 'Medical Records', icon: '📋' },
    { id: 'nursing', name: 'Nursing', icon: '🫀' },
    { id: 'consultation', name: 'Consultation', icon: '📊' },
    { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
    { id: 'laboratory', name: 'Laboratory', icon: '🔬' },
    { id: 'user-management', name: 'User Management', icon: '👤' }
  ]);

  const permissions: Permission[] = ['view', 'create', 'edit', 'delete', 'export'];

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: {} as Record<string, Permission[]>
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered and sorted roles
  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch = role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           role.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [roles, searchTerm]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!roleFormData.name.trim()) {
      errors.name = 'Role name is required';
    } else if (!/^[a-z0-9-]+$/.test(roleFormData.name)) {
      errors.name = 'Role name must contain only lowercase letters, numbers, and hyphens';
    } else if (!selectedItem && roles.some(r => r.name === roleFormData.name)) {
      errors.name = 'Role name already exists';
    }
    
    if (!roleFormData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }
    
    if (!roleFormData.description.trim()) {
      errors.description = 'Description is required';
    }

    const hasPermissions = Object.keys(roleFormData.permissions).some(moduleId => 
      roleFormData.permissions[moduleId].length > 0
    );
    if (!hasPermissions) {
      errors.permissions = 'At least one permission must be granted';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (item: Role | null = null) => {
    setSelectedItem(item);
    setShowModal(true);
    setFormErrors({});
    
    if (item) {
      setRoleFormData({
        name: item.name,
        displayName: item.displayName,
        description: item.description,
        permissions: item.permissions
      });
    } else {
      setRoleFormData({
        name: '',
        displayName: '',
        description: '',
        permissions: {}
      });
    }
  };

  const handleSaveRole = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (selectedItem) {
        setRoles(roles.map(role => 
          role.id === selectedItem.id 
            ? { ...role, ...roleFormData, updatedAt: new Date().toISOString() }
            : role
        ));
        showNotification('success', 'Role updated successfully');
      } else {
        const newRole: Role = {
          id: Date.now(),
          ...roleFormData,
          userCount: 0,
          createdAt: new Date().toISOString()
        };
        setRoles([...roles, newRole]);
        showNotification('success', 'Role created successfully');
      }
      setShowModal(false);
    } catch (error) {
      showNotification('error', 'Failed to save role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    if (role && role.userCount > 0) {
      showNotification('error', `Cannot delete role "${role.displayName}" - it has ${role.userCount} assigned users`);
      setShowDeleteConfirm(null);
      return;
    }
    
    setRoles(roles.filter(role => role.id !== roleId));
    setShowDeleteConfirm(null);
    setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    showNotification('success', 'Role deleted successfully');
  };

  const handlePermissionChange = (moduleId: string, permission: Permission) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: prev.permissions[moduleId] 
          ? prev.permissions[moduleId].includes(permission)
            ? prev.permissions[moduleId].filter(p => p !== permission)
            : [...prev.permissions[moduleId], permission]
          : [permission]
      }
    }));
  };

  const toggleRoleSelection = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const toggleAllRoles = () => {
    if (selectedRoles.length === filteredRoles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(filteredRoles.map(role => role.id));
    }
  };

  const getModuleName = (moduleId: string): string => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : moduleId;
  };

  const getModuleIcon = (moduleId: string): string => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.icon : '📄';
  };

  const getPermissionColor = (permission: Permission): string => {
    const colors = {
      view: 'bg-gray-100 text-gray-700',
      create: 'bg-green-100 text-green-700',
      edit: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      export: 'bg-purple-100 text-purple-700'
    };
    return colors[permission] || 'bg-gray-100 text-gray-700';
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
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-gray-500">Manage roles and their permissions in the EMR system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Content Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Roles & Permissions</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {filteredRoles.length} of {roles.length} roles
                  {selectedRoles.length > 0 && (
                    <span className="ml-2 text-blue-600">({selectedRoles.length} selected)</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Add new role"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </button>
            </div>

            {/* Search */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search roles by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Search roles"
                />
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
                      onClick={toggleAllRoles}
                      className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      aria-label={selectedRoles.length === filteredRoles.length ? 'Deselect all roles' : 'Select all roles'}
                    >
                      {selectedRoles.length === filteredRoles.length && filteredRoles.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRoleSelection(role.id)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        aria-label={`${selectedRoles.includes(role.id) ? 'Deselect' : 'Select'} ${role.displayName}`}
                      >
                        {selectedRoles.includes(role.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{role.displayName}</div>
                          <code className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded">
                            {role.name}
                          </code>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {role.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {Object.entries(role.permissions).slice(0, 2).map(([moduleId, perms]) => (
                          <div key={moduleId} className="flex items-center space-x-2">
                            <span className="text-sm">{getModuleIcon(moduleId)}</span>
                            <span className="text-xs font-medium text-gray-700">{getModuleName(moduleId)}:</span>
                            <div className="flex flex-wrap gap-1">
                              {perms.slice(0, 3).map(perm => (
                                <span 
                                  key={perm} 
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getPermissionColor(perm)}`}
                                >
                                  {perm}
                                </span>
                              ))}
                              {perms.length > 3 && (
                                <span className="text-xs text-gray-500">+{perms.length - 3}</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {Object.keys(role.permissions).length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{Object.keys(role.permissions).length - 2} more modules
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {role.userCount} {role.userCount === 1 ? 'user' : 'users'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(role)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Edit ${role.displayName}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(role.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Delete ${role.displayName}`}
                          disabled={role.userCount > 0}
                        >
                          <Trash2 className={`h-4 w-4 ${role.userCount > 0 ? 'opacity-50' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRoles.length === 0 && (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? 'Try adjusting your search criteria.'
                    : 'Get started by creating your first role.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Role Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedItem ? 'Edit Role' : 'Add New Role'}
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
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                      className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., doctor"
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                    />
                    {formErrors.name && (
                      <p id="name-error" className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={roleFormData.displayName}
                      onChange={(e) => setRoleFormData({...roleFormData, displayName: e.target.value})}
                      className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.displayName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Doctor"
                      aria-describedby={formErrors.displayName ? 'displayName-error' : undefined}
                    />
                    {formErrors.displayName && (
                      <p id="displayName-error" className="mt-1 text-xs text-red-600">{formErrors.displayName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={roleFormData.description}
                    onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                    rows={2}
                    className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      formErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of this role's responsibilities..."
                    aria-describedby={formErrors.description ? 'description-error' : undefined}
                  />
                  {formErrors.description && (
                    <p id="description-error" className="mt-1 text-xs text-red-600">{formErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Module Permissions <span className="text-red-500">*</span>
                  </label>
                  <div className={`space-y-4 p-4 border rounded-md ${
                    formErrors.permissions ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    {modules.map(module => (
                      <div key={module.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center mb-3">
                          <span className="text-lg mr-3" role="img" aria-label="Module icon">
                            {module.icon}
                          </span>
                          <h4 className="font-medium text-gray-900">{module.name}</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {permissions.map(permission => (
                            <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions[module.id]?.includes(permission) || false}
                                onChange={() => handlePermissionChange(module.id, permission)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className={`text-xs font-medium px-2 py-1 rounded ${getPermissionColor(permission)}`}>
                                {permission}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {formErrors.permissions && (
                    <p className="mt-2 text-xs text-red-600">{formErrors.permissions}</p>
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
                  onClick={handleSaveRole}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Role'}
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
                  <h3 className="text-lg font-medium text-gray-900">Delete Role</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this role? This action cannot be undone.
                      {(() => {
                        const role = roles.find(r => r.id === showDeleteConfirm);
                        return role && role.userCount > 0 ? (
                          <span className="block mt-2 text-red-600 font-medium">
                            Warning: This role has {role.userCount} assigned users.
                          </span>
                        ) : null;
                      })()}
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
                  onClick={() => handleDeleteRole(showDeleteConfirm)}
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

export default RolesPage;