"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit, Eye, Copy, Trash2, FileText, Save, X, Download, Settings } from "lucide-react";

const resultTemplates = [
  {
    id: "temp001",
    name: "Complete Blood Count Template",
    category: "Hematology",
    description: "Standard CBC test template with all major parameters",
    isDefault: true,
    isActive: true,
    createdBy: "Dr. Lab Director",
    createdDate: "2024-01-15",
    lastModified: "2024-11-20",
    usageCount: 234,
    version: "2.1",
    headerText: "COMPLETE BLOOD COUNT REPORT",
    footerText: "Results reviewed and approved by laboratory staff.",
    fields: [
      { id: "wbc", name: "White Blood Cells", type: "number", required: true, unit: "×10³/μL", normalRange: "4.0-11.0" },
      { id: "rbc", name: "Red Blood Cells", type: "number", required: true, unit: "×10⁶/μL", normalRange: "4.2-5.4" },
      { id: "hgb", name: "Hemoglobin", type: "number", required: true, unit: "g/dL", normalRange: "12.0-15.5" },
      { id: "hct", name: "Hematocrit", type: "number", required: true, unit: "%", normalRange: "36-46" },
      { id: "plt", name: "Platelets", type: "number", required: true, unit: "×10³/μL", normalRange: "150-450" }
    ]
  },
  {
    id: "temp002",
    name: "Chemistry Panel Template",
    category: "Chemistry",
    description: "Basic metabolic panel for routine chemistry tests",
    isDefault: true,
    isActive: true,
    createdBy: "Dr. Clinical Pathologist",
    createdDate: "2024-01-20",
    lastModified: "2024-10-15",
    usageCount: 189,
    version: "1.8",
    headerText: "CHEMISTRY PANEL REPORT",
    footerText: "Critical values have been called to the ordering physician.",
    fields: [
      { id: "glucose", name: "Glucose", type: "number", required: true, unit: "mg/dL", normalRange: "70-100" },
      { id: "bun", name: "Blood Urea Nitrogen", type: "number", required: true, unit: "mg/dL", normalRange: "7-20" },
      { id: "creatinine", name: "Creatinine", type: "number", required: true, unit: "mg/dL", normalRange: "0.6-1.2" },
      { id: "sodium", name: "Sodium", type: "number", required: true, unit: "mEq/L", normalRange: "136-145" },
      { id: "potassium", name: "Potassium", type: "number", required: true, unit: "mEq/L", normalRange: "3.5-5.1" }
    ]
  },
  {
    id: "temp003",
    name: "Lipid Panel Template",
    category: "Chemistry",
    description: "Comprehensive lipid profile for cardiovascular risk assessment",
    isDefault: false,
    isActive: true,
    createdBy: "Dr. Cardio Lab",
    createdDate: "2024-02-10",
    lastModified: "2024-09-12",
    usageCount: 156,
    version: "1.4",
    headerText: "LIPID PANEL REPORT",
    footerText: "Fasting specimen required. Results may vary with diet and medications.",
    fields: [
      { id: "total_chol", name: "Total Cholesterol", type: "number", required: true, unit: "mg/dL", normalRange: "<200" },
      { id: "hdl", name: "HDL Cholesterol", type: "number", required: true, unit: "mg/dL", normalRange: ">40 (M), >50 (F)" },
      { id: "ldl", name: "LDL Cholesterol", type: "number", required: true, unit: "mg/dL", normalRange: "<100" },
      { id: "triglycerides", name: "Triglycerides", type: "number", required: true, unit: "mg/dL", normalRange: "<150" }
    ]
  },
  {
    id: "temp004",
    name: "Thyroid Function Template",
    category: "Endocrinology",
    description: "Standard thyroid function tests including TSH and free hormones",
    isDefault: false,
    isActive: true,
    createdBy: "Dr. Endocrine Specialist",
    createdDate: "2024-03-05",
    lastModified: "2024-08-20",
    usageCount: 98,
    version: "1.2",
    headerText: "THYROID FUNCTION TEST REPORT",
    footerText: "Clinical correlation recommended. Reference ranges may vary by laboratory method.",
    fields: [
      { id: "tsh", name: "Thyroid Stimulating Hormone", type: "number", required: true, unit: "mIU/L", normalRange: "0.4-4.0" },
      { id: "free_t4", name: "Free Thyroxine (T4)", type: "number", required: true, unit: "ng/dL", normalRange: "0.8-1.8" },
      { id: "free_t3", name: "Free Triiodothyronine (T3)", type: "number", required: false, unit: "pg/mL", normalRange: "2.3-4.2" }
    ]
  },
  {
    id: "temp005",
    name: "Custom Result Template",
    category: "General",
    description: "Generic template for custom laboratory results",
    isDefault: false,
    isActive: false,
    createdBy: "System Admin",
    createdDate: "2024-05-01",
    lastModified: "2024-06-15",
    usageCount: 23,
    version: "1.0",
    headerText: "LABORATORY REPORT",
    footerText: "Please correlate with clinical findings.",
    fields: [
      { id: "test_name", name: "Test Name", type: "text", required: true },
      { id: "result", name: "Result", type: "text", required: true },
      { id: "reference", name: "Reference Range", type: "text", required: false },
      { id: "status", name: "Status", type: "select", required: true, options: ["Normal", "Abnormal", "Critical"] },
      { id: "comments", name: "Comments", type: "textarea", required: false }
    ]
  }
];

