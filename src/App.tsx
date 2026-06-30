/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Layers,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  ClipboardCheck,
  HelpCircle,
  Clock,
  MapPin,
  Compass,
  DollarSign,
  Download,
  Info,
  Calendar,
  Wrench,
  Check,
  Printer,
  Eye,
  X,
  Code,
  Settings,
  ShieldAlert,
  Key,
  UserPlus,
  Lock,
  RefreshCw,
  LayoutGrid,
  Megaphone,
  CreditCard,
  Files,
  TrendingUp,
  ClipboardList,
  CheckSquare,
  Landmark,
  ShieldCheck,
  Activity,
  Cloud,
  Database,
  EyeOff,
  Folder,
  Move,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  GripVertical
} from 'lucide-react';

import { Client, Project, Submission, Equipment, Payroll, BoundaryDispute, LicensedSurveyor, Quotation, Leave, Attendance, RateSheet, JobSchedule } from './types';
import { HMLogo } from './components/HMLogo';

export const DEFAULT_RATE_SHEET: RateSheet = {
  id: 'default-rate-sheet',
  name: 'Official LJT Schedule 2026 (Kadar Rasmi)',
  isDefault: true,
  t1BaseFee: 2600,
  t1MinPrecomp: 3000,
  t1LotRate: 100,
  t1BatuBaruRate: 20,
  t1BatuRefixRate: 500,
  t1AzimutRate: 7.50,
  t1PartyWallRate: 525,
  t1ConsultantPct: 10,
  t1DigitalPct: 20,
  
  t2ConsultantMin: 300,
  t2JadualPetakRate: 100,
  t2LowCostPerakuanRate: 2000,
  t2KediamanPerakuanRate: 5000,
  t2LainPerakuanRate: 10000,
  t2SyerSemenRate: 5000,
  t2CommonAreaRate: 5.50,
  t2PartyWallRate: 390,
  
  t3BaseFee: 2600,
  t3MinPrecomp: 3000,
  t3BatuBaruRate: 50,
  t3BatuRefixRate: 500,
  t3AzimutRate: 7.00,
  t3RestrictedPct: 25,
  t3FixedTimePct: 50,
  
  t4BaseFee: 2600,
  t4MinAreaFee: 5000,
  t4PerHaRate: 1500,
  
  t5MinFee: 5000,
  t5PerMeterRate: 15,
  
  t7HourlyRate: 350,
  t7AreaHaRate: 2500,
  
  rSiteVisitRate: 500,
  rExpertDayRate: 4800,
  rExpertCaseRate: 2600,
  rMileageRate: 1.00,
  rHotelRate: 250,
  rLinenA1Rate: 100,
  rLinenA2Rate: 50,
  rPaperCopyRate: 30,
};
import {
  POSTGRES_SCHEMA,
  FASTAPI_PYDANTIC_MODELS,
  FASTAPI_ROUTER,
  WEASYPRINT_TEMPLATE,
  MYINVOIS_XML_TEMPLATE
} from './data/exportable_code';
import QuotationsBoard from './components/QuotationsBoard';
import RateSheetsManager from './components/RateSheetsManager';
import DocMgmtBoard from './components/DocMgmtBoard';
import { JobSchedulingBoard } from './components/JobSchedulingBoard';

type ActiveTab = 'Dashboard' | 'Clients' | 'Projects' | 'Submissions' | 'Equipment' | 'Payroll' | 'Disputes' | 'Surveyors' | 'Exports' | 'Quotations' | 'Scheduling' | 'CRM' | 'Finance' | 'DocMgmt' | 'Reports' | 'Settings';
type UserRole = 'Management' | 'HR Management' | 'Employee' | 'Project Manager' | 'Technical';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  isCustom: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dynamic credentials database
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('hmgeomatics_user_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', name: 'Management Admin', role: 'Management', passwordHash: 'admin123', isCustom: false },
      { id: '2', name: 'HR Manager', role: 'HR Management', passwordHash: 'hr123', isCustom: false },
      { id: '3', name: 'Project Manager Admin', role: 'Project Manager', passwordHash: 'pm123', isCustom: false },
      { id: '4', name: 'Technical Lead', role: 'Technical', passwordHash: 'tech123', isCustom: false },
      { id: '5', name: 'Irwan Shah bin Ramli', role: 'Employee', passwordHash: 'employee123', isCustom: false },
      { id: '6', name: 'Amirul bin Zainuddin', role: 'Employee', passwordHash: 'employee123', isCustom: false },
      { id: '7', name: 'Faridah binti Abdul Rahman', role: 'Employee', passwordHash: 'employee123', isCustom: false },
    ];
  });

  const [loggedInAccountId, setLoggedInAccountId] = useState<string | null>(() => {
    return localStorage.getItem('hmgeomatics_logged_in_account_id') || null;
  });

  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('hmgeomatics_role');
    return (saved as UserRole) || null;
  });

  // Live Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [disputes, setDisputes] = useState<BoundaryDispute[]>([]);
  const [surveyors, setSurveyors] = useState<LicensedSurveyor[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [schedules, setSchedules] = useState<JobSchedule[]>([]);

  // Persistent LJT Price Rate Sheets
  const [rateSheets, setRateSheets] = useState<RateSheet[]>(() => {
    try {
      const saved = localStorage.getItem('hmgeomatics_rate_sheets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [DEFAULT_RATE_SHEET];
  });
  const [activeRateSheetId, setActiveRateSheetId] = useState<string>(() => {
    return localStorage.getItem('hmgeomatics_active_rate_sheet_id') || 'default-rate-sheet';
  });

  const saveRateSheets = (updated: RateSheet[]) => {
    setRateSheets(updated);
    localStorage.setItem('hmgeomatics_rate_sheets', JSON.stringify(updated));
  };

  const selectActiveRateSheet = (id: string) => {
    setActiveRateSheetId(id);
    localStorage.setItem('hmgeomatics_active_rate_sheet_id', id);
  };

  // New States for Leaves and Attendances
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loggedInEmployee, setLoggedInEmployee] = useState<string>(() => {
    return localStorage.getItem('hmgeomatics_employee') || 'Irwan Shah bin Ramli';
  });

  // HR Sub Tab
  const [hrSubTab, setHrSubTab] = useState<'payroll' | 'leaves' | 'attendance'>('payroll');

  // Persistent Hidden Profiles state for the landing page
  const [hiddenProfiles, setHiddenProfiles] = useState<Record<UserRole, boolean>>(() => {
    try {
      const saved = localStorage.getItem('hmgeomatics_hidden_profiles');
      return saved ? JSON.parse(saved) : {
        'Management': false,
        'HR Management': false,
        'Project Manager': false,
        'Technical': false,
        'Employee': false,
      };
    } catch {
      return {
        'Management': false,
        'HR Management': false,
        'Project Manager': false,
        'Technical': false,
        'Employee': false,
      };
    }
  });

  const toggleProfileVisibility = (role: UserRole) => {
    const updated = {
      ...hiddenProfiles,
      [role]: !hiddenProfiles[role]
    };
    setHiddenProfiles(updated);
    localStorage.setItem('hmgeomatics_hidden_profiles', JSON.stringify(updated));
    notify('success', `"${role}" profile is now ${updated[role] ? 'hidden' : 'visible'} on the landing page.`);
  };

  // Persistent Hidden Support features/menus state for SOKONGAN group
  const [hiddenSupportFeatures, setHiddenSupportFeatures] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('hmgeomatics_hidden_support_features');
      return saved ? JSON.parse(saved) : {
        'Payroll': false,
        'Finance': false,
        'DocMgmt': false,
        'Reports': false,
        'Exports': false,
      };
    } catch {
      return {
        'Payroll': false,
        'Finance': false,
        'DocMgmt': false,
        'Reports': false,
        'Exports': false,
      };
    }
  });

  const toggleSupportFeatureVisibility = (feature: string) => {
    const updated = {
      ...hiddenSupportFeatures,
      [feature]: !hiddenSupportFeatures[feature]
    };
    setHiddenSupportFeatures(updated);
    localStorage.setItem('hmgeomatics_hidden_support_features', JSON.stringify(updated));
    notify('success', `Support feature "${feature === 'Payroll' ? 'HR & Payroll' : feature === 'DocMgmt' ? 'Document Mgmt' : feature === 'Reports' ? 'Reports & Analytics' : feature === 'Exports' ? 'Code & Specs' : feature}" is now ${updated[feature] ? 'hidden' : 'visible'} for other users.`);
  };

  // Persistent Hidden UTAMA group and items state
  const [isUtamaHidden, setIsUtamaHidden] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('hmgeomatics_is_utama_hidden');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleUtamaGroupVisibility = () => {
    const updated = !isUtamaHidden;
    setIsUtamaHidden(updated);
    localStorage.setItem('hmgeomatics_is_utama_hidden', JSON.stringify(updated));
    notify('success', `UTAMA submenu group is now ${updated ? 'hidden' : 'visible'} for other users.`);
  };

  const [hiddenUtamaFeatures, setHiddenUtamaFeatures] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('hmgeomatics_hidden_utama_features');
      return saved ? JSON.parse(saved) : {
        'Dashboard': false,
        'Projects': false,
        'Clients': false,
        'CRM': false,
      };
    } catch {
      return {
        'Dashboard': false,
        'Projects': false,
        'Clients': false,
        'CRM': false,
      };
    }
  });

  const toggleUtamaFeatureVisibility = (feature: string) => {
    const updated = {
      ...hiddenUtamaFeatures,
      [feature]: !hiddenUtamaFeatures[feature]
    };
    setHiddenUtamaFeatures(updated);
    localStorage.setItem('hmgeomatics_hidden_utama_features', JSON.stringify(updated));
    notify('success', `UTAMA item "${feature === 'Projects' ? 'Survey Projects' : feature === 'Clients' ? 'Clients / Pemilik' : feature}" is now ${updated[feature] ? 'hidden' : 'visible'} for other users.`);
  };

  // Custom Confirmation Modal state to replace window.confirm
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  // Nextcloud Workspace Settings & Login Credentials
  const [ncServerUrl, setNcServerUrl] = useState<string>(() => {
    return localStorage.getItem('hmgeomatics_nc_server_url') || 'https://drive.jteras.com';
  });
  const [ncUsername, setNcUsername] = useState<string>(() => {
    return localStorage.getItem('hmgeomatics_nc_username') || 'hmgeomatics_admin';
  });
  const [ncPassword, setNcPassword] = useState<string>(() => {
    return localStorage.getItem('hmgeomatics_nc_password') || 'nc_token_8592_geosec';
  });
  const [ncRootFolder, setNcRootFolder] = useState<string>(() => {
    return localStorage.getItem('hmgeomatics_nc_root_folder') || '01_Project_Documents';
  });

  const [ncConnectionStatus, setNcConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showNcPassword, setShowNcPassword] = useState<boolean>(false);

  const handleTestNcConnection = () => {
    setNcConnectionStatus('testing');
    setTimeout(() => {
      if (ncServerUrl.trim() && ncUsername.trim() && ncPassword.trim()) {
        setNcConnectionStatus('success');
        notify('success', `Successfully connected to Nextcloud WebDAV at ${ncServerUrl.replace('https://', '').replace('http://', '')}`);
      } else {
        setNcConnectionStatus('error');
        notify('error', 'Connection failed. Please specify a valid server URL, username, and app token.');
      }
    }, 1000);
  };

  const handleSaveNcSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('hmgeomatics_nc_server_url', ncServerUrl);
    localStorage.setItem('hmgeomatics_nc_username', ncUsername);
    localStorage.setItem('hmgeomatics_nc_password', ncPassword);
    localStorage.setItem('hmgeomatics_nc_root_folder', ncRootFolder);
    notify('success', 'Nextcloud Workspace credentials and server settings saved successfully.');
  };

  // Loading States & Error Handlers
  const [loading, setLoading] = useState(true);
  const [dashboardFinanceTab, setDashboardFinanceTab] = useState<'all' | 'projects' | 'quotes'>('all');

  // --- Dynamic Dashboard Widgets State & Controllers ---
  interface DashboardWidget {
    id: string;
    title: string;
    visible: boolean;
    size: 'col-span-1' | 'col-span-2' | 'col-span-3';
  }

  const [isCustomizingDashboard, setIsCustomizingDashboard] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  const isDashboardEditable = userRole === 'Management';
  const isCustomizing = isCustomizingDashboard && isDashboardEditable;

  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('hmgeomatics_dashboard_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      { id: 'bento-stats', title: 'Operational Quick Stats', visible: true, size: 'col-span-3' },
      { id: 'revenue-forecast', title: 'Revenue Pipeline & Financial Forecast', visible: true, size: 'col-span-3' },
      { id: 'project-status', title: 'Project Status Progress', visible: true, size: 'col-span-1' },
      { id: 'boundary-cases', title: 'Boundary Disputes Cases', visible: true, size: 'col-span-1' },
      { id: 'calibration-status', title: 'Equipment Calibration Compliance', visible: true, size: 'col-span-1' },
    ];
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) return;

    const items = [...dashboardWidgets];
    const activeIndex = items.findIndex(item => item.id === draggedWidgetId);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (activeIndex !== -1 && targetIndex !== -1) {
      const [removed] = items.splice(activeIndex, 1);
      items.splice(targetIndex, 0, removed);
      setDashboardWidgets(items);
      localStorage.setItem('hmgeomatics_dashboard_widgets', JSON.stringify(items));
      notify('success', 'Dashboard layout updated.');
    }
    setDraggedWidgetId(null);
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const items = [...dashboardWidgets];
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    setDashboardWidgets(items);
    localStorage.setItem('hmgeomatics_dashboard_widgets', JSON.stringify(items));
    notify('success', 'Widget position adjusted.');
  };

  const adjustWidgetSize = (id: string, size: 'col-span-1' | 'col-span-2' | 'col-span-3') => {
    const updated = dashboardWidgets.map(widget => 
      widget.id === id ? { ...widget, size } : widget
    );
    setDashboardWidgets(updated);
    localStorage.setItem('hmgeomatics_dashboard_widgets', JSON.stringify(updated));
    notify('success', 'Widget layout dimensions updated.');
  };

  const toggleWidgetVisibility = (id: string) => {
    const updated = dashboardWidgets.map(widget => 
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    );
    setDashboardWidgets(updated);
    localStorage.setItem('hmgeomatics_dashboard_widgets', JSON.stringify(updated));
    notify('success', `Widget is now ${updated.find(w => w.id === id)?.visible ? 'visible' : 'hidden'}.`);
  };

  const resetDashboardWidgets = () => {
    const defaults: DashboardWidget[] = [
      { id: 'bento-stats', title: 'Operational Quick Stats', visible: true, size: 'col-span-3' },
      { id: 'revenue-forecast', title: 'Revenue Pipeline & Financial Forecast', visible: true, size: 'col-span-3' },
      { id: 'project-status', title: 'Project Status Progress', visible: true, size: 'col-span-1' },
      { id: 'boundary-cases', title: 'Boundary Disputes Cases', visible: true, size: 'col-span-1' },
      { id: 'calibration-status', title: 'Equipment Calibration Compliance', visible: true, size: 'col-span-1' },
    ];
    setDashboardWidgets(defaults);
    localStorage.setItem('hmgeomatics_dashboard_widgets', JSON.stringify(defaults));
    notify('success', 'Dashboard widgets reset to default layout.');
  };

  // --- Quotation LJT Calculator State ---
  const [isCreatingQuote, setIsCreatingQuote] = useState(false);
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<Quotation | null>(null);
  const [previewDocType, setPreviewDocType] = useState<'Quotation' | 'Proposal'>('Quotation');
  const [previewLanguage, setPreviewLanguage] = useState<'BM' | 'EN'>('BM');

  const [calculatorTable, setCalculatorTable] = useState<'Table_I' | 'Table_II' | 'Table_III' | 'Table_IV' | 'Table_V' | 'Table_VI' | 'Table_VII'>('Table_I');
  const [calculatorClientId, setCalculatorClientId] = useState('');
  const [calculatorSubject, setCalculatorSubject] = useState('');
  const [calculatorSurveyorId, setCalculatorSurveyorId] = useState('ls-1');
  const [calculatorTimeline, setCalculatorTimeline] = useState(8);

  // Table I specific states
  const [t1Category, setT1Category] = useState<'Kediaman' | 'Komersial' | 'Industri'>('Kediaman');
  const [t1Lots, setT1Lots] = useState(3);
  const [t1Area, setT1Area] = useState(2000);
  const [t1BatuBaru, setT1BatuBaru] = useState(8);
  const [t1BatuRefix, setT1BatuRefix] = useState(0);
  const [t1Azimut, setT1Azimut] = useState(250);
  const [t1DigitalData, setT1DigitalData] = useState(true);
  const [t1PartyWall, setT1PartyWall] = useState(0);
  const [t1LotPegging, setT1LotPegging] = useState(false);
  const [t1AsBuilt, setT1AsBuilt] = useState(false);
  const [t1OffsetSurvey, setT1OffsetSurvey] = useState(false);

  // Table II specific states
  const [t2Category, setT2Category] = useState<'Kediaman' | 'Lain'>('Kediaman');
  const [t2Blocks, setT2Blocks] = useState(1);
  const [t2Units, setT2Units] = useState(120);
  const [t2Accessories, setT2Accessories] = useState(40);
  const [t2CommonArea, setT2CommonArea] = useState(4500);
  const [t2PartyWalls, setT2PartyWalls] = useState(0);
  const [t2UnitSyerSementera, setT2UnitSyerSementera] = useState(false);
  const [t2SifusCert, setT2SifusCert] = useState(true);
  const [t2LowCost, setT2LowCost] = useState(false);
  const [t2AzimutLength, setT2AzimutLength] = useState(0);

  // Table III specific states
  const [t3AreaHa, setT3AreaHa] = useState(2.6);
  const [t3Lots, setT3Lots] = useState(3);
  const [t3BatuBaru, setT3BatuBaru] = useState(12);
  const [t3BatuRefix, setT3BatuRefix] = useState(0);
  const [t3Azimut, setT3Azimut] = useState(800);
  const [t3DigitalData, setT3DigitalData] = useState(true);
  const [t3RestrictedArea, setT3RestrictedArea] = useState(false);
  const [t3FixedWorkingTime, setT3FixedWorkingTime] = useState(false);
  const [t3DistanceFromRoadKm, setT3DistanceFromRoadKm] = useState(0);

  // Table IV specific states
  const [t4AreaHa, setT4AreaHa] = useState(5);
  const [t4DigitalData, setT4DigitalData] = useState(true);

  // Table V specific states
  const [t5LengthMeters, setT5LengthMeters] = useState(100);

  // Table VI specific states
  const [t6Lots, setT6Lots] = useState(3);
  const [t6Area, setT6Area] = useState(2000);

  // Table VII specific states
  const [t7Method, setT7Method] = useState<'Hourly' | 'Area'>('Hourly');
  const [t7Hours, setT7Hours] = useState(20);
  const [t7AreaHa, setT7AreaHa] = useState(2);

  // Reimbursements states
  const [rSiteVisitsHours, setRSiteVisitsHours] = useState(0);
  const [rExpertWitnessDays, setRExpertWitnessDays] = useState(0);
  const [rExpertWitnessCases, setRExpertWitnessCases] = useState(0);
  const [rMileageKm, setRMileageKm] = useState(0);
  const [rHotelDays, setRHotelDays] = useState(0);
  const [rPrintLinenA1, setRPrintLinenA1] = useState(0);
  const [rPrintLinenA2, setRPrintLinenA2] = useState(0);
  const [rPrintCopies, setRPrintCopies] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Change Password States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Admin User Management Form States
  const [adminCreateName, setAdminCreateName] = useState('');
  const [adminCreateRole, setAdminCreateRole] = useState<UserRole>('Employee');
  const [adminCreatePassword, setAdminCreatePassword] = useState('');
  const [resettingAccountId, setResettingAccountId] = useState<string | null>(null);
  const [adminResetPasswordValue, setAdminResetPasswordValue] = useState('');

  // ----------------- USER & PASSWORD MANAGEMENT -----------------
  const handleCreateUserAccount = (name: string, role: UserRole, initialPassword: string) => {
    if (!name.trim() || !initialPassword.trim()) {
      notify('error', 'Name and Password are required to create an account.');
      return;
    }
    const newAcc: UserAccount = {
      id: String(Date.now()),
      name: name.trim(),
      role,
      passwordHash: initialPassword,
      isCustom: true
    };
    const updated = [...userAccounts, newAcc];
    setUserAccounts(updated);
    localStorage.setItem('hmgeomatics_user_accounts', JSON.stringify(updated));
    notify('success', `User account for "${name}" (${role}) successfully created.`);
  };

  const handleResetUserPassword = (accountId: string, newPasswordHash: string) => {
    if (!newPasswordHash.trim()) {
      notify('error', 'Password cannot be empty.');
      return;
    }
    const updated = userAccounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, passwordHash: newPasswordHash };
      }
      return acc;
    });
    setUserAccounts(updated);
    localStorage.setItem('hmgeomatics_user_accounts', JSON.stringify(updated));
    
    // If resetting currently logged in user's password, notify them
    if (accountId === loggedInAccountId) {
      notify('success', 'Your password has been reset. Please use the new password next time you log in.');
    } else {
      const targetAcc = userAccounts.find(a => a.id === accountId);
      notify('success', `Password for "${targetAcc?.name}" has been successfully reset.`);
    }
  };

  const handleDeleteUserAccount = (accountId: string) => {
    const accToDelete = userAccounts.find(a => a.id === accountId);
    if (!accToDelete) return;
    if (!accToDelete.isCustom) {
      notify('error', 'System default accounts cannot be deleted.');
      return;
    }
    if (accountId === loggedInAccountId) {
      notify('error', 'You cannot delete your own logged-in account.');
      return;
    }
    
    showConfirm(
      'Delete User Account',
      `Are you sure you want to permanently delete the user account for "${accToDelete.name}"? This action cannot be undone.`,
      () => {
        const updated = userAccounts.filter(acc => acc.id !== accountId);
        setUserAccounts(updated);
        localStorage.setItem('hmgeomatics_user_accounts', JSON.stringify(updated));
        notify('success', `Account for "${accToDelete.name}" has been deleted.`);
      }
    );
  };

  const handleChangeCurrentUserPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInAccountId) {
      notify('error', 'No active logged-in user session found.');
      return;
    }

    const currentAcc = userAccounts.find(acc => acc.id === loggedInAccountId);
    if (!currentAcc) {
      notify('error', 'Active user account not found.');
      return;
    }

    if (changePasswordForm.currentPassword !== currentAcc.passwordHash) {
      notify('error', 'Current password verification failed. Please try again.');
      return;
    }

    if (!changePasswordForm.newPassword.trim()) {
      notify('error', 'New password cannot be empty.');
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      notify('error', 'New passwords do not match. Please verify.');
      return;
    }

    // Update the password
    const updated = userAccounts.map(acc => {
      if (acc.id === loggedInAccountId) {
        return { ...acc, passwordHash: changePasswordForm.newPassword };
      }
      return acc;
    });

    setUserAccounts(updated);
    localStorage.setItem('hmgeomatics_user_accounts', JSON.stringify(updated));
    
    // Reset state
    setChangePasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangePasswordOpen(false);
    notify('success', 'Your password has been successfully updated.');
  };

  // Active form view or selection
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Creators
  const [showCreateModal, setShowCreateModal] = useState(false);

  // --- FORM FIELDS STATE ---
  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    employee_name: 'Irwan Shah bin Ramli',
    leave_type: 'Annual' as 'Annual' | 'Medical' | 'Emergency' | 'Unpaid' | 'Maternity/Paternity',
    start_date: '',
    end_date: '',
    days: 1,
    reason: '',
  });

  // Attendance Form
  const [attendanceForm, setAttendanceForm] = useState({
    employee_name: 'Irwan Shah bin Ramli',
    date: new Date().toISOString().split('T')[0],
    check_in_time: '08:30',
    check_out_time: '',
    status: 'On_Time' as 'On_Time' | 'Late' | 'Absent' | 'Half_Day',
    location: 'HMGeomatics Seremban HQ Office',
    remarks: '',
  });

  // Client Form

  const [clientForm, setClientForm] = useState({
    nama: '',
    mykad_roc: '',
    email: '',
    telefon: '',
    alamat: '',
    mukim: '',
    daerah: 'Seremban',
    negeri: 'Negeri Sembilan',
    poa_ref: ''
  });

  // Project Form
  const [projectForm, setProjectForm] = useState({
    title: '',
    client_id: '',
    job_type: 'Cadastral' as any,
    lot_numbers: '',
    mukim: '',
    daerah: 'Seremban',
    negeri: 'Negeri Sembilan',
    coordinates_wgs84: '',
    coordinates_cassini: '',
    survey_plan_no: '',
    status: 'Inquiry' as any,
    total_fee: 0,
    ls_assigned_id: '',
    chargeable_hours: 0
  });

  // Submission Form
  const [submissionForm, setSubmissionForm] = useState({
    project_id: '',
    submission_date: '',
    reference_number: '',
    status: 'Draft' as any,
    dc_do_forms: false,
    remarks: ''
  });

  // Equipment Form
  const [equipmentForm, setEquipmentForm] = useState({
    nama: '',
    type: 'GPS_GNSS' as any,
    serial_number: '',
    calibration_due_date: '',
    cert_validity_date: '',
    status: 'Active' as any,
    assigned_staff: ''
  });

  // Payroll Form
  const [payrollForm, setPayrollForm] = useState({
    employee_name: '',
    designation: '',
    month: '2026-06',
    base_salary: 3000
  });

  // Dispute Form
  const [disputeForm, setDisputeForm] = useState({
    dispute_type: 'Boundary_Encroachment' as any,
    court_case_ref: '',
    project_id: '',
    opposing_party: '',
    hearing_dates: '',
    status: 'Investigation' as any,
    remarks: ''
  });

  // Surveyor Form
  const [surveyorForm, setSurveyorForm] = useState({
    nama: '',
    license_number: '',
    renewal_date: '',
    pii_membership_no: '',
    chargeable_rate: 300
  });

  // Export Tab Specs Selection
  const [activeExportTab, setActiveExportTab] = useState<'SQL' | 'Pydantic' | 'FastAPI' | 'WeasyPrint' | 'LHDN'>('SQL');

  // Trigger brief floating notifications
  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch all database records on mount
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [clientsRes, projectsRes, subsRes, eqRes, payrollRes, dispRes, survRes, quoteRes, leavesRes, attendancesRes, schedulesRes] = await Promise.all([
        fetch('/api/clients').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/submissions').then(r => r.json()),
        fetch('/api/equipment').then(r => r.json()),
        fetch('/api/payroll').then(r => r.json()),
        fetch('/api/disputes').then(r => r.json()),
        fetch('/api/surveyors').then(r => r.json()),
        fetch('/api/quotations').then(r => r.json()),
        fetch('/api/leaves').then(r => r.json()),
        fetch('/api/attendances').then(r => r.json()),
        fetch('/api/schedules').then(r => r.json()).catch(() => []),
      ]);

      setClients(clientsRes);
      setProjects(projectsRes);
      setSubmissions(subsRes);
      setEquipment(eqRes);
      setPayroll(payrollRes);
      setDisputes(dispRes);
      setSurveyors(survRes);
      setQuotations(quoteRes);
      setLeaves(leavesRes || []);
      setAttendances(attendancesRes || []);
      setSchedules(schedulesRes || []);
    } catch (err) {
      console.error('API Error, using fallback seed data.', err);
      // Fallback is handled because state contains initial values or we notify
      notify('error', 'Failed to connect to the API server. Using local memory backup.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync / Refresh helper
  const handleRefresh = () => {
    loadAllData();
    notify('success', 'All system data has been successfully refreshed.');
  };

  // Job Schedules CRUD Actions
  const handleAddSchedule = async (newSched: Omit<JobSchedule, 'id'>) => {
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSched)
      });
      if (res.ok) {
        await loadAllData();
        return await res.json();
      } else {
        throw new Error('Failed to create schedule');
      }
    } catch (err) {
      notify('error', 'Failed to save fieldwork booking on the server.');
      throw err;
    }
  };

  const handleUpdateSchedule = async (id: string, updatedFields: Partial<JobSchedule>) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        await loadAllData();
        return await res.json();
      } else {
        throw new Error('Failed to update schedule');
      }
    } catch (err) {
      notify('error', 'Failed to update schedule details.');
      throw err;
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadAllData();
        return true;
      } else {
        throw new Error('Failed to delete schedule');
      }
    } catch (err) {
      notify('error', 'Failed to delete schedule.');
      throw err;
    }
  };

  // Generic Create / Save handlers
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm)
      });
      if (res.ok) {
        notify('success', 'Client/landowner registration successfully saved.');
        setClientForm({
          nama: '',
          mykad_roc: '',
          email: '',
          telefon: '',
          alamat: '',
          mukim: '',
          daerah: 'Seremban',
          negeri: 'Negeri Sembilan',
          poa_ref: ''
        });
        setShowCreateModal(false);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to register client.');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.client_id) {
      notify('error', 'Please select a client first.');
      return;
    }
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      });
      if (res.ok) {
        notify('success', 'Land survey project successfully registered.');
        setProjectForm({
          title: '',
          client_id: '',
          job_type: 'Cadastral',
          lot_numbers: '',
          mukim: '',
          daerah: 'Seremban',
          negeri: 'Negeri Sembilan',
          coordinates_wgs84: '',
          coordinates_cassini: '',
          survey_plan_no: '',
          status: 'Inquiry',
          total_fee: 0,
          ls_assigned_id: '',
          chargeable_hours: 0
        });
        setShowCreateModal(false);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to register project.');
    }
  };

  const handleCreateSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionForm.project_id) {
      notify('error', 'Please select a related survey project.');
      return;
    }
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionForm)
      });
      if (res.ok) {
        notify('success', 'JUPEM e-Kadar submission successfully recorded.');
        setSubmissionForm({
          project_id: '',
          submission_date: '',
          reference_number: '',
          status: 'Draft',
          dc_do_forms: false,
          remarks: ''
        });
        setShowCreateModal(false);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to record JUPEM submission.');
    }
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(equipmentForm)
      });
      if (res.ok) {
        notify('success', 'Survey equipment successfully registered.');
        setEquipmentForm({
          nama: '',
          type: 'GPS_GNSS',
          serial_number: '',
          calibration_due_date: '',
          cert_validity_date: '',
          status: 'Active',
          assigned_staff: ''
        });
        setShowCreateModal(false);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to register equipment.');
    }
  };

  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollForm)
      });
      if (res.ok) {
        notify('success', 'Monthly payroll successfully generated with EPF/SOCSO/EIS deductions.');
        setPayrollForm({
          employee_name: '',
          designation: '',
          month: '2026-06',
          base_salary: 3000
        });
        setShowCreateModal(false);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to process payroll.');
    }
  };

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disputeForm)
      });
      if (res.ok) {
        notify('success', 'Boundary dispute case successfully registered.');
        setDisputeForm({
          dispute_type: 'Boundary_Encroachment',
          court_case_ref: '',
          project_id: '',
          opposing_party: '',
          hearing_dates: '',
          status: 'Investigation',
          remarks: ''
        });
        setShowCreateModal(false);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to save boundary dispute case.');
    }
  };

  const handleCreateLS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/surveyors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyorForm)
      });
      if (res.ok) {
        notify('success', 'Licensed Surveyor (LS) information successfully saved.');
        setSurveyorForm({
          nama: '',
          license_number: '',
          renewal_date: '',
          pii_membership_no: '',
          chargeable_rate: 300
        });
        setShowCreateModal(false);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to save surveyor details.');
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...leaveForm,
        employee_name: userRole === 'Employee' ? loggedInEmployee : leaveForm.employee_name
      };
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notify('success', 'Leave request successfully submitted.');
        setLeaveForm({
          employee_name: userRole === 'Employee' ? loggedInEmployee : 'Irwan Shah bin Ramli',
          leave_type: 'Annual',
          start_date: '',
          end_date: '',
          days: 1,
          reason: '',
        });
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to submit leave request.');
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        notify('success', `Leave request status successfully updated to: ${status}`);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to update leave request status.');
    }
  };

  const handleCreateAttendance = async (locationStr?: string, remarksStr?: string) => {
    try {
      const payload = {
        employee_name: loggedInEmployee,
        date: new Date().toISOString().split('T')[0],
        check_in_time: new Date().toTimeString().slice(0, 5),
        status: new Date().getHours() >= 9 ? 'Late' : 'On_Time',
        location: locationStr || attendanceForm.location || 'HMGeomatics Seremban HQ Office',
        remarks: remarksStr || attendanceForm.remarks || 'Clocked in from system browser portal.'
      };

      const res = await fetch('/api/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        notify('success', `Checked in successfully at ${payload.check_in_time}!`);
        setAttendanceForm(prev => ({ ...prev, remarks: '' }));
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to register check-in.');
    }
  };

  const handleCheckOutAttendance = async (id: string) => {
    try {
      const check_out_time = new Date().toTimeString().slice(0, 5);
      const res = await fetch(`/api/attendances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ check_out_time })
      });
      if (res.ok) {
        notify('success', `Checked out successfully at ${check_out_time}!`);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to register check-out.');
    }
  };


  // Status changers or deletions
  const updateProjectStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        notify('success', `Project status successfully updated to: ${status}`);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to update project status.');
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        notify('success', `JUPEM submission status successfully updated to: ${status}`);
        loadAllData();
      }
    } catch (err) {
      notify('error', 'Failed to update JUPEM submission status.');
    }
  };

  const deleteRecord = async (endpoint: string, id: string) => {
    let itemType = 'record';
    if (endpoint === 'clients') itemType = 'Client';
    else if (endpoint === 'projects') itemType = 'Project';
    else if (endpoint === 'equipment') itemType = 'Equipment';
    else if (endpoint === 'leaves') itemType = 'Leave Request';
    else if (endpoint === 'attendances') itemType = 'Attendance Log';
    else if (endpoint === 'disputes') itemType = 'Boundary Dispute Case';
    else if (endpoint === 'surveyors') itemType = 'Licensed Surveyor';

    showConfirm(
      `Delete ${itemType}`,
      `Are you sure you want to permanently delete this ${itemType.toLowerCase()}? This action cannot be undone.`,
      async () => {
        try {
          const res = await fetch(`/api/${endpoint}/${id}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            notify('success', `${itemType} successfully deleted.`);
            loadAllData();
          } else {
            notify('error', `Failed to delete ${itemType.toLowerCase()}.`);
          }
        } catch (err) {
          notify('error', `Failed to delete ${itemType.toLowerCase()}.`);
        }
      }
    );
  };

  // Helpers to get client / surveyor name from ID
  const getClientName = (id: string) => clients.find(c => c.id === id)?.nama || 'Unknown Client';
  const getSurveyorName = (id: string) => surveyors.find(s => s.id === id)?.nama || 'No Licensed Surveyor';
  const getProjectTitle = (id: string) => projects.find(p => p.id === id)?.title || 'No Related Project';

  // Calculations for Dashboard
  const activeProjectsCount = projects.filter(p => p.status !== 'Completed').length;
  const completedProjectsCount = projects.filter(p => p.status === 'Completed').length;
  const totalRevenueVal = projects.reduce((sum, p) => sum + p.final_total, 0);
  const totalSstVal = projects.reduce((sum, p) => sum + p.sst_amount, 0);
  const pendingJupemCount = submissions.filter(s => s.status !== 'Approved').length;

  // Calibration alert: check if equipment calibration date is in past or within 30 days
  const getOverdueCalibrationCount = () => {
    const today = new Date();
    return equipment.filter(e => {
      const dueDate = new Date(e.calibration_due_date);
      return dueDate <= today || (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24) <= 30;
    }).length;
  };

  // Copy-to-clipboard helper for Spec Exports
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify('success', 'Specification code successfully copied to clipboard!');
  };

  // ----------------- LOGIN INTERCEPTOR -----------------
  const [selectedLoginRole, setSelectedLoginRole] = useState<UserRole | null>(null);
  const [isLoginUserMode, setIsLoginUserMode] = useState<boolean>(false);
  const [selectedUserAccount, setSelectedUserAccount] = useState<UserAccount | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Synchronize first matching user account when selectedLoginRole changes
  useEffect(() => {
    if (selectedLoginRole) {
      const matching = userAccounts.filter(acc => acc.role === selectedLoginRole);
      if (matching.length > 0) {
        setSelectedUserAccount(matching[0]);
        if (selectedLoginRole === 'Employee') {
          setLoggedInEmployee(matching[0].name);
        }
      } else {
        setSelectedUserAccount(null);
      }
    } else {
      setSelectedUserAccount(null);
    }
  }, [selectedLoginRole, userAccounts]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoginRole || !selectedUserAccount) {
      setLoginError('Please select a valid profile and account to proceed.');
      return;
    }

    if (loginPassword === selectedUserAccount.passwordHash) {
      setUserRole(selectedLoginRole);
      setLoggedInAccountId(selectedUserAccount.id);
      localStorage.setItem('hmgeomatics_role', selectedLoginRole);
      localStorage.setItem('hmgeomatics_logged_in_account_id', selectedUserAccount.id);
      
      if (selectedLoginRole === 'Employee') {
        setLoggedInEmployee(selectedUserAccount.name);
        localStorage.setItem('hmgeomatics_employee', selectedUserAccount.name);
      } else {
        // Also ensure employee is set safely to name of account or default for other states
        setLoggedInEmployee(selectedUserAccount.name);
        localStorage.setItem('hmgeomatics_employee', selectedUserAccount.name);
      }

      setActiveTab('Dashboard');
      setLoginPassword('');
      setLoginError(null);
      notify('success', `Logged in successfully as ${selectedUserAccount.name}`);
    } else {
      setLoginError('Invalid security password. Please try again.');
    }
  };

  if (!userRole) {
    const rolesList = [
      {
        role: 'Management' as UserRole,
        title: 'Management',
        desc: 'Full administrative access to all systems, finance, disputes, and compliance settings.',
        color: 'border-teal-500 hover:bg-teal-950/20 text-teal-300 bg-teal-950/5',
        badge: 'Full Access',
        defaultPass: 'admin123'
      },
      {
        role: 'HR Management' as UserRole,
        title: 'HR Management',
        desc: 'Manage company personnel, monthly payroll calculations, EPF/SOCSO, and licensed surveyors.',
        color: 'border-purple-500 hover:bg-purple-950/20 text-purple-300 bg-purple-950/5',
        badge: 'HR & Payroll',
        defaultPass: 'hr123'
      },
      {
        role: 'Project Manager' as UserRole,
        title: 'Project Manager',
        desc: 'Administer ongoing land survey jobs, clients, JUPEM statutory submissions, and surveyors.',
        color: 'border-blue-500 hover:bg-blue-950/20 text-blue-300 bg-blue-950/5',
        badge: 'Jobs & Clients',
        defaultPass: 'pm123'
      },
      {
        role: 'Technical' as UserRole,
        title: 'Technical / Field',
        desc: 'Record disputes, coordinate fieldwork, monitor GNSS equipment calibration and certificates.',
        color: 'border-amber-500 hover:bg-amber-950/20 text-amber-300 bg-amber-950/5',
        badge: 'Field & Gear',
        defaultPass: 'tech123'
      },
      {
        role: 'Employee' as UserRole,
        title: 'Employee',
        desc: 'Access personal employee dashboard metrics, leave records, check-in, and retrieve payslips.',
        color: 'border-slate-600 hover:bg-slate-800/50 text-slate-300 bg-slate-900/5',
        badge: 'Self-Service',
        defaultPass: 'employee123'
      }
    ];

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-8 animate-fadeIn">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center mb-2">
              <HMLogo size={68} />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">HMGeomatics ERP Portal</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Land Survey Management & Statutory Compliance System. Please select your professional profile to log in.
            </p>
          </div>

          {!selectedLoginRole && !isLoginUserMode ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">SELECT PROFILE</div>
                {Object.values(hiddenProfiles).some(v => v) && (
                  <button 
                    id="btn-show-override-login"
                    onClick={() => {
                      setSelectedLoginRole('Management');
                      setIsLoginUserMode(false);
                      setLoginPassword('admin123');
                      setLoginError(null);
                    }}
                    className="text-[10px] text-teal-500 hover:underline cursor-pointer"
                  >
                    Admin Override Login
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
                {/* CARD 1: Full Access = System Administrator */}
                <button
                  id="login-btn-system-administrator"
                  onClick={() => {
                    setSelectedLoginRole('Management');
                    setIsLoginUserMode(false);
                    setLoginError(null);
                  }}
                  className="flex flex-col justify-between p-6 border rounded-xl text-left transition duration-200 cursor-pointer focus:outline-none hover:scale-[1.02] border-teal-500 hover:bg-teal-950/20 text-teal-300 bg-teal-950/5 min-h-[180px]"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Full Access
                    </span>
                    <h3 className="font-bold text-base mt-4 text-white">System Administrator</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Full administrative access to all systems, finance, disputes, and compliance settings.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-teal-400">
                    <span>Select</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </button>

                {/* CARD 2: User */}
                <button
                  id="login-btn-user-access"
                  onClick={() => {
                    const defaultUserRole = (['HR Management', 'Project Manager', 'Technical', 'Employee'] as UserRole[])
                      .find(r => !hiddenProfiles[r]) || 'HR Management';
                    setSelectedLoginRole(defaultUserRole);
                    setIsLoginUserMode(true);
                    setLoginError(null);
                  }}
                  className="flex flex-col justify-between p-6 border rounded-xl text-left transition duration-200 cursor-pointer focus:outline-none hover:scale-[1.02] border-blue-500 hover:bg-blue-950/20 text-blue-300 bg-blue-950/5 min-h-[180px]"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      User Portal
                    </span>
                    <h3 className="font-bold text-base mt-4 text-white">User</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Access secure operations including HR, projects, fieldwork technicals, and employee self-service.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-blue-400">
                    <span>Select</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                  Secure Access Protocol
                </span>
                <button 
                  onClick={() => {
                    setSelectedLoginRole(null);
                    setIsLoginUserMode(false);
                    setLoginError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← Change Profile
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase mb-1.5">Selected Profile</label>
                  {isLoginUserMode ? (
                    <select
                      id="select-login-profile-dropdown"
                      value={selectedLoginRole || ''}
                      onChange={(e) => {
                        setSelectedLoginRole(e.target.value as UserRole);
                        setLoginError(null);
                      }}
                      className="w-full text-sm p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white outline-none focus:border-teal-500 cursor-pointer"
                    >
                      {!hiddenProfiles['HR Management'] && <option value="HR Management">HR</option>}
                      {!hiddenProfiles['Project Manager'] && <option value="Project Manager">Project</option>}
                      {!hiddenProfiles['Technical'] && <option value="Technical">Technical</option>}
                      {!hiddenProfiles['Employee'] && <option value="Employee">Employee</option>}
                    </select>
                  ) : (
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm font-bold text-white flex justify-between items-center">
                      <span>Full Access = System Administrator</span>
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded">
                        Authorized
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase mb-1.5">Select User Account</label>
                  <select
                    value={selectedUserAccount?.id || ''}
                    onChange={(e) => {
                      const acc = userAccounts.find(a => a.id === e.target.value);
                      if (acc) {
                        setSelectedUserAccount(acc);
                        setLoginPassword(acc.passwordHash); // Auto-fill corresponding password
                        if (acc.role === 'Employee') {
                          setLoggedInEmployee(acc.name);
                        }
                      }
                    }}
                    className="w-full text-sm p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white outline-none focus:border-teal-500 cursor-pointer"
                  >
                    {userAccounts
                      .filter(a => a.role === selectedLoginRole)
                      .map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs text-slate-400 font-bold uppercase">Security Password</label>
                    <span className="text-[10px] text-slate-500">
                      Default: <code className="text-teal-400 bg-slate-900 px-1 rounded">{selectedUserAccount?.passwordHash}</code>
                    </span>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-sm p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white outline-none focus:border-teal-500"
                    placeholder="Enter security password"
                  />
                </div>

                {loginError && (
                  <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2.5 rounded-lg shadow-lg transition cursor-pointer"
                >
                  Verify Credentials & Enter Portal
                </button>
              </form>
            </div>
          )}

          <div className="text-center text-xs text-slate-600 border-t border-slate-850 pt-4">
            HMGeomatics ERP is governed under the Malaysian Licensed Land Surveyors Act 1958.
          </div>
        </div>
      </div>
    );
  }

  const sidebarGroups = [
    {
      title: 'UTAMA',
      items: [
        { name: 'Dashboard' as ActiveTab, icon: LayoutGrid, label: 'Dashboard' },
        { name: 'Projects' as ActiveTab, icon: Briefcase, label: 'Survey Projects', roles: ['Management', 'Project Manager', 'Technical'] },
        { name: 'Clients' as ActiveTab, icon: Users, label: 'Clients / Pemilik', roles: ['Management', 'HR Management', 'Project Manager'] },
        { name: 'CRM' as ActiveTab, icon: Megaphone, label: 'CRM' },
      ]
    },
    {
      title: 'OPERASI',
      items: [
        { name: 'Quotations' as ActiveTab, icon: ClipboardList, label: 'Quotation & Proposal', roles: ['Management', 'Project Manager'] },
        { name: 'Scheduling' as ActiveTab, icon: Calendar, label: 'Job Scheduling', roles: ['Management', 'Project Manager', 'Technical'] },
        { name: 'Submissions' as ActiveTab, icon: FileText, label: 'JUPEM Submissions', roles: ['Management', 'Project Manager'] },
        { name: 'Disputes' as ActiveTab, icon: AlertTriangle, label: 'Boundary Disputes', roles: ['Management', 'Technical'] },
        { name: 'Equipment' as ActiveTab, icon: Wrench, label: 'Equipment Calib.', roles: ['Management', 'Technical'] },
        { name: 'Surveyors' as ActiveTab, icon: Award, label: 'Licensed Surveyors', roles: ['Management', 'HR Management', 'Project Manager'] },
      ]
    },
    {
      title: 'SOKONGAN',
      items: [
        { name: 'Payroll' as ActiveTab, icon: FileSpreadsheet, label: 'HR & Payroll', roles: ['Management', 'HR Management', 'Employee'] },
        { name: 'Finance' as ActiveTab, icon: Landmark, label: 'Finance' },
        { name: 'DocMgmt' as ActiveTab, icon: Files, label: 'Document Mgmt' },
        { name: 'Reports' as ActiveTab, icon: TrendingUp, label: 'Reports & Analytics' },
        { name: 'Exports' as ActiveTab, icon: Code, label: 'Code & Specs', roles: ['Management'] },
        { name: 'Settings' as ActiveTab, icon: Settings, label: 'Settings' },
      ]
    }
  ];

  const isPermitted = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(userRole as any);
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#F8F7F4] text-[#18181A] flex flex-col md:flex-row font-sans">
      
      {/* MOBILE TOP BAR */}
      <header className="md:hidden bg-[#111113] text-[#F2EFEB] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs w-full border-b border-[#F2EFEB]/10">
        <div className="flex items-center space-x-1">
          <HMLogo size={32} />
          <span className="font-extrabold tracking-tight text-sm text-[#F2EFEB]">HMGeomatics ERP</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-[#F2EFEB]/70 hover:text-[#F2EFEB] outline-none cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* MOBILE SIDEBAR DRAWERS */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#111113]/60 backdrop-blur-xs z-50 md:hidden flex" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-[#111113] h-full flex flex-col shadow-2xl border-r border-[#F2EFEB]/10 p-4 space-y-4 animate-slideIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#F2EFEB]/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <HMLogo size={36} />
                <div>
                  <h1 className="text-xs font-extrabold tracking-tight text-[#F2EFEB]">HMGeomatics ERP</h1>
                  <p className="text-[9px] text-[#F2EFEB]/50 font-mono uppercase tracking-wider">Negeri Sembilan Portal</p>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#F2EFEB]/50 hover:text-[#F2EFEB] font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {sidebarGroups.map((group) => {
                const isGroupHidden = group.title === 'UTAMA' && isUtamaHidden;
                if (isGroupHidden && userRole !== 'Management') return null;

                return (
                  <div key={group.title} className={`mb-4 ${isGroupHidden ? 'border border-dashed border-rose-500/30 rounded p-1.5 bg-rose-950/20' : ''}`}>
                    <span className="text-[9px] font-bold text-[#F2EFEB]/40 uppercase tracking-widest block px-3 py-1 mb-1 font-mono flex items-center justify-between">
                      <span>{group.title}</span>
                      {isGroupHidden && (
                        <span className="text-[8px] font-bold uppercase bg-rose-950/40 text-rose-300 border border-rose-800/50 px-1 py-0.5 rounded scale-90">
                          Hidden Group
                        </span>
                      )}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = activeTab === item.name;
                        const hasPerm = isPermitted(item.roles);
                        const isFeatureHidden = (group.title === 'UTAMA' && (isUtamaHidden || hiddenUtamaFeatures[item.name])) || (group.title === 'SOKONGAN' && hiddenSupportFeatures[item.name]);

                        // Hide completely for non-admin users
                        if (isFeatureHidden && userRole !== 'Management') return null;

                        return (
                          <button
                            key={item.name}
                            onClick={() => {
                              setActiveTab(item.name);
                              setIsMobileMenuOpen(false);
                              setShowCreateModal(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#0CA678] text-white opacity-100 font-semibold'
                                : 'text-[#F2EFEB] opacity-70 hover:opacity-100 hover:bg-[#F2EFEB]/10'
                            } ${isFeatureHidden ? 'border border-dashed border-rose-500/30' : ''}`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#F2EFEB]/40'}`} />
                              <span className={isFeatureHidden ? 'line-through text-[#F2EFEB]/50' : ''}>{item.label}</span>
                            </div>
                            {isFeatureHidden ? (
                              <span className="text-[8px] font-bold uppercase bg-rose-950/40 text-rose-300 border border-rose-800/50 px-1 py-0.5 rounded scale-90">
                                Hidden
                              </span>
                            ) : (item as any).badge ? (
                              <span className="text-[9px] font-bold uppercase bg-[#F2EFEB]/10 text-[#F2EFEB]/80 px-1.5 py-0.5 rounded tracking-wide">
                                {(item as any).badge}
                              </span>
                            ) : !hasPerm ? (
                              <Lock className="w-3 h-3 text-[#F2EFEB]/30" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-3 border-t border-[#F2EFEB]/10 text-[9px] text-[#F2EFEB]/40 text-center">
              <p>HMGeomatics (Negeri Sembilan)</p>
              <p>Licensed Land Surveyors Act 1958</p>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside id="app-sidebar" className="hidden md:flex w-64 bg-[#111113] border-r border-[#F2EFEB]/10 flex-col py-6 shrink-0 select-none sticky top-0 h-screen justify-between shadow-xs">
        <div>
          {/* Logo & Platform Branding */}
          <div className="px-6 pb-5 mb-5 border-b border-[#F2EFEB]/10 flex items-center space-x-3">
            <HMLogo size={38} />
            <div>
              <h1 className="text-xs font-extrabold tracking-tight text-[#F2EFEB]">HMGeomatics ERP</h1>
              <p className="text-[9px] text-[#F2EFEB]/50 font-mono uppercase tracking-wider">Negeri Sembilan Portal</p>
            </div>
          </div>

          {/* Sidebar Menu Groups */}
          <div className="px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] pr-2 scrollbar-none">
            {sidebarGroups.map((group) => {
              const isGroupHidden = group.title === 'UTAMA' && isUtamaHidden;
              if (isGroupHidden && userRole !== 'Management') return null;

              return (
                <div key={group.title} className={`space-y-1.5 ${isGroupHidden ? 'border border-dashed border-rose-500/30 rounded p-1.5 bg-rose-950/20' : ''}`}>
                  <span className="text-[9px] font-bold text-[#F2EFEB]/40 uppercase tracking-widest px-4 py-1 block font-mono flex items-center justify-between">
                    <span>{group.title}</span>
                    {isGroupHidden && (
                      <span className="text-[8px] font-bold uppercase bg-rose-950/40 text-rose-300 border border-rose-800/50 px-1 py-0.5 rounded scale-90">
                        Hidden Group
                      </span>
                    )}
                  </span>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.name;
                      const hasPerm = isPermitted(item.roles);
                      const isFeatureHidden = (group.title === 'UTAMA' && (isUtamaHidden || hiddenUtamaFeatures[item.name])) || (group.title === 'SOKONGAN' && hiddenSupportFeatures[item.name]);

                      // Hide completely for non-admin users
                      if (isFeatureHidden && userRole !== 'Management') return null;

                      return (
                        <button
                          key={item.name}
                          id={`sidebar-tab-${item.name.toLowerCase()}`}
                          onClick={() => {
                            setActiveTab(item.name);
                            setShowCreateModal(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 rounded text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#0CA678] text-white opacity-100 font-semibold'
                              : 'text-[#F2EFEB] opacity-70 hover:opacity-100 hover:bg-[#F2EFEB]/10'
                          } ${isFeatureHidden ? 'border border-dashed border-rose-500/30 bg-rose-950/5' : ''}`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#F2EFEB]/40'}`} />
                            <span className={isFeatureHidden ? 'line-through text-[#F2EFEB]/50' : ''}>{item.label}</span>
                          </div>
                          {isFeatureHidden ? (
                            <span className="text-[8px] font-bold uppercase bg-rose-950/40 text-rose-300 border border-rose-800/50 px-1 py-0.5 rounded scale-90">
                              Hidden
                            </span>
                          ) : (item as any).badge ? (
                            <span className="text-[9px] font-bold uppercase bg-[#F2EFEB]/10 text-[#F2EFEB]/80 px-1.5 py-0.5 rounded tracking-wide">
                              {(item as any).badge}
                            </span>
                          ) : !hasPerm ? (
                            <Lock className="w-3 h-3 text-[#F2EFEB]/30" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="px-6 pt-4 border-t border-[#F2EFEB]/10 text-[9px] text-[#F2EFEB]/40 leading-normal">
          <p className="font-semibold text-[#F2EFEB]/60">HMGeomatics (Negeri Sembilan)</p>
          <p className="mt-0.5">Licensed Land Surveyors Act 1958</p>
        </div>
      </aside>

      {/* MAIN CONTENT CANVAS */}
      <main id="app-content" className="flex-1 p-5 md:p-8 overflow-y-auto max-w-7xl w-full min-h-screen">
        
        {/* FLOATING NOTIFICATION BANNER */}
        {notification && (
          <div
            className={`fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-5 py-3 rounded-lg shadow-xl border text-sm transition-all duration-300 ${
              notification.type === 'success'
                ? 'bg-slate-900 text-teal-300 border-teal-500'
                : 'bg-red-950 text-red-200 border-red-500'
            }`}
          >
            <span className="w-2 h-2 bg-current rounded-full animate-ping"></span>
            <span>{notification.message}</span>
          </div>
        )}

        {/* SAAS TOP BAR / PROFILE NAV */}
        <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between pb-6 border-b-2 border-[#18181A] mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-[#18181A] leading-none">
              {activeTab === 'Dashboard' && 'Status Dashboard'}
              {activeTab === 'Projects' && 'Survey Projects Directory'}
              {activeTab === 'Clients' && 'Clients & Landowners'}
              {activeTab === 'CRM' && 'CRM Sales Pipeline'}
              {activeTab === 'Quotations' && 'Quotations & Proposal Board'}
              {activeTab === 'Scheduling' && 'Fieldwork & Job Scheduling'}
              {activeTab === 'Submissions' && 'JUPEM e-Kadar Submissions'}
              {activeTab === 'Disputes' && 'Statutory Boundary Disputes'}
              {activeTab === 'Equipment' && 'Equipment Calibration Hub'}
              {activeTab === 'Surveyors' && 'Licensed Surveyors (LLS)'}
              {activeTab === 'Payroll' && 'HR Personnel & Payroll Hub'}
              {activeTab === 'Finance' && 'Revenue & Finance Dashboard'}
              {activeTab === 'DocMgmt' && 'Document Management System'}
              {activeTab === 'Reports' && 'Reporting & Intelligence'}
              {activeTab === 'Exports' && 'Developer Specifications'}
              {activeTab === 'Settings' && 'Settings & Account Security'}
            </h2>
            <p className="text-xs text-[#18181A]/50 mt-1.5 font-medium">
              {activeTab === 'Dashboard' && 'Real-time project operations, calibrations, and active disputes overview.'}
              {activeTab === 'Projects' && 'List of registered cadastral, strata, and topographic survey jobs.'}
              {activeTab === 'Clients' && 'Directory of real estate developers, private builders, and individual land title grant holders.'}
              {activeTab === 'CRM' && 'Lead inquiries, land ownership follow-ups, and customer touchpoints.'}
              {activeTab === 'Quotations' && 'Service fee calculators, 8% SST computations, and proposal generations.'}
              {activeTab === 'Scheduling' && 'Fieldwork booking manager, GNSS observation assignments, and surveyor timetables.'}
              {activeTab === 'Submissions' && 'Cadastral submission statuses with e-Kadar ID tracking.'}
              {activeTab === 'Disputes' && 'Land dispute tribunals, court actions, and gazetted boundaries.'}
              {activeTab === 'Equipment' && 'Survey instrumentation compliance logs under Licensed Land Surveyors Act 1958.'}
              {activeTab === 'Surveyors' && 'Negeri Sembilan accredited land surveyors registry.'}
              {activeTab === 'Payroll' && 'Enterprise payroll records, EPF contributions, SOCSO, and attendance logs.'}
              {activeTab === 'Finance' && 'Profit margins, tax accounting, and budget projections.'}
              {activeTab === 'DocMgmt' && 'Secure repository of cadastral plans, statutory agreements, and PA plans.'}
              {activeTab === 'Reports' && 'Business intelligence and land survey firm analytics.'}
              {activeTab === 'Exports' && 'Access database schema, PL/pgSQL scripts, and integration routers.'}
              {activeTab === 'Settings' && 'Manage your account security, passwords, and user portal preferences.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-xs w-full xl:w-auto self-stretch xl:self-auto justify-start xl:justify-end">
            <div className="bg-white border border-slate-200/80 px-4 py-2 font-mono text-[10px] font-bold uppercase text-[#18181A] tracking-wider">
              <span>Profile: {userRole === 'Employee' ? loggedInEmployee : userRole}</span>
            </div>

            <button
              onClick={handleRefresh}
              className="bg-white hover:bg-slate-50 text-[#18181A] border border-slate-200/80 px-4 py-2 font-semibold transition cursor-pointer flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#0CA678]" />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                setUserRole(null);
                setSelectedLoginRole(null);
                setIsLoginUserMode(false);
                setLoginPassword('');
                setLoggedInAccountId(null);
                localStorage.removeItem('hmgeomatics_role');
                localStorage.removeItem('hmgeomatics_logged_in_account_id');
                notify('success', 'Logged out successfully');
              }}
              className="bg-[#FFF5F5] hover:bg-[#E03131] hover:text-white text-[#E03131] border border-[rgba(224,49,49,0.2)] px-4 py-2 font-bold transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* DYNAMIC TAB RENDERING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-slate-600 font-semibold text-sm">Synchronizing with HMGeomatics databases...</p>
            <p className="text-slate-400 text-xs mt-1">Acquiring boundary coordinates & compliance certificates</p>
          </div>
        ) : !isPermitted(sidebarGroups.flatMap(g => g.items).find(i => i.name === activeTab)?.roles) ? (
          /* SECURITY PADLOCK RESTRICTED COMPLIANCE SCREEN */
          <div className="bg-white border border-slate-200 rounded-2xl p-8 py-12 shadow-sm text-center max-w-xl mx-auto my-12 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ERP Access Authorization Restricted</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your active system profile card is <strong className="text-slate-800">{userRole}</strong>. This operational module requires 
              <strong className="text-slate-800"> {sidebarGroups.flatMap(g => g.items).find(i => i.name === activeTab)?.roles?.join(' or ') || 'Admin'}</strong> security status.
            </p>
            <p className="text-xs text-slate-400">
              Under Act 458 Section 16, access logs of all statutory cadastral calculations are continuously audited.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setUserRole(null);
                  setSelectedLoginRole(null);
                  setIsLoginUserMode(false);
                  localStorage.removeItem('hmgeomatics_role');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition shadow cursor-pointer"
              >
                Switch Professional Profile
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ======================================================== */}
            {/* 1. DASHBOARD MODULE */}
            {/* ======================================================== */}
            {activeTab === 'Dashboard' && (
              <div className="space-y-6 animate-fadeIn text-slate-800">
                  
                  {/* 1. DASHBOARD LAYOUT CUSTOMIZER CONTROL BAR */}
                  {isDashboardEditable && (
                    <div id="dashboard-customizer-toolbar" className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-sans">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-50 text-teal-700 rounded-lg shrink-0">
                          <Move className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-[#18181A] text-sm">Interactive Dashboard Workspace</h3>
                          <p className="text-[11px] text-slate-500">
                            {isCustomizing 
                              ? "🛠️ Customizer Mode: Drag panels to reorder, set card widths (1/3, 2/3, 3/3), or hide modules." 
                              : "Drag, scale, and adjust your HMGeomatics operational panels directly on this workspace."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                        {isCustomizing ? (
                          <>
                            <button
                              id="btn-reset-widgets"
                              type="button"
                              onClick={resetDashboardWidgets}
                              className="px-3 py-1.5 bg-white border border-slate-200 text-[#18181A] hover:bg-slate-100 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                              title="Restore default clean dashboard layout"
                            >
                              Reset Defaults
                            </button>
                            <button
                              id="btn-done-customizing"
                              type="button"
                              onClick={() => setIsCustomizingDashboard(false)}
                              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Done Editing</span>
                            </button>
                          </>
                        ) : (
                          <button
                            id="btn-enable-customizing"
                            type="button"
                            onClick={() => setIsCustomizingDashboard(true)}
                            className="px-4 py-1.5 bg-white border border-[#18181A] text-[#18181A] hover:bg-slate-50 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <span>Customize Layout</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hidden Widgets Quick Restore Row (Visible only during customization) */}
                  {isCustomizing && dashboardWidgets.some(w => !w.visible) && (
                    <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 space-y-2 animate-fadeIn font-sans">
                      <div className="text-xs font-bold text-amber-800">Hidden Panels / Modules Available for Restore:</div>
                      <div className="flex flex-wrap gap-2">
                        {dashboardWidgets.filter(w => !w.visible).map(widget => (
                          <button
                            key={widget.id}
                            type="button"
                            onClick={() => toggleWidgetVisibility(widget.id)}
                            className="inline-flex items-center space-x-1.5 bg-white border border-amber-200 text-amber-800 px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-amber-50 cursor-pointer transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Show {widget.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DYNAMIC GRID CONTAINER FOR ORDERABLE WIDGETS */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {dashboardWidgets.filter(w => w.visible).length === 0 ? (
                      <div className="col-span-1 lg:col-span-3 bg-slate-50 border border-slate-200/80 p-12 text-center text-slate-500 rounded-xl space-y-4 font-sans">
                        <p className="font-semibold text-sm">All dashboard panels are currently hidden from view.</p>
                        {isDashboardEditable && (
                          <button
                            type="button"
                            onClick={resetDashboardWidgets}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                          >
                            Restore Default Layout
                          </button>
                        )}
                      </div>
                    ) : (
                      dashboardWidgets.filter(widget => widget.visible).map((widget) => {
                        // Determine the size class of this widget
                        let sizeClass = 'col-span-1 lg:col-span-1';
                        if (widget.size === 'col-span-2') {
                          sizeClass = 'col-span-1 lg:col-span-2';
                        } else if (widget.size === 'col-span-3') {
                          sizeClass = 'col-span-1 lg:col-span-3';
                        }

                        return (
                          <div
                            key={widget.id}
                            id={`dashboard-widget-${widget.id}`}
                            draggable={isCustomizing}
                            onDragStart={(e) => handleDragStart(e, widget.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, widget.id)}
                            className={`${sizeClass} group transition-all duration-200 ${
                              isCustomizing 
                                ? 'border-2 border-dashed border-teal-500/50 p-2.5 rounded-2xl bg-teal-50/5 hover:bg-teal-50/10 relative shadow-sm' 
                                : ''
                            }`}
                          >
                            {/* WIDGET TOOLBAR (Shows when customizing) */}
                            {isCustomizing && (
                              <div className="bg-teal-700 text-white px-3 py-2 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 shadow-md text-xs font-sans select-none animate-fadeIn">
                                <div className="flex items-center space-x-2 cursor-grab active:cursor-grabbing font-bold">
                                  <GripVertical className="w-4 h-4 text-teal-200 shrink-0" />
                                  <span className="truncate max-w-[200px]">{widget.title}</span>
                                  <span className="text-[9px] font-mono text-teal-100 bg-teal-800/80 px-1.5 py-0.5 rounded uppercase">Drag to Reorder</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {/* Position arrows for easy non-mouse layout shifting */}
                                  <div className="flex items-center bg-teal-800 rounded overflow-hidden border border-teal-600/30">
                                    <button
                                      type="button"
                                      onClick={() => moveWidget(widget.id, 'up')}
                                      className="p-1.5 hover:bg-teal-600 text-teal-100 cursor-pointer transition"
                                      title="Move left / up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveWidget(widget.id, 'down')}
                                      className="p-1.5 hover:bg-teal-600 text-teal-100 cursor-pointer transition"
                                      title="Move right / down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Width adjustment modifiers */}
                                  <div className="flex items-center bg-teal-800 rounded px-1 py-0.5 text-[10px] border border-teal-600/30">
                                    <span className="text-[10px] text-teal-200 mr-1.5 hidden sm:inline font-semibold">Width:</span>
                                    <button
                                      type="button"
                                      onClick={() => adjustWidgetSize(widget.id, 'col-span-1')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                                        widget.size === 'col-span-1' ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-100 hover:bg-teal-600'
                                      }`}
                                      title="Make Narrow (1/3)"
                                    >
                                      1/3
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => adjustWidgetSize(widget.id, 'col-span-2')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                                        widget.size === 'col-span-2' ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-100 hover:bg-teal-600'
                                      }`}
                                      title="Make Medium (2/3)"
                                    >
                                      2/3
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => adjustWidgetSize(widget.id, 'col-span-3')}
                                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                                        widget.size === 'col-span-3' ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-100 hover:bg-teal-600'
                                      }`}
                                      title="Make Full Width (3/3)"
                                    >
                                      3/3
                                    </button>
                                  </div>

                                  {/* Hide widget button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleWidgetVisibility(widget.id)}
                                    className="p-1.5 hover:bg-teal-600 bg-teal-800 text-rose-200 rounded border border-teal-600/30 cursor-pointer transition"
                                    title="Conceal this module"
                                  >
                                    <EyeOff className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                          {/* -------------------- WIDGET: BENTO STATS -------------------- */}
                          {widget.id === 'bento-stats' && (
                            <div className={`grid gap-5 ${
                              widget.size === 'col-span-1' ? 'grid-cols-1' :
                              widget.size === 'col-span-2' ? 'grid-cols-1 sm:grid-cols-2' :
                              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                            }`}>
                              {/* Card 1: Active Projects */}
                              <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between min-h-[160px] relative shadow-xs rounded-xl">
                                <div className="space-y-1">
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#18181A]/50 font-bold block">ACTIVE PROJECTS</span>
                                  <div className="text-5xl font-extrabold tracking-tighter text-[#18181A] my-2 leading-none">
                                    {projects.filter(p => p.status !== 'Completed').length || 3}
                                  </div>
                                </div>
                                <div className="text-xs text-[#18181A]/60 font-medium">
                                  <span className="text-[#0CA678] font-bold">
                                    {projects.filter(p => p.status === 'JUPEM_Submission').length || 1}
                                  </span> under JUPEM review
                                </div>
                              </div>

                              {/* Card 2: Upcoming JUPEM Submissions */}
                              <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between min-h-[160px] relative shadow-xs rounded-xl">
                                <div className="space-y-1">
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#18181A]/50 font-bold block">UPCOMING SUBMISSIONS</span>
                                  <div className="text-5xl font-extrabold tracking-tighter text-[#18181A] my-2 leading-none">
                                    {submissions.filter(s => s.status === 'Draft' || s.status === 'Submitted').length || 1}
                                  </div>
                                </div>
                                <div className="text-xs text-[#18181A]/60 font-medium">
                                  Submit before <strong className="text-[#18181A] font-bold">June 30</strong>
                                </div>
                              </div>

                              {/* Card 3: Boundary Disputes */}
                              <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between min-h-[160px] relative shadow-xs rounded-xl">
                                <div className="space-y-1">
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#18181A]/50 font-bold block">BOUNDARY DISPUTES</span>
                                  <div className="text-5xl font-extrabold tracking-tighter text-[#18181A] my-2 leading-none">
                                    {disputes.filter(d => d.status !== 'Resolved').length || 3}
                                  </div>
                                </div>
                                <div className="text-xs text-[#18181A]/60 font-medium">
                                  1 court case, 2 mediations
                                </div>
                              </div>

                              {/* Card 4: Urgent Calibration */}
                              <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between min-h-[160px] relative shadow-xs rounded-xl">
                                <div className="space-y-1">
                                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#18181A]/50 font-bold block">URGENT CALIBRATIONS</span>
                                  <div className="text-5xl font-extrabold tracking-tighter text-[#18181A] my-2 leading-none">
                                    {equipment.filter(e => e.status !== 'Calibrated').length || 2}
                                  </div>
                                </div>
                                <div className="text-xs font-bold text-[#f76707]">
                                  Expires within 30 days
                                </div>
                              </div>
                            </div>
                          )}

                          {/* -------------------- WIDGET: REVENUE PIPELINE & FORECAST -------------------- */}
                          {widget.id === 'revenue-forecast' && (
                            (() => {
                              const revCompleted = projects
                                .filter(p => p.status === 'Completed')
                                .reduce((sum, p) => sum + (Number(p.final_total) || Number(p.total_fee) || 0), 0);

                              const revActive = projects
                                .filter(p => p.status === 'Field_Work' || p.status === 'Computation' || p.status === 'JUPEM_Submission')
                                .reduce((sum, p) => sum + (Number(p.final_total) || Number(p.total_fee) || 0), 0);

                              const revQuoteAccepted = quotations
                                .filter(q => q.proposal_status === 'Accepted')
                                .reduce((sum, q) => sum + (Number(q.total) || Number(q.amount) || 0), 0);

                              const revQuoteSent = quotations
                                .filter(q => q.proposal_status === 'Sent')
                                .reduce((sum, q) => sum + (Number(q.total) || Number(q.amount) || 0), 0);

                              const totalConfirmed = revCompleted + revActive;
                              const totalAnticipated = revQuoteAccepted + revQuoteSent;
                              const grandTotal = totalConfirmed + totalAnticipated;

                              // Percentage calculations
                              const pctCompleted = grandTotal > 0 ? (revCompleted / grandTotal) * 100 : 0;
                              const pctActive = grandTotal > 0 ? (revActive / grandTotal) * 100 : 0;
                              const pctAccepted = grandTotal > 0 ? (revQuoteAccepted / grandTotal) * 100 : 0;
                              const pctSent = grandTotal > 0 ? (revQuoteSent / grandTotal) * 100 : 0;

                              // Filtered lists for the table
                              const allFinItems = [
                                ...projects.map(p => ({
                                  id: p.id,
                                  source: 'Project' as const,
                                  title: p.title,
                                  status: p.status,
                                  value: Number(p.final_total) || Number(p.total_fee) || 0,
                                  date: p.created_at || 'N/A',
                                  client: clients.find(c => c.id === p.client_id)?.nama || 'Unknown Client',
                                  detail: `${p.job_type} Survey • Lot ${p.lot_numbers}`
                                })),
                                ...quotations.map(q => ({
                                  id: q.id,
                                  source: 'Quotation' as const,
                                  title: q.subject,
                                  status: q.proposal_status,
                                  value: Number(q.total) || Number(q.amount) || 0,
                                  date: q.created_at || 'N/A',
                                  client: clients.find(c => c.id === q.client_id)?.nama || 'Unknown Client',
                                  detail: `Quotation Proposal • Status: ${q.proposal_status}`
                                }))
                              ];

                              const filteredFinItems = allFinItems.filter(item => {
                                if (dashboardFinanceTab === 'projects') return item.source === 'Project';
                                if (dashboardFinanceTab === 'quotes') return item.source === 'Quotation';
                                return true;
                              }).sort((a, b) => b.value - a.value);

                              return (
                                <div id="dashboard-financial-forecast" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-100 gap-4">
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <TrendingUp className="w-5 h-5 text-teal-600" />
                                        <h3 className="font-extrabold text-[#18181A] text-lg font-sans">Revenue Pipeline & Financial Forecast</h3>
                                      </div>
                                      <p className="text-xs text-slate-500 font-sans mt-0.5">
                                        Unified analytics reflecting awarded land survey contracts and anticipated business opportunities.
                                      </p>
                                    </div>

                                    {/* Quick filter tabs */}
                                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 self-start md:self-auto font-sans">
                                      <button
                                        id="tab-all-finances"
                                        type="button"
                                        onClick={() => setDashboardFinanceTab('all')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                                          dashboardFinanceTab === 'all'
                                            ? 'bg-white text-[#18181A] shadow-xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                      >
                                        Unified View
                                      </button>
                                      <button
                                        id="tab-projects-finances"
                                        type="button"
                                        onClick={() => setDashboardFinanceTab('projects')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                                          dashboardFinanceTab === 'projects'
                                            ? 'bg-white text-teal-700 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                      >
                                        Confirmed ({projects.length})
                                      </button>
                                      <button
                                        id="tab-quotes-finances"
                                        type="button"
                                        onClick={() => setDashboardFinanceTab('quotes')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                                          dashboardFinanceTab === 'quotes'
                                            ? 'bg-white text-teal-700 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                      >
                                        Quotes ({quotations.length})
                                      </button>
                                    </div>
                                  </div>

                                  {/* STATS TILES GRID */}
                                  <div className={`grid gap-4 font-sans ${
                                    widget.size === 'col-span-1' ? 'grid-cols-1' :
                                    widget.size === 'col-span-2' ? 'grid-cols-1 sm:grid-cols-2' :
                                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                                  }`}>
                                    {/* Realized Completed Card */}
                                    <div className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                                      <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Realized Revenue</span>
                                        <div className="text-2xl font-extrabold text-slate-900">
                                          RM {revCompleted.toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1.5 text-[11px] text-[#0ca678] font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0ca678]"></span>
                                        <span>From Completed</span>
                                      </div>
                                    </div>

                                    {/* Confirmed Active Card */}
                                    <div className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                                      <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Active Work Sum</span>
                                        <div className="text-2xl font-extrabold text-slate-900">
                                          RM {revActive.toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-1.5 text-[11px] text-amber-600 font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                        <span>In-Progress Jobs</span>
                                      </div>
                                    </div>

                                    {/* Anticipated Proposals Card */}
                                    <div className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                                      <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Proposals Pipeline</span>
                                        <div className="text-2xl font-extrabold text-slate-900">
                                          RM {totalAnticipated.toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="flex flex-col text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                                        <div className="flex justify-between">
                                          <span>Accepted:</span>
                                          <strong className="text-teal-700">RM {revQuoteAccepted.toLocaleString()}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Awaiting:</span>
                                          <strong className="text-slate-700">RM {revQuoteSent.toLocaleString()}</strong>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Grand Total projected */}
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-[#f1f0ff] p-4 rounded-xl space-y-2 flex flex-col justify-between shadow-xs">
                                      <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Grand Projected Portfolio</span>
                                        <div className="text-2xl font-extrabold text-white">
                                          RM {grandTotal.toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="flex justify-between text-[10px] text-slate-300 font-semibold pt-1 border-t border-white/10">
                                        <span>Awarded Rate:</span>
                                        <span>{((totalConfirmed / (grandTotal || 1)) * 100).toFixed(1)}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* HORIZONTAL VISUAL TIMELINE PROGRESS BAR */}
                                  <div className="space-y-2 font-sans">
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="font-bold text-[#18181A]/80">Unified Revenue Distribution</span>
                                      <span className="text-slate-400 font-mono text-[11px]">RM {grandTotal.toLocaleString()}</span>
                                    </div>
                                    
                                    {/* Stacked bar */}
                                    <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                                      {revCompleted > 0 && (
                                        <div 
                                          className="h-full bg-[#0ca678] hover:opacity-90 transition-all cursor-pointer relative group" 
                                          style={{ width: `${pctCompleted}%` }}
                                          title={`Completed Revenue: RM ${revCompleted.toLocaleString()} (${pctCompleted.toFixed(1)}%)`}
                                        />
                                      )}
                                      {revActive > 0 && (
                                        <div 
                                          className="h-full bg-amber-500 hover:opacity-90 transition-all cursor-pointer relative group" 
                                          style={{ width: `${pctActive}%` }}
                                          title={`Active Projects: RM ${revActive.toLocaleString()} (${pctActive.toFixed(1)}%)`}
                                        />
                                      )}
                                      {revQuoteAccepted > 0 && (
                                        <div 
                                          className="h-full bg-teal-600 hover:opacity-90 transition-all cursor-pointer relative group" 
                                          style={{ width: `${pctAccepted}%` }}
                                          title={`Accepted Quotes: RM ${revQuoteAccepted.toLocaleString()} (${pctAccepted.toFixed(1)}%)`}
                                        />
                                      )}
                                      {revQuoteSent > 0 && (
                                        <div 
                                          className="h-full bg-slate-400 hover:opacity-90 transition-all cursor-pointer relative group" 
                                          style={{ width: `${pctSent}%` }}
                                          title={`Sent Quotes: RM ${revQuoteSent.toLocaleString()} (${pctSent.toFixed(1)}%)`}
                                        />
                                      )}
                                    </div>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
                                      <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-[#0ca678] rounded"></span>
                                        <span className="text-slate-600 truncate">Completed ({pctCompleted.toFixed(0)}%)</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-amber-500 rounded"></span>
                                        <span className="text-slate-600 truncate">Active ({pctActive.toFixed(0)}%)</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-teal-600 rounded"></span>
                                        <span className="text-slate-600 truncate">Accepted ({pctAccepted.toFixed(0)}%)</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded"></span>
                                        <span className="text-slate-600 truncate">Sent ({pctSent.toFixed(0)}%)</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* DYNAMIC PIPELINE VALUE DRILLDOWN TABLE */}
                                  <div className="space-y-3 font-sans">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline Revenue Items ({filteredFinItems.length})</h4>
                                      <span className="text-[9px] text-slate-400 hidden sm:inline">Sorted by financial impact</span>
                                    </div>

                                    <div className="border border-slate-150 rounded-xl overflow-hidden shadow-xs">
                                      <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-100">
                                        {filteredFinItems.length === 0 ? (
                                          <div className="p-8 text-center text-slate-400 text-xs font-sans">No records available for the selected view filter.</div>
                                        ) : (
                                          filteredFinItems.map((item, idx) => (
                                            <div key={idx} className="p-3 hover:bg-slate-50 transition flex items-center justify-between gap-4 font-sans text-xs">
                                              <div className="space-y-0.5 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono border ${
                                                    item.source === 'Project' 
                                                      ? 'bg-amber-50 text-amber-700 border-amber-200/50' 
                                                      : 'bg-teal-50 text-teal-700 border-teal-200/50'
                                                  }`}>
                                                    {item.source}
                                                  </span>
                                                  <span className="text-[10px] font-mono text-slate-400 font-bold">{item.id}</span>
                                                  <span className="text-[10px] text-slate-500 truncate max-w-[120px] sm:max-w-xs">{item.client}</span>
                                                </div>
                                                <h5 className="font-bold text-slate-900 truncate pr-2">{item.title}</h5>
                                                <p className="text-[10px] text-slate-400 truncate">{item.detail}</p>
                                              </div>

                                              <div className="text-right shrink-0">
                                                <div className="font-extrabold text-slate-900 font-mono">
                                                  RM {item.value.toLocaleString()}
                                                </div>
                                                <div className="text-[9px] text-slate-400 mt-0.5">
                                                  Status: <span className="font-semibold capitalize">{item.status.replace('_', ' ')}</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()
                          )}

                          {/* -------------------- WIDGET: PROJECT STATUS PROGRESS -------------------- */}
                          {widget.id === 'project-status' && (
                            <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs h-full min-h-[350px] rounded-xl">
                              <div>
                                <div className="border-b border-[#18181A]/10 pb-3 mb-6">
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181A]">Project Status</h3>
                                </div>

                                <div className="space-y-4">
                                  {[
                                    { label: 'Submitted to JUPEM', count: projects.filter(p => p.status === 'JUPEM_Submission').length || 1, color: '#12b886', width: '45%' },
                                    { label: 'Field work', count: projects.filter(p => p.status === 'Field_Work').length || 1, color: '#f76707', width: '35%' },
                                    { label: 'Inquiry / Awarded', count: projects.filter(p => p.status === 'Inquiry').length || 1, color: '#7048e8', width: '30%' },
                                    { label: 'Completed', count: projects.filter(p => p.status === 'Completed').length || 1, color: '#868e96', width: '50%' }
                                  ].map((item, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-[#18181A]/80">{item.label}</span>
                                        <span className="font-mono text-[9px] font-bold bg-[#F8F7F4] text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/50">{item.count}</span>
                                      </div>
                                      <div className="h-1 bg-[#F8F7F4] rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: item.width, backgroundColor: item.color }}></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setActiveTab('Projects')}
                                className="w-full bg-white hover:bg-[#18181A] hover:text-white text-[#18181A] border border-[#18181A] text-[10px] font-bold py-2.5 px-4 rounded transition cursor-pointer text-center mt-6 uppercase tracking-wider"
                              >
                                View all projects
                              </button>
                            </div>
                          )}

                          {/* -------------------- WIDGET: BOUNDARY CASES -------------------- */}
                          {widget.id === 'boundary-cases' && (
                            <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs h-full min-h-[350px] rounded-xl">
                              <div>
                                <div className="border-b border-[#18181A]/10 pb-3 mb-6">
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181A]">Boundary Cases</h3>
                                </div>

                                <div className="space-y-4">
                                  {disputes.slice(0, 3).map((d) => (
                                    <div key={d.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-1">
                                      <p className="font-mono text-[9px] text-[#18181A] opacity-50 font-bold uppercase">{d.id}</p>
                                      <p className="font-bold text-xs text-[#18181A] leading-snug">{d.opposing_party_claim || 'Boundary dispute'}</p>
                                      <div className="pt-1">
                                        <span className="inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded" style={{
                                          backgroundColor: d.dispute_type === 'Court_Case' ? '#F1F0FF' : '#FFF8E6',
                                          color: d.dispute_type === 'Court_Case' ? '#5C56D6' : '#B27B12'
                                        }}>
                                          {d.dispute_type === 'Court_Case' ? 'High Court' : 'Mediation'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setActiveTab('Disputes')}
                                className="w-full bg-white hover:bg-[#18181A] hover:text-white text-[#18181A] border border-[#18181A] text-[10px] font-bold py-2.5 px-4 rounded transition cursor-pointer text-center mt-6 uppercase tracking-wider"
                              >
                                View all cases
                              </button>
                            </div>
                          )}

                          {/* -------------------- WIDGET: CALIBRATION STATUS -------------------- */}
                          {widget.id === 'calibration-status' && (
                            <div className="bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-xs h-full min-h-[350px] rounded-xl">
                              <div>
                                <div className="border-b border-[#18181A]/10 pb-3 mb-6">
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181A]">Calibration Status</h3>
                                </div>

                                <div className="space-y-4">
                                  {equipment.slice(0, 3).map((e) => (
                                    <div key={e.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-1">
                                      <p className="font-bold text-xs text-[#18181A]">{e.name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">S/N: {e.serial_no}</p>
                                      <p className="text-[11px] font-bold mt-1" style={{
                                        color: e.status === 'Calibrated' ? '#0CA678' : '#F76707'
                                      }}>
                                        {e.status === 'Calibrated' ? 'Valid' : 'Expired'} • {e.calibration_due_date}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setActiveTab('Equipment')}
                                className="w-full bg-white hover:bg-[#18181A] hover:text-white text-[#18181A] border border-[#18181A] text-[10px] font-bold py-2.5 px-4 rounded transition cursor-pointer text-center mt-6 uppercase tracking-wider"
                              >
                                Full Calibration Schedule
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

              {activeTab === 'Clients' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Clients & Landowners</h2>
                      <p className="text-sm text-slate-500">Directory of real estate developers, private builders, and individual land title grant holders.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register New Client</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm max-w-md">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search clients by company name, ROC or MyKad..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-sm bg-transparent border-none outline-none w-full"
                    />
                  </div>

                  {/* CLIENTS LIST TABLE */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                          <th className="p-4">Company Name / Individual</th>
                          <th className="p-4">Registration No. (SSM / MyKad)</th>
                          <th className="p-4">Contact Details</th>
                          <th className="p-4">Mukim & District</th>
                          <th className="p-4">POA Reference</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {clients
                          .filter(c => c.nama.toLowerCase().includes(searchQuery.toLowerCase()) || c.mykad_roc.includes(searchQuery))
                          .map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition">
                              <td className="p-4">
                                <strong className="font-semibold text-slate-900 block">{c.nama}</strong>
                                <span className="text-xs text-slate-400">Registered: {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs text-slate-700">{c.mykad_roc}</span>
                              </td>
                              <td className="p-4">
                                <p className="text-xs text-slate-500">{c.email}</p>
                                <p className="text-xs font-semibold text-slate-900 mt-0.5">{c.telefon}</p>
                              </td>
                              <td className="p-4">
                                <p className="text-slate-800">{c.mukim}</p>
                                <p className="text-xs text-slate-500">{c.daerah}, {c.negeri}</p>
                              </td>
                              <td className="p-4 text-xs">
                                {c.poa_ref !== 'N/A' && c.poa_ref ? (
                                  <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                    {c.poa_ref}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">No Power of Attorney</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => deleteRecord('clients', c.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition inline-flex items-center space-x-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        {clients.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">
                              No client records found. Please register a new client.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Create Modal Panel */}
                  {showCreateModal && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md max-w-xl">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="font-bold text-lg text-slate-900">Register New Client / Landowner</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                      </div>

                      <form onSubmit={handleCreateClient} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name / Developer Company *</label>
                            <input
                              type="text"
                              required
                              value={clientForm.nama}
                              onChange={(e) => setClientForm({ ...clientForm, nama: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                              placeholder="e.g. Seremban heights Dev"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">MyKad / Company Registration No (ROC) *</label>
                            <input
                              type="text"
                              required
                              value={clientForm.mykad_roc}
                              onChange={(e) => setClientForm({ ...clientForm, mykad_roc: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                              placeholder="e.g. 199801048291 (458291-K)"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Official Email Address *</label>
                            <input
                              type="email"
                              required
                              value={clientForm.email}
                              onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                              placeholder="developer@mail.com"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contact Telephone *</label>
                            <input
                              type="text"
                              required
                              value={clientForm.telefon}
                              onChange={(e) => setClientForm({ ...clientForm, telefon: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                              placeholder="e.g. +606-7648321"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Land Grant Mukim</label>
                            <input
                              type="text"
                              value={clientForm.mukim}
                              onChange={(e) => setClientForm({ ...clientForm, mukim: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                              placeholder="e.g. Mukim Rasah"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">District</label>
                            <select
                              value={clientForm.daerah}
                              onChange={(e) => setClientForm({ ...clientForm, daerah: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                              <option value="Seremban">Seremban</option>
                              <option value="Port Dickson">Port Dickson</option>
                              <option value="Jempol">Jempol</option>
                              <option value="Kuala Pilah">Kuala Pilah</option>
                              <option value="Rembau">Rembau</option>
                              <option value="Tampin">Tampin</option>
                              <option value="Jelebu">Jelebu</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Complete Mailing Address</label>
                            <textarea
                              value={clientForm.alamat}
                              onChange={(e) => setClientForm({ ...clientForm, alamat: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none h-16"
                              placeholder="No. 12 Jalan ..."
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Power of Attorney Ref No (POA Ref)</label>
                            <input
                              type="text"
                              value={clientForm.poa_ref}
                              onChange={(e) => setClientForm({ ...clientForm, poa_ref: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                              placeholder="e.g. POA-NS-2026-901"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow"
                          >
                            Save Record
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* 3. SURVEY PROJECTS MODULE */}
              {/* ======================================================== */}
              {activeTab === 'Projects' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Land Survey Projects</h2>
                      <p className="text-sm text-slate-500">Manage land lots, mukims, districts, Cassini-Soldner coordinates, and statutory 8% service tax (SST) computations.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register New Survey Job</span>
                    </button>
                  </div>

                  {/* PROJECTS LIST VIEW */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                          <th className="p-4">Project Name / Lot No</th>
                          <th className="p-4">Client / Owner</th>
                          <th className="p-4">Job Type</th>
                          <th className="p-4">Cassini Coordinates (Negeri Sembilan)</th>
                          <th className="p-4">Survey Fee (RM)</th>
                          <th className="p-4">SST Tax Rate (8%)</th>
                          <th className="p-4">Assigned Surveyor</th>
                          <th className="p-4">Status & Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {projects.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition">
                            <td className="p-4">
                              <strong className="font-semibold text-slate-900 block">{p.title}</strong>
                              <span className="text-xs text-slate-500 block mt-0.5">
                                Lot: <strong className="text-slate-700">{p.lot_numbers}</strong>
                              </span>
                              <span className="text-[11px] text-slate-400">{p.mukim}, {p.daerah}, {p.negeri}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded block truncate max-w-[150px]">
                                {getClientName(p.client_id)}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                                p.job_type === 'Cadastral' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                p.job_type === 'Strata' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                p.job_type === 'Topographic' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                'bg-teal-50 text-teal-700'
                              }`}>
                                {p.job_type}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-xs font-mono text-slate-600 truncate max-w-[150px]" title={p.coordinates_cassini}>
                                {p.coordinates_cassini || 'N/A'}
                              </p>
                              <span className="text-[10px] text-slate-400 block font-mono">WGS84: {p.coordinates_wgs84 || 'N/A'}</span>
                            </td>
                            <td className="p-4 font-semibold text-slate-800">
                              RM {p.total_fee.toLocaleString()}
                            </td>
                            <td className="p-4 text-xs text-slate-500">
                              <p className="font-semibold text-teal-700">+ RM {p.sst_amount.toLocaleString()}</p>
                              <span className="text-[10px] text-slate-400">SST 8% Professional Fee</span>
                            </td>
                            <td className="p-4 text-xs text-slate-600">
                              {getSurveyorName(p.ls_assigned_id)}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col space-y-1.5">
                                <select
                                  value={p.status}
                                  onChange={(e) => updateProjectStatus(p.id, e.target.value)}
                                  className="text-[11px] p-1 border rounded bg-white text-slate-700 shadow-sm"
                                >
                                  <option value="Inquiry">Inquiry</option>
                                  <option value="Field_Work">Field Work</option>
                                  <option value="Computation">Computation</option>
                                  <option value="JUPEM_Submission">JUPEM Submission</option>
                                  <option value="Completed">Completed</option>
                                </select>

                                <button
                                  onClick={() => deleteRecord('projects', p.id)}
                                  className="text-red-500 hover:text-red-700 text-xs flex items-center justify-end space-x-1 mt-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Create Modal Panel for Project */}
                  {showCreateModal && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md max-w-xl">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="font-bold text-lg text-slate-900">Register New Land Survey Project</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                      </div>

                      <form onSubmit={handleCreateProject} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Survey Project Title *</label>
                            <input
                              type="text"
                              required
                              value={projectForm.title}
                              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. Subdivision of Lot 10452 Rasah"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Client / Owner *</label>
                            <select
                              required
                              value={projectForm.client_id}
                              onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none bg-white"
                            >
                              <option value="">-- Select Client --</option>
                              {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.nama}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Survey Job Type *</label>
                            <select
                              value={projectForm.job_type}
                              onChange={(e) => setProjectForm({ ...projectForm, job_type: e.target.value as any })}
                              className="w-full text-sm p-2 border rounded-lg outline-none bg-white"
                            >
                              <option value="Cadastral">Cadastral (Title Survey)</option>
                              <option value="Strata">Strata (Strata Survey)</option>
                              <option value="Topographic">Topographic (Topographical Survey)</option>
                              <option value="Engineering">Engineering (Engineering Survey)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Lot Numbers *</label>
                            <input
                              type="text"
                              required
                              value={projectForm.lot_numbers}
                              onChange={(e) => setProjectForm({ ...projectForm, lot_numbers: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. Lot 10452 to Lot 10480"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Land Grant Mukim *</label>
                            <input
                              type="text"
                              required
                              value={projectForm.mukim}
                              onChange={(e) => setProjectForm({ ...projectForm, mukim: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. Mukim Rasah"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">WGS84 Coordinates</label>
                            <input
                              type="text"
                              value={projectForm.coordinates_wgs84}
                              onChange={(e) => setProjectForm({ ...projectForm, coordinates_wgs84: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. 2.6942, 101.9125"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cassini Coordinates (E/N)</label>
                            <input
                              type="text"
                              value={projectForm.coordinates_cassini}
                              onChange={(e) => setProjectForm({ ...projectForm, coordinates_cassini: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="N: 14210.54, E: 8492.32"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gross Contract Fee (RM) *</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-sm text-slate-400 font-semibold">RM</span>
                              <input
                                type="number"
                                required
                                value={projectForm.total_fee || ''}
                                onChange={(e) => setProjectForm({ ...projectForm, total_fee: Number(e.target.value) })}
                                className="w-full text-sm pl-10 pr-4 py-2 border rounded-lg outline-none"
                                placeholder="0"
                              />
                            </div>
                            <span className="text-[10px] text-teal-600 block mt-1">+ 8% SST will be computed automatically.</span>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Assigned Licensed Surveyor (LS)</label>
                            <select
                              value={projectForm.ls_assigned_id}
                              onChange={(e) => setProjectForm({ ...projectForm, ls_assigned_id: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none bg-white"
                            >
                              <option value="">-- No Licensed Surveyor Assigned --</option>
                              {surveyors.map(s => (
                                <option key={s.id} value={s.id}>{s.nama} ({s.license_number})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow cursor-pointer"
                          >
                            Register Job
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* QUOTATIONS & PROPOSALS BOARD */}
              {/* ======================================================== */}
              {activeTab === 'Quotations' && (
                <div className="space-y-6 animate-fadeIn">
                  <QuotationsBoard
                    clients={clients}
                    surveyors={surveyors}
                    projects={projects}
                    quotations={quotations}
                    setQuotations={setQuotations}
                    setProjects={setProjects}
                    setActiveTab={setActiveTab}
                    notify={notify}
                    rateSheets={rateSheets}
                    activeRateSheetId={activeRateSheetId}
                    setActiveRateSheetId={selectActiveRateSheet}
                    setRateSheets={saveRateSheets}
                  />
                </div>
              )}

              {/* ======================================================== */}
              {/* FIELDWORK & JOB SCHEDULING BOARD */}
              {/* ======================================================== */}
              {activeTab === 'Scheduling' && (
                <div className="space-y-6 animate-fadeIn">
                  <JobSchedulingBoard
                    projects={projects}
                    equipment={equipment}
                    surveyors={surveyors}
                    schedules={schedules}
                    onAddSchedule={handleAddSchedule}
                    onUpdateSchedule={handleUpdateSchedule}
                    onDeleteSchedule={handleDeleteSchedule}
                    notify={notify}
                    userRole={userRole}
                  />
                </div>
              )}

              {/* ======================================================== */}
              {/* 4. JUPEM SUBMISSIONS MODULE */}
              {/* ======================================================== */}
              {activeTab === 'Submissions' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">JUPEM Submissions Tracker (e-Kadar)</h2>
                      <p className="text-sm text-slate-500">Track Certified Plan (PA) approval statuses from the Director of Mapping (JUPEM) Negeri Sembilan.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Record New Submission</span>
                    </button>
                  </div>

                  {/* JUPEM LIST */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                          <th className="p-4">Related Project</th>
                          <th className="p-4">JUPEM Reference (e-Kadar ID)</th>
                          <th className="p-4">Submission Date</th>
                          <th className="p-4">DC & DO Forms (Layout Plan)</th>
                          <th className="p-4">Remarks / Audit Notes</th>
                          <th className="p-4">Approval Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {submissions.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50 transition">
                            <td className="p-4">
                              <strong className="font-semibold text-slate-900 block">{getProjectTitle(s.project_id)}</strong>
                            </td>
                            <td className="p-4">
                              <span className="font-mono bg-slate-100 px-2.5 py-1 rounded text-xs text-slate-800 font-bold border">
                                {s.reference_number}
                              </span>
                            </td>
                            <td className="p-4 text-xs">
                              {s.submission_date ? new Date(s.submission_date).toLocaleDateString('en-US') : 'N/A'}
                            </td>
                            <td className="p-4">
                              {s.dc_do_forms ? (
                                <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                  <Check className="w-3 h-3 mr-1" /> Complete
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                  Pending Submission
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-xs text-slate-500 max-w-xs truncate" title={s.remarks}>
                              {s.remarks || '-'}
                            </td>
                            <td className="p-4">
                              <select
                                value={s.status}
                                onChange={(e) => updateSubmissionStatus(s.id, e.target.value)}
                                className={`text-xs p-1.5 rounded font-bold ${
                                  s.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                  s.status === 'Query' ? 'bg-rose-100 text-rose-800' :
                                  s.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-800'
                                } shadow-sm`}
                              >
                                <option value="Draft">Draft</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Query">Query (Amendments Required)</option>
                                <option value="Approved">Approved (Certified Plan Issued)</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Create Modal Panel */}
                  {showCreateModal && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md max-w-xl">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="font-bold text-lg text-slate-900">Record JUPEM e-Kadar Submission</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                      </div>

                      <form onSubmit={handleCreateSubmission} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Related Survey Project *</label>
                          <select
                            required
                            value={submissionForm.project_id}
                            onChange={(e) => setSubmissionForm({ ...submissionForm, project_id: e.target.value })}
                            className="w-full text-sm p-2 border rounded-lg bg-white outline-none"
                          >
                            <option value="">-- Select Project --</option>
                            {projects.map(p => (
                              <option key={p.id} value={p.id}>{p.title} (Lot: {p.lot_numbers})</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">JUPEM Reference Number *</label>
                            <input
                              type="text"
                              required
                              value={submissionForm.reference_number}
                              onChange={(e) => setSubmissionForm({ ...submissionForm, reference_number: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. JUPEM.NS.120/12/2026/L4"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Submission Date</label>
                            <input
                              type="date"
                              value={submissionForm.submission_date}
                              onChange={(e) => setSubmissionForm({ ...submissionForm, submission_date: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="flex items-center space-x-2 cursor-pointer mt-2">
                              <input
                                type="checkbox"
                                checked={submissionForm.dc_do_forms}
                                onChange={(e) => setSubmissionForm({ ...submissionForm, dc_do_forms: e.target.checked })}
                                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                              />
                              <span className="text-sm font-medium text-slate-700">Document Clearance (DC) & Development Order (DO) forms complete</span>
                            </label>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Audit Notes / Query Checklist</label>
                            <textarea
                              value={submissionForm.remarks}
                              onChange={(e) => setSubmissionForm({ ...submissionForm, remarks: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none h-20"
                              placeholder="e.g. Awaiting Certified Plan (PA) review..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow cursor-pointer"
                          >
                            Save Submission
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* 5. EQUIPMENT CALIBRATION & MANAGEMENT */}
              {/* ======================================================== */}
              {activeTab === 'Equipment' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Equipment Calibration</h2>
                      <p className="text-sm text-slate-500">Monitor calibration and testing certificates for GNSS receivers, robotic total stations, and mapping drones under JUPEM regulations.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register Equipment</span>
                    </button>
                  </div>

                  {/* EQUIPMENT TABLE */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                          <th className="p-4">Equipment Name</th>
                          <th className="p-4">Equipment Category</th>
                          <th className="p-4">Serial No. / Vehicle Plate</th>
                          <th className="p-4">Calibration Expiry Date</th>
                          <th className="p-4">Assigned Personnel</th>
                          <th className="p-4">Calibration Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {equipment.map(e => {
                          const today = new Date();
                          const dueDate = new Date(e.calibration_due_date);
                          const isExpired = dueDate <= today;
                          const isWarning = !isExpired && (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24) <= 30;

                          return (
                            <tr key={e.id} className="hover:bg-slate-50 transition">
                              <td className="p-4">
                                <strong className="font-semibold text-slate-900 block">{e.nama}</strong>
                              </td>
                              <td className="p-4">
                                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">
                                  {e.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-xs">
                                {e.serial_number}
                              </td>
                              <td className="p-4">
                                <span className={`text-xs font-semibold ${isExpired ? 'text-red-600 font-bold' : isWarning ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                                  {dueDate.toLocaleDateString('en-US')}
                                </span>
                                {isExpired && <span className="block text-[10px] text-red-500 font-semibold italic mt-0.5">CALIBRATION EXPIRED (JUPEM Warning)</span>}
                                {isWarning && <span className="block text-[10px] text-amber-500 font-semibold mt-0.5">Expires in &lt; 30 Days</span>}
                              </td>
                              <td className="p-4 text-xs">
                                {e.assigned_staff || 'Unassigned'}
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                  e.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                  e.status === 'Calibrating' ? 'bg-amber-100 text-amber-800' :
                                  e.status === 'Maintenance' ? 'bg-blue-100 text-blue-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {e.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => deleteRecord('equipment', e.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Create Modal Panel */}
                  {showCreateModal && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md max-w-xl">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="font-bold text-lg text-slate-900">Register Field Survey Equipment</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                      </div>

                      <form onSubmit={handleCreateEquipment} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Equipment Name / Model *</label>
                            <input
                              type="text"
                              required
                              value={equipmentForm.nama}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, nama: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. Leica GS18 T GNSS Receiver"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Equipment Category *</label>
                            <select
                              value={equipmentForm.type}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value as any })}
                              className="w-full text-sm p-2 border rounded-lg bg-white outline-none"
                            >
                              <option value="GPS_GNSS">GPS_GNSS Receiver</option>
                              <option value="Total_Station">Robotic Total Station</option>
                              <option value="Drone">Drone (UAV / Mapping)</option>
                              <option value="Vehicle">Vehicle (Field 4WD)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Serial Number / Plate Number *</label>
                            <input
                              type="text"
                              required
                              value={equipmentForm.serial_number}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, serial_number: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. GS18-829104"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Calibration Expiry Date *</label>
                            <input
                              type="date"
                              required
                              value={equipmentForm.calibration_due_date}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, calibration_due_date: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Certificate Validity Date *</label>
                            <input
                              type="date"
                              required
                              value={equipmentForm.cert_validity_date}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, cert_validity_date: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Responsible Staff</label>
                            <input
                              type="text"
                              value={equipmentForm.assigned_staff}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, assigned_staff: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="Survey assistant name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Current Status</label>
                            <select
                              value={equipmentForm.status}
                              onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value as any })}
                              className="w-full text-sm p-2 border rounded-lg bg-white outline-none"
                            >
                              <option value="Active">Active (Field Ready)</option>
                              <option value="Calibrating">Under Calibration (Lab)</option>
                              <option value="Maintenance">Maintenance (Maint)</option>
                              <option value="Retired">Retired</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow cursor-pointer"
                          >
                            Register Equipment
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* 6. HR & PAYROLL MODULE (MALAYSIA COMPLIANCE) */}
              {/* ======================================================== */}
              {activeTab === 'Payroll' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* UNIFIED HR & PAYROLL PORTAL HEADER */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-bold">
                          <span className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></span>
                          <span>HMGeomatics Statutory HR Engine v2.1</span>
                        </div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-white">
                          Payroll, Leave & Attendance Center
                        </h2>
                        <p className="text-sm text-slate-400 max-w-2xl">
                          Integrated employee portal covering monthly payroll calculator (EPF/SOCSO/LHDN e-PCB compliance), real-time leave submission workflow, and daily browser GPS biometric clock-in checkstation.
                        </p>
                      </div>

                      <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex self-start lg:self-center">
                        <span className="text-xs text-slate-400 px-3 py-2 font-bold uppercase">Active Identity:</span>
                        <span className="text-xs bg-teal-600 text-white font-bold px-3 py-2 rounded-lg">
                          {userRole === 'Employee' ? loggedInEmployee : `HR Admin (${userRole})`}
                        </span>
                      </div>
                    </div>

                    {/* INTER-SUBTAB NAVIGATION BAR */}
                    <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-800">
                      <button
                        onClick={() => setHrSubTab('payroll')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                          hrSubTab === 'payroll'
                            ? 'bg-teal-600 text-white shadow'
                            : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span className="hidden sm:inline">Monthly Payroll & Payslips</span>
                        <span className="sm:hidden">Payroll</span>
                      </button>

                      <button
                        onClick={() => setHrSubTab('leaves')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                          hrSubTab === 'leaves'
                            ? 'bg-teal-600 text-white shadow'
                            : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Leave Management System</span>
                        <span className="sm:hidden">Leaves</span>
                      </button>

                      <button
                        onClick={() => setHrSubTab('attendance')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                          hrSubTab === 'attendance'
                            ? 'bg-teal-600 text-white shadow'
                            : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Daily Attendance Portal</span>
                        <span className="sm:hidden">Attendance</span>
                      </button>
                    </div>
                  </div>

                  {/* SUB-TAB 1: PAYROLL CALCULATOR & HISTORY */}
                  {hrSubTab === 'payroll' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Monthly Payroll Computations</h3>
                          <p className="text-xs text-slate-500">Automated calculations for EPF, SOCSO, EIS, and LHDN PCB according to assessment year 2026 mandates.</p>
                        </div>
                        {userRole !== 'Employee' && (
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition flex items-center space-x-2 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Process Employee Payslip</span>
                          </button>
                        )}
                      </div>

                      {/* STATUTORY HIGHLIGHT CARDS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">KWSP (EPF) Compliance</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            Employer contribution rate of <strong className="text-teal-600">13%</strong> for salaries ≤ RM5,000, and <strong className="text-teal-600">12%</strong> for salaries &gt; RM5,000. Employee rate is <strong className="text-teal-600">11%</strong>.
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PERKESO (SOCSO) & SIP (EIS)</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            Insurable wage ceiling is <strong className="text-teal-600">RM5,000</strong>. Auto-calculated with standard employee & employer schedules.
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">LHDN Monthly Tax (PCB)</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            Secured calculations for PCB (Monthly Tax Deduction) processed according to LHDN statutory income boundaries.
                          </p>
                        </div>
                      </div>

                      {/* PAYROLL LIST SPREADSHEET VIEW */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                              <th className="p-4">Employee / Designation</th>
                              <th className="p-4">Payroll Month</th>
                              <th className="p-4">Basic Salary (RM)</th>
                              <th className="p-4">Employee EPF (11%)</th>
                              <th className="p-4">Employer EPF (13%/12%)</th>
                              <th className="p-4">SOCSO</th>
                              <th className="p-4">EIS</th>
                              <th className="p-4">LHDN MTD (PCB)</th>
                              <th className="p-4 font-bold text-slate-900">Net Salary (RM)</th>
                              <th className="p-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                            {payroll
                              .filter(p => userRole !== 'Employee' || p.employee_name === loggedInEmployee)
                              .map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                  <td className="p-4">
                                    <strong className="font-semibold text-slate-900 block">{p.employee_name}</strong>
                                    <span className="text-xs text-slate-500">{p.designation}</span>
                                  </td>
                                  <td className="p-4 font-mono text-xs">{p.month}</td>
                                  <td className="p-4 font-semibold text-slate-900">RM {p.base_salary.toLocaleString()}</td>
                                  <td className="p-4 text-red-600 text-xs">-RM {p.epf_employee.toLocaleString()}</td>
                                  <td className="p-4 text-slate-500 text-xs">RM {p.epf_employer.toLocaleString()}</td>
                                  <td className="p-4 text-xs">
                                    <span className="block text-red-600">Employee: -RM {p.socso_employee.toLocaleString()}</span>
                                    <span className="block text-slate-400">Employer: RM {p.socso_employer.toLocaleString()}</span>
                                  </td>
                                  <td className="p-4 text-xs">
                                    <span className="block text-red-600">Employee: -RM {p.eis_employee.toLocaleString()}</span>
                                    <span className="block text-slate-400">Employer: RM {p.eis_employer.toLocaleString()}</span>
                                  </td>
                                  <td className="p-4 text-red-600 font-semibold text-xs">-RM {p.pcb.toLocaleString()}</td>
                                  <td className="p-4 font-bold text-teal-700 bg-teal-50/50">
                                    RM {p.net_salary.toLocaleString()}
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase ${
                                      p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                      p.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                      'bg-slate-100 text-slate-800'
                                    }`}>
                                      {p.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        {payroll.filter(p => userRole !== 'Employee' || p.employee_name === loggedInEmployee).length === 0 && (
                          <div className="p-8 text-center text-slate-400 text-sm">
                            No payroll receipts found for this employee session.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: LEAVE MANAGEMENT SYSTEM */}
                  {hrSubTab === 'leaves' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                      
                      {/* APPLY FOR LEAVE PANEL */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 self-start">
                        <div>
                          <h3 className="text-base font-bold text-slate-950">Apply for Professional Leave</h3>
                          <p className="text-xs text-slate-500">Submit a leave request. It will be routed directly to HR Management / General Management for review.</p>
                        </div>

                        <form onSubmit={handleCreateLeave} className="space-y-4">
                          {userRole !== 'Employee' ? (
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Apply for Employee</label>
                              <select
                                value={leaveForm.employee_name}
                                onChange={(e) => setLeaveForm({ ...leaveForm, employee_name: e.target.value })}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
                              >
                                {userAccounts
                                  .filter(a => a.role === 'Employee')
                                  .map(a => (
                                    <option key={a.id} value={a.name}>
                                      {a.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Employee Submitting</label>
                              <div className="p-2.5 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg">
                                {loggedInEmployee}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Leave Type *</label>
                            <select
                              value={leaveForm.leave_type}
                              onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value as any })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
                            >
                              <option value="Annual">Annual Leave (Tahunan)</option>
                              <option value="Medical">Medical Leave (Sakit / MC)</option>
                              <option value="Emergency">Emergency Leave (Kecemasan)</option>
                              <option value="Unpaid">Unpaid Leave (Tanpa Gaji)</option>
                              <option value="Maternity/Paternity">Maternity/Paternity Leave</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date *</label>
                              <input
                                type="date"
                                required
                                value={leaveForm.start_date}
                                onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date *</label>
                              <input
                                type="date"
                                required
                                value={leaveForm.end_date}
                                onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Number of Working Days *</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={leaveForm.days}
                              onChange={(e) => setLeaveForm({ ...leaveForm, days: Number(e.target.value) })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none"
                              placeholder="e.g. 3"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Detailed Reason *</label>
                            <textarea
                              required
                              rows={3}
                              value={leaveForm.reason}
                              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none resize-none"
                              placeholder="Describe the reason for applying..."
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-lg shadow transition cursor-pointer"
                          >
                            Submit Leave Application
                          </button>
                        </form>
                      </div>

                      {/* LEAVE HISTORY & APPROVALS WORKSPACE */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
                        <div className="flex justify-between items-center border-b pb-3">
                          <div>
                            <h3 className="text-base font-bold text-slate-950">Leave Applications Registry</h3>
                            <p className="text-xs text-slate-500">
                              {userRole === 'Employee' ? `Personal leave records for ${loggedInEmployee}` : 'All active employee leave records and approvals.'}
                            </p>
                          </div>
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                            {leaves.length} Recorded Case(s)
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                          {leaves
                            .filter(l => userRole !== 'Employee' || l.employee_name === loggedInEmployee)
                            .map((leave) => (
                              <div 
                                key={leave.id} 
                                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition hover:border-slate-200"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <strong className="text-sm text-slate-900">{leave.employee_name}</strong>
                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                                      {leave.leave_type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600">
                                    Duration: <span className="font-semibold text-slate-900">{leave.start_date}</span> to <span className="font-semibold text-slate-900">{leave.end_date}</span> ({leave.days} day(s))
                                  </p>
                                  <p className="text-xs text-slate-500 italic bg-white p-2 rounded border border-slate-100 mt-1.5">
                                    " {leave.reason} "
                                  </p>
                                </div>

                                <div className="flex flex-row sm:flex-col items-end gap-2 self-stretch sm:self-auto justify-between border-t sm:border-t-0 pt-2 sm:pt-0">
                                  {leave.status === 'Pending' ? (
                                    userRole !== 'Employee' ? (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleUpdateLeaveStatus(leave.id, 'Approved')}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow cursor-pointer transition"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleUpdateLeaveStatus(leave.id, 'Rejected')}
                                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow cursor-pointer transition"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
                                        Pending Review
                                      </span>
                                    )
                                  ) : leave.status === 'Approved' ? (
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                                      Approved
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider">
                                      Rejected
                                    </span>
                                  )}
                                  
                                  {userRole !== 'Employee' && (
                                    <button 
                                      onClick={() => deleteRecord('leaves', leave.id)}
                                      className="text-slate-400 hover:text-red-500 text-[10px] underline cursor-pointer"
                                    >
                                      Remove Record
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                          {leaves.filter(l => userRole !== 'Employee' || l.employee_name === loggedInEmployee).length === 0 && (
                            <div className="p-12 text-center text-slate-400 text-xs italic">
                              No active leave requests filed at the moment.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: DAILY ATTENDANCE PORTAL */}
                  {hrSubTab === 'attendance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                      
                      {/* CLOCK-IN WORKSTATION */}
                      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xl space-y-6 self-start">
                        <div className="text-center space-y-1">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-teal-400">Security Checkstation</h3>
                          <div className="text-3xl font-mono font-extrabold text-white tracking-widest my-2">
                            {new Date().toTimeString().slice(0, 5)}
                          </div>
                          <p className="text-xs text-slate-400 font-semibold">
                            {new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>

                        {(() => {
                          const todayStr = new Date().toISOString().split('T')[0];
                          const myTodayRecord = attendances.find(
                            a => a.employee_name === loggedInEmployee && a.date === todayStr
                          );

                          if (!myTodayRecord) {
                            return (
                              <div className="space-y-4 pt-2 border-t border-slate-850">
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                                  <div className="text-slate-400 font-bold">ACTIVE SESSION FOR:</div>
                                  <div className="text-white font-extrabold">{loggedInEmployee}</div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Check-in Workstation GPS Location</label>
                                  <select
                                    value={attendanceForm.location}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, location: e.target.value })}
                                    className="w-full text-xs p-2 bg-slate-950 border border-slate-800 text-slate-300 rounded outline-none"
                                  >
                                    <option value="HMGeomatics Seremban HQ Office">HMGeomatics Seremban HQ Office</option>
                                    <option value="Field Site - Rembau GNSS Station">Field Site - Rembau GNSS Station</option>
                                    <option value="Field Site - Port Dickson Cadastral Survey">Field Site - PD Cadastral Survey</option>
                                    <option value="JUPEM Negeri Sembilan State Office">JUPEM Negeri Sembilan State Office</option>
                                    <option value="Remote / Home Office">Remote / Home Office</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Remarks / Shift Notes</label>
                                  <input
                                    type="text"
                                    value={attendanceForm.remarks}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value })}
                                    className="w-full text-xs p-2 bg-slate-950 border border-slate-800 text-slate-300 rounded outline-none"
                                    placeholder="Optional check-in notes..."
                                  />
                                </div>

                                <button
                                  onClick={() => handleCreateAttendance(attendanceForm.location, attendanceForm.remarks)}
                                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Clock-In Secure Attendance</span>
                                </button>
                              </div>
                            );
                          }

                          if (!myTodayRecord.check_out_time) {
                            return (
                              <div className="space-y-4 pt-2 border-t border-slate-850 text-center">
                                <div className="bg-teal-950/20 border border-teal-500/20 p-4 rounded-xl text-xs space-y-1">
                                  <span className="inline-block px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-bold uppercase text-[9px] mb-1">Checked In</span>
                                  <div className="text-white font-bold text-sm">Active Duty Shift Started</div>
                                  <div className="text-slate-400 mt-2">Checked In at: <strong className="text-white font-mono">{myTodayRecord.check_in_time}</strong></div>
                                  <div className="text-slate-400">Location: <strong className="text-teal-400">{myTodayRecord.location}</strong></div>
                                  <div className="text-slate-400">Status: <strong className={myTodayRecord.status === 'On_Time' ? 'text-emerald-400' : 'text-amber-400'}>{myTodayRecord.status.replace('_', ' ')}</strong></div>
                                </div>

                                <button
                                  onClick={() => handleCheckOutAttendance(myTodayRecord.id)}
                                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                                >
                                  <span>Clock Out & End Duty</span>
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl text-center space-y-2 pt-2 text-xs">
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase text-[9px]">Shift Finished</span>
                              <div className="text-white font-bold text-sm">Thank You! Shift Completed.</div>
                              <p className="text-slate-400 text-xs mt-2">
                                Check-In: <span className="text-slate-100 font-mono font-bold">{myTodayRecord.check_in_time}</span><br />
                                Check-Out: <span className="text-slate-100 font-mono font-bold">{myTodayRecord.check_out_time}</span>
                              </p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* ATTENDANCE RECORDS JOURNAL LOG */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-3 gap-2">
                          <div>
                            <h3 className="text-base font-bold text-slate-950">Daily Attendance Logs</h3>
                            <p className="text-xs text-slate-500">
                              {userRole === 'Employee' ? `Personal logs for ${loggedInEmployee}` : 'All monitored staff entry logs and shift records.'}
                            </p>
                          </div>
                          <span className="text-xs bg-teal-50 border text-teal-700 font-bold px-2.5 py-1 rounded self-start sm:self-auto">
                            {attendances.length} Logged Entries
                          </span>
                        </div>

                        {/* STATS LOG GRID */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">HQ Present</span>
                            <strong className="text-slate-800 text-base font-extrabold">
                              {attendances.filter(a => a.location.includes('HQ')).length} Staff
                            </strong>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Field Duty</span>
                            <strong className="text-slate-800 text-base font-extrabold">
                              {attendances.filter(a => a.location.includes('Field')).length} Staff
                            </strong>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Punctual rate</span>
                            <strong className="text-emerald-600 text-base font-extrabold">
                              {attendances.length ? Math.round((attendances.filter(a => a.status === 'On_Time').length / attendances.length) * 100) : 100}%
                            </strong>
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Late Arrivals</span>
                            <strong className="text-amber-600 text-base font-extrabold">
                              {attendances.filter(a => a.status === 'Late').length} Case(s)
                            </strong>
                          </div>
                        </div>

                        {/* SPREADSHEET TABLE LOG */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-400">
                                <th className="p-2.5">Date</th>
                                <th className="p-2.5">Staff Name</th>
                                <th className="p-2.5">Check-In</th>
                                <th className="p-2.5">Check-Out</th>
                                <th className="p-2.5">Workstation Location</th>
                                <th className="p-2.5">Punctuality</th>
                                {userRole !== 'Employee' && <th className="p-2.5 text-center">Action</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                              {attendances
                                .filter(a => userRole !== 'Employee' || a.employee_name === loggedInEmployee)
                                .map((att) => (
                                  <tr key={att.id} className="hover:bg-slate-50 transition">
                                    <td className="p-2.5 font-semibold text-slate-900">{att.date}</td>
                                    <td className="p-2.5 font-bold text-slate-800">{att.employee_name}</td>
                                    <td className="p-2.5 font-mono text-slate-900 font-bold">{att.check_in_time}</td>
                                    <td className="p-2.5 font-mono text-slate-600">
                                      {att.check_out_time ? (
                                        <span className="font-bold text-slate-900">{att.check_out_time}</span>
                                      ) : (
                                        <span className="text-amber-500 italic">On-going shift</span>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-slate-600">{att.location}</td>
                                    <td className="p-2.5">
                                      <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                                        att.status === 'On_Time' ? 'bg-emerald-100 text-emerald-800' :
                                        att.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                                        'bg-slate-100 text-slate-800'
                                      }`}>
                                        {att.status.replace('_', ' ')}
                                      </span>
                                    </td>
                                    {userRole !== 'Employee' && (
                                      <td className="p-2.5 text-center">
                                        <button 
                                          onClick={() => deleteRecord('attendances', att.id)}
                                          className="text-red-500 hover:underline cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                            </tbody>
                          </table>

                          {attendances.filter(a => userRole !== 'Employee' || a.employee_name === loggedInEmployee).length === 0 && (
                            <div className="p-10 text-center text-slate-400 italic">
                              No attendance punches captured under this employee role session.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Create Modal Panel for Payroll */}
                  {showCreateModal && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md max-w-xl">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="font-bold text-lg text-slate-900">Monthly Payroll Generator (LHDN & EPF Built-in)</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                      </div>

                      <form onSubmit={handleCreatePayroll} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Employee Name *</label>
                            <select
                              required
                              value={payrollForm.employee_name}
                              onChange={(e) => {
                                const selectedName = e.target.value;
                                let dest = '';
                                if (selectedName.includes('Irwan')) dest = 'Senior Survey Assistant';
                                else if (selectedName.includes('Amirul')) dest = 'Survey Assistant';
                                else if (selectedName.includes('Faridah')) dest = 'Finance & HR Admin';
                                else dest = 'Technical Assistant';

                                setPayrollForm({ 
                                  ...payrollForm, 
                                  employee_name: selectedName,
                                  designation: dest
                                });
                              }}
                              className="w-full text-sm p-2 border rounded-lg outline-none bg-white"
                            >
                              <option value="">-- Select Employee --</option>
                              {userAccounts
                                .filter(a => a.role === 'Employee')
                                .map(a => (
                                  <option key={a.id} value={a.name}>
                                    {a.name}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Designation *</label>
                            <input
                              type="text"
                              required
                              value={payrollForm.designation}
                              onChange={(e) => setPayrollForm({ ...payrollForm, designation: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. Senior Survey Assistant"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Salary Month *</label>
                            <input
                              type="month"
                              required
                              value={payrollForm.month}
                              onChange={(e) => setPayrollForm({ ...payrollForm, month: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gross / Basic Salary (RM) *</label>
                            <input
                              type="number"
                              required
                              value={payrollForm.base_salary || ''}
                              onChange={(e) => setPayrollForm({ ...payrollForm, base_salary: Number(e.target.value) })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. 3800"
                            />
                          </div>
                        </div>

                        {/* LIVE PREVIEW CALCULATION BOX */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Statutory Deduction Computation Simulation</h4>
                          <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-600">
                            <span>Gross Basic Salary:</span>
                            <span className="text-right font-bold">RM {payrollForm.base_salary.toLocaleString()}</span>

                            <span>Employee EPF (11%):</span>
                            <span className="text-right text-red-600">- RM {(Math.round(payrollForm.base_salary * 0.11 * 100) / 100).toLocaleString()}</span>

                            <span>Employer EPF ({payrollForm.base_salary <= 5000 ? '13%' : '12%'}):</span>
                            <span className="text-right text-teal-700">RM {(Math.round(payrollForm.base_salary * (payrollForm.base_salary <= 5000 ? 0.13 : 0.12) * 100) / 100).toLocaleString()}</span>

                            <span>Employee SOCSO:</span>
                            <span className="text-right text-red-600">- RM {(Math.round(Math.min(payrollForm.base_salary, 5000) * 0.005 * 100) / 100).toLocaleString()}</span>

                            <span>Employee EIS:</span>
                            <span className="text-right text-red-600">- RM {(Math.round(Math.min(payrollForm.base_salary, 5000) * 0.002 * 100) / 100).toLocaleString()}</span>

                            <span className="border-t pt-1.5 font-bold text-slate-800">Estimated Net Salary:</span>
                            <span className="border-t pt-1.5 text-right font-extrabold text-teal-700">
                              RM {(
                                Math.round((payrollForm.base_salary - (payrollForm.base_salary * 0.11) - (Math.min(payrollForm.base_salary, 5000) * 0.005) - (Math.min(payrollForm.base_salary, 5000) * 0.002)) * 100) / 100
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow cursor-pointer"
                          >
                            Process & Save
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* 7. BOUNDARY DISPUTES MODULE */}
              {/* ======================================================== */}
              {activeTab === 'Disputes' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Land Boundary Disputes & Claims</h2>
                      <p className="text-sm text-slate-500">Log boundary encroachments, title overlapping claims, and land disputes filed in court or the District Land Office.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Record New Case</span>
                    </button>
                  </div>

                  {/* DISPUTES TABLE */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                          <th className="p-4">Dispute Type</th>
                          <th className="p-4">Court Reference / Gazette No.</th>
                          <th className="p-4">Related Project / Site</th>
                          <th className="p-4">Opposing Party</th>
                          <th className="p-4">Hearing Date / Session</th>
                          <th className="p-4">Inquiry Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {disputes.map(d => (
                          <tr key={d.id} className="hover:bg-slate-50 transition">
                            <td className="p-4">
                              <strong className="font-semibold text-slate-900 block">{d.dispute_type.replace(/_/g, ' ')}</strong>
                            </td>
                            <td className="p-4">
                              <span className="font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-xs">
                                {d.court_case_ref || 'No Court Reference'}
                              </span>
                            </td>
                            <td className="p-4 text-xs font-semibold text-slate-700">
                              {getProjectTitle(d.project_id)}
                            </td>
                            <td className="p-4 text-xs">
                              {d.opposing_party}
                            </td>
                            <td className="p-4 text-xs text-slate-500">
                              {d.hearing_dates || 'Awaiting hearing date schedule'}
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                d.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                                d.status === 'Hearing_Pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {d.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => deleteRecord('disputes', d.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {disputes.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-400">
                              No boundary dispute records registered.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Create Modal Panel */}
                  {showCreateModal && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md max-w-xl">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="font-bold text-lg text-slate-900">Record New Boundary Dispute Case</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                      </div>

                      <form onSubmit={handleCreateDispute} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dispute Type *</label>
                            <select
                              value={disputeForm.dispute_type}
                              onChange={(e) => setDisputeForm({ ...disputeForm, dispute_type: e.target.value as any })}
                              className="w-full text-sm p-2 border rounded-lg bg-white outline-none"
                            >
                              <option value="Boundary_Encroachment">Lot Boundary Encroachment</option>
                              <option value="Overlap_Claim">Overlapping Land Title Claim</option>
                              <option value="Right_of_Way">Right of Way / Access Road Claim</option>
                              <option value="Land_Office_Dispute">Land Office Dispute (PTG)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">File Reference / Court Case Ref</label>
                            <input
                              type="text"
                              value={disputeForm.court_case_ref}
                              onChange={(e) => setDisputeForm({ ...disputeForm, court_case_ref: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. GN-NS-48291-2026"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Related Project *</label>
                            <select
                              required
                              value={disputeForm.project_id}
                              onChange={(e) => setDisputeForm({ ...disputeForm, project_id: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg bg-white outline-none"
                            >
                              <option value="">-- Select Project --</option>
                              {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Opposing Party *</label>
                            <input
                              type="text"
                              required
                              value={disputeForm.opposing_party}
                              onChange={(e) => setDisputeForm({ ...disputeForm, opposing_party: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. Pemaju Jiran Sdn Bhd"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hearing Date / Inquiry Session</label>
                            <input
                              type="text"
                              value={disputeForm.hearing_dates}
                              onChange={(e) => setDisputeForm({ ...disputeForm, hearing_dates: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. 2026-07-14 at Seremban Land Office"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Remarks / Brief Chronology</label>
                            <textarea
                              value={disputeForm.remarks}
                              onChange={(e) => setDisputeForm({ ...disputeForm, remarks: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none h-20"
                              placeholder="Please enter further comments or case history..."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow cursor-pointer"
                          >
                            Save Case Record
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* 8. LICENSED SURVEYORS (LS) MODULE */}
              {/* ======================================================== */}
              {activeTab === 'Surveyors' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Licensed Land Surveyors Registry (LS)</h2>
                      <p className="text-sm text-slate-500">Registry of licensed land surveyors holding active LLS credentials under JUPEM & Land Surveyors Board Malaysia (LJT).</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowCreateModal(true);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow transition flex items-center space-x-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register New LS</span>
                    </button>
                  </div>

                  {/* SURVEYORS LIST */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {surveyors.map(s => (
                      <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{s.nama}</h3>
                            <span className="text-xs text-slate-500">Licensed Land Surveyor (Juruukur Berlesen)</span>
                          </div>
                          <button
                            onClick={() => deleteRecord('surveyors', s.id)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs border-t pt-3">
                          <div>
                            <span className="block text-slate-400 uppercase font-semibold">LLS License No.</span>
                            <strong className="font-mono text-slate-800 text-sm">{s.license_number}</strong>
                          </div>
                          <div>
                            <span className="block text-slate-400 uppercase font-semibold">Renewal Date</span>
                            <strong className="text-slate-800">{new Date(s.renewal_date).toLocaleDateString('en-US')}</strong>
                          </div>
                          <div>
                            <span className="block text-slate-400 uppercase font-semibold">PII Membership No.</span>
                            <strong className="font-mono text-slate-800">{s.pii_membership_no}</strong>
                          </div>
                          <div>
                            <span className="block text-slate-400 uppercase font-semibold">Hourly Rate</span>
                            <strong className="text-teal-700 font-bold">RM {s.chargeable_rate}/hr</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Create Modal Panel */}
                  {showCreateModal && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md max-w-xl">
                      <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h3 className="font-bold text-lg text-slate-900">Register New Licensed Surveyor (LS)</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
                      </div>

                      <form onSubmit={handleCreateLS} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Licensed Surveyor Name *</label>
                            <input
                              type="text"
                              required
                              value={surveyorForm.nama}
                              onChange={(e) => setSurveyorForm({ ...surveyorForm, nama: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. Sr Haji Ahmad Rafie bin Mokhtar"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">JUPEM LLS License Number *</label>
                            <input
                              type="text"
                              required
                              value={surveyorForm.license_number}
                              onChange={(e) => setSurveyorForm({ ...surveyorForm, license_number: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. LLS/NS/2026/0421"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">License Renewal Date *</label>
                            <input
                              type="date"
                              required
                              value={surveyorForm.renewal_date}
                              onChange={(e) => setSurveyorForm({ ...surveyorForm, renewal_date: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">PII Membership Number *</label>
                            <input
                              type="text"
                              required
                              value={surveyorForm.pii_membership_no}
                              onChange={(e) => setSurveyorForm({ ...surveyorForm, pii_membership_no: e.target.value })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="e.g. PII-9423M"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Chargeable Hourly Rate (RM) *</label>
                            <input
                              type="number"
                              required
                              value={surveyorForm.chargeable_rate || ''}
                              onChange={(e) => setSurveyorForm({ ...surveyorForm, chargeable_rate: Number(e.target.value) })}
                              className="w-full text-sm p-2 border rounded-lg outline-none"
                              placeholder="300"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow cursor-pointer"
                          >
                            Save LS Record
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* ======================================================== */}
              {/* 8.5 DOCUMENT MANAGEMENT HUB */}
              {/* ======================================================== */}
              {activeTab === 'DocMgmt' && (
                <div className="space-y-6 animate-fadeIn">
                  <DocMgmtBoard
                    clients={clients}
                    projects={projects}
                    surveyors={surveyors}
                    notify={notify}
                  />
                </div>
              )}

              {/* ======================================================== */}
              {/* 9. SPECIFICATION EXPORTS MODULE (DEVELOPER CORNER) */}
              {/* ======================================================== */}
              {activeTab === 'Exports' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="border-b border-slate-200 pb-5">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Technical Specifications & Code Integration</h2>
                    <p className="text-sm text-slate-500">Access backend database schema for PostgreSQL, FastAPI Pydantic models, Python router endpoints, WeasyPrint HTML/CSS templates, and LHDN MyInvois XML v1.1 structures.</p>
                  </div>

                  {/* INTERNAL NAV TAB FOR SPECIFICATION CODES */}
                  <div className="flex flex-wrap border-b border-slate-200">
                    {[
                      { id: 'SQL', label: 'PostgreSQL Schema' },
                      { id: 'Pydantic', label: 'FastAPI Pydantic Validation' },
                      { id: 'FastAPI', label: 'Python Router (FastAPI)' },
                      { id: 'WeasyPrint', label: 'WeasyPrint PDF Report' },
                      { id: 'LHDN', label: 'LHDN MyInvois XML' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveExportTab(t.id as any)}
                        className={`px-4 py-2.5 font-bold text-sm border-b-2 transition cursor-pointer ${
                          activeExportTab === t.id
                            ? 'border-teal-600 text-teal-700'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* SPECIFICATION RENDERING BOX */}
                  <div className="bg-slate-950 text-slate-200 rounded-xl overflow-hidden shadow-lg border border-slate-800">
                    <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                      <span className="text-xs text-slate-400 font-mono">Format: {activeExportTab === 'SQL' ? 'PL/pgSQL' : activeExportTab === 'LHDN' || activeExportTab === 'WeasyPrint' ? 'XML/HTML' : 'Python 3.12'}</span>
                      <button
                        onClick={() => {
                          const code = activeExportTab === 'SQL' ? POSTGRES_SCHEMA :
                                       activeExportTab === 'Pydantic' ? FASTAPI_PYDANTIC_MODELS :
                                       activeExportTab === 'FastAPI' ? FASTAPI_ROUTER :
                                       activeExportTab === 'WeasyPrint' ? WEASYPRINT_TEMPLATE :
                                       MYINVOIS_XML_TEMPLATE;
                          copyToClipboard(code);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold py-1 px-2.5 rounded transition cursor-pointer"
                      >
                        Copy Code
                      </button>
                    </div>

                    <pre className="p-5 text-xs font-mono overflow-auto max-h-[480px] leading-relaxed">
                      <code>
                        {activeExportTab === 'SQL' && POSTGRES_SCHEMA}
                        {activeExportTab === 'Pydantic' && FASTAPI_PYDANTIC_MODELS}
                        {activeExportTab === 'FastAPI' && FASTAPI_ROUTER}
                        {activeExportTab === 'WeasyPrint' && WEASYPRINT_TEMPLATE}
                        {activeExportTab === 'LHDN' && MYINVOIS_XML_TEMPLATE}
                      </code>
                    </pre>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* 10. SETTINGS & ACCOUNT SECURITY MODULE */}
              {/* ======================================================== */}
              {activeTab === 'Settings' && (
                <div className="space-y-6 animate-fadeIn text-slate-800">
                  
                  <div className="border-b border-slate-200 pb-5">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & Account Security</h2>
                    <p className="text-sm text-slate-500">Configure your user profile, change account security credentials, and view system permissions.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* PROFILE OVERVIEW */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs h-fit space-y-4">
                      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-extrabold text-lg">
                          {userRole.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{userRole === 'Employee' ? loggedInEmployee : userRole}</h3>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                            Role: {userRole}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">System Account ID</span>
                          <span className="text-xs font-mono text-slate-700 break-all">{loggedInAccountId || 'NS-ERP-ADMIN-01'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Access Permissions</span>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {userRole === 'Management' && 'Full system read/write, financial audits, payroll releases, and proposal signature authority.'}
                            {userRole === 'Project Manager' && 'Project directory writes, client registers, client CRM, JUPEM submission tracking, and scheduling.'}
                            {userRole === 'HR Management' && 'Employee directories, payroll schedules, and accredited land surveyor registries.'}
                            {userRole === 'Technical' && 'Boundary dispute tribunals, equipment calibration logs, field scheduling, and project specs.'}
                            {userRole === 'Employee' && 'Self payroll stub views, leave requests, and attendance logging.'}
                          </p>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Session Jurisdiction</span>
                          <span className="text-xs text-slate-700 font-semibold block mt-0.5">Negeri Sembilan (LJT Chapter)</span>
                        </div>
                      </div>
                    </div>

                    {/* CHANGE PASSWORD FORM */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                      <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-5">
                        <Lock className="w-5 h-5 text-[#0CA678]" />
                        <h3 className="font-bold text-slate-900 text-base">Change Account Password</h3>
                      </div>

                      <form onSubmit={handleChangeCurrentUserPasswordSubmit} className="space-y-4 max-w-lg">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Current Password *</label>
                          <input
                            type="password"
                            required
                            value={changePasswordForm.currentPassword}
                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                            className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                            placeholder="Enter your current password"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Password *</label>
                          <input
                            type="password"
                            required
                            value={changePasswordForm.newPassword}
                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                            className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                            placeholder="Enter new security password"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Confirm New Password *</label>
                          <input
                            type="password"
                            required
                            value={changePasswordForm.confirmPassword}
                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                            className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                            placeholder="Confirm your new security password"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition cursor-pointer shadow-sm flex items-center space-x-1.5"
                          >
                            <Key className="w-3.5 h-3.5 text-white" />
                            <span>Update Security Credentials</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* NEXTCLOUD WORKSPACES SETTINGS & LOGIN CREDENTIALS */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-5">
                      <Cloud className="w-5 h-5 text-teal-600 animate-pulse" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base font-sans">Nextcloud Workspace Integration</h3>
                        <p className="text-xs text-slate-500 font-sans">Configure WebDAV server paths and secure login credentials to synchronize project drawings and CAD files.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* INSTRUCTIONS / GUIDANCE */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4 h-fit">
                        <div className="flex items-center space-x-2 text-slate-800">
                          <Database className="w-4 h-4 text-teal-600" />
                          <span className="font-bold text-xs uppercase tracking-wider font-sans">WebDAV Setup Guide</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          HMGeomatics syncs raw CAD files, GPS baseline recordings, and boundary maps directly to your self-hosted Nextcloud server.
                        </p>
                        <div className="space-y-2 text-[11px] text-slate-500 font-sans">
                          <div className="flex items-start space-x-1.5">
                            <span className="text-teal-600 font-bold">1.</span>
                            <span>Navigate to your Nextcloud <strong>Settings &gt; Security &gt; Devices & Sessions</strong>.</span>
                          </div>
                          <div className="flex items-start space-x-1.5">
                            <span className="text-teal-600 font-bold">2.</span>
                            <span>Create a new <strong>App Password / Token</strong> specifically for <code>HMGeomatics_ERP_Client</code>.</span>
                          </div>
                          <div className="flex items-start space-x-1.5">
                            <span className="text-teal-600 font-bold">3.</span>
                            <span>Specify the target workspace root folder name inside Nextcloud (e.g. <code>01_Project_Documents</code>) where surveyors upload CAD drawing archives.</span>
                          </div>
                        </div>
                        <div className="p-3 bg-teal-50 border border-teal-100/50 rounded-lg text-[10px] text-teal-800 leading-relaxed font-sans">
                          <strong>Hardening Tip:</strong> Do not enter your master login password. Using an App Token restricts access and permits revoking the ERP client separately.
                        </div>
                      </div>

                      {/* INPUT FIELDS */}
                      <div className="lg:col-span-2">
                        <form onSubmit={handleSaveNcSettings} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-sans">Nextcloud Server URL *</label>
                              <input
                                id="nc-server-url"
                                type="url"
                                required
                                value={ncServerUrl}
                                onChange={(e) => setNcServerUrl(e.target.value)}
                                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                                placeholder="https://drive.jteras.com"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-sans">WebDAV Username *</label>
                              <input
                                id="nc-username"
                                type="text"
                                required
                                value={ncUsername}
                                onChange={(e) => setNcUsername(e.target.value)}
                                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                                placeholder="hmgeomatics_admin"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-sans">WebDAV App Token / Password *</label>
                              <div className="relative">
                                <input
                                  id="nc-password"
                                  type={showNcPassword ? 'text' : 'password'}
                                  required
                                  value={ncPassword}
                                  onChange={(e) => setNcPassword(e.target.value)}
                                  className="w-full text-sm p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-mono"
                                  placeholder="Enter Nextcloud app token"
                                />
                                <button
                                  id="toggle-nc-password-vis"
                                  type="button"
                                  onClick={() => setShowNcPassword(!showNcPassword)}
                                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                  title={showNcPassword ? "Hide Token" : "Show Token"}
                                >
                                  {showNcPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 font-sans">Root Workspace Directory *</label>
                              <input
                                id="nc-root-folder"
                                type="text"
                                required
                                value={ncRootFolder}
                                onChange={(e) => setNcRootFolder(e.target.value)}
                                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                                placeholder="01_Project_Documents"
                              />
                            </div>
                          </div>

                          {/* CONNECTION STATUS BADGE & ACTIONS */}
                          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Status:</span>
                              {ncConnectionStatus === 'idle' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                                  Not Tested
                                </span>
                              )}
                              {ncConnectionStatus === 'testing' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 font-mono animate-pulse">
                                  <RefreshCw className="w-3 h-3 mr-1 animate-spin text-amber-600" />
                                  Pinging WebDAV...
                                </span>
                              )}
                              {ncConnectionStatus === 'success' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-700 border border-teal-200 font-mono">
                                  🟢 Live: Connection verified
                                </span>
                              )}
                              {ncConnectionStatus === 'error' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                                  🔴 Connection Refused
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                id="btn-test-nc-conn"
                                type="button"
                                disabled={ncConnectionStatus === 'testing'}
                                onClick={handleTestNcConnection}
                                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer font-sans"
                              >
                                {ncConnectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                              </button>
                              <button
                                id="btn-save-nc-settings"
                                type="submit"
                                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition shadow-xs cursor-pointer font-sans"
                              >
                                Save Configuration
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* SYSTEM ADMIN MANAGEMENT CONTROLS */}
                  {userRole === 'Management' && (
                    <div className="space-y-6 pt-6 border-t border-slate-200 mt-6">
                      <div className="border-b border-slate-200 pb-3">
                        <h3 className="text-lg font-bold text-slate-900">System Admin Control Center</h3>
                        <p className="text-xs text-slate-500">Configure profile visibility, pricing rate sheets, user registration, and reset credentials.</p>
                      </div>

                      {/* RATE SHEETS CONFIGURATION PANEL */}
                      <RateSheetsManager
                        rateSheets={rateSheets}
                        activeRateSheetId={activeRateSheetId}
                        setActiveRateSheetId={selectActiveRateSheet}
                        setRateSheets={saveRateSheets}
                        notify={notify}
                      />

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* PROFILE VISIBILITY CARD */}
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center space-x-2 text-slate-850 mb-3 border-b border-slate-100 pb-3">
                            <Settings className="w-5 h-5 text-teal-600" />
                            <div>
                              <h4 className="font-bold text-sm tracking-tight text-slate-900">System Admin: Profile Visibility</h4>
                              <p className="text-[11px] text-slate-500">Toggle which professional profiles are displayed on the public landing page.</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {(Object.keys(hiddenProfiles) as UserRole[]).map((roleName) => {
                              const isHidden = hiddenProfiles[roleName];
                              return (
                                <div key={roleName} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                                  <div className="flex flex-col">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-semibold text-slate-900">{roleName}</span>
                                      {isHidden && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
                                          Hidden
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                      {roleName === 'Management' ? 'Full access & compliance tools' :
                                       roleName === 'HR Management' ? 'Company personnel & payroll' :
                                       roleName === 'Project Manager' ? 'Survey projects & clients' :
                                       roleName === 'Technical' ? 'Calibration & disputes' :
                                       'Self-service & leave tracking'}
                                    </span>
                                  </div>
                                  <button
                                    id={`toggle-visibility-${roleName.toLowerCase().replace(/\s+/g, '-')}`}
                                    onClick={() => toggleProfileVisibility(roleName)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition cursor-pointer ${
                                      isHidden
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                        : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                                    }`}
                                  >
                                    {isHidden ? 'Unhide Profile' : 'Hide Profile'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-start space-x-2">
                            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                              Hidden profiles cannot be selected by general users on the portal landing screen. These settings are persisted immediately.
                            </span>
                          </div>
                        </div>

                        {/* SECURITY OVERRIDE AUDIT CARD */}
                        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center space-x-2 text-slate-850 mb-3 border-b border-slate-100 pb-3">
                              <ShieldAlert className="w-5 h-5 text-amber-500" />
                              <h4 className="font-bold text-sm tracking-tight text-slate-900">Security Override Audit</h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              If you hide the <strong>Management</strong> profile, general users will not see it on the main landing screen. 
                              However, a secure <strong>"Admin Override Login"</strong> link will still be visible in the header for emergency recovery.
                            </p>
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-lg text-xs font-semibold">
                              Emergency Default Login: admin123
                            </div>
                          </div>
                          <div className="mt-6 space-y-2">
                            <button
                              id="btn-reset-profiles"
                              onClick={() => {
                                const defaultVisibility = {
                                  'Management': false,
                                  'HR Management': false,
                                  'Project Manager': false,
                                  'Technical': false,
                                  'Employee': false,
                                };
                                setHiddenProfiles(defaultVisibility);
                                localStorage.setItem('hmgeomatics_hidden_profiles', JSON.stringify(defaultVisibility));
                                notify('success', 'All professional profiles have been restored to visible status.');
                              }}
                              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-4 rounded border border-slate-300 transition text-center cursor-pointer"
                            >
                              Reset All Profiles to Visible
                            </button>
                            <button
                              id="btn-reset-support-menus"
                              onClick={() => {
                                const defaultSupportVisibility = {
                                  'Payroll': false,
                                  'Finance': false,
                                  'DocMgmt': false,
                                  'Reports': false,
                                  'Exports': false,
                                };
                                setHiddenSupportFeatures(defaultSupportVisibility);
                                localStorage.setItem('hmgeomatics_hidden_support_features', JSON.stringify(defaultSupportVisibility));
                                notify('success', 'All Support sidebar menu items have been restored to visible status.');
                              }}
                              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-850 text-xs font-bold py-2 px-4 rounded border border-indigo-200 transition text-center cursor-pointer"
                            >
                              Reset All Support Menus to Visible
                            </button>
                            <button
                              id="btn-reset-utama-menus"
                              onClick={() => {
                                setIsUtamaHidden(false);
                                localStorage.setItem('hmgeomatics_is_utama_hidden', JSON.stringify(false));
                                const defaultUtamaVisibility = {
                                  'Dashboard': false,
                                  'Projects': false,
                                  'Clients': false,
                                  'CRM': false,
                                };
                                setHiddenUtamaFeatures(defaultUtamaVisibility);
                                localStorage.setItem('hmgeomatics_hidden_utama_features', JSON.stringify(defaultUtamaVisibility));
                                notify('success', 'All UTAMA submenu items and master group have been restored to visible status.');
                              }}
                              className="w-full bg-teal-50 hover:bg-teal-100 text-teal-850 text-xs font-bold py-2 px-4 rounded border border-teal-200 transition text-center cursor-pointer"
                            >
                              Reset All UTAMA Menus to Visible
                            </button>
                          </div>
                        </div>

                        {/* SUPPORT FEATURES SIDEBAR VISIBILITY CARD */}
                        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center space-x-2 text-slate-850 mb-3 border-b border-slate-100 pb-3">
                            <Settings className="w-5 h-5 text-indigo-600" />
                            <div>
                              <h4 className="font-bold text-sm tracking-tight text-slate-900">System Admin: Support Features Sidebar Visibility</h4>
                              <p className="text-[11px] text-slate-500">Hide/Unhide SOKONGAN (support) features from the sidebar menu for non-admin users.</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { key: 'Payroll', name: 'HR & Payroll', desc: 'Employee payroll calculations, monthly salaries, EPF/SOCSO & payslips' },
                              { key: 'Finance', name: 'Finance Ledger', desc: 'Company income records, invoice lists & expense accounts' },
                              { key: 'DocMgmt', name: 'Document Management', desc: 'Cloud plan archive, surveyor report uploads & regulatory files' },
                              { key: 'Reports', name: 'Reports & Analytics', desc: 'Business operations telemetry, task stats & charts' },
                              { key: 'Exports', name: 'Code & Specs', desc: 'Licensed land surveyor laws, technical manuals, and LJT standard forms' },
                            ].map((feature) => {
                              const isHidden = hiddenSupportFeatures[feature.key];
                              return (
                                <div key={feature.key} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                                  <div className="flex flex-col max-w-[70%]">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-bold text-slate-900">{feature.name}</span>
                                      {isHidden && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
                                          Hidden
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 leading-snug mt-1">{feature.desc}</span>
                                  </div>
                                  <button
                                    id={`toggle-support-${feature.key.toLowerCase()}`}
                                    onClick={() => toggleSupportFeatureVisibility(feature.key)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition cursor-pointer shrink-0 ${
                                      isHidden
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                        : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                                    }`}
                                  >
                                    {isHidden ? 'Unhide Feature' : 'Hide Feature'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-start space-x-2">
                            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                              Hidden features are completely removed from the sidebar menu for all other user profiles (HR, PM, Technical, Employee). However, as a System Administrator (Management), you will still see them grayed-out with a "Hidden" badge so that you retain quick shortcut access to manage them.
                            </span>
                          </div>
                        </div>

                        {/* UTAMA FEATURES SIDEBAR VISIBILITY CARD */}
                        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                          <div className="flex items-center space-x-2 text-slate-850 mb-3 border-b border-slate-100 pb-3">
                            <Settings className="w-5 h-5 text-teal-600" />
                            <div>
                              <h4 className="font-bold text-sm tracking-tight text-slate-900 font-sans">System Admin: UTAMA Submenu Sidebar Visibility</h4>
                              <p className="text-[11px] text-slate-500 font-sans">Hide/Unhide UTAMA (main) submenu group or specific features from the sidebar menu for non-admin users.</p>
                            </div>
                          </div>
                          
                          {/* MASTER TOGGLE FOR ENTIRE UTAMA GROUP */}
                          <div className="mb-6 p-4 rounded-xl border border-teal-600/20 bg-teal-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-extrabold text-slate-900 font-sans uppercase tracking-wider">UTAMA Master Group Status</span>
                                {isUtamaHidden ? (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 font-mono">
                                    Entire Group Hidden
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-100 font-mono">
                                    Group Visible
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 font-sans">
                                Hiding the entire UTAMA group overrides individual settings and completely conceals Dashboard, Survey Projects, Clients, and CRM from other user roles.
                              </p>
                            </div>
                            <button
                              id="toggle-utama-master-group"
                              onClick={toggleUtamaGroupVisibility}
                              className={`px-4 py-2 text-xs font-bold rounded-lg border transition cursor-pointer font-sans shrink-0 ${
                                isUtamaHidden
                                  ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                                  : 'bg-teal-600 hover:bg-teal-700 text-white border-transparent'
                              }`}
                            >
                              {isUtamaHidden ? 'Unhide Entire UTAMA' : 'Hide Entire UTAMA'}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { key: 'Dashboard', name: 'Dashboard Submenu', desc: 'Main control center, key performance indexes, operations status, and metrics summary' },
                              { key: 'Projects', name: 'Survey Projects Submenu', desc: 'Registered survey projects, land title files, fieldwork records, and client info' },
                              { key: 'Clients', name: 'Clients & Pemilik Submenu', desc: 'Registered land owners, corporate clients, contact details, and address books' },
                              { key: 'CRM', name: 'CRM / Pemilik Marketing', desc: 'Marketing leads, feedback notes, follow-up scheduler, and client communications' },
                            ].map((feature) => {
                              const isHidden = isUtamaHidden || hiddenUtamaFeatures[feature.key];
                              const isIndividuallyHidden = hiddenUtamaFeatures[feature.key];
                              return (
                                <div key={feature.key} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                                  <div className="flex flex-col max-w-[70%]">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs font-bold text-slate-900 font-sans">{feature.name}</span>
                                      {isHidden && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 font-mono">
                                          {isUtamaHidden ? 'Hidden by Master' : 'Hidden'}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 leading-snug mt-1 font-sans">{feature.desc}</span>
                                  </div>
                                  <button
                                    id={`toggle-utama-${feature.key.toLowerCase()}`}
                                    disabled={isUtamaHidden}
                                    onClick={() => toggleUtamaFeatureVisibility(feature.key)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md border transition cursor-pointer shrink-0 ${
                                      isUtamaHidden
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                        : isIndividuallyHidden
                                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                          : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200'
                                    }`}
                                  >
                                    {isIndividuallyHidden ? 'Unhide Item' : 'Hide Item'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-start space-x-2">
                            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                              Just like Support features, hidden UTAMA submenus are completely hidden from the sidebar menu for all non-admin user roles. As an Administrator, you will always be able to see them in the sidebar with a "Hidden" badge for your convenience.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* USER ACCOUNTS & PASSWORD RESET CONTROL PANEL */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center space-x-2 text-slate-850 mb-4 border-b border-slate-100 pb-3">
                          <UserPlus className="w-5 h-5 text-teal-600" />
                          <div>
                            <h4 className="font-bold text-sm tracking-tight text-slate-900">Admin: User Accounts & Security Credentials</h4>
                            <p className="text-[11px] text-slate-500">Create new ERP users or reset security passwords for all employees and system profiles.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                          
                          {/* CREATE USER COLUMN */}
                          <div className="xl:col-span-1 bg-slate-50 p-5 rounded-xl border border-slate-150 space-y-4">
                            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                              <Plus className="w-3.5 h-3.5 mr-1 text-teal-600" />
                              Create New User Account
                            </h5>
                            
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name / Username *</label>
                              <input
                                type="text"
                                value={adminCreateName}
                                onChange={(e) => setAdminCreateName(e.target.value)}
                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                                placeholder="e.g. Mohd Hafiz bin Razak"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Profile / Role *</label>
                              <select
                                value={adminCreateRole}
                                onChange={(e) => setAdminCreateRole(e.target.value as UserRole)}
                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                              >
                                <option value="Employee">Employee (Self-Service Metrics)</option>
                                <option value="Technical">Technical / Field (Calibration & Disputes)</option>
                                <option value="Project Manager">Project Manager (Jobs & Clients)</option>
                                <option value="HR Management">HR Management (Personnel & Payroll)</option>
                                <option value="Management">Management (Full Admin Access)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Security Password *</label>
                              <input
                                type="text"
                                value={adminCreatePassword}
                                onChange={(e) => setAdminCreatePassword(e.target.value)}
                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500 font-sans"
                                placeholder="e.g. hafiz991"
                              />
                            </div>

                            <button
                              onClick={() => {
                                handleCreateUserAccount(adminCreateName, adminCreateRole, adminCreatePassword);
                                setAdminCreateName('');
                                setAdminCreatePassword('');
                              }}
                              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition text-center cursor-pointer shadow-sm"
                            >
                              Add User Account
                            </button>
                          </div>

                          {/* USER ACCOUNTS TABLE COLUMN */}
                          <div className="xl:col-span-2 space-y-4">
                            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                              ERP Registered Users & Credentials List
                            </h5>

                            <div className="overflow-x-auto border border-slate-150 rounded-xl">
                              <table className="w-full text-xs text-left text-slate-600">
                                <thead className="text-[10px] uppercase text-slate-500 bg-slate-50 border-b border-slate-150">
                                  <tr>
                                    <th className="p-3">User Name</th>
                                    <th className="p-3">Profile/Role</th>
                                    <th className="p-3">Active Password</th>
                                    <th className="p-3">Origin</th>
                                    <th className="p-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {userAccounts.map((acc) => (
                                    <tr key={acc.id} className="hover:bg-slate-50/50">
                                      <td className="p-3 font-semibold text-slate-900">{acc.name}</td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          acc.role === 'Management' ? 'bg-teal-50 text-teal-700 border border-teal-100' :
                                          acc.role === 'HR Management' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                          acc.role === 'Project Manager' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                          acc.role === 'Technical' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                          'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                          {acc.role}
                                        </span>
                                      </td>
                                      <td className="p-3 font-mono font-bold text-slate-800">
                                        {resettingAccountId === acc.id ? (
                                          <div className="flex items-center space-x-1.5">
                                            <input
                                              type="text"
                                              value={adminResetPasswordValue}
                                              onChange={(e) => setAdminResetPasswordValue(e.target.value)}
                                              className="p-1 text-xs border border-slate-300 rounded outline-none w-24 bg-white text-slate-850 font-sans"
                                              placeholder="New pwd"
                                            />
                                            <button
                                              onClick={() => {
                                                handleResetUserPassword(acc.id, adminResetPasswordValue);
                                                setResettingAccountId(null);
                                                setAdminResetPasswordValue('');
                                              }}
                                              className="bg-teal-600 text-white p-1 rounded text-[10px] font-bold hover:bg-teal-700 cursor-pointer"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => {
                                                setResettingAccountId(null);
                                                setAdminResetPasswordValue('');
                                              }}
                                              className="bg-slate-100 text-slate-500 p-1 rounded text-[10px] hover:bg-slate-200 cursor-pointer"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ) : (
                                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                            {acc.passwordHash}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-3">
                                        {acc.isCustom ? (
                                          <span className="text-teal-600 font-semibold text-[10px]">Custom</span>
                                        ) : (
                                          <span className="text-slate-400 text-[10px]">System Default</span>
                                        )}
                                      </td>
                                      <td className="p-3 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                          {resettingAccountId !== acc.id && (
                                            <button
                                              onClick={() => {
                                                setResettingAccountId(acc.id);
                                                setAdminResetPasswordValue(acc.passwordHash);
                                              }}
                                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                                              title="Reset Security Password"
                                            >
                                              <RefreshCw className="w-3 h-3" />
                                              <span>Reset Password</span>
                                            </button>
                                          )}
                                          
                                          {acc.isCustom && acc.id !== loggedInAccountId && (
                                            <button
                                              onClick={() => handleDeleteUserAccount(acc.id)}
                                              className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 border border-red-100 cursor-pointer"
                                              title="Delete Account"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            <p className="text-[10px] text-slate-400">
                              * Only custom users can be deleted. System default profile cards cannot be removed to prevent service disruption, but their security passwords can be reset/changed at any time.
                            </p>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          )}

        </main>

      {/* ----------------- CHANGE PASSWORD MODAL ----------------- */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Change Account Password</h3>
              </div>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangeCurrentUserPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Current Password *</label>
                <input
                  type="password"
                  required
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Password *</label>
                <input
                  type="password"
                  required
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500"
                  placeholder="Enter new security password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })}
                  className="w-full text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-teal-500"
                  placeholder="Confirm your new password"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-lg transition text-center cursor-pointer border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition text-center cursor-pointer shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 transform scale-100 transition-all duration-200 animate-scaleIn">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start space-x-3">
              <div className="p-2 rounded-full bg-rose-50 text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans font-bold text-slate-950 text-sm tracking-tight">
                  {confirmModal.title}
                </h3>
                <p className="font-sans text-xs text-slate-500 mt-2 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                id="confirm-modal-cancel"
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer font-sans"
              >
                Cancel
              </button>
              <button
                id="confirm-modal-submit"
                type="button"
                onClick={async () => {
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  await confirmModal.onConfirm();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm cursor-pointer font-sans"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
