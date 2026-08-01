// Mock data for the health surveillance portal
export interface Village {
  village_id: number;
  village_name: string;
  state: string;
  district: string;
  latitude?: number;
  longitude?: number;
  risk_level: "low" | "moderate" | "high";
  total_cases: number;
}

export interface User {
  user_id: number;
  name: string;
  role: "admin" | "asha_worker" | "ngo" | "clinic";
  email: string;
  village_id?: number;
  created_at: string;
}

export interface HealthReport {
  report_id: number;
  patient_name: string;
  age: number;
  gender: string;
  village_id: number;
  symptoms: string;
  severity: "Mild" | "Moderate" | "Severe";
  date_of_reporting: string;
  water_source: string;
  treatment_given: string;
  asha_worker_id: number;

  // ✅ new fields
  state: string;
  district: string;
  village: string;
}

export interface NgoReport {
  ngo_id: number;
  village_id: number;
  clean_drinking_water: boolean;
  toilet_coverage: number;
  waste_disposal_system: string;
  flooding_waterlogging: boolean;
  awareness_campaigns: boolean;
  typhoid_cases: number;
  fever_cases: number;
  diarrhea_cases: number;
  report_date: string;
}

export interface Alert {
  alert_id: number;
  title: string;
  message: string;
  type: "water_contamination" | "disease_outbreak" | "general";
  severity: "low" | "medium" | "high";
  created_at: string;
  villages_affected: number[];
}

// Mock Villages Data
export const mockVillages: Village[] = [
  {
    village_id: 1,
    village_name: "Kohima",
    state: "Nagaland",
    district: "Kohima",
    latitude: 25.6751,
    longitude: 94.1086,
    risk_level: "high",
    total_cases: 25,
  },
  {
    village_id: 2,
    village_name: "Dimapur",
    state: "Nagaland",
    district: "Dimapur",
    latitude: 25.9044,
    longitude: 93.7267,
    risk_level: "moderate",
    total_cases: 15,
  },
  {
    village_id: 3,
    village_name: "Itanagar",
    state: "Arunachal Pradesh",
    district: "Papum Pare",
    latitude: 27.0844,
    longitude: 93.6053,
    risk_level: "low",
    total_cases: 8,
  },
  {
    village_id: 4,
    village_name: "Guwahati",
    state: "Assam",
    district: "Kamrup",
    latitude: 26.1445,
    longitude: 91.7362,
    risk_level: "high",
    total_cases: 32,
  },
  {
    village_id: 5,
    village_name: "Imphal",
    state: "Manipur",
    district: "Imphal West",
    latitude: 24.817,
    longitude: 93.9368,
    risk_level: "moderate",
    total_cases: 18,
  },
  {
    village_id: 6,
    village_name: "Shillong",
    state: "Meghalaya",
    district: "East Khasi Hills",
    latitude: 25.5788,
    longitude: 91.8933,
    risk_level: "low",
    total_cases: 6,
  },
  {
    village_id: 7,
    village_name: "Aizawl",
    state: "Mizoram",
    district: "Aizawl",
    latitude: 23.7271,
    longitude: 92.7176,
    risk_level: "moderate",
    total_cases: 12,
  },
  {
    village_id: 8,
    village_name: "Gangtok",
    state: "Sikkim",
    district: "East Sikkim",
    latitude: 27.3389,
    longitude: 88.6065,
    risk_level: "low",
    total_cases: 4,
  },
  {
    village_id: 9,
    village_name: "Agartala",
    state: "Tripura",
    district: "West Tripura",
    latitude: 23.8315,
    longitude: 91.2868,
    risk_level: "high",
    total_cases: 28,
  },
];

// Mock Users Data
export const mockUsers: User[] = [
  {
    user_id: 1,
    name: "Dr. Admin Kumar",
    role: "admin",
    email: "admin@mdoner.gov.in",
    created_at: "2024-01-15",
  },
  {
    user_id: 2,
    name: "Priya Sharma",
    role: "asha_worker",
    email: "priya.asha@gmail.com",
    village_id: 1,
    created_at: "2024-02-10",
  },
  {
    user_id: 3,
    name: "Northeast Health NGO",
    role: "ngo",
    email: "contact@nehealthngo.org",
    village_id: 2,
    created_at: "2024-01-20",
  },
  {
    user_id: 4,
    name: "Kohima Medical Center",
    role: "clinic",
    email: "info@kohimamedical.com",
    village_id: 1,
    created_at: "2024-02-05",
  },
];

// Mock Health Reports
export const mockHealthReports: HealthReport[] = [
  {
    report_id: 1,
    patient_name: "Ram Kumar",
    age: 35,
    gender: "Male",
    village_id: 1,
    symptoms: "Diarrhea, Fever, Vomiting",
    severity: "Moderate",
    date_of_reporting: "2024-09-10",
    water_source: "Well Water",
    treatment_given: "ORS, Antibiotics",
    asha_worker_id: 2,
    state: "Nagaland",       
    district: "Kohima",     
    village: "Kohima",       
  },
  {
    report_id: 2,
    patient_name: "Sita Devi",
    age: 28,
    gender: "Female",
    village_id: 1,
    symptoms: "Typhoid symptoms",
    severity: "Severe",
    date_of_reporting: "2024-09-09",
    water_source: "River Water",
    treatment_given: "Hospitalization recommended",
    asha_worker_id: 2,
    state: "Nagaland",      
    district: "Kohima",     
    village: "Kohima",       
  },
];

// Mock NGO Reports
export const mockNgoReports: NgoReport[] = [
  {
    ngo_id: 3,
    village_id: 1,
    clean_drinking_water: false,
    toilet_coverage: 65,
    waste_disposal_system: "basic",
    flooding_waterlogging: true,
    awareness_campaigns: true,
    typhoid_cases: 8,
    fever_cases: 15,
    diarrhea_cases: 12,
    report_date: "2024-09-01",
  },
  {
    ngo_id: 3,
    village_id: 2,
    clean_drinking_water: true,
    toilet_coverage: 80,
    waste_disposal_system: "advanced",
    flooding_waterlogging: false,
    awareness_campaigns: true,
    typhoid_cases: 3,
    fever_cases: 7,
    diarrhea_cases: 5,
    report_date: "2024-09-05",
  },
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    alert_id: 1,
    title: "Water Contamination Alert",
    message:
      "High levels of contamination detected in Kohima water sources. Immediate action required.",
    type: "water_contamination",
    severity: "high",
    created_at: "2024-09-11",
    villages_affected: [1],
  },
  {
    alert_id: 2,
    title: "Disease Outbreak Warning",
    message:
      "Increased cases of typhoid reported in multiple villages. Enhanced surveillance needed.",
    type: "disease_outbreak",
    severity: "medium",
    created_at: "2024-09-10",
    villages_affected: [1, 4, 9],
  },
];

// Helper functions
export const getVillageById = (id: number): Village | undefined => {
  return mockVillages.find((village) => village.village_id === id);
};

export const getUsersByRole = (role: string): User[] => {
  return mockUsers.filter((user) => user.role === role);
};

export const getHealthReportsByVillage = (
  villageId: number,
): HealthReport[] => {
  return mockHealthReports.filter((report) => report.village_id === villageId);
};

export const getNgoReportsByVillage = (villageId: number): NgoReport[] => {
  return mockNgoReports.filter((report) => report.village_id === villageId);
};

export const getAlertsByType = (type: string): Alert[] => {
  return mockAlerts.filter((alert) => alert.type === type);
};

// Risk level calculation based on total cases
export const calculateRiskLevel = (
  totalCases: number,
): "low" | "moderate" | "high" => {
  if (totalCases <= 10) return "low";
  if (totalCases <= 20) return "moderate";
  return "high";
};

// Get risk color for UI
export const getRiskColor = (
  riskLevel: "low" | "moderate" | "high",
): string => {
  switch (riskLevel) {
    case "low":
      return "#22c55e"; // green
    case "moderate":
      return "#eab308"; // yellow
    case "high":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};
