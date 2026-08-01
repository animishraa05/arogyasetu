import LocationSelector from "@/components/LocationSelector.tsx";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TurbidityCard from "@/components/TurbidityCard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthContext";
import {
  mockHealthReports,
  mockVillages,
  HealthReport,
  getVillageById,
} from "@/lib/mockData";
import { toast } from "sonner";
import api from "../axiosConfig"; // ✅ yaha se import karo


const AshaWorkerDashboard = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNewReport, setShowNewReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("weekly");
  const [workerReports, setWorkerReports] = useState<HealthReport[]>([]);

  useEffect(() => {
    const fetchReportPeriod = async () => {
      console.log("API called");
      try {
        const response = await api.get(
          `/data_collection/aasha_worker_reports/`,
          {
            params: {
              asha_worker_id: user?.user_id || "123456",
              reportPeriod: reportPeriod,
            },
          }
        );

        setWorkerReports(response.data.reports);
        console.log("Report period response:", response.data);
      } catch (error) {
        console.error("Error fetching report period:", error);
      }
    };

    fetchReportPeriod();
  }, [reportPeriod, user?.user_id]);

// State
const [statsFilter, setStatsFilter] = useState<"total" | "weekly" | "monthly" | "6months">("weekly");
const [diseaseStats, setDiseaseStats] = useState<{ [key: string]: number }>({});
const [totalDiseaseCount, setTotalDiseaseCount] = useState(0);

// Fetch data when filter or user changes
useEffect(() => {
  const fetchDiseaseStats = async () => {
    try {
      const response = await api.get(
        `/data_collection/disease_stats/`,
        {
          params: {
            asha_worker_id: user?.user_id,
            filter: statsFilter,
          },
        }
      );

      // Backend se expected response:
      // {
      //   "disease_counts": { "Fever": 5, "Diarrhea": 2, ... },
      //   "total_disease_count": 15
      // }

      const data = response.data;

      setDiseaseStats(data.disease_counts || {}); // fallback empty object
      setTotalDiseaseCount(data.total_disease_count || 0); // fallback 0

      console.log("Disease Counts:", data.disease_counts);
      console.log("Total Disease Count:", data.total_disease_count);
    } catch (error) {
      console.error("❌ Error fetching disease stats:", error);
      setDiseaseStats({});
      setTotalDiseaseCount(0);
    }
  };

  if (user?.user_id) fetchDiseaseStats();
}, [statsFilter, user?.user_id]);



  const [newReport, setNewReport] = useState({
    patient_name: "",
    age: "",
    gender: "",
    symptoms: "",
    severity: "",
    water_source: "",
    treatment_given: "",
    state: "",
    district: "",
    village: "",
  });
  
  // Calculate statistics dynamically from fetched data
const totalWaterContaminationCases = workerReports.filter(
  (report) =>
    report.water_source.toLowerCase().includes("well") ||
    report.water_source.toLowerCase().includes("river"),
).length;

const diseaseWiseCases = workerReports.reduce((acc, report) => {
  const symptoms = report.symptoms.split(", ");
  symptoms.forEach((symptom) => {
    acc[symptom] = (acc[symptom] || 0) + 1;
  });
  return acc;
}, {} as { [key: string]: number });

const villagesCovered = new Set(workerReports.map((report) => report.village_id)).size;

const handleSubmitReport = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newReport.patient_name || !newReport.symptoms || !newReport.severity) {
    toast.error("Please fill in all required fields");
    return;
  }

  // Create new health report object
  const report: HealthReport = {
    report_id: mockHealthReports.length + 1,
    patient_name: newReport.patient_name,
    age: parseInt(newReport.age) || 0,
    gender: newReport.gender,
    village_id: user?.village_id || 1,
    symptoms: newReport.symptoms,
    severity: newReport.severity as "Mild" | "Moderate" | "Severe",
    date_of_reporting: new Date().toISOString().split("T")[0],
    water_source: newReport.water_source,
    treatment_given: newReport.treatment_given,
    asha_worker_id: user?.user_id || 0,
    state: newReport.state,
    district: newReport.district,
    village: newReport.village,
  };

  try {
    const response = await api.post(
      `/data_collection/health-reports/`,
      report
    );

    console.log("✅ Report submitted successfully:", response.data);
    toast.success("Health report submitted successfully!");
    setShowNewReport(false);

    // Reset form
    setNewReport({
      patient_name: "",
      age: "",
      gender: "",
      symptoms: "",
      severity: "",
      water_source: "",
      treatment_given: "",
      state: "",
      district: "",
      village: "",
    });
  } catch (error) {
    console.error("❌ Error submitting report:", error);
    toast.error("Failed to submit health report");
  }

  console.log(report);
};

  const handleSendAlert = (type: "water" | "disease") => {
    toast.success(
      `${type === "water" ? "Water contamination" : "Disease outbreak"} alert sent to Ministry!`,
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                ASHA Worker Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowProfile(true)}
                className="text-sm"
              >
                👤 Profile
              </Button>
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Alert Marquee */}
      <div className="bg-red-600 text-white py-2 overflow-hidden">
        <div className="animate-pulse">
          <marquee className="text-sm">
            🚨 ALERT: High contamination levels detected in multiple water sources. Immediate action required.
            Disease cases increasing in Kohima and Guwahati regions. Enhanced surveillance recommended.
          </marquee>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Survey Reporting */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Survey Report</CardTitle>
                <CardDescription>
                  View and manage your health reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-6">
                  <Button
                    variant={reportPeriod === "weekly" ? "default" : "outline"}
                    onClick={() => setReportPeriod("weekly")}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={reportPeriod === "monthly" ? "default" : "outline"}
                    onClick={() => setReportPeriod("monthly")}
                  >
                    Monthly
                  </Button>

                  <Dialog open={showNewReport} onOpenChange={setShowNewReport}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Submit New Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Submit New Health Report</DialogTitle>
                        <DialogDescription>
                          Record a new patient case for health surveillance
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleSubmitReport} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="patient_name">Patient Name *</Label>
                            <Input
                              id="patient_name"
                              value={newReport.patient_name}
                              onChange={(e) =>
                                setNewReport({
                                  ...newReport,
                                  patient_name: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              min="0"
                              max="120"
                              value={newReport.age}
                              onChange={(e) =>
                                setNewReport({
                                  ...newReport,
                                  age: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <LocationSelector
                           state={newReport.state}
                           district={newReport.district}
                           village={newReport.village}
                           className="mb-4"
                           onChange={(field, value) =>
                        setNewReport((prev) => ({
                               ...prev,
                              [field]: value,
                             }))
                            }
                          />
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={newReport.gender}
                            onValueChange={(value) =>
                              setNewReport({ ...newReport, gender: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                        <Label htmlFor="symptoms">Symptoms *</Label>
                        <select
                         id="symptoms"
                         value={newReport.symptoms}
                         onChange={(e) =>
                        setNewReport({
                        ...newReport,
                          symptoms: e.target.value,
                           })
                          }
    required
    className="w-full border rounded-md p-2"
  >
    <option value="">Select a symptom</option>
    <option value="Fever">Fever</option>
    <option value="Diarrhea">Diarrhea</option>
    <option value="Vomiting">Vomiting</option>
    <option value="Headache">Headache</option>
    <option value="Stomach Pain">Stomach Pain</option>
    <option value="Cough">Cough</option>
    <option value="Cold">Cold</option>
    <option value="Fatigue">Fatigue</option>
    <option value="Nausea">Nausea</option>
    <option value="Skin Rash">Skin Rash</option>
    <option value="Other">Other</option>
  </select>

  {newReport.symptoms === "Other" && (
    <Textarea
      id="other-symptom"
      placeholder="Enter other symptom"
      value={newReport.symptoms === "Other" ? "" : newReport.symptoms}
      onChange={(e) =>
        setNewReport({
          ...newReport,
          symptoms: e.target.value,
        })
      }
      className="mt-2"
    />
  )}
</div>

                        <div>
                          <Label htmlFor="severity">Severity *</Label>
                          <Select
                            value={newReport.severity}
                            onValueChange={(value) =>
                              setNewReport({ ...newReport, severity: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mild">Mild</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Severe">Severe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="water_source">Water Source</Label>
                        <Select
                        value={newReport.water_source}
                        onValueChange={(value) =>
                        setNewReport({
                          ...newReport,
                         water_source: value,
                              })
                           }
                            >
                        <SelectTrigger>
                        <SelectValue placeholder="Select water source" />
                        </SelectTrigger>
    <SelectContent>
      <SelectItem value="Well Water">Well Water</SelectItem>
      <SelectItem value="Borewell Water">Borewell Water</SelectItem>
      <SelectItem value="Municipal Water">Municipal Water</SelectItem>
      <SelectItem value="Lake">Lake</SelectItem>
      <SelectItem value="River">River</SelectItem>
      <SelectItem value="Other">Other</SelectItem>
    </SelectContent>
  </Select>
</div>


                        <div>
                          <Label htmlFor="treatment_given">
                            Treatment Given
                          </Label>
                          <Textarea
                            id="treatment_given"
                            placeholder="Describe treatment provided or recommended"
                            value={newReport.treatment_given}
                            onChange={(e) =>
                              setNewReport({
                                ...newReport,
                                treatment_given: e.target.value,
                              })
                            }
                          />
                        </div>

                        <Button type="submit" className="w-full">
                          Submit Report
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Reports Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Symptoms</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Water Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workerReports.map((report) => (
                        <TableRow key={report.report_id}>
                          <TableCell>{report.date_of_reporting}</TableCell>
                          <TableCell className="font-medium">
                            {report.patient_name}
                          </TableCell>
                          <TableCell>{report.age}</TableCell>
                          <TableCell>{report.symptoms}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${report.severity === "Severe"
                                ? "bg-red-100 text-red-800"
                                : report.severity === "Moderate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                                }`}
                            >
                              {report.severity}
                            </span>
                          </TableCell>
                          <TableCell>{report.water_source}</TableCell>
                        </TableRow>
                      ))}
                      {workerReports.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-gray-500"
                          >
                            No reports found. Submit your first report above.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Statistics & Alerts */}
          <div className="space-y-6">
            {/* Statistics */}
            <TurbidityCard />
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
  {/* Total Water Contamination Cases */}
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">Total Water Contamination Cases</span>
    <span className="text-2xl font-bold text-blue-600">{totalDiseaseCount}</span>
  </div>

  {/* Disease-wise Case Count */}
  <div className="flex justify-between items-center">
    <h4 className="text-sm font-medium text-gray-700 mb-2">Disease-wise Case Count</h4>
    <select
      value={statsFilter}
      onChange={(e) => setStatsFilter(e.target.value as typeof statsFilter)}
      className="border rounded-md p-1 text-sm"
    >
      <option value="total">Total</option>
      <option value="weekly">This Week</option>
      <option value="monthly">This Month</option>
      <option value="6months">6 Months</option>
    </select>
  </div>

  {/* List disease stats */}
  <div className="space-y-2">
  {Object.entries(diseaseStats)
    .filter(([_, count]) => count > 0) // ✅ Only show if count > 0
    .map(([disease, count]) => (
      <div key={disease} className="flex justify-between">
        <span className="text-sm text-gray-600">{disease}</span>
        <span className="font-medium">{count}</span>
      </div>
    ))}

  {/* If no symptoms have count > 0 */}
  {Object.values(diseaseStats).every((count) => count === 0) && (
    <p className="text-sm text-gray-500">No cases reported yet</p>
  )}
  </div>

</CardContent>
            </Card>

            {/* Alert Section */}
            <Card>
              <CardHeader>
                <CardTitle>Send Alerts</CardTitle>
                <CardDescription>
                  Report critical issues to Ministry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleSendAlert("water")}
                >
                  🚰 Send Water Contamination Alert
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleSendAlert("disease")}
                >
                  🦠 Send Disease Outbreak Alert
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Reports:</span>
                  <span className="font-bold">{workerReports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Week:</span>
                  <span className="font-bold text-blue-600">
                    {
                      workerReports.filter((r) => {
                        const reportDate = new Date(r.date_of_reporting);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return reportDate >= weekAgo;
                      }).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Severe Cases:</span>
                  <span className="font-bold text-red-600">
                    {
                      workerReports.filter((r) => r.severity === "Severe")
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Working Since:</span>
                  <span className="text-sm text-gray-600">
                    {user?.created_at}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ASHA Worker Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <p className="text-lg font-medium">{user?.name}</p>
            </div>
            <div>
              <Label>Village</Label>
              <p>
                {getVillageById(user?.village_id || 0)?.village_name ||
                  "Not specified"}
              </p>
            </div>
            <div>
              <Label>Email</Label>
              <p>{user?.email}</p>
            </div>
            <div>
              <Label>Duration of Working</Label>
              <p>1 year 8 months</p>
            </div>
            <div>
              <Label>Registration Date</Label>
              <p>{user?.created_at}</p>
            </div>
            <div>
              <Label>Total Reports Submitted</Label>
              <p className="text-lg font-bold text-blue-600">
                {workerReports.length}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AshaWorkerDashboard;