export default function TemplateManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [templates, setTemplates] = useState(resultTemplates);

  const categories = [...new Set(templates.map(template => template.category))];

  const handleCreateNew = () => {
    setSelectedTemplate({
      id: '',
      name: '',
      category: '',
      description: '',
      fields: [],
      headerText: '',
      footerText: '',
      isDefault: false,
      isActive: true,
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0,
      version: '1.0'
    });
    setIsEdit(true);
    setShowEditor(true);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setIsEdit(true);
    setShowEditor(true);
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setIsEdit(false);
    setShowEditor(true);
  };

  const handleDuplicate = (template) => {
    const duplicatedTemplate = {
      ...template,
      id: `temp${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdBy: 'Current User',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0,
      version: '1.0'
    };
    setTemplates(prev => [...prev, duplicatedTemplate]);
    alert(`Template duplicated: ${duplicatedTemplate.name}`);
  };

  const handleToggleStatus = (templateId) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isActive: !template.isActive }
        : template
    ));
  };

  const handleDelete = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      alert('Template deleted successfully');
    }
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    
    if (selectedTemplate.id) {
      setTemplates(prev => prev.map(template => 
        template.id === selectedTemplate.id 
          ? { 
              ...selectedTemplate, 
              lastModified: new Date().toISOString().split('T')[0],
              version: (parseFloat(selectedTemplate.version) + 0.1).toFixed(1)
            }
          : template
      ));
    } else {
      const newTemplate = {
        ...selectedTemplate,
        id: `temp${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    
    setShowEditor(false);
    setSelectedTemplate(null);
    alert('Template saved successfully');
  };

  const exportTemplate = (template) => {
    const dataStr = JSON.stringify(template, null, 2);
    alert(`Template exported: ${template.name}`);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || template.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || 
      (statusFilter === "Active" && template.isActive) ||
      (statusFilter === "Inactive" && !template.isActive) ||
      (statusFilter === "Default" && template.isDefault);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    inactive: templates.filter(t => !t.isActive).length,
    default: templates.filter(t => t.isDefault).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0)
  };

  const TemplateEditor = () => {
    if (!showEditor || !selectedTemplate) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">
              {isEdit ? (selectedTemplate.id ? 'Edit Template' : 'Create Template') : 'Preview Template'}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowEditor(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={selectedTemplate.name}
                  onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                  disabled={!isEdit}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={selectedTemplate.category}
                  onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, category: e.target.value} : null)}
                  disabled={!isEdit}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={selectedTemplate.description}
                onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, description: e.target.value} : null)}
                disabled={!isEdit}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Header Text</Label>
                <Input
                  value={selectedTemplate.headerText}
                  onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, headerText: e.target.value} : null)}
                  disabled={!isEdit}
                />
              </div>
              <div>
                <Label>Footer Text</Label>
                <Input
                  value={selectedTemplate.footerText}
                  onChange={(e) => setSelectedTemplate(prev => prev ? {...prev, footerText: e.target.value} : null)}
                  disabled={!isEdit}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDefault"
                  checked={selectedTemplate.isDefault}
                  onCheckedChange={(checked) => setSelectedTemplate(prev => prev ? {...prev, isDefault: !!checked} : null)}
                  disabled={!isEdit}
                />
                <Label htmlFor="isDefault">Default Template</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={selectedTemplate.isActive}
                  onCheckedChange={(checked) => setSelectedTemplate(prev => prev ? {...prev, isActive: !!checked} : null)}
                  disabled={!isEdit}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <div>
              <Label>Fields Configuration</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {selectedTemplate.fields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{field.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                        {field.required && <Badge className="ml-2" variant="outline">Required</Badge>}
                      </div>
                      <div className="text-sm text-gray-600">
                        {field.unit && <span>Unit: {field.unit}</span>}
                        {field.normalRange && <span className="ml-2">Range: {field.normalRange}</span>}
                      </div>
                    </div>
                    {field.options && (
                      <div className="text-xs text-gray-500 mt-1">
                        Options: {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-6 border-t">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              {isEdit ? 'Cancel' : 'Close'}
            </Button>
            {isEdit && (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Management</h1>
          <p className="text-gray-600">Create and manage result templates for laboratory tests</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Template
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Default</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.default}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalUsage}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-4 p-4 border rounded">
        <h2 className="font-semibold">Search & Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search Templates</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name, description, or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Category Filter</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status Filter</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Default">Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredTemplates.length} templates
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.category}</CardDescription>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {template.isDefault && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                      Default
                    </Badge>
                  )}
                  <Badge 
                    className={template.isActive 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-gray-100 text-gray-800 border-gray-200"} 
                    variant="outline"
                  >
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{template.description}</p>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div><strong>Fields:</strong> {template.fields.length}</div>
                  <div><strong>Usage:</strong> {template.usageCount} times</div>
                  <div><strong>Version:</strong> {template.version}</div>
                  <div><strong>Created:</strong> {new Date(template.createdDate).toLocaleDateString()}</div>
                  <div><strong>Modified:</strong> {new Date(template.lastModified).toLocaleDateString()}</div>
                </div>

                <div className="flex justify-between space-x-2">
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" onClick={() => handlePreview(template)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(template)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => exportTemplate(template)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(template.id)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    {!template.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium mb-1">No templates found</p>
              <p className="text-sm">
                Try adjusting your search or filter criteria, or create a new template
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <TemplateEditor />
    </div>
  );
}