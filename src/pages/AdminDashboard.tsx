import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/AuthContext";
import MapComponent from "@/components/MapComponent";
import axios from "@/axiosConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  Users,
  Map,
  BarChart2,
  LineChart as LineChartIcon,
  HeartPulse,
  Skull,
  Hospital,
  Siren,
  Search,
  User,
  Droplets,
  ShieldCheck,
  Activity,
  Eye,
  Wind,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';

// --- TYPE DEFINITIONS ---
interface VillageDashboardType {
  id: number;
  village: number;
  village_name: string;
  district: string;
  state: string;
  total_cases: number;
  total_deaths: number;
  hospitalized_cases: number;
  risk_level: "Very Low" | "Low" | "Moderate" | "High" | "Very High";
  risk_percentage: number;
  latest_rb_alerts: string;
  symptom_distribution: { [key: string]: number };
  severity_distribution: { [key: string]: number };
  monthly_trend: { [key: string]: number };
  last_aggregated_at: string;
  population: number;
  latest_water_assessment_status: string | null;
  latest_water_assessment_date: string | null;
  current_admissions: number;
  critical_cases: number;
  recovered_cases: number;
  completed_campaigns: number;
  ongoing_campaigns: number;
  planned_campaigns: number;
  latitude: number;
  longitude: number;
}

interface AlertType {
  id: number;
  title: string;
  message: string;
  created_at: string;
}

interface AlertSummaryType {
  id: number;
  village: string;
  district: string;
  state: string;
  risk_percentage: number;
  risk_level: "Very Low" | "Low" | "Moderate" | "High" | "Very High";
  summary: string;
  created_at: string;
}

// --- HELPER & CHILD COMPONENTS ---
const getRiskColor = (
  riskLevel: VillageDashboardType["risk_level"] | AlertSummaryType["risk_level"],
) => {
  const colors: { [key: string]: string } = {
    "Very Low": "#22c55e",
    Low: "#84cc16",
    Moderate: "#eab308",
    High: "#f97316",
    "Very High": "#ef4444",
  };
  return colors[riskLevel] || "#6b7280";
};

const getRiskClass = (
  riskLevel: AlertSummaryType["risk_level"],
  type: "bg" | "text" | "border",
) => {
  const classes = {
    "Very High": {
      bg: "hover:bg-red-100",
      text: "text-red-800",
      border: "border-red-500",
    },
    High: {
      bg: "hover:bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-500",
    },
    Moderate: {
      bg: "hover:bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-500",
    },
    Low: {
      bg: "hover:bg-lime-100",
      text: "text-lime-800",
      border: "border-lime-500",
    },
    "Very Low": {
      bg: "hover:bg-green-100",
      text: "text-green-800",
      border: "border-green-500",
    },
  };
  return classes[riskLevel]?.[type] || "";
};

const StatCard = ({
  title, // This will be a translation key
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => {
  const { t } = useTranslation();
  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t(title)}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

const VillageList = ({
  villages,
  onVillageSelect,
  selectedVillageId,
}: {
  villages: VillageDashboardType[];
  onVillageSelect: (id: number) => void;
  selectedVillageId: number | null;
}) => {
  const { t } = useTranslation();
  if (villages.length === 0) {
    return (
      <div className="text-center p-6">
        <Wind className="mx-auto h-8 w-8 text-slate-400" />
        <p className="text-sm text-muted-foreground mt-2">{t("no_villages_found")}</p>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {villages.map((village) => (
        <Button
          key={village.id}
          variant="ghost"
          className={cn(
            "w-full justify-start h-auto py-2",
            selectedVillageId === village.id && "bg-slate-200",
          )}
          onClick={() => onVillageSelect(village.id)}
        >
          <div className="flex flex-col items-start w-full">
            <span className="font-semibold">{village.village_name}</span>
            <span className="text-xs text-muted-foreground">
              {village.total_cases} {t("cases")} | {village.risk_percentage}% {t("risk")}
            </span>
          </div>
        </Button>
      ))}
    </div>
  );
};

const DashboardSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="h-24 bg-slate-200 rounded-lg"></div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="h-24 bg-slate-200 rounded-lg"></div>
            <div className="h-24 bg-slate-200 rounded-lg"></div>
            <div className="h-24 bg-slate-200 rounded-lg"></div>
            <div className="h-24 bg-slate-200 rounded-lg"></div>
            <div className="h-24 bg-slate-200 rounded-lg"></div>
            <div className="h-24 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-96 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="h-64 bg-slate-200 rounded-lg"></div>
          <div className="h-32 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  // --- STATE MANAGEMENT ---
  const [allVillagesData, setAllVillagesData] = useState<
    VillageDashboardType[]
  >([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(
    null,
  );
  const [liveAlerts] = useState<AlertType[]>([
    {
      id: 1,
      title: t("high_fever_outbreak"), // Example of translating hardcoded alert
      message: t("high_fever_outbreak_message"),
      created_at: "2025-09-15T10:00:00Z",
    },
    {
      id: 2,
      title: t("water_contamination"),
      message: t("water_contamination_message"),
      created_at: "2025-09-14T14:30:00Z",
    },
  ]);
  const [alertSummaries, setAlertSummaries] = useState<AlertSummaryType[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<AlertSummaryType | null>(null);
  const [isPredictionDialogOpen, setPredictionDialogOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState("6months");
  const [isVillagesDialogOpen, setVillagesDialogOpen] = useState(false);
  const [watchlistSearchTerm, setWatchlistSearchTerm] = useState("");
  const [activeWatchlistTab, setActiveWatchlistTab] = useState("high");

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const villagesResponse = await axios.get<VillageDashboardType[]>(
          "/dashboard/villages/",
        );
        const sortedVillages = villagesResponse.data.sort(
          (a, b) => b.risk_percentage - a.risk_percentage,
        );
        setAllVillagesData(sortedVillages);
        if (sortedVillages.length > 0) {
          setSelectedVillageId(sortedVillages[0].id);
        }

        const summariesResponse = await axios.get<{ data: AlertSummaryType[] }>(
          "/prediction/summaries/",
        );
        setAlertSummaries(summariesResponse.data.data);
        if (summariesResponse.data.data.length > 0) {
          setSelectedSummary(summariesResponse.data.data[0]);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(t("failed_to_load_dashboard_data"));
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchInitialData();
  }, []);

  const selectedVillageData = useMemo(
    () => allVillagesData.find((v) => v.id === selectedVillageId) || null,
    [selectedVillageId, allVillagesData],
  );
  const highRiskVillages = useMemo(
    () =>
      allVillagesData.filter(
        (v) => v.risk_level === "High" || v.risk_level === "Very High",
      ),
    [allVillagesData],
  );
  const moderateRiskVillages = useMemo(
    () => allVillagesData.filter((v) => v.risk_level === "Moderate"),
    [allVillagesData],
  );
  const lowRiskVillages = useMemo(
    () =>
      allVillagesData.filter(
        (v) => v.risk_level === "Low" || v.risk_level === "Very Low",
      ),
    [allVillagesData],
  );

  const getScopedVillages = (tab: string) => {
    if (tab === "high") return highRiskVillages;
    if (tab === "moderate") return moderateRiskVillages;
    if (tab === "low") return lowRiskVillages;
    return [];
  };

  const filteredWatchlistVillages = useMemo(() => {
    const list = getScopedVillages(activeWatchlistTab);
    return list.filter((v) =>
      v.village_name.toLowerCase().includes(watchlistSearchTerm.toLowerCase()),
    );
  }, [
    activeWatchlistTab,
    watchlistSearchTerm,
    highRiskVillages,
    moderateRiskVillages,
    lowRiskVillages,
  ]);

  const symptomChartData = useMemo(() => {
    if (!selectedVillageData?.symptom_distribution) return [];
    return Object.entries(selectedVillageData.symptom_distribution)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [selectedVillageData]);

  const severityPieData = useMemo(() => {
    if (!selectedVillageData?.severity_distribution) return [];
    const colors = { Mild: "#22c55e", Moderate: "#eab308", Severe: "#ef4444" };
    return Object.entries(selectedVillageData.severity_distribution).map(
      ([name, value]) => ({
        name: t(name.toLowerCase()), // Translate severity names
        value,
        fill: colors[name as keyof typeof colors] || "#6b7280",
      }),
    );
  }, [selectedVillageData, t]);

  const monthlyTrendData = useMemo(() => {
    if (!selectedVillageData?.monthly_trend) return [];
    return Object.entries(selectedVillageData.monthly_trend).map(
      ([month, cases]) => ({
        month: t(month.toLowerCase()), // Translate month names if needed, or map to specific keys
        cases,
      }),
    );
  }, [selectedVillageData, t]);

  // --- RENDER LOGIC ---
  if (loading) return <DashboardSkeleton />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png"
                alt="India Flag"
                className="h-8 w-12 object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {t("admin_dashboard")}
                </h1>
                <p className="text-sm text-slate-600">
                  {t("ministry_of_development_ner")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Siren className="h-4 w-4 mr-2" />
                    {t("live_alerts")}
                    <Badge className="ml-2 bg-red-500 text-white px-1.5 py-0.5 text-xs">
                      {liveAlerts.length}
                    </Badge>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("live_alerts")}</DialogTitle>
                    <DialogDescription>
                      {t("current_active_alerts")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                    {liveAlerts.map((alert) => (
                      <Card key={alert.id}>
                        <CardHeader>
                          <CardTitle className="text-base">
                            {alert.title}
                          </CardTitle>
                          <CardDescription>
                            {new Date(alert.created_at).toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>{alert.message}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isPredictionDialogOpen}
                onOpenChange={setPredictionDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    {t("alert_prediction")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>{t("ai_powered_alert_predictions")}</DialogTitle>
                    <DialogDescription>
                      {t("click_village_for_summary")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-3 gap-4 h-full overflow-hidden pt-4">
                    <div className="col-span-1 flex flex-col border-r pr-4 overflow-y-auto">
                      <div className="text-sm font-semibold mb-2 px-2">
                        {t("all_village_summaries")}
                      </div>
                      <div className="flex-grow space-y-1">
                        {alertSummaries.map((summary) => (
                          <button
                            key={summary.id}
                            onClick={() => setSelectedSummary(summary)}
                            className={cn(
                              "w-full text-left p-2 rounded-md border-l-4 transition-colors",
                              getRiskClass(summary.risk_level, "bg"),
                              getRiskClass(summary.risk_level, "border"),
                              selectedSummary?.id === summary.id
                                ? "bg-slate-200"
                                : "bg-transparent",
                            )}
                          >
                            <div className="font-semibold">
                              {summary.village}
                            </div>
                            <div className="text-xs text-slate-600">
                              {t(summary.risk_level.toLowerCase())} {t("risk")} (
                              {summary.risk_percentage.toFixed(1)}%)
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2 overflow-y-auto">
                      {selectedSummary ? (
                        <div className="space-y-4">
                          <Card
                            style={{
                              borderLeft: `4px solid ${getRiskColor(selectedSummary.risk_level)}`,
                            }}
                          >
                            <CardHeader>
                              <CardTitle className="text-xl">
                                {selectedSummary.village}
                              </CardTitle>
                              <CardDescription>
                                {selectedSummary.district}, {" "}
                                {selectedSummary.state}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Badge
                                style={{
                                  backgroundColor: getRiskColor(
                                    selectedSummary.risk_level,
                                  ),
                                }}
                                className="text-white"
                              >
                                {t(selectedSummary.risk_level.toLowerCase())} {t("risk")} (
                                {selectedSummary.risk_percentage.toFixed(1)}%)
                              </Badge>
                              <p className="text-xs text-slate-500 mt-2">
                                {t("generated_on")}:{" "}
                                {new Date(
                                  selectedSummary.created_at,
                                ).toLocaleString()}
                              </p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader>
                              <CardTitle>{t("actionable_summary")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div dangerouslySetInnerHTML={{ __html: selectedSummary.summary }} />
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-slate-500">
                            {t("select_village_to_see_summary")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                {t("send_alert")}
              </Button>
              <div className="flex items-center space-x-2 border-l pl-2 ml-2">
                <User className="h-5 w-5 text-slate-500" />
                <span className="text-sm text-slate-600 font-medium">
                  {user?.name}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  {t("logout")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* --- MAIN CONTENT (LEFT 3/4) --- */}
          <div className="lg:col-span-3 space-y-6">
            <Card
              style={{
                borderLeft: `4px solid ${selectedVillageData ? getRiskColor(selectedVillageData.risk_level) : "transparent"}`,
              }}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                      {selectedVillageData?.village_name ??
                        t("no_village_selected")}
                    </CardTitle>
                    <CardDescription>
                      {selectedVillageData
                        ? `${selectedVillageData.district}, ${selectedVillageData.state}`
                        : t("select_village_sidebar_details")}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    {selectedVillageData && (
                      <Badge
                        style={{
                          backgroundColor: getRiskColor(
                            selectedVillageData.risk_level,
                          ),
                        }}
                        className="text-white text-sm"
                      >
                        {t(selectedVillageData.risk_level.toLowerCase())} {t("risk")} (
                        {selectedVillageData.risk_percentage}%)
                      </Badge>
                    )}
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1month">{t("last_1_month")}</SelectItem>
                        <SelectItem value="6months">{t("last_6_months")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* KPI Stats */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <StatCard
                title="population"
                value={selectedVillageData?.population.toLocaleString() ?? "--"}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="total_cases"
                value={selectedVillageData?.total_cases ?? "--"}
                icon={<HeartPulse className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="deaths"
                value={selectedVillageData?.total_deaths ?? "--"}
                icon={<Skull className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="hospitalized"
                value={selectedVillageData?.hospitalized_cases ?? "--"}
                icon={<Hospital className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="critical"
                value={selectedVillageData?.critical_cases ?? "--"}
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="recovered"
                value={selectedVillageData?.recovered_cases ?? "--"}
                icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t("interactive_map")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full rounded-md overflow-hidden border">
                      <MapComponent
                        villages={allVillagesData}
                        onVillageSelect={setSelectedVillageId}
                        selectedVillageId={selectedVillageId}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="xl:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t("severity_distribution")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={severityPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {severityPieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t("symptom_distribution")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={symptomChartData} layout="vertical">
                        <defs>
                          <linearGradient
                            id="colorUv"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0.4}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={80}
                          fontSize={12}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="url(#colorUv)"
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              <div className="xl:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{t("monthly_trend")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyTrendData}>
                        <defs>
                          <linearGradient
                            id="colorCases"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#16a34a"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#16a34a"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="cases"
                          stroke="#16a34a"
                          strokeWidth={2}
                          fill="url(#colorCases)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* --- SIDEBAR (RIGHT 1/4) --- */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{t("village_watchlist")}</CardTitle>
                <Dialog
                  open={isVillagesDialogOpen}
                  onOpenChange={setVillagesDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      {t("view_all")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t("all_risk_villages", { riskLevel: t(activeWatchlistTab) })}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-80 overflow-y-auto mt-4 space-y-2">
                      <VillageList
                        villages={getScopedVillages(activeWatchlistTab)}
                        onVillageSelect={(id) => {
                          setSelectedVillageId(id);
                          setVillagesDialogOpen(false);
                        }}
                        selectedVillageId={selectedVillageId}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="high" onValueChange={setActiveWatchlistTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="high">{t("high")}</TabsTrigger>
                    <TabsTrigger value="moderate">{t("moderate")}</TabsTrigger>
                    <TabsTrigger value="low">{t("low")}</TabsTrigger>
                  </TabsList>
                  <div className="relative mt-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder={t("search_in_risk", { riskLevel: t(activeWatchlistTab) })}
                      className="w-full p-2 pl-8 border rounded-md"
                      value={watchlistSearchTerm}
                      onChange={(e) => setWatchlistSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[400px] overflow-y-auto mt-4">
                    <VillageList
                      villages={filteredWatchlistVillages}
                      onVillageSelect={setSelectedVillageId}
                      selectedVillageId={selectedVillageId}
                    />
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {selectedVillageData && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("additional_info")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("water_status")}</span>
                    <Badge
                      variant={
                        selectedVillageData.latest_water_assessment_status ===
                          "Poor"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {selectedVillageData.latest_water_assessment_status
                        ? t(selectedVillageData.latest_water_assessment_status.toLowerCase()) // Translate status
                        : t("n_a")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("last_tested")}</span>
                    <span>
                      {selectedVillageData.latest_water_assessment_date
                        ? new Date(
                          selectedVillageData.latest_water_assessment_date,
                        ).toLocaleDateString()
                        : t("n_a")}
                    </span>
                  </div>
                  <hr />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("completed_campaigns")}
                    </span>
                    <span className="font-bold">
                      {selectedVillageData.completed_campaigns}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("ongoing_campaigns")}
                    </span>
                    <span className="font-bold">
                      {selectedVillageData.ongoing_campaigns}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("planned_campaigns")}
                    </span>
                    <span className="font-bold">
                      {selectedVillageData.planned_campaigns}
                    </span>
                  </div>
                  <hr />
                  <p className="text-muted-foreground pt-2">
                    {t("latest_alert")}{" "}
                    <span className="font-semibold text-slate-800">
                      {selectedVillageData.latest_rb_alerts || t("no_alerts")}
                    </span>
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
