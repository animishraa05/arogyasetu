import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationSelector from "@/components/LocationSelector.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "../axiosConfig";
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
import { useAuth } from "@/components/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShieldCheck,
  HandHeart,
  Hospital,
  ArrowRight,
  DatabaseZap,
  GitBranch,
  Siren,
  BrainCircuit,
  Megaphone,
  Facebook,
  Twitter,
  Linkedin,
  Mountain,
  Coffee,
  Swords,
  CloudRain,
  Feather,
  Snowflake,
  Building,
  SquareStack,
  Globe,
} from "lucide-react";
import ProcessTimeline from "@/components/ProcessTimeline";
import StateCards from "@/components/StateCards";
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Main Landing Component
const Landing = () => {
  const { t, i18n } = useTranslation(); // Initialize useTranslation
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    village: "",
  });

  const { setAuthUser } = useAuth();

  // --- Handlers for Login/Register ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error(t("please_fill_email_password")); // Use t() for translation
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/users/login/", {
        email: loginForm.email,
        password: loginForm.password,
      });
      const { access, refresh, user } = response.data;
      if (access) localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);
      if (user) setAuthUser(user);
      toast.success(t("login_successful")); // Use t() for translation
      setIsLoginOpen(false);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      toast.error(
        (error as any)?.response?.data?.detail ||
        t("login_failed"), // Use t() for translation
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error(t("passwords_do_not_match")); // Use t() for translation
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/users/register/", {
        name: registerForm.name,
        role: selectedRole,
        state: registerForm.state,
        district: registerForm.district,
        village: registerForm.village || "",
        email: registerForm.email,
        password: registerForm.password,
        password2: registerForm.confirmPassword,
      });
      const { access, refresh, user } = response.data;
      if (access) localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);
      if (user) setAuthUser(user);
      toast.success(t("registration_successful")); // Use t() for translation
      setIsRegisterOpen(false);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      toast.error(
        (error as any)?.response?.data?.email?.[0] ||
        t("registration_failed"), // Use t() for translation
      );
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = (role: string) => {
    setSelectedRole(role);
    setIsRegisterOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 text-gray-800">
      <AppHeader onLoginClick={() => setIsLoginOpen(true)} />

      <main>
        <HeroSection
          onRegisterClick={() => openRegisterModal("asha_worker")} // Default role or could be generic
          onLoginClick={() => setIsLoginOpen(true)}
        />
        <WhoWeServeSection onRegisterClick={openRegisterModal} />
        <HowItWorksSection />
      </main>

      <AppFooter />

      {/* --- Dialogs for Login/Register --- */}
      <LoginDialog
        isOpen={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onSubmit={handleLogin}
        loading={loading}
        form={loginForm}
        setForm={setLoginForm}
      />
      <RegisterDialog
        isOpen={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        onSubmit={handleRegister}
        loading={loading}
        form={registerForm}
        setForm={setRegisterForm}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />
    </div>
  );
};

// --- Sub-components for Cleaner Structure ---

const AppHeader = ({ onLoginClick }: { onLoginClick: () => void; }) => {
  const { t, i18n } = useTranslation(); // Initialize useTranslation
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png"
              alt="India Flag"
              className="h-8 w-12 object-cover rounded"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {t("ministry_of_development")}
              </h1>
              <p className="text-sm text-blue-600 font-semibold">
                {t("north_eastern_region")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              {t("home")}
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              {t("about")}
            </a>
            <Button
              onClick={onLoginClick}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            >
              {t("login")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Globe className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => i18n.changeLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage('hi')}>
                  हिंदी
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage('kha')}>
                  Khasi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => i18n.changeLanguage('brx')}>
                  Bodo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

const HeroSection = ({
  onRegisterClick,
  onLoginClick,
}: {
  onRegisterClick: () => void;
  onLoginClick: () => void;
}) => {
  const { t } = useTranslation(); // Initialize useTranslation
  return (
    <div className="relative py-24 sm:py-32 px-4 overflow-hidden flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50 animate-gradient-xy">
      <style>
        {`
          @keyframes gradient-xy {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-xy {
            background-size: 400% 400%;
            animation: gradient-xy 15s ease infinite;
          }
        `}
      </style>
      <div className="relative z-10 bg-white/70 backdrop-blur-sm p-8 rounded-lg max-w-4xl mx-auto shadow-xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="block text-gray-800">{t("guarding_health")}</span>
          <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {t("of_seven_sisters")}
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
          {t("unified_platform_description")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            onClick={onRegisterClick}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform"
          >
            {t("register_now")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onLoginClick}
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform"
          >
            {t("member_login")}
          </Button>
        </div>
      </div>
      <div className="mt-12 w-full">
        <StateCards />
      </div>
    </div>
  );
};

const WhoWeServeSection = ({
  onRegisterClick,
}: {
  onRegisterClick: (role: string) => void;
}) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const roles = [
    {
      icon: <HandHeart className="w-10 h-10 text-green-600" />,
      role: "asha_worker",
      title: t("asha_workers"), // Use t() for translation
      description: t("asha_description"), // Use t() for translation
      backgroundClass: "bg-gradient-to-br from-green-50 to-green-100",
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-blue-600" />,
      role: "ngo",
      title: t("ngos"), // Use t() for translation
      description: t("ngo_description"), // Use t() for translation
      backgroundClass: "bg-gradient-to-br from-blue-50 to-blue-100",
    },
    {
      icon: <Hospital className="w-10 h-10 text-red-600" />,
      role: "clinic",
      title: t("clinics"), // Use t() for translation
      description: t("clinic_description"), // Use t() for translation
      backgroundClass: "bg-gradient-to-br from-red-50 to-red-100",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{t("who_we_serve")}</h2>
          <p className="text-lg text-gray-600 mt-2">
            {t("dedicated_platform_description")}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((roleInfo) => (
            <Card
              key={roleInfo.role}
              className={`text-center shadow-lg hover:shadow-xl transition-shadow duration-300 ${roleInfo.backgroundClass}`}
            >
              <CardHeader className="items-center">
                <div className="p-4 bg-white rounded-full shadow-sm">
                  {roleInfo.icon}
                </div>
                <CardTitle className="mt-4 text-2xl">
                  {roleInfo.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">{roleInfo.description}</p>
                <Button
                  onClick={() => onRegisterClick(roleInfo.role)}
                  className="w-full"
                >
                  {t("register_as")} {roleInfo.title}{" "}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const steps = [
    {
      icon: <DatabaseZap className="w-8 h-8 text-blue-500" />,
      title: t("data_collection"), // Use t() for translation
      description: t("data_collection_description"), // Use t() for translation
    },
    {
      icon: <GitBranch className="w-8 h-8 text-orange-500" />,
      title: t("rule_based_filtering"), // Use t() for translation
      description: t("rule_based_filtering_description"), // Use t() for translation
    },
    {
      icon: <Siren className="w-8 h-8 text-yellow-500" />,
      title: t("early_warnings"), // Use t() for translation
      description: t("early_warnings_description"), // Use t() for translation
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-purple-500" />,
      title: t("llm_powered_prediction"), // Use t() for translation
      description: t("llm_powered_prediction_description"), // Use t() for translation
    },
    {
      icon: <Megaphone className="w-8 h-8 text-red-500" />,
      title: t("high_level_alerts"), // Use t() for translation
      description: t("high_level_alerts_description"), // Use t() for translation
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">{t("how_it_works")}</h2>
          <p className="text-lg text-gray-600 mt-2">
            {t("process_description")}
          </p>
        </div>
        <ProcessTimeline steps={steps} />
      </div>
    </section>
  );
};

const AppFooter = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const statesData = [
    {
      nameKey: "arunachal_pradesh",
      icon: <Mountain className="w-5 h-5" />,
      url: "https://arunachalhealth.com/",
    },
    {
      nameKey: "assam",
      icon: <Coffee className="w-5 h-5" />,
      url: "https://health.assam.gov.in/",
    },
    {
      nameKey: "manipur",
      icon: <Swords className="w-5 h-5" />,
      url: "https://mn.gov.in/",
    },
    {
      nameKey: "meghalaya",
      icon: <CloudRain className="w-5 h-5" />,
      url: "https://meghealth.gov.in/",
    },
    {
      nameKey: "mizoram",
      icon: <SquareStack className="w-5 h-5" />,
      url: "https://health.mizoram.gov.in/",
    },
    {
      nameKey: "nagaland",
      icon: <Feather className="w-5 h-5" />,
      url: "https://health.nagaland.gov.in/",
    },
    {
      nameKey: "sikkim",
      icon: <Snowflake className="w-5 h-5" />,
      url: "http://health.sikkim.gov.in/",
    },
    {
      nameKey: "tripura",
      icon: <Building className="w-5 h-5" />,
      url: "https://health.tripura.gov.in/",
    },
  ];

  return (
    <footer className="bg-blue-950 text-gray-300 py-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Column 1: Ministry Details */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-1">
              {t("ministry_of_development")}
            </h3>
            <p className="text-blue-400 font-semibold text-sm mb-2">
              {t("north_eastern_region")}
            </p>
            <p className="text-gray-400 text-xs">{t("government_of_india")}</p>
            <p className="text-gray-400 text-xs mt-1">
              © 2025 {t("all_rights_reserved")}
            </p>
          </div>

          {/* Column 2: State Portals */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold text-white mb-3">
              {t("state_health_portals")}
            </h4>
            <div className="grid grid-cols-2 gap-y-1 gap-x-2 justify-items-center md:justify-items-end">
              {statesData.map((state) => (
                <a
                  key={state.nameKey} // Use nameKey as key
                  href={state.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-gray-300 hover:text-blue-400 transition-colors group text-xs"
                >
                  {state.icon}
                  <span className="group-hover:underline">{t(state.nameKey)}</span> {/* Translate state name */}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Dialog Components ---

interface LoginFormState {
  email: string;
  password: string;
}
interface LoginDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  form: LoginFormState;
  setForm: React.Dispatch<React.SetStateAction<LoginFormState>>;
}
const LoginDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  loading,
  form,
  setForm,
}: LoginDialogProps) => {
  const { t } = useTranslation(); // Initialize useTranslation
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("login_to_health_portal")}</DialogTitle>
          <DialogDescription>
            {t("login_description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="loginEmail">{t("email")}</Label>
            <Input
              id="loginEmail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@mdoner.gov.in"
              required
            />
          </div>
          <div>
            <Label htmlFor="loginPassword">{t("password")}</Label>
            <Input
              id="loginPassword"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("logging_in") : t("login")}
          </Button>
          <div className="text-xs text-gray-500 text-center pt-2">
            <p>
              <strong>Admin:</strong> admin@mdoner.gov.in (pass: admin@123)
            </p>
            <p>
              <strong>ASHA:</strong> ram.asha@gmail.com (pass: 12345)
            </p>

            <p>
              <strong>NGO:</strong> contact@nehealthngo.org (contact123)
            </p>
            <p>
              <strong>Clinic:</strong> info@kohimamedical.com (info123)
            </p>

          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  state: string;
  district: string;
  village: string;
}
interface RegisterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  form: RegisterFormState;
  setForm: React.Dispatch<React.SetStateAction<RegisterFormState>>;
  selectedRole: string;
  setSelectedRole: React.Dispatch<React.SetStateAction<string>>;
}
const RegisterDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  loading,
  form,
  setForm,
  selectedRole,
  setSelectedRole,
}: RegisterDialogProps) => {
  const { t } = useTranslation(); // Initialize useTranslation
  const getRoleDisplayName = (role: string) =>
    ({ asha_worker: t("asha_workers"), ngo: t("ngos"), clinic: t("clinics") })[role] ||
    role;
  const getNameLabel = (role: string) =>
    ({ asha_worker: t("full_name"), ngo: t("ngo_name"), clinic: t("clinic_name") })[
    role
    ] || t("name");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("register_as_a")} {getRoleDisplayName(selectedRole)}
          </DialogTitle>
          <DialogDescription>
            {t("register_description")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
        >
          {/* Role selection is now outside, but we can show it for confirmation */}
          <div className="space-y-2">
            <Label>{t("role")}</Label>
            <Input value={getRoleDisplayName(selectedRole)} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{getNameLabel(selectedRole)}</Label>
            <Input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t("location")}</Label>
            <LocationSelector
              state={form.state}
              district={form.district}
              village={form.village}
              className="space-y-3"
              onChange={(field, value) =>
                setForm((prev: RegisterFormState) => ({
                  ...prev,
                  [field]: value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirm_password")}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("registering") : t("create_account")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Landing;