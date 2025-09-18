"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Download, Upload, FileText, Calendar, Paperclip } from 'lucide-react';

const CorrespondenceManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [correspondences, setCorrespondences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [correspondenceType, setCorrespondenceType] = useState('inward');
  const [formData, setFormData] = useState({});

  const divisions = [
    "Engineering",
    "Land & Asset Administration",
    "Marine and Operations",
    "Monitoring & Regulation",
    "HSE",
    "Security",
    "Port Managers",
    "HR",
    "Medical",
    "Admin",
    "Finance",
    "Superannuation & Investment",
    "Enterprise Risk Management",
    "Procurement",
    "Corporate & Strategic Communications",
    "Corporate & Strategic Planning",
    "Legal Services",
    "Audit",
    "ICT",
    "PPP",
    "Abuja Liaison Office",
    "Servicom",
    "Overseas Liaison Office",
    "MD's Office"
  ];

  useEffect(() => {
    setCorrespondences([
      {
        id: 1,
        type: 'inward',
        serialNumber: 'IN/2025/001',
        senderReference: 'REF/MIN/2025/001',
        dateOfLetter: '2025-09-01',
        dateReceived: '2025-09-05',
        fromWhom: 'Ministry of Transportation',
        subject: 'Port Infrastructure Development Project',
        filedUnder: 'Engineering',
        division: 'Engineering',
        remarks: 'Urgent response required',
        hasAttachment: true,
        status: 'Pending'
      },
      {
        id: 2,
        type: 'outward',
        serialNumber: 'OUT/2025/001',
        reference: 'NPA/MD/2025/001',
        dateOfLetter: '2025-09-03',
        dateOfDispatch: '2025-09-03',
        toWhom: 'Federal Ministry of Transportation',
        subject: 'Monthly Port Operations Report',
        division: "MD's Office",
        remarks: 'Monthly report submitted',
        hasAttachment: true,
        status: 'Sent'
      },
      {
        id: 3,
        type: 'inward',
        serialNumber: 'IN/2025/002',
        senderReference: 'NIMASA/REG/2025/045',
        dateOfLetter: '2025-09-04',
        dateReceived: '2025-09-06',
        fromWhom: 'Nigerian Maritime Administration',
        subject: 'Vessel Traffic Monitoring System Update',
        filedUnder: 'Marine and Operations',
        division: 'Marine and Operations',
        remarks: 'Review required',
        hasAttachment: false,
        status: 'Pending'
      }
    ]);
  }, []);

  const handleAddCorrespondence = (data) => {
    const newCorrespondence = {
      id: correspondences.length + 1,
      type: correspondenceType,
      serialNumber: generateSerialNumber(correspondenceType),
      ...data,
      status: correspondenceType === 'inward' ? 'Pending' : 'Sent'
    };
    setCorrespondences([...correspondences, newCorrespondence]);
    setShowAddModal(false);
    setFormData({});
  };

  const generateSerialNumber = (type) => {
    const prefix = type === 'inward' ? 'IN' : 'OUT';
    const count = correspondences.filter(c => c.type === type).length + 1;
    return `${prefix}/2025/${count.toString().padStart(3, '0')}`;
  };

  const filteredCorrespondences = correspondences.filter(corr => {
    const matchesSearch = corr.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corr.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (corr.fromWhom && corr.fromWhom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (corr.toWhom && corr.toWhom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDivision = !selectedDivision || corr.division === selectedDivision;
    return matchesSearch && matchesDivision;
  });

  const stats = {
    total: correspondences.length,
    inward: correspondences.filter(c => c.type === 'inward').length,
    outward: correspondences.filter(c => c.type === 'outward').length,
    pending: correspondences.filter(c => c.status === 'Pending').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Correspondence Management System</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Correspondence
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['dashboard', 'inward', 'outward', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Correspondence</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Download className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Inward</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inward}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Upload className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Outward</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.outward}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Correspondence */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Correspondence</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {correspondences.map((corr) => (
                      <tr key={corr.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{corr.serialNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            corr.type === 'inward' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {corr.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{corr.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{corr.division}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {corr.type === 'inward' ? corr.dateReceived : corr.dateOfDispatch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            corr.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {corr.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            {corr.hasAttachment && (
                              <button className="text-purple-600 hover:text-purple-900">
                                <Paperclip className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inward/Outward List */}
        {(activeTab === 'inward' || activeTab === 'outward') && (
          <div>
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search correspondence..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Divisions</option>
                    {divisions.map((division) => (
                      <option key={division} value={division}>{division}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {activeTab === 'inward' ? 'Sender Ref.' : 'Reference'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {activeTab === 'inward' ? 'From' : 'To'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCorrespondences
                      .filter(corr => corr.type === activeTab)
                      .map((corr) => (
                      <tr key={corr.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {corr.serialNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activeTab === 'inward' ? corr.senderReference : corr.reference}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activeTab === 'inward' ? corr.fromWhom : corr.toWhom}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{corr.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{corr.division}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activeTab === 'inward' ? corr.dateReceived : corr.dateOfDispatch}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            {corr.hasAttachment && (
                              <button className="text-purple-600 hover:text-purple-900">
                                <Paperclip className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Reports & Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                <h4 className="font-medium text-gray-900">Monthly Summary Report</h4>
                <p className="text-sm text-gray-500 mt-2">Generate monthly correspondence summary by division</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                <h4 className="font-medium text-gray-900">Pending Correspondence</h4>
                <p className="text-sm text-gray-500 mt-2">List of all pending inward correspondence</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer">
                <h4 className="font-medium text-gray-900">Division Activity Report</h4>
                <p className="text-sm text-gray-500 mt-2">Correspondence activity by division</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Correspondence</h3>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={correspondenceType}
                  onChange={(e) => setCorrespondenceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="inward">Inward</option>
                  <option value="outward">Outward</option>
                </select>
              </div>

              <CorrespondenceForm
                type={correspondenceType}
                divisions={divisions}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddCorrespondence}
                onCancel={() => {
                  setShowAddModal(false);
                  setFormData({});
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CorrespondenceForm = ({ type, divisions, formData, setFormData, onSubmit, onCancel }) => {
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      {type === 'inward' ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender's Reference</label>
            <input
              type="text"
              value={formData.senderReference || ''}
              onChange={(e) => updateFormData('senderReference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Letter</label>
              <input
                type="date"
                value={formData.dateOfLetter || ''}
                onChange={(e) => updateFormData('dateOfLetter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Received</label>
              <input
                type="date"
                value={formData.dateReceived || ''}
                onChange={(e) => updateFormData('dateReceived', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Whom</label>
            <input
              type="text"
              value={formData.fromWhom || ''}
              onChange={(e) => updateFormData('fromWhom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filed Under (Division)</label>
            <select
              value={formData.filedUnder || ''}
              onChange={(e) => {
                updateFormData('filedUnder', e.target.value);
                updateFormData('division', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input
              type="text"
              value={formData.reference || ''}
              onChange={(e) => updateFormData('reference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Letter</label>
              <input
                type="date"
                value={formData.dateOfLetter || ''}
                onChange={(e) => updateFormData('dateOfLetter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Dispatch</label>
              <input
                type="date"
                value={formData.dateOfDispatch || ''}
                onChange={(e) => updateFormData('dateOfDispatch', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Whom</label>
            <input
              type="text"
              value={formData.toWhom || ''}
              onChange={(e) => updateFormData('toWhom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
            <select
              value={formData.division || ''}
              onChange={(e) => updateFormData('division', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          type="text"
          value={formData.subject || ''}
          onChange={(e) => updateFormData('subject', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
        <textarea
          rows="3"
          value={formData.remarks || ''}
          onChange={(e) => updateFormData('remarks', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Scan/Attachment</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">PDF, DOC, or image files</p>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => updateFormData('hasAttachment', e.target.files.length > 0)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Correspondence
        </button>
      </div>
    </div>
  );
};

export default CorrespondenceManagementSystem;