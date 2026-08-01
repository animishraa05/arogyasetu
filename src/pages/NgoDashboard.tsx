import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/components/AuthContext';
import { mockVillages, mockNgoReports, NgoReport, getVillageById } from '@/lib/mockData';
import { toast } from 'sonner';
import LocationSelector from "@/components/LocationSelector.tsx";
import { getCurrentUser, clearAuth } from "../api/authConfig";
import api from "../axiosConfig";

const NgoDashboard = () => {
  const { user, logout } = useAuth();
  const [showAddData, setShowAddData] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [villages, setVillages] = useState<{ village_id: number; village_name: string }[]>([]);
  const [totalVillages, setTotalVillages] = useState(0);
  const [surveyedVillages, setSurveyedVillages] = useState(0);
  const [pendingVillages, setPendingVillages] = useState(0);
  const [reportPeriod, setReportPeriod] = useState<"weekly" | "monthly">("weekly");
  const [surveyedData, setSurveyedData] = useState<any[]>([]);

  const [newReport, setNewReport] = useState({
    village_id: 0,
    clean_drinking_water: false,
    toilet_coverage: "",
    waste_disposal_system: false,
    flooding_waterlogging: false,
    awareness_campaigns: false,
    typhoid_cases: "",
    fever_cases: "",
    diarrhea_cases: "",
  });

  const [stats, setStats] = useState({
    total_villages: 0,
    high_alert_villages: 0,
    total_disease_cases: 0,
    villages_without_clean_water: 0,
  });


  useEffect(() => {
    const fetchSurveyedData = async () => {
      try {
        const res = await api.get("/ngoData/surveyed-villages/");
        // Add a static alert_level for now
        const updated = res.data.map((item: any) => ({
          village_name: item.village,
          clean_drinking_water: item.clean_water,
          toilet_coverage: item.toilet_coverage,
          waste_disposal_system: item.waste_disposal,
          flooding_waterlogging: item.flooding,
          awareness_campaigns: item.awareness,
          typhoid_cases: item.typhoid_cases,
          fever_cases: item.fever_cases,
          diarrhea_cases: item.diarrhea_cases,
          alert_level: "medium", // 🔹 static for now
        }));
        setSurveyedData(updated);
      } catch (err) {
        console.error("Error fetching surveyed villages:", err);
      }
    };

    fetchSurveyedData();
  }, []);


  // ✅ Fetch summary statistics from API
  const fetchStatistics = async () => {
    try {
      const res = await api.get("/ngoData/summary-statistics/");
      setStats(res.data);
    } catch (err: any) {
      toast.error("Failed to fetch summary statistics");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  // ✅ Fetch summary data
  const fetchSummary = async () => {
    try {
      const res = await api.get("/ngoData/ngo-dashboard/summary");
      const data = res.data;
      setTotalVillages(data.total_villages);
      setSurveyedVillages(data.surveyed_count);
      setPendingVillages(data.pending_count);
    } catch (err: any) {
      toast.error("Failed to fetch survey summary");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);




  // ✅ Fetch villages on component mount
  useEffect(() => {
    const fetchVillages = async () => {
      try {
        const res = await api.get("/ngoData/villages/dropdown");
        setVillages(res.data);
      } catch (err: any) {
        toast.error("Failed to fetch villages");
      }
    };
    fetchVillages();
  }, []);




  const getSurveyedVillageData = () => {
    return mockNgoReports.map(report => {
      const village = getVillageById(report.village_id);
      const totalDiseases = report.typhoid_cases + report.fever_cases + report.diarrhea_cases;

      // Determine alert level based on thresholds
      let alertLevel: 'low' | 'medium' | 'high' = 'low';
      if (!report.clean_drinking_water || report.flooding_waterlogging || totalDiseases > 20) {
        alertLevel = 'high';
      } else if (report.toilet_coverage < 70 || totalDiseases > 10) {
        alertLevel = 'medium';
      }

      return {
        ...report,
        village_name: village?.village_name || 'Unknown',
        total_diseases: totalDiseases,
        alert_level: alertLevel
      };
    });
  };

  // ✅ Submit Handler
  // ✅ Handle form submission
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReport.village_id) {
      toast.error("Please select a village");
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      toast.error("User not logged in");
      clearAuth();
      return;
    }

    const payload = {
      ngo_id: user.user_id,
      village_id: newReport.village_id, // send village_id here
      clean_drinking_water: newReport.clean_drinking_water,
      toilet_coverage: parseInt(newReport.toilet_coverage) || 0,
      waste_disposal_system: newReport.waste_disposal_system,
      flooding_waterlogging: newReport.flooding_waterlogging,
      awareness_campaigns: newReport.awareness_campaigns,
      typhoid_cases: parseInt(newReport.typhoid_cases) || 0,
      fever_cases: parseInt(newReport.fever_cases) || 0,
      diarrhea_cases: parseInt(newReport.diarrhea_cases) || 0,
      report_date: new Date().toISOString().split("T")[0],
    };

    try {
      const res = await api.post("/ngoData/ngo-surveys/", payload);
      toast.success("Survey data submitted successfully!");
      console.log("Response:", res.data);

      // reset form
      setNewReport({
        village_id: 0,
        clean_drinking_water: false,
        toilet_coverage: "",
        waste_disposal_system: false,
        flooding_waterlogging: false,
        awareness_campaigns: false,
        typhoid_cases: "",
        fever_cases: "",
        diarrhea_cases: "",
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit data");
    }
  };

  const handleSendAlert = (type: 'water' | 'disease') => {
    toast.success(`${type === 'water' ? 'Water contamination' : 'Disease outbreak'} alert sent to authorities!`);
  };

  const getAlertColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowProfile(true)}
                className="text-left"
              >
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{user?.name}</h1>
                  <p className="text-sm text-gray-600">NGO Dashboard</p>
                </div>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="ghost" onClick={logout}>Logout</Button>
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
          {/* Left Panel - Survey Status and Reports */}
          <div className="lg:col-span-2 space-y-6">
            {/* Survey Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Village Survey Status</CardTitle>
                <CardDescription>
                  Track survey completion across assigned villages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalVillages}</div>
                    <div className="text-sm text-gray-600">Total Villages</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{surveyedVillages}</div>
                    <div className="text-sm text-gray-600">Surveyed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{pendingVillages}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>

                <div className="flex space-x-4 mb-4">
                  <Button
                    variant={reportPeriod === "weekly" ? "default" : "outline"}
                    onClick={() => setReportPeriod("weekly")}
                  >
                    Weekly Report
                  </Button>
                  <Button
                    variant={reportPeriod === "monthly" ? "default" : "outline"}
                    onClick={() => setReportPeriod("monthly")}
                  >
                    Monthly Report
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Surveyed Villages Table */}
            <Card>
              <CardHeader>
                <CardTitle>Surveyed Villages Status</CardTitle>
                <CardDescription>
                  Villages where surveys have been completed with alert levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Village</TableHead>
                        <TableHead>Clean Water</TableHead>
                        <TableHead>Toilet Coverage</TableHead>
                        <TableHead>Waste Disposal</TableHead>
                        <TableHead>Flooding</TableHead>
                        <TableHead>Awareness</TableHead>
                        <TableHead>Typhoid</TableHead>
                        <TableHead>Fever</TableHead>
                        <TableHead>Diarrhea</TableHead>
                        <TableHead>Alert Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {surveyedData.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{data.village_name}</TableCell>
                          <TableCell>
                            <Badge variant={data.clean_drinking_water ? "default" : "destructive"}>
                              {data.clean_drinking_water ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{data.toilet_coverage}%</TableCell>
                          <TableCell className="capitalize">{data.waste_disposal_system}</TableCell>
                          <TableCell>
                            <Badge variant={data.flooding_waterlogging ? "destructive" : "default"}>
                              {data.flooding_waterlogging ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={data.awareness_campaigns ? "default" : "secondary"}>
                              {data.awareness_campaigns ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>{data.typhoid_cases}</TableCell>
                          <TableCell>{data.fever_cases}</TableCell>
                          <TableCell>{data.diarrhea_cases}</TableCell>
                          <TableCell>
                            <Badge className={getAlertColor(data.alert_level)}>
                              {data.alert_level.toUpperCase()}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Panel - Actions */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={showAddData} onOpenChange={setShowAddData}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Add Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Village Survey Data</DialogTitle>
                      <DialogDescription>
                        Fill in the survey information for a village
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitReport} className="space-y-4">
                      {/* ✅ Dynamic Village Dropdown */}
                      <div>
                        <label htmlFor="village">Select Village</label>
                        <select
                          id="village"
                          className="w-full border p-2 rounded"
                          value={newReport.village_id}
                          onChange={(e) =>
                            setNewReport((prev) => ({ ...prev, village_id: parseInt(e.target.value) }))
                          }
                        >
                          <option value={0}>-- Select Village --</option>
                          {villages.map((v) => (
                            <option key={v.village_id} value={v.village_id}>
                              {v.village_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* ✅ Rest of your switches and inputs */}
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="clean_water"
                          checked={newReport.clean_drinking_water}
                          onCheckedChange={(checked) =>
                            setNewReport({ ...newReport, clean_drinking_water: checked })
                          }
                        />
                        <Label htmlFor="clean_water">Clean Drinking Water Available</Label>
                      </div>

                      <div>
                        <Label htmlFor="toilet_coverage">Toilet Coverage (%)</Label>
                        <Input
                          id="toilet_coverage"
                          type="number"
                          min="0"
                          max="100"
                          value={newReport.toilet_coverage}
                          onChange={(e) =>
                            setNewReport({ ...newReport, toilet_coverage: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="waste_disposal"
                          checked={newReport.waste_disposal_system}
                          onCheckedChange={(checked) =>
                            setNewReport({ ...newReport, waste_disposal_system: checked })
                          }
                        />
                        <Label htmlFor="waste_disposal">Waste Disposal System Available</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="flooding"
                          checked={newReport.flooding_waterlogging}
                          onCheckedChange={(checked) =>
                            setNewReport({ ...newReport, flooding_waterlogging: checked })
                          }
                        />
                        <Label htmlFor="flooding">Flooding & Waterlogging Issues</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="awareness"
                          checked={newReport.awareness_campaigns}
                          onCheckedChange={(checked) =>
                            setNewReport({ ...newReport, awareness_campaigns: checked })
                          }
                        />
                        <Label htmlFor="awareness">Awareness Campaigns Conducted</Label>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="typhoid">Typhoid Cases</Label>
                          <Input
                            id="typhoid"
                            type="number"
                            min="0"
                            value={newReport.typhoid_cases}
                            onChange={(e) =>
                              setNewReport({ ...newReport, typhoid_cases: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="fever">Fever Cases</Label>
                          <Input
                            id="fever"
                            type="number"
                            min="0"
                            value={newReport.fever_cases}
                            onChange={(e) =>
                              setNewReport({ ...newReport, fever_cases: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="diarrhea">Diarrhea Cases</Label>
                          <Input
                            id="diarrhea"
                            type="number"
                            min="0"
                            value={newReport.diarrhea_cases}
                            onChange={(e) =>
                              setNewReport({ ...newReport, diarrhea_cases: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        Submit Survey Data
                      </Button>
                    </form>

                  </DialogContent>
                </Dialog>

                <Dialog open={showProfile} onOpenChange={setShowProfile}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>NGO Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>NGO Name</Label>
                        <p className="text-lg font-medium">{user?.name}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p>{user?.email}</p>
                      </div>
                      <div>
                        <Label>Location/Village</Label>
                        <p>{getVillageById(user?.village_id || 0)?.village_name || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label>Duration of Working</Label>
                        <p>2 years 3 months</p>
                      </div>
                      <div>
                        <Label>Registration Date</Label>
                        <p>{user?.created_at}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Alert Section */}
            <Card>
              <CardHeader>
                <CardTitle>Send Alerts</CardTitle>
                <CardDescription>
                  Report critical issues to authorities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleSendAlert('water')}
                >
                  🚰 Water Contamination Alert
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleSendAlert('disease')}
                >
                  🦠 Disease Alert
                </Button>
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Villages Covered:</span>
                  <span className="font-bold">{stats.total_villages}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Alert Villages:</span>
                  <span className="font-bold text-red-600">{stats.high_alert_villages}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Disease Cases:</span>
                  <span className="font-bold">{stats.total_disease_cases}</span>
                </div>
                <div className="flex justify-between">
                  <span>Villages without Clean Water:</span>
                  <span className="font-bold text-orange-600">{stats.villages_without_clean_water}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;
