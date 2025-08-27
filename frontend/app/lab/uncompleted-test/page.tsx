// lab/uncompleted-test/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Clock, FlaskConical, User, Search, Filter } from "lucide-react";

const UncompletedTest = () => {
  const uncompletedTests = [
    {
      id: "TEST-004",
      patient: "Sarah Wilson",
      patientId: "PAT-004",
      testType: "Liver Function",
      orderTime: "08:30",
      priority: "High",
      technician: "Unassigned",
      status: "Pending",
      estimatedTime: "60 min",
      doctor: "Dr. Garcia"
    },
    {
      id: "TEST-005",
      patient: "Robert Brown",
      patientId: "PAT-005",
      testType: "Kidney Function",
      orderTime: "09:15",
      priority: "Medium",
      technician: "Lab Tech 2",
      status: "In Progress",
      estimatedTime: "45 min",
      doctor: "Dr. Martinez"
    },
    {
      id: "TEST-006",
      patient: "Emily Davis",
      patientId: "PAT-006",
      testType: "Thyroid Panel",
      orderTime: "10:00",
      priority: "Low",
      technician: "Unassigned",
      status: "Waiting",
      estimatedTime: "30 min",
      doctor: "Dr. Lee"
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Waiting": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Uncompleted Tests</h2>
        <Button>Assign Test</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uncompleted</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Tests pending</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Need technician</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search uncompleted tests..." className="pl-8" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {uncompletedTests.map((test) => (
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
                  <Badge className={getPriorityColor(test.priority)}>
                    {test.priority} Priority
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
                  <div className="text-sm font-medium">Order Time</div>
                  <div className="text-sm text-muted-foreground">{test.orderTime}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Technician</div>
                  <div className="text-sm text-muted-foreground">{test.technician}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Estimated Time</div>
                  <div className="text-sm text-muted-foreground">{test.estimatedTime}</div>
                </div>
              </div>
              <div className="mt-4 space-x-2">
                <Button variant="outline" size="sm">Assign to Me</Button>
                <Button variant="outline" size="sm">Start Test</Button>
                <Button variant="outline" size="sm">View Details</Button>
                <Button variant="outline" size="sm">Escalate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UncompletedTest;