"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Edit } from "lucide-react";

interface TemplateEditorModalProps {
  show: boolean;
  onClose: () => void;
  selectedTemplate: ResultTemplate | null;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  show,
  onClose,
  selectedTemplate
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{selectedTemplate ? 'Edit Template' : 'Create Template'}</h2>
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
            <div className="text-center py-8 text-gray-500">
              <Edit className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">Template Editor</p>
              <p className="text-sm">
                Create and customize result templates for different test types
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button>
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
};