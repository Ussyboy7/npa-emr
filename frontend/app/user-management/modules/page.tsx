"use client";
import React, { useState, useMemo } from 'react';
import { Settings, Plus, Edit, Trash2, Eye, EyeOff, X, Search, Filter, AlertTriangle } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

const ModulesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Module | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const [modules, setModules] = useState<Module[]>([
    { 
      id: 'medical-records', 
      name: 'Medical Records', 
      icon: '📋', 
      description: 'Access and maintain comprehensive patient medical records', 
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    },
    { 
      id: 'nursing', 
      name: 'Nursing', 
      icon: '🫀', 
      description: 'Record and monitor patient vital signs and nursing care', 
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    },
    { 
      id: 'consultation', 
      name: 'Consultation', 
      icon: '📊', 
      description: 'Manage patient consultations and generate medical reports', 
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    },
    { 
      id: 'pharmacy', 
      name: 'Pharmacy', 
      icon: '💊', 
      description: 'Manage patient prescriptions and medication inventory', 
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    },
    { 
      id: 'laboratory', 
      name: 'Laboratory', 
      icon: '🔬', 
      description: 'Process and manage laboratory tests and results', 
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    },
    { 
      id: 'user-management', 
      name: 'User Management', 
      icon: '👤', 
      description: 'Manage system users, roles, and access permissions', 
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ]);

  const [moduleFormData, setModuleFormData] = useState({
    id: '',
    name: '',
    icon: '',
    description: '',
    status: 'active' as 'active' | 'inactive'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered and sorted modules
  const filteredModules = useMemo(() => {
    return modules.filter(module => {
      const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           module.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || module.status === filterStatus;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [modules, searchTerm, filterStatus]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!moduleFormData.name.trim()) {
      errors.name = 'Module name is required';
    }
    
    if (!moduleFormData.id.trim()) {
      errors.id = 'Module ID is required';
    } else if (!/^[a-z0-9-]+$/.test(moduleFormData.id)) {
      errors.id = 'Module ID must contain only lowercase letters, numbers, and hyphens';
    } else if (!selectedItem && modules.some(m => m.id === moduleFormData.id)) {
      errors.id = 'Module ID already exists';
    }
    
    if (!moduleFormData.icon.trim()) {
      errors.icon = 'Icon is required';
    }
    
    if (!moduleFormData.description.trim()) {
      errors.description = 'Description is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (item: Module | null = null) => {
    setSelectedItem(item);
    setShowModal(true);
    setFormErrors({});
    
    if (item) {
      setModuleFormData({
        id: item.id,
        name: item.name,
        icon: item.icon,
        description: item.description,
        status: item.status
      });
    } else {
      setModuleFormData({
        id: '',
        name: '',
        icon: '',
        description: '',
        status: 'active'
      });
    }
  };

  const handleSaveModule = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      if (selectedItem) {
        setModules(modules.map(module => 
          module.id === selectedItem.id 
            ? { ...module, ...moduleFormData, updatedAt: new Date().toISOString() }
            : module
        ));
        showNotification('success', 'Module updated successfully');
      } else {
        const newModule: Module = {
          ...moduleFormData,
          id: moduleFormData.id || moduleFormData.name.toLowerCase().replace(/\s+/g, '-'),
          createdAt: new Date().toISOString()
        };
        setModules([...modules, newModule]);
        showNotification('success', 'Module created successfully');
      }
      setShowModal(false);
    } catch (error) {
      showNotification('error', 'Failed to save module');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId));
    setShowDeleteConfirm(null);
    showNotification('success', 'Module deleted successfully');
  };

  const toggleModuleStatus = (moduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { 
            ...module, 
            status: module.status === 'active' ? 'inactive' : 'active',
            updatedAt: new Date().toISOString()
          }
        : module
    ));
    const module = modules.find(m => m.id === moduleId);
    const newStatus = module?.status === 'active' ? 'inactive' : 'active';
    showNotification('success', `Module ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
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
          <h1 className="text-2xl font-bold text-gray-900">System Modules</h1>
          <p className="mt-1 text-sm text-gray-500">Manage available modules in the EMR system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Content Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">System Modules</h2>
                <p className="mt-1 text-sm text-gray-600">
                  {filteredModules.length} of {modules.length} modules
                </p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Add new module"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search modules by name, description, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Search modules"
                />
              </div>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4 text-gray-400" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModules.map((module) => (
                  <tr key={module.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3" role="img" aria-label="Module icon">
                          {module.icon}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{module.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {module.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleModuleStatus(module.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          module.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500'
                            : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
                        }`}
                        aria-label={`Toggle module status. Currently ${module.status}`}
                      >
                        {module.status === 'active' ? (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {module.id}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(module)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={`Edit ${module.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(module.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Delete ${module.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredModules.length === 0 && (
              <div className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No modules found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first module.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Module Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedItem ? 'Edit Module' : 'Add New Module'}
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
                      Module ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={moduleFormData.id}
                      onChange={(e) => setModuleFormData({...moduleFormData, id: e.target.value})}
                      disabled={!!selectedItem}
                      className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.id ? 'border-red-300' : 'border-gray-300'
                      } ${selectedItem ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="e.g., medical-records"
                      aria-describedby={formErrors.id ? 'id-error' : undefined}
                    />
                    {formErrors.id && (
                      <p id="id-error" className="mt-1 text-xs text-red-600">{formErrors.id}</p>
                    )}
                    {selectedItem && (
                      <p className="mt-1 text-xs text-gray-500">Module ID cannot be changed after creation</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Module Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={moduleFormData.name}
                      onChange={(e) => setModuleFormData({...moduleFormData, name: e.target.value})}
                      className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Medical Records"
                      aria-describedby={formErrors.name ? 'name-error' : undefined}
                    />
                    {formErrors.name && (
                      <p id="name-error" className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon (Emoji) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={moduleFormData.icon}
                      onChange={(e) => setModuleFormData({...moduleFormData, icon: e.target.value})}
                      className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        formErrors.icon ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="📋"
                      maxLength={2}
                      aria-describedby={formErrors.icon ? 'icon-error' : undefined}
                    />
                    {formErrors.icon && (
                      <p id="icon-error" className="mt-1 text-xs text-red-600">{formErrors.icon}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={moduleFormData.status}
                      onChange={(e) => setModuleFormData({...moduleFormData, status: e.target.value as 'active' | 'inactive'})}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData({...moduleFormData, description: e.target.value})}
                    rows={3}
                    className={`block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                      formErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of what this module does..."
                    aria-describedby={formErrors.description ? 'description-error' : undefined}
                  />
                  {formErrors.description && (
                    <p id="description-error" className="mt-1 text-xs text-red-600">{formErrors.description}</p>
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
                  onClick={handleSaveModule}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Module'}
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
                  <h3 className="text-lg font-medium text-gray-900">Delete Module</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this module? This action cannot be undone.
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
                  onClick={() => handleDeleteModule(showDeleteConfirm)}
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

export default ModulesPage;