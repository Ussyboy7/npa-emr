// lab/record-results/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FlaskConical, FileText, Upload, Save } from "lucide-react";

const RecordResults = () => {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Record Lab Results</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Today</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Awaiting entry</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abnormal Results</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Save className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">Ready for release</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Test Results</CardTitle>
          <CardDescription>Enter laboratory test results for patient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="patient-search">Patient</Label>
              <Input id="patient-search" placeholder="Search patient by name or ID..." />
            </div>
            <div>
              <Label htmlFor="test-id">Test ID</Label>
              <Input id="test-id" placeholder="Enter test identifier..." />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="test-type">Test Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">Blood Test</SelectItem>
                  <SelectItem value="urine">Urine Analysis</SelectItem>
                  <SelectItem value="cholesterol">Cholesterol Panel</SelectItem>
                  <SelectItem value="liver">Liver Function</SelectItem>
                  <SelectItem value="kidney">Kidney Function</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sample-date">Sample Date</Label>
              <Input id="sample-date" type="date" />
            </div>
            <div>
              <Label htmlFor="technician">Technician</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech1">Lab Tech 1</SelectItem>
                  <SelectItem value="tech2">Lab Tech 2</SelectItem>
                  <SelectItem value="tech3">Lab Tech 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="results">Test Results</Label>
            <Textarea 
              id="results" 
              placeholder="Enter detailed test results, values, and measurements..."
              rows={6}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="reference-range">Reference Range</Label>
              <Input id="reference-range" placeholder="Normal range for this test..." />
            </div>
            <div>
              <Label htmlFor="status">Result Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="abnormal">Abnormal</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any additional observations or notes..."
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button className="flex-1">Save Results</Button>
            <Button variant="outline" className="flex-1">Save & Verify</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordResults;