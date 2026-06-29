import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Activity, 
  CloudSun, 
  CloudRain, 
  Cloud, 
  CloudLightning, 
  Sun, 
  Filter, 
  Wrench, 
  Compass, 
  Search, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Layers,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Equipment, LicensedSurveyor, JobSchedule, JobType } from '../types';

interface JobSchedulingBoardProps {
  projects: Project[];
  equipment: Equipment[];
  surveyors: LicensedSurveyor[];
  schedules: JobSchedule[];
  onAddSchedule: (schedule: Omit<JobSchedule, 'id'>) => Promise<any>;
  onUpdateSchedule: (id: string, schedule: Partial<JobSchedule>) => Promise<any>;
  onDeleteSchedule: (id: string) => Promise<any>;
  notify: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  userRole: string | null;
}

export const JobSchedulingBoard: React.FC<JobSchedulingBoardProps> = ({
  projects,
  equipment,
  surveyors,
  schedules,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  notify,
  userRole,
}) => {
  // Navigation & Tabs
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'workloads'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  
  // Date State for Calendar
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 25)); // June 2026

  // Form / Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<JobSchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Form Fields
  const [formProjectId, setFormProjectId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSurveyorId, setFormSurveyorId] = useState('');
  const [formTeamLeader, setFormTeamLeader] = useState('');
  const [formTeamMembersRaw, setFormTeamMembersRaw] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<JobSchedule['status']>('Scheduled');
  const [formSurveyType, setFormSurveyType] = useState<JobType>('Cadastral');
  const [formEquipmentIds, setFormEquipmentIds] = useState<string[]>([]);
  const [formDaerah, setFormDaerah] = useState('Seremban');
  const [formMukim, setFormMukim] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formWeather, setFormWeather] = useState<JobSchedule['weather_condition']>('Sunny');
  const [formGpsBaseline, setFormGpsBaseline] = useState(false);
  const [formBaselineLength, setFormBaselineLength] = useState<number>(1000);

  // Auto-fill form values when project changes
  const handleProjectSelect = (projId: string) => {
    setFormProjectId(projId);
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setFormTitle(`${proj.title} - Fieldwork`);
      setFormSurveyType(proj.job_type);
      setFormDaerah(proj.daerah);
      setFormMukim(proj.mukim);
      if (proj.ls_assigned_id) {
        setFormSurveyorId(proj.ls_assigned_id);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormProjectId('');
    setFormTitle('');
    setFormSurveyorId('');
    setFormTeamLeader('');
    setFormTeamMembersRaw('');
    setFormStartDate('');
    setFormEndDate('');
    setFormStatus('Scheduled');
    setFormSurveyType('Cadastral');
    setFormEquipmentIds([]);
    setFormDaerah('Seremban');
    setFormMukim('');
    setFormNotes('');
    setFormWeather('Sunny');
    setFormGpsBaseline(false);
    setFormBaselineLength(1000);
    setEditingSchedule(null);
  };

  // Open modal for Create
  const handleOpenCreate = (dayNumber?: number) => {
    resetForm();
    if (dayNumber) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(dayNumber).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      setFormStartDate(dateStr);
      setFormEndDate(dateStr);
    } else {
      const todayStr = '2026-06-25';
      setFormStartDate(todayStr);
      setFormEndDate(todayStr);
    }
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (sched: JobSchedule) => {
    setEditingSchedule(sched);
    setFormProjectId(sched.project_id);
    setFormTitle(sched.title);
    setFormSurveyorId(sched.surveyor_id);
    setFormTeamLeader(sched.team_leader);
    setFormTeamMembersRaw(sched.team_members.join(', '));
    setFormStartDate(sched.start_date);
    setFormEndDate(sched.end_date);
    setFormStatus(sched.status);
    setFormSurveyType(sched.survey_type);
    setFormEquipmentIds(sched.equipment_ids || []);
    setFormDaerah(sched.daerah);
    setFormMukim(sched.mukim);
    setFormNotes(sched.notes || '');
    setFormWeather(sched.weather_condition || 'Sunny');
    setFormGpsBaseline(sched.gps_baseline_observed || false);
    setFormBaselineLength(sched.baseline_length_m || 1000);
    setShowModal(true);
  };

  // Save Schedule
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      notify('error', 'Please provide a schedule title.');
      return;
    }
    if (!formStartDate || !formEndDate) {
      notify('error', 'Please specify both start and end dates.');
      return;
    }
    if (new Date(formStartDate) > new Date(formEndDate)) {
      notify('error', 'Start date cannot be after the end date.');
      return;
    }

    const team_members = formTeamMembersRaw
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const payload = {
      project_id: formProjectId,
      title: formTitle,
      surveyor_id: formSurveyorId,
      team_leader: formTeamLeader,
      team_members,
      start_date: formStartDate,
      end_date: formEndDate,
      status: formStatus,
      survey_type: formSurveyType,
      equipment_ids: formEquipmentIds,
      daerah: formDaerah,
      mukim: formMukim,
      notes: formNotes,
      weather_condition: formWeather,
      gps_baseline_observed: formGpsBaseline,
      baseline_length_m: formGpsBaseline ? Number(formBaselineLength) : undefined,
    };

    try {
      if (editingSchedule) {
        await onUpdateSchedule(editingSchedule.id, payload);
        notify('success', `Successfully updated job schedule: "${formTitle}"`);
      } else {
        await onAddSchedule(payload);
        notify('success', `Successfully created fieldwork booking: "${formTitle}"`);
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      notify('error', 'Failed to save job schedule. Please try again.');
    }
  };

  // Delete Schedule
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the schedule: "${title}"?`)) {
      try {
        await onDeleteSchedule(id);
        notify('success', `Deleted job schedule: "${title}"`);
      } catch (err) {
        notify('error', 'Failed to delete schedule.');
      }
    }
  };

  // District options
  const NS_DISTRICTS = [
    'Seremban',
    'Port Dickson',
    'Jelebu',
    'Jempol',
    'Kuala Pilah',
    'Rembau',
    'Tampin'
  ];

  // Weather Icons helper
  const renderWeatherIcon = (weather?: string, size = 16) => {
    switch (weather) {
      case 'Sunny':
        return <Sun className="text-amber-500 fill-amber-100 shrink-0" size={size} />;
      case 'Overcast':
        return <Cloud className="text-slate-400 shrink-0" size={size} />;
      case 'Rainy':
        return <CloudRain className="text-blue-400 shrink-0" size={size} />;
      case 'Stormy':
        return <CloudLightning className="text-indigo-600 shrink-0" size={size} />;
      default:
        return <CloudSun className="text-amber-400 shrink-0" size={size} />;
    }
  };

  // Filtered Schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.team_leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.mukim.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesDistrict = districtFilter === 'All' || s.daerah === districtFilter;
      return matchesSearch && matchesStatus && matchesDistrict;
    });
  }, [schedules, searchQuery, statusFilter, districtFilter]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayOfMonthIndex = useMemo(() => {
    return new Date(year, month, 1).getDay(); // Sunday is 0, Monday is 1, etc.
  }, [year, month]);

  const monthNames = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  // Generate calendar days array
  const calendarGridDays = useMemo(() => {
    const days = [];
    // Padding days from previous month
    for (let i = 0; i < firstDayOfMonthIndex; i++) {
      days.push({ dayNumber: null, currentMonth: false });
    }
    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ dayNumber: i, currentMonth: true });
    }
    return days;
  }, [daysInMonth, firstDayOfMonthIndex]);

  // Get schedules for a specific day of this month
  const getSchedulesForDay = (dayNum: number) => {
    const yearStr = year;
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const fullDateStr = `${yearStr}-${monthStr}-${dayStr}`;

    return schedules.filter(s => {
      // Check if day is between or equal to start and end date
      return fullDateStr >= s.start_date && fullDateStr <= s.end_date;
    });
  };

  // Crew Allocation Overlap Checker
  const crewOverlaps = useMemo(() => {
    const overlaps: { [key: string]: { date: string, type: 'Staff' | 'Equipment', name: string, jobs: string[] }[] } = {};
    
    // Check overlapping dates for Team Leaders, Surveyors, and Equipment
    const dateMap: { 
      [date: string]: { 
        leaders: { [name: string]: string[] }; 
        surveyors: { [id: string]: string[] };
        equip: { [id: string]: string[] } 
      } 
    } = {};

    schedules.forEach(sched => {
      // iterate dates between start and end
      let curr = new Date(sched.start_date);
      const end = new Date(sched.end_date);
      
      while (curr <= end) {
        const dateStr = curr.toISOString().split('T')[0];
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { leaders: {}, surveyors: {}, equip: {} };
        }

        // Leader track
        if (sched.team_leader) {
          if (!dateMap[dateStr].leaders[sched.team_leader]) {
            dateMap[dateStr].leaders[sched.team_leader] = [];
          }
          dateMap[dateStr].leaders[sched.team_leader].push(sched.title);
        }

        // Surveyor track
        if (sched.surveyor_id) {
          if (!dateMap[dateStr].surveyors[sched.surveyor_id]) {
            dateMap[dateStr].surveyors[sched.surveyor_id] = [];
          }
          dateMap[dateStr].surveyors[sched.surveyor_id].push(sched.title);
        }

        // Equipment track
        if (sched.equipment_ids) {
          sched.equipment_ids.forEach(eqId => {
            if (!dateMap[dateStr].equip[eqId]) {
              dateMap[dateStr].equip[eqId] = [];
            }
            dateMap[dateStr].equip[eqId].push(sched.title);
          });
        }

        curr.setDate(curr.getDate() + 1);
      }
    });

    const results: { date: string, type: 'Staff' | 'Equipment', name: string, jobs: string[] }[] = [];

    Object.keys(dateMap).sort().forEach(date => {
      // check leaders
      Object.entries(dateMap[date].leaders).forEach(([leader, jobs]) => {
        if (jobs.length > 1) {
          results.push({ date, type: 'Staff', name: `Crew Leader: ${leader}`, jobs });
        }
      });
      // check surveyors
      Object.entries(dateMap[date].surveyors).forEach(([survId, jobs]) => {
        if (jobs.length > 1) {
          const sName = surveyors.find(s => s.id === survId)?.nama || survId;
          results.push({ date, type: 'Staff', name: `Licensed Surveyor: ${sName}`, jobs });
        }
      });
      // check equipment
      Object.entries(dateMap[date].equip).forEach(([eqId, jobs]) => {
        if (jobs.length > 1) {
          const eqName = equipment.find(e => e.id === eqId)?.nama || eqId;
          results.push({ date, type: 'Equipment', name: `Instrument: ${eqName}`, jobs });
        }
      });
    });

    return results;
  }, [schedules, surveyors, equipment]);

  // Statistics
  const stats = useMemo(() => {
    const active = schedules.filter(s => s.status === 'In_Progress' || s.status === 'Scheduled').length;
    const completed = schedules.filter(s => s.status === 'Completed').length;
    const delayed = schedules.filter(s => s.status === 'Delayed').length;
    
    // Checked out equipment count
    const uniqueEquipCheckedOut = new Set<string>();
    schedules.forEach(s => {
      if (s.status === 'In_Progress' || s.status === 'Scheduled') {
        s.equipment_ids?.forEach(id => uniqueEquipCheckedOut.add(id));
      }
    });

    // GNSS ratio
    const totalCadastralSchedules = schedules.filter(s => s.survey_type === 'Cadastral').length;
    const gnssObserved = schedules.filter(s => s.survey_type === 'Cadastral' && s.gps_baseline_observed).length;

    return {
      active,
      completed,
      delayed,
      equipCheckedOut: uniqueEquipCheckedOut.size,
      totalCadastralSchedules,
      gnssObserved
    };
  }, [schedules]);

  // Check if an equipment is overdue or calibrating
  const getEquipmentStatusAlert = (eqId: string) => {
    const eq = equipment.find(e => e.id === eqId);
    if (!eq) return null;
    if (eq.status !== 'Active') {
      return `Instrument is in ${eq.status} mode.`;
    }
    const today = new Date('2026-06-25');
    const calibDue = new Date(eq.calibration_due_date);
    if (calibDue < today) {
      return `Calibration EXPIRED on ${eq.calibration_due_date}.`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div id="stat-active-schedules" className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bookings</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.active}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Pending & In Progress</p>
          </div>
          <div className="p-3.5 bg-indigo-50 rounded-lg text-indigo-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div id="stat-equip-deployments" className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipment Deployed</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.equipCheckedOut} <span className="text-xs font-normal text-slate-400">/ {equipment.length}</span></h3>
            <p className="text-[10px] text-slate-400 mt-1">GNSS & Robotic Stations in use</p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-lg text-emerald-600">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div id="stat-gnss-baselines" className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Static GNSS Baselines</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.gnssObserved} <span className="text-xs font-normal text-slate-400">/ {stats.totalCadastralSchedules}</span></h3>
            <p className="text-[10px] text-slate-400 mt-1">Pegged & recorded with standard LJT baselines</p>
          </div>
          <div className="p-3.5 bg-amber-50 rounded-lg text-amber-600">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 - Double-booking status */}
        <div id="stat-double-bookings" className={`p-5 border rounded-xl shadow-xs flex items-center justify-between transition-colors ${
          crewOverlaps.length > 0 
            ? 'bg-rose-50 border-rose-200 text-rose-900' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${crewOverlaps.length > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
              Conflicts Detected
            </span>
            <h3 className="text-2xl font-extrabold mt-1">{crewOverlaps.length}</h3>
            <p className="text-[10px] mt-1 opacity-80">
              {crewOverlaps.length > 0 ? 'Overlapping double bookings!' : 'No crew or instrument conflicts'}
            </p>
          </div>
          <div className={`p-3.5 rounded-lg ${
            crewOverlaps.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SYSTEM CREW OVERLAP WARNING PANEL */}
      {crewOverlaps.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3 text-rose-800 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Active Allocation Conflicts Detected</h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-snug">
              Multiple field assignments have been booked for the same staff members or instruments on the same days. Double-check crew availability to prevent site delays.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {crewOverlaps.slice(0, 4).map((conflict, idx) => (
                <div key={idx} className="bg-white/80 border border-rose-100 rounded p-2 text-[11px] flex flex-col">
                  <div className="flex items-center justify-between font-bold text-rose-900">
                    <span>{conflict.name}</span>
                    <span className="font-mono bg-rose-100 px-1 rounded text-[9px]">{conflict.date}</span>
                  </div>
                  <span className="text-slate-500 mt-1">Overlapping jobs:</span>
                  <ul className="list-disc list-inside text-slate-600 ml-1 text-[10px]">
                    {conflict.jobs.map((job, jIdx) => <li key={jIdx} className="truncate">{job}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: WORKSPACE TABS & CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 p-4 gap-4">
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition ${
                viewMode === 'calendar' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendar Grid View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition ${
                viewMode === 'timeline' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gantt / Timeline
            </button>
            <button
              onClick={() => setViewMode('workloads')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition ${
                viewMode === 'workloads' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Crew Workloads
            </button>
          </div>

          {/* District & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team or mukim..."
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>

            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="border border-slate-200 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            >
              <option value="All">All Districts (Semua Daerah)</option>
              {NS_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In_Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Book Button */}
            {(userRole === 'Management' || userRole === 'Project Manager') && (
              <button
                onClick={() => handleOpenCreate()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Book Fieldwork</span>
              </button>
            )}
          </div>
        </div>

        {/* MAIN VIEWS CONTAINER */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* VIEW A: CALENDAR GRID */}
            {viewMode === 'calendar' && (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Month Navigator Header */}
                <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="text-indigo-600 w-5 h-5" />
                    <h3 className="font-extrabold text-slate-800 text-base">
                      {monthNames[month]} {year}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentDate(new Date(year, month - 1, 15))}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(2026, 5, 25))}
                      className="px-3 py-1 text-xs font-bold border border-slate-200 hover:bg-slate-200 rounded text-slate-700 transition"
                    >
                      Reset to June 2026
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date(year, month + 1, 15))}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center py-2">
                    {['SAD', 'ISN', 'SEL', 'RAB', 'KHA', 'JUM', 'SAB'].map((d, idx) => (
                      <span key={idx} className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Dates Grid */}
                  <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                    {calendarGridDays.map((cell, index) => {
                      const daySchedules = cell.dayNumber ? getSchedulesForDay(cell.dayNumber) : [];
                      
                      // Check if matches calendar selection
                      const isToday = cell.dayNumber === 25 && month === 5 && year === 2026;

                      return (
                        <div
                          key={index}
                          className={`min-h-[120px] p-2 flex flex-col transition-colors group ${
                            !cell.currentMonth 
                              ? 'bg-slate-50/55 text-slate-300 pointer-events-none' 
                              : 'bg-white hover:bg-slate-50/40 cursor-pointer'
                          } ${isToday ? 'bg-indigo-50/30 font-bold border-2 border-indigo-400' : ''}`}
                          onClick={() => cell.dayNumber && handleOpenCreate(cell.dayNumber)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              isToday 
                                ? 'bg-indigo-600 text-white font-bold' 
                                : 'text-slate-600 font-semibold'
                            }`}>
                              {cell.dayNumber}
                            </span>
                            {cell.dayNumber && cell.currentMonth && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCreate(cell.dayNumber!);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-indigo-50 rounded text-indigo-600 transition"
                              >
                                <Plus size={12} />
                              </button>
                            )}
                          </div>

                          {/* Day Bookings List */}
                          <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                            {daySchedules.map((s) => {
                              // Type background color
                              let typeBg = 'bg-slate-100 text-slate-800 border-slate-200';
                              if (s.survey_type === 'Cadastral') typeBg = 'bg-teal-50 text-teal-800 border-teal-200';
                              if (s.survey_type === 'Strata') typeBg = 'bg-purple-50 text-purple-800 border-purple-200';
                              if (s.survey_type === 'Topographic') typeBg = 'bg-amber-50 text-amber-800 border-amber-200';
                              if (s.survey_type === 'Engineering') typeBg = 'bg-blue-50 text-blue-800 border-blue-200';

                              return (
                                <div
                                  key={s.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(s);
                                  }}
                                  className={`p-1 rounded text-[9px] font-bold border truncate transition hover:shadow-xs ${typeBg}`}
                                  title={`${s.title} (${s.team_leader})`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate">{s.title}</span>
                                    {renderWeatherIcon(s.weather_condition, 10)}
                                  </div>
                                  <div className="text-[8px] text-slate-500 font-normal mt-0.5 flex items-center space-x-1">
                                    <Users size={8} />
                                    <span className="truncate">{s.team_leader}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-start space-x-2 border border-slate-100">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Malaysia Geomatics Workflow Tip:</strong> Fieldwork scheduling is highly weather-bound. In-progress cadastral static GPS observations require a minimum of 45 minutes baseline tracking per station. Double-clicking on any calendar day will automatically draft a booking for that date.
                  </span>
                </div>
              </motion.div>
            )}

            {/* VIEW B: GANTT / TIMELINE VIEW */}
            {viewMode === 'timeline' && (
              <motion.div
                key="timeline-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="bg-slate-50 p-4 border-b border-slate-200">
                    <h4 className="font-extrabold text-sm text-slate-800">Fieldwork Timeline & Progress Blocks (June/July 2026)</h4>
                    <p className="text-[11px] text-slate-500">Visualization of overlapping team deployments and duration scopes.</p>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <div className="min-w-[800px] space-y-3">
                      {/* Timeline Day Headers */}
                      <div className="grid grid-cols-12 gap-1 border-b border-slate-100 pb-2 text-center">
                        <div className="col-span-3 text-left font-bold text-xs text-slate-500">Job Detail & Team</div>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const dayNum = 20 + idx;
                          return (
                            <div key={idx} className={`text-[10px] font-bold py-1 rounded ${dayNum === 25 ? 'bg-indigo-100 text-indigo-800' : 'text-slate-400'}`}>
                              {dayNum} Jun
                            </div>
                          );
                        })}
                      </div>

                      {/* Timeline rows */}
                      {filteredSchedules.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400 font-medium">
                          No schedules matching the current filters.
                        </div>
                      ) : (
                        filteredSchedules.map((s) => {
                          const sDay = parseInt(s.start_date.split('-')[2]);
                          const eDay = parseInt(s.end_date.split('-')[2]);

                          // Determine visual bar column offsets for June 20-28
                          const startOffset = Math.max(0, sDay - 20);
                          const endOffset = Math.min(8, eDay - 20);
                          const durationCols = Math.max(1, endOffset - startOffset + 1);

                          // Colors matching job category
                          let barColor = 'bg-slate-500';
                          if (s.survey_type === 'Cadastral') barColor = 'bg-teal-500';
                          if (s.survey_type === 'Strata') barColor = 'bg-purple-500';
                          if (s.survey_type === 'Topographic') barColor = 'bg-amber-500';
                          if (s.survey_type === 'Engineering') barColor = 'bg-blue-500';

                          return (
                            <div key={s.id} className="grid grid-cols-12 gap-1 items-center hover:bg-slate-50/50 p-1.5 rounded transition">
                              {/* Job Details col */}
                              <div className="col-span-3 flex flex-col pr-2">
                                <span className="text-xs font-bold text-slate-800 truncate" title={s.title}>{s.title}</span>
                                <div className="flex items-center space-x-1.5 mt-0.5">
                                  <span className="text-[9px] bg-slate-100 border text-slate-600 px-1.5 rounded font-mono font-bold">
                                    {s.survey_type}
                                  </span>
                                  <span className="text-[9px] text-slate-500 truncate font-semibold">
                                    {s.team_leader}
                                  </span>
                                </div>
                              </div>

                              {/* Calendar bar segment */}
                              <div className="col-span-9 relative grid grid-cols-9 h-8 items-center bg-slate-50 rounded-lg border border-slate-100">
                                {/* Bar representation */}
                                <div 
                                  className={`absolute h-6 rounded-md px-2 flex items-center text-[10px] text-white font-extrabold truncate shadow-xs ${barColor}`}
                                  style={{
                                    left: `${(startOffset / 9) * 100}%`,
                                    width: `${(durationCols / 9) * 100}%`,
                                    marginLeft: '2px',
                                    marginRight: '2px',
                                  }}
                                >
                                  <span className="truncate flex items-center space-x-1.5">
                                    {renderWeatherIcon(s.weather_condition, 12)}
                                    <span>{s.status}</span>
                                    {s.gps_baseline_observed && <span className="text-[8px] bg-white/20 px-1 rounded">GNSS</span>}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW C: CREW WORKLOADS GRID */}
            {viewMode === 'workloads' && (
              <motion.div
                key="workloads-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">Technician & Instrument Allocation Register</h4>
                      <p className="text-[11px] text-slate-500">Track which surveyors, leaders, and gear are deployed and check for double assignments.</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                      Live Verification Engine
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {/* Surveyors / Crew Section */}
                    <div className="p-4">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Survey Crews / LLS Leaders</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Static hardcoded list of crews */}
                        {[
                          { name: 'Irwan Shah bin Ramli', title: 'Senior Field Surveyor' },
                          { name: 'Amirul bin Zainuddin', title: 'Survey Assistant' },
                          { name: 'Zulhilmi bin Rosli', title: 'Technical Draftsman' },
                          { name: 'Hafizul bin Mohamad', title: 'Field Assistant' },
                          { name: 'Suresh Kumar a/l Muniandy', title: 'Junior Surveyor' },
                        ].map((staff, idx) => {
                          const staffJobs = schedules.filter(s => 
                            s.team_leader === staff.name || s.team_members.includes(staff.name)
                          );
                          const hasOverlap = staffJobs.length > 1; // Simplistic flag

                          return (
                            <div key={idx} className="border border-slate-100 rounded-lg p-3.5 hover:bg-slate-50/50 transition">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-extrabold text-slate-900 block">{staff.name}</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{staff.title}</span>
                                </div>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                                  hasOverlap 
                                    ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                    : staffJobs.length > 0 
                                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                      : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}>
                                  {hasOverlap ? 'Overlap Risk' : staffJobs.length > 0 ? 'Allocated' : 'Available'}
                                </span>
                              </div>

                              <div className="mt-3 space-y-1.5">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Assigned Site Jobs</span>
                                {staffJobs.length === 0 ? (
                                  <span className="text-[10px] text-slate-400 block italic">No site visits assigned this week</span>
                                ) : (
                                  staffJobs.map(job => (
                                    <div key={job.id} className="flex justify-between items-center text-[10px] bg-white p-1.5 rounded border border-slate-100">
                                      <span className="font-bold text-slate-700 truncate max-w-[65%]">{job.title}</span>
                                      <span className="font-mono text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">
                                        {job.start_date} to {job.end_date}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Instruments Section */}
                    <div className="p-4">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Field Instruments Status</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {equipment.map((eq) => {
                          const eqJobs = schedules.filter(s => s.equipment_ids?.includes(eq.id));
                          const alertMsg = getEquipmentStatusAlert(eq.id);

                          return (
                            <div key={eq.id} className="border border-slate-100 rounded-lg p-3.5 hover:bg-slate-50/50 transition">
                              <div className="flex justify-between items-start">
                                <div className="max-w-[70%]">
                                  <span className="text-xs font-extrabold text-slate-900 block truncate">{eq.nama}</span>
                                  <span className="text-[10px] text-slate-500 font-semibold">{eq.type.replace('_', ' ')} • S/N: {eq.serial_number}</span>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                                    alertMsg 
                                      ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                      : eq.status === 'Active' 
                                        ? 'bg-teal-50 text-teal-600 border-teal-200' 
                                        : 'bg-amber-50 text-amber-600 border-amber-200'
                                  }`}>
                                    {alertMsg ? 'Alert' : eq.status}
                                  </span>
                                </div>
                              </div>

                              {alertMsg && (
                                <div className="mt-2 text-[9px] font-bold text-rose-600 bg-rose-50/50 p-1.5 border border-rose-100 rounded flex items-center space-x-1">
                                  <AlertTriangle size={10} />
                                  <span>{alertMsg}</span>
                                </div>
                              )}

                              <div className="mt-3 space-y-1.5">
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Deployment Schedule</span>
                                {eqJobs.length === 0 ? (
                                  <span className="text-[10px] text-slate-400 block italic">Safe in storage. No checkouts.</span>
                                ) : (
                                  eqJobs.map(job => (
                                    <div key={job.id} className="flex justify-between items-center text-[10px] bg-white p-1.5 rounded border border-slate-100">
                                      <span className="font-bold text-slate-700 truncate max-w-[65%]">{job.title}</span>
                                      <span className="font-mono text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">
                                        {job.start_date} to {job.end_date}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SECTION 3: DETAILED ALL BOOKINGS CARD LIST */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h4 className="font-extrabold text-sm text-slate-800">Fieldwork Job & Static GNSS Registry</h4>
            <p className="text-[11px] text-slate-500">Edit, status-track, or manage existing bookings in the system.</p>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            Showing {filteredSchedules.length} of {schedules.length}
          </span>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchedules.map((s) => {
              // Get related project & client details
              const proj = projects.find(p => p.id === s.project_id);
              const surveyor = surveyors.find(surv => surv.id === s.surveyor_id);

              return (
                <div key={s.id} className="bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-xs transition p-5 flex flex-col justify-between space-y-4">
                  {/* Header info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border ${
                        s.survey_type === 'Cadastral' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        s.survey_type === 'Strata' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        s.survey_type === 'Topographic' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {s.survey_type}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {renderWeatherIcon(s.weather_condition, 14)}
                        <select
                          value={s.status}
                          onChange={(e) => onUpdateSchedule(s.id, { status: e.target.value as any })}
                          className={`text-[10px] font-bold border rounded px-1.5 py-0.5 cursor-pointer focus:outline-none ${
                            s.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            s.status === 'In_Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            s.status === 'Delayed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In_Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2" title={s.title}>
                      {s.title}
                    </h4>

                    {proj && (
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Linked Project: {proj.title}
                      </span>
                    )}
                  </div>

                  {/* Body elements */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center space-x-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>Location:</span>
                      </span>
                      <span className="font-medium text-slate-800">
                        {s.mukim || 'N/A'}, {s.daerah}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center space-x-1">
                        <CalendarIcon size={12} className="text-slate-400" />
                        <span>Dates:</span>
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-800">
                        {s.start_date} to {s.end_date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center space-x-1">
                        <Users size={12} className="text-slate-400" />
                        <span>Leader:</span>
                      </span>
                      <span className="font-semibold text-slate-800">{s.team_leader}</span>
                    </div>

                    {s.team_members && s.team_members.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Helpers:</span>
                        <span className="text-slate-500 truncate max-w-[65%] font-medium" title={s.team_members.join(', ')}>
                          {s.team_members.join(', ')}
                        </span>
                      </div>
                    )}

                    {surveyor && (
                      <div className="flex items-center justify-between border-t border-slate-200/50 pt-1.5 mt-1.5">
                        <span className="font-bold text-slate-500">LLS Inspector:</span>
                        <span className="font-semibold text-slate-800">{surveyor.nama}</span>
                      </div>
                    )}
                  </div>

                  {/* Static GPS details */}
                  {s.gps_baseline_observed && (
                    <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-[10px] flex items-center justify-between text-indigo-900">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <Sparkles size={12} className="text-indigo-600 animate-pulse" />
                        <span>Static GNSS Baseline</span>
                      </div>
                      <span className="font-mono font-bold">
                        {s.baseline_length_m?.toLocaleString() || '1,420'} meters
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {s.notes && (
                    <p className="text-[10px] text-slate-400 italic line-clamp-2 leading-relaxed bg-slate-50/40 p-2 rounded border border-dashed border-slate-200">
                      "{s.notes}"
                    </p>
                  )}

                  {/* Action buttons */}
                  {(userRole === 'Management' || userRole === 'Project Manager') && (
                    <div className="flex space-x-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded py-1.5 text-[11px] font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Edit size={12} />
                        <span>Edit Schedule</span>
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.title)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded px-2 py-1.5 text-[11px] font-bold transition flex items-center justify-center cursor-pointer"
                        title="Cancel/Delete booking"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: BOOKING MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="text-indigo-600" size={20} />
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {editingSchedule ? 'Modify Fieldwork Booking' : 'Book New Fieldwork Site Visit'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Link to Registered Project
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Optional: Link to Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.job_type}] {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Survey Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Surveying Category
                  </label>
                  <select
                    value={formSurveyType}
                    onChange={(e) => setFormSurveyType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Cadastral">Cadastral (Tanah Geran)</option>
                    <option value="Strata">Strata (Highrise/Subdivision)</option>
                    <option value="Topographic">Topographic (Drone/Contours)</option>
                    <option value="Engineering">Engineering (Setting Out/Gridlines)</option>
                  </select>
                </div>

                {/* Booking Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Schedule / Fieldwork Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Lot 452 pegging & baseline survey"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Licensed Surveyor assigned */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Accredited LLS Inspector
                  </label>
                  <select
                    value={formSurveyorId}
                    onChange={(e) => setFormSurveyorId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select LLS Surveyor --</option>
                    {surveyors.map(s => (
                      <option key={s.id} value={s.id}>{s.nama} ({s.license_number})</option>
                    ))}
                  </select>
                </div>

                {/* Weather Logger */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Weather Outlook
                  </label>
                  <select
                    value={formWeather}
                    onChange={(e) => setFormWeather(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Sunny">Sunny / Cerah</option>
                    <option value="Overcast">Overcast / Redup</option>
                    <option value="Rainy">Rainy / Hujan</option>
                    <option value="Stormy">Stormy / Ribut Petir</option>
                  </select>
                </div>

                {/* Team Leader */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Crew Coordinator / Team Leader *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTeamLeader}
                    onChange={(e) => setFormTeamLeader(e.target.value)}
                    placeholder="e.g. Irwan Shah bin Ramli"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    list="staff-suggestions"
                  />
                  <datalist id="staff-suggestions">
                    <option value="Irwan Shah bin Ramli" />
                    <option value="Amirul bin Zainuddin" />
                    <option value="Zulhilmi bin Rosli" />
                    <option value="Hafizul bin Mohamad" />
                    <option value="Suresh Kumar a/l Muniandy" />
                  </datalist>
                </div>

                {/* Team Members */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assistant Survey Crew (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formTeamMembersRaw}
                    onChange={(e) => setFormTeamMembersRaw(e.target.value)}
                    placeholder="e.g. Amirul, Zulhilmi"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daerah (District) *
                  </label>
                  <select
                    value={formDaerah}
                    onChange={(e) => setFormDaerah(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {NS_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Mukim */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mukim (Subdistrict)
                  </label>
                  <input
                    type="text"
                    value={formMukim}
                    onChange={(e) => setFormMukim(e.target.value)}
                    placeholder="e.g. Mukim Rasah"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Booking Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In_Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* GNSS static baseline observations */}
                {formSurveyType === 'Cadastral' && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex flex-col justify-center space-y-2">
                    <label className="flex items-center space-x-2 text-xs font-bold text-indigo-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formGpsBaseline}
                        onChange={(e) => setFormGpsBaseline(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Involves static GNSS observation?</span>
                    </label>
                    {formGpsBaseline && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-indigo-700 font-bold">Baseline Length (m):</span>
                        <input
                          type="number"
                          value={formBaselineLength}
                          onChange={(e) => setFormBaselineLength(Number(e.target.value))}
                          className="w-24 border border-indigo-200 bg-white rounded p-1 text-xs font-mono font-bold"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Equipment Checkout Checklist */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Select Fieldwork Instruments to Check Out
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {equipment.map(eq => {
                    const isChecked = formEquipmentIds.includes(eq.id);
                    const alertMsg = getEquipmentStatusAlert(eq.id);

                    return (
                      <label 
                        key={eq.id} 
                        className={`flex items-start space-x-2.5 p-2 rounded-lg border cursor-pointer transition ${
                          isChecked 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900' 
                            : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormEquipmentIds([...formEquipmentIds, eq.id]);
                            } else {
                              setFormEquipmentIds(formEquipmentIds.filter(id => id !== eq.id));
                            }
                          }}
                          className="rounded text-indigo-600 mt-0.5 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold block truncate">{eq.nama}</span>
                          <span className="text-[9px] text-slate-400 block font-semibold">
                            S/N: {eq.serial_number} • {eq.type.replace('_', ' ')}
                          </span>
                          {alertMsg && (
                            <span className="text-[8px] font-bold text-rose-600 flex items-center space-x-0.5 mt-0.5">
                              <AlertTriangle size={8} />
                              <span className="truncate">{alertMsg}</span>
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Survey Notes / Site Instructions
                </label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Include any special site hazards, landowners' contact details, or local benchmark coordinates."
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg py-2.5 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-xs font-bold transition shadow-md cursor-pointer"
                >
                  {editingSchedule ? 'Save Changes' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
