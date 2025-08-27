"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Send, FileText } from "lucide-react";

interface ResultEntryModalProps {
  show: boolean;
  onClose: () => void;
  selectedOrder: LabOrder | null;
  selectedTemplates: { [testId: string]: ResultTemplate | null };
  setSelectedTemplate: (testId: string, template: ResultTemplate | null) => void;
  resultData: { [testId: string]: any };
  setResultData: (data: { [testId: string]: any }) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  handleSubmitResults: () => void;
  resultTemplates: ResultTemplate[];
  selectedTests: string[];
}

export const ResultEntryModal: React.FC<ResultEntryModalProps> = ({
  show,
  onClose,
  selectedOrder,
  selectedTemplates,
  setSelectedTemplate,
  resultData,
  setResultData,
  uploadedFiles,
  setUploadedFiles,
  handleSubmitResults,
  resultTemplates,
  selectedTests
}) => {
  if (!show || !selectedOrder) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const updateTestData = (testId: string, fieldId: string, value: string) => {
    setResultData({
      ...resultData,
      [testId]: {
        ...(resultData[testId] || {}),
        [fieldId]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Enter Lab Results</h2>
            <p className="text-gray-600">
              {selectedOrder.patientName} - Order: {selectedOrder.orderId}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {selectedTests.map((testId) => {
              const test = selectedOrder.tests.find((t) => t.id === testId);
              if (!test) return null;
              const selectedTemplate = selectedTemplates[testId] || null;
              const testData = resultData[testId] || {};

              return (
                <div key={testId} className="border p-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">{test.name} Results</h3>
                  {/* Template Selection */}
                  <div className="space-y-2 mb-4">
                    <Label>Select Result Template for {test.name}</Label>
                    <Select
                      value={selectedTemplate?.id || ""}
                      onValueChange={(value) => {
                        const template = resultTemplates.find(t => t.id === value);
                        setSelectedTemplate(testId, template || null);
                        updateTestData(testId, '', ''); // Reset data
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {resultTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Result Fields */}
                  {selectedTemplate && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">{selectedTemplate.headerText}</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedTemplate.fields.map(field => (
                          <div key={field.id} className="space-y-2">
                            <Label>
                              {field.name} {field.required && <span className="text-red-500">*</span>}
                              {field.unit && <span className="text-gray-500"> ({field.unit})</span>}
                            </Label>
                            {field.normalRange && (
                              <p className="text-xs text-gray-500">Normal: {field.normalRange}</p>
                            )}
                            {field.type === "text" && (
                              <Input
                                value={testData[field.id] || ""}
                                onChange={(e) => updateTestData(testId, field.id, e.target.value)}
                                placeholder={field.defaultValue}
                              />
                            )}
                            {field.type === "number" && (
                              <Input
                                type="number"
                                value={testData[field.id] || ""}
                                onChange={(e) => updateTestData(testId, field.id, e.target.value)}
                                placeholder={field.defaultValue}
                              />
                            )}
                            {field.type === "select" && field.options && (
                              <Select
                                value={testData[field.id] || ""}
                                onValueChange={(value) => updateTestData(testId, field.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map(option => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {field.type === "textarea" && (
                              <Textarea
                                value={testData[field.id] || ""}
                                onChange={(e) => updateTestData(testId, field.id, e.target.value)}
                                placeholder={field.defaultValue}
                                rows={3}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload External Results</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload lab reports, images, or documents
                      </span>
                    </Label>
                    <Input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, JPG, PNG, DOC up to 10MB each
                  </p>
                </div>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmitResults}>
            <Send className="mr-2 h-4 w-4" />
            Submit Results
          </Button>
        </div>
      </div>
    </div>
  );
};