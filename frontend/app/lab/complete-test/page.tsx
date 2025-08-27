// lab/complete-test/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, FileText, User, Search, Filter } from "lucide-react";

const CompleteTest = () => {
  const completedTests = [
    {
      id: "TEST-001",
      patient: "John Doe",
      patientId: "PAT-001",
      testType: "Blood Test",
      completedTime: "14:30",
      technician: "Lab Tech 1",
      status: "Verified",
      results: "Normal",
      doctor: "Dr. Smith"
    },
    {
      id: "TEST-002",
      patient: "Jane Smith",
      patientId: "PAT-002",
      testType: "Urine Analysis",
      completedTime: "15:15",
      technician: "Lab Tech 2",
      status: "Pending Review",
      results: "Abnormal",
      doctor: "Dr. Wilson"
    },
    {
      id: "TEST-003",
      patient: "Mike Johnson",
      patientId: "PAT-003",
      testType: "Cholesterol Panel",
      completedTime: "13:45",
      technician: "Lab Tech 1",
      status: "Released",
      results: "Normal",
      doctor: "Dr. Brown"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified": return "bg-green-100 text-green-800";
      case "Pending Review": return "bg-yellow-100 text-yellow-800";
      case "Released": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getResultsColor = (results: string) => {
    switch (results) {
      case "Normal": return "bg-green-100 text-green-800";
      case "Abnormal": return "bg-red-100 text-red-800";
      case "Critical": return "bg-red-200 text-red-900";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Complete Test</h2>
        <Button>Mark Test Complete</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Tests finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. TAT</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 hrs</div>
            <p className="text-xs text-muted-foreground">Turnaround time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38</div>
            <p className="text-xs text-muted-foreground">Ready for release</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Active today</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search completed tests..." className="pl-8" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {completedTests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{test.patient}</CardTitle>
                  <CardDescription>
                    Test ID: {test.id} | Patient ID: {test.patientId} | Doctor: {test.doctor}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getResultsColor(test.results)}>
                    {test.results}
                  </Badge>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm font-medium">Test Type</div>
                  <div className="text-sm text-muted-foreground">{test.testType}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Completed Time</div>
                  <div className="text-sm text-muted-foreground">{test.completedTime}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Technician</div>
                  <div className="text-sm text-muted-foreground">{test.technician}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-sm text-muted-foreground">{test.status}</div>
                </div>
              </div>
              <div className="mt-4 space-x-2">
                <Button variant="outline" size="sm">View Results</Button>
                <Button variant="outline" size="sm">Print Report</Button>
                <Button variant="outline" size="sm">Notify Doctor</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompleteTest;