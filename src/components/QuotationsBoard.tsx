import React, { useState } from 'react';
import { 
  Plus, Search, Trash2, Edit, Eye, Printer, Download, X, Briefcase, 
  AlertTriangle, FileText, Check, ChevronRight, FileSpreadsheet, Calculator, ClipboardList
} from 'lucide-react';
import { Client, Project, Quotation, LicensedSurveyor, RateSheet } from '../types';
import { HMLogo } from './HMLogo';

interface Props {
  clients: Client[];
  surveyors: LicensedSurveyor[];
  projects: Project[];
  quotations: Quotation[];
  setQuotations: React.Dispatch<React.SetStateAction<Quotation[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setActiveTab: (tab: any) => void;
  notify: (type: 'success' | 'error', message: string) => void;
  rateSheets?: RateSheet[];
  activeRateSheetId?: string;
  setActiveRateSheetId?: (id: string) => void;
  setRateSheets?: (sheets: RateSheet[]) => void;
}

export default function QuotationsBoard({
  clients,
  surveyors,
  projects,
  quotations,
  setQuotations,
  setProjects,
  setActiveTab,
  notify,
  rateSheets = [],
  activeRateSheetId = 'default-rate-sheet',
  setActiveRateSheetId,
  setRateSheets
}: Props) {
  // Navigation & Listing state
  const [isCreating, setIsCreating] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Sent' | 'Accepted' | 'Rejected'>('All');
  
  // Document preview settings
  const [previewDocType, setPreviewDocType] = useState<'Quotation' | 'Proposal'>('Quotation');
  const [previewLang, setPreviewLang] = useState<'BM' | 'EN'>('BM');

  const isIframe = () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  };

  // Calculator Form State
  const [table, setTable] = useState<'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII'>('I');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [surveyorId, setSurveyorId] = useState(surveyors[0]?.id || 'ls-1');
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [selectedRateSheetId, setSelectedRateSheetId] = useState<string>(activeRateSheetId);

  // Retrieve active rate sheet based on state
  const activeRateSheet = (rateSheets || []).find(s => s.id === selectedRateSheetId) || (rateSheets && rateSheets[0]) || {
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

  // Table-specific states (compact)
  const [t1Cat, setT1Cat] = useState<'Kediaman' | 'Komersial' | 'Industri'>('Kediaman');
  const [t1Lots, setT1Lots] = useState(3);
  const [t1Area, setT1Area] = useState(2000);
  const [t1BatuBaru, setT1BatuBaru] = useState(8);
  const [t1BatuRefix, setT1BatuRefix] = useState(0);
  const [t1Azimut, setT1Azimut] = useState(250);
  const [t1Digital, setT1Digital] = useState(true);
  const [t1PartyWall, setT1PartyWall] = useState(0);
  const [t1Pegging, setT1Pegging] = useState(false);
  const [t1AsBuilt, setT1AsBuilt] = useState(false);
  const [t1Offset, setT1Offset] = useState(false);

  const [t2Cat, setT2Cat] = useState<'Kediaman' | 'Lain'>('Kediaman');
  const [t2Blocks, setT2Blocks] = useState(1);
  const [t2Units, setT2Units] = useState(120);
  const [t2Accessories, setT2Accessories] = useState(40);
  const [t2CommonArea, setT2CommonArea] = useState(4500);
  const [t2PartyWalls, setT2PartyWalls] = useState(0);
  const [t2SyerSemen, setT2SyerSemen] = useState(false);
  const [t2Sifus, setT2Sifus] = useState(true);
  const [t2LowCost, setT2LowCost] = useState(false);
  const [t2Azimut, setT2Azimut] = useState(0);

  const [t3AreaHa, setT3AreaHa] = useState(2.6);
  const [t3Lots, setT3Lots] = useState(3);
  const [t3BatuBaru, setT3BatuBaru] = useState(12);
  const [t3BatuRefix, setT3BatuRefix] = useState(0);
  const [t3Azimut, setT3Azimut] = useState(800);
  const [t3Digital, setT3Digital] = useState(true);
  const [t3Restricted, setT3Restricted] = useState(false);
  const [t3FixedTime, setT3FixedTime] = useState(false);
  const [t3DistKm, setT3DistKm] = useState(0);

  const [t4AreaHa, setT4AreaHa] = useState(5);
  const [t4Digital, setT4Digital] = useState(true);

  const [t5Length, setT5Length] = useState(100);

  const [t6Lots, setT6Lots] = useState(3);
  const [t6Area, setT6Area] = useState(2000);

  const [t7Method, setT7Method] = useState<'Hourly' | 'Area'>('Hourly');
  const [t7Hours, setT7Hours] = useState(20);
  const [t7AreaHa, setT7AreaHa] = useState(2);

  // Reimbursements
  const [rSiteVisits, setRSiteVisits] = useState(0);
  const [rExpertWitnessDays, setRExpertWitnessDays] = useState(0);
  const [rExpertWitnessCases, setRExpertWitnessCases] = useState(0);
  const [rMileage, setRMileage] = useState(0);
  const [rHotel, setRHotel] = useState(0);
  const [rLinenA1, setRLinenA1] = useState(0);
  const [rLinenA2, setRLinenA2] = useState(0);
  const [rCopies, setRCopies] = useState(0);

  // Calculate live breakdown according to LJT Schedule Rules using selected Rate Sheet
  const calc = () => {
    const items: { label: string; amount: number; desc?: string }[] = [];
    let base = 0, consult = 0, precomp = 0, boundary = 0, area = 0, digital = 0, azimut = 0, add = 0, reimb = 0;

    const sheet = activeRateSheet;

    if (table === 'I') {
      base = sheet.t1BaseFee;
      items.push({ label: 'Bayaran Asas (Table I)', amount: base, desc: 'Fi asas ukuran kadaster bangunan' });
      precomp = Math.max(sheet.t1MinPrecomp, t1Lots * sheet.t1LotRate);
      items.push({ label: `Pelan Pra-Hitungan (Min RM${sheet.t1MinPrecomp.toLocaleString()})`, amount: precomp, desc: `${t1Lots} lot @ RM ${sheet.t1LotRate}/lot` });
      boundary = (t1BatuBaru * sheet.t1BatuBaruRate) + (t1BatuRefix * sheet.t1BatuRefixRate);
      if (boundary > 0) {
        items.push({ 
          label: 'Batu Sempadan', 
          amount: boundary, 
          desc: `${t1BatuBaru} Baru (@RM${sheet.t1BatuBaruRate}), ${t1BatuRefix} Refix (@RM${sheet.t1BatuRefixRate})` 
        });
      }
      
      let baseArea = 0;
      if (t1Area <= 2000) baseArea = Math.max(1000, t1Area * 0.80);
      else if (t1Area <= 10000) baseArea = 1600 + (t1Area - 2000) * 0.60;
      else baseArea = 6400 + (t1Area - 10000) * 0.40;
      
      const multiplier = t1Cat === 'Komersial' ? 1.2 : (t1Cat === 'Industri' ? 1.5 : 1.0);
      area = baseArea * t1Lots * multiplier;
      items.push({ label: `Ukuran Keluasan (${t1Cat})`, amount: area, desc: `${t1Area} sm x ${t1Lots} lot x x${multiplier}` });
      
      consult = (sheet.t1ConsultantPct / 100) * (precomp + boundary + area);
      items.push({ label: `Caj Perundingan (${sheet.t1ConsultantPct}%)`, amount: consult });
      
      if (t1Digital) {
        digital = (sheet.t1DigitalPct / 100) * (precomp + boundary + area);
        items.push({ label: `Digital Data (${sheet.t1DigitalPct}%)`, amount: digital });
      }
      if (t1Azimut > 0) {
        azimut = t1Azimut * sheet.t1AzimutRate;
        items.push({ label: 'Garisan Azimut & Sambungan', amount: azimut, desc: `${t1Azimut}m @ RM ${sheet.t1AzimutRate.toFixed(2)}/m` });
      }
      if (t1PartyWall > 0) {
        add += t1PartyWall * sheet.t1PartyWallRate;
        items.push({ label: 'Party Wall', amount: t1PartyWall * sheet.t1PartyWallRate, desc: `${t1PartyWall} dinding @ RM ${sheet.t1PartyWallRate}` });
      }
      if (t1Pegging) {
        const p = 0.65 * (area + azimut);
        add += p;
        items.push({ label: 'Lot Pegging (65%)', amount: p });
      }
      if (t1AsBuilt) {
        const ab = 0.80 * (area + azimut) + 3800;
        add += ab;
        items.push({ label: 'As-Built & Perakuan', amount: ab, desc: '80% yuran + RM3,800 perakuan' });
      }
      if (t1Offset) {
        const os = 0.80 * (area + azimut);
        add += os;
        items.push({ label: 'Offset Survey (80%)', amount: os });
      }
    } 
    else if (table === 'II') {
      consult = sheet.t2ConsultantMin;
      items.push({ label: 'Caj Perundingan Strata (Min)', amount: consult });
      const jp = t2Units * sheet.t2JadualPetakRate;
      items.push({ label: 'Penyediaan Jadual Petak', amount: jp, desc: `${t2Units} petak @ RM${sheet.t2JadualPetakRate}` });
      const syer = (t2Units * (t2Cat === 'Kediaman' ? 150.00 : 180.00)) + (t2Accessories * 80.00);
      items.push({ label: 'Hak Unit Syer', amount: syer, desc: `${t2Units} petak, ${t2Accessories} aksesori` });
      if (t2Sifus) {
        const s = Math.min(10000, t2Units * 100.00);
        add += s;
        items.push({ label: 'Sijil SiFUS LJT', amount: s });
      }
      if (t2SyerSemen) {
        add += t2Blocks * sheet.t2SyerSemenRate;
        items.push({ label: 'Quantum Unit Syer Sementara', amount: t2Blocks * sheet.t2SyerSemenRate, desc: `RM${sheet.t2SyerSemenRate}/blok` });
      }
      const perkRate = t2LowCost ? sheet.t2LowCostPerakuanRate : (t2Cat === 'Kediaman' ? sheet.t2KediamanPerakuanRate : sheet.t2LainPerakuanRate);
      const perk = t2Blocks * perkRate;
      items.push({ label: 'Perakuan Skim Strata', amount: perk, desc: `RM ${perkRate}/blok x ${t2Blocks}` });
      const sp = (t2Units * 50.00) + (t2Accessories * 30.00);
      items.push({ label: 'Pelan S&P', amount: sp });
      if (t2Azimut > 0) { add += t2Azimut * 6.00; items.push({ label: 'Azimut Strata', amount: t2Azimut * 6.00 }); }
      if (t2PartyWalls > 0) { add += t2PartyWalls * sheet.t2PartyWallRate; items.push({ label: 'Party Wall Strata', amount: t2PartyWalls * sheet.t2PartyWallRate }); }
      if (t2CommonArea > 0) { add += t2CommonArea * sheet.t2CommonAreaRate; items.push({ label: 'Ukuran Harta Bersama', amount: t2CommonArea * sheet.t2CommonAreaRate }); }
    }
    else if (table === 'III') {
      base = sheet.t3BaseFee;
      items.push({ label: 'Bayaran Asas (Table III)', amount: base });
      precomp = Math.max(sheet.t3MinPrecomp, t3Lots * 100);
      items.push({ label: `Pelan Pra-Hitungan (Min RM${sheet.t3MinPrecomp.toLocaleString()})`, amount: precomp });
      boundary = (t3BatuBaru * sheet.t3BatuBaruRate) + (t3BatuRefix * sheet.t3BatuRefixRate);
      if (boundary > 0) items.push({ label: 'Batu Sempadan Pertanian', amount: boundary });
      
      const lotRate = t3AreaHa <= 0.4 ? 740 : (t3AreaHa <= 2.6 ? 2350 : (t3AreaHa <= 20 ? 12500 : 15000));
      area = lotRate * t3Lots;
      items.push({ label: 'Keluasan Pertanian', amount: area, desc: `${t3Lots} lot @ RM ${lotRate} (${t3AreaHa} Ha)` });
      
      if (t3Azimut > 0) {
        azimut = t3Azimut * sheet.t3AzimutRate;
        items.push({ label: 'Garisan Azimut', amount: azimut });
      }
      consult = 0.10 * (precomp + boundary + area + azimut);
      items.push({ label: 'Caj Perundingan (10%)', amount: consult });
      if (t3Digital) {
        digital = 0.20 * (precomp + boundary + area + azimut);
        items.push({ label: 'Digital Data (20%)', amount: digital });
      }
      if (t3Restricted) {
        const r = (sheet.t3RestrictedPct / 100) * (base + consult + boundary + area + azimut);
        add += r;
        items.push({ label: `Kawasan Larangan/Berisiko (+${sheet.t3RestrictedPct}%)`, amount: r });
      }
      if (t3FixedTime) {
        const ft = (sheet.t3FixedTimePct / 100) * (base + consult + boundary + area + azimut);
        add += ft;
        items.push({ label: `Pengiring/Masa Tetap (+${sheet.t3FixedTimePct}%)`, amount: ft });
      }
      if (t3DistKm > 0) {
        const d = (t3DistKm * 0.05) * (base + consult + boundary + area);
        add += d;
        items.push({ label: `Jarak dari Jalan (+5% per km: ${t3DistKm} km)`, amount: d });
      }
    }
    else if (table === 'IV') {
      base = sheet.t4BaseFee;
      area = Math.max(sheet.t4MinAreaFee, t4AreaHa * sheet.t4PerHaRate);
      items.push({ label: 'Bayaran Asas (Table IV)', amount: base });
      items.push({ label: `Keluasan Perlombongan (Min RM${sheet.t4MinAreaFee.toLocaleString()})`, amount: area, desc: `${t4AreaHa} Ha @ RM${sheet.t4PerHaRate}/Ha` });
      if (t4Digital) {
        digital = 0.20 * area;
        items.push({ label: 'Digital Data (20%)', amount: digital });
      }
    }
    else if (table === 'V') {
      area = Math.max(sheet.t5MinFee, t5Length * sheet.t5PerMeterRate);
      items.push({ label: `Underground Tunnel Survey (Min RM${sheet.t5MinFee.toLocaleString()})`, amount: area, desc: `${t5Length}m @ RM ${sheet.t5PerMeterRate}/m` });
    }
    else if (table === 'VI') {
      base = 2600;
      precomp = Math.max(3000, t6Lots * 100);
      const baseArea = t6Area <= 2000 ? Math.max(1000, t6Area * 0.80) : 1600 + (t6Area - 2000) * 0.60;
      area = baseArea * t6Lots;
      items.push({ label: 'Bayaran Asas (Table VI)', amount: base });
      items.push({ label: 'Pra-Hitungan Amalgamasi', amount: precomp });
      items.push({ label: 'Yuran Keluasan Amalgamasi', amount: area });
    }
    else if (table === 'VII') {
      if (t7Method === 'Hourly') {
        area = t7Hours * sheet.t7HourlyRate;
        items.push({ label: 'Kadar Jam Kerja Am LJT', amount: area, desc: `${t7Hours} jam @ RM${sheet.t7HourlyRate}/jam` });
      } else {
        area = t7AreaHa * sheet.t7AreaHaRate;
        items.push({ label: 'Kadar Keluasan Tujuan Khas', amount: area, desc: `${t7AreaHa} Ha @ RM${sheet.t7AreaHaRate}/Ha` });
      }
    }

    // Reimbursements
    if (rSiteVisits > 0) { reimb += rSiteVisits * sheet.rSiteVisitRate; items.push({ label: 'Reimb: Lawatan Tapak / Mesyuarat', amount: rSiteVisits * sheet.rSiteVisitRate, desc: `${rSiteVisits} jam @ RM${sheet.rSiteVisitRate}` }); }
    if (rExpertWitnessDays > 0 || rExpertWitnessCases > 0) {
      const exp = (rExpertWitnessDays * sheet.rExpertDayRate) + (rExpertWitnessCases * sheet.rExpertCaseRate);
      reimb += exp;
      items.push({ label: 'Reimb: Saksi Pakar Mahkamah', amount: exp, desc: `${rExpertWitnessDays} hari (@RM${sheet.rExpertDayRate}), ${rExpertWitnessCases} kes (@RM${sheet.rExpertCaseRate})` });
    }
    if (rMileage > 0) { reimb += rMileage * sheet.rMileageRate; items.push({ label: 'Reimb: Mileage Claims', amount: rMileage * sheet.rMileageRate, desc: `${rMileage} km @ RM${sheet.rMileageRate.toFixed(2)}/km` }); }
    if (rHotel > 0) { reimb += rHotel * sheet.rHotelRate; items.push({ label: 'Reimb: Hotel Stay', amount: rHotel * sheet.rHotelRate, desc: `${rHotel} malam @ RM${sheet.rHotelRate}` }); }
    if (rLinenA1 > 0) { reimb += rLinenA1 * sheet.rLinenA1Rate; items.push({ label: 'Reimb: Cetakan Linen A1', amount: rLinenA1 * sheet.rLinenA1Rate, desc: `${rLinenA1} keping @ RM${sheet.rLinenA1Rate}` }); }
    if (rLinenA2 > 0) { reimb += rLinenA2 * sheet.rLinenA2Rate; items.push({ label: 'Reimb: Cetakan Linen A2', amount: rLinenA2 * sheet.rLinenA2Rate, desc: `${rLinenA2} keping @ RM${sheet.rLinenA2Rate}` }); }
    if (rCopies > 4) { reimb += (rCopies - 4) * sheet.rPaperCopyRate; items.push({ label: 'Reimb: Cetakan Kertas Tambahan', amount: (rCopies - 4) * sheet.rPaperCopyRate, desc: `${rCopies - 4} salinan @ RM${sheet.rPaperCopyRate}` }); }

    const subtotal = base + consult + precomp + boundary + area + digital + azimut + add + reimb;
    const sst = subtotal * 0.06;
    const total = subtotal + sst;

    return { items, subtotal, sst, total };
  };

  const { items: feeItems, subtotal, sst, total } = calc();

  // Save quotation via full-stack endpoint
  const handleSaveQuotation = async () => {
    if (!subject.trim()) {
      notify('error', 'Sila nyatakan tajuk sebut harga.');
      return;
    }
    if (!clientId) {
      notify('error', 'Sila pilih klien.');
      return;
    }

    const payload = {
      client_id: clientId,
      subject,
      amount: subtotal,
      sst_amount: sst,
      total,
      proposal_status: 'Draft' as const,
      // Metadata to recreate/view details
      meta: {
        table,
        surveyorId,
        timelineWeeks,
        feeItems,
        rateSheetId: selectedRateSheetId,
        rateSheetName: activeRateSheet.name
      }
    };

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newQuote = await res.json();
        setQuotations(prev => [newQuote, ...prev]);
        notify('success', 'Sebut Harga LJT berjaya dijana dan disimpan.');
        setIsCreating(false);
      } else {
        notify('error', 'Gagal menyimpan sebut harga ke pelayan.');
      }
    } catch {
      notify('error', 'Ralat rangkaian berlaku.');
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!window.confirm('Adakah anda pasti mahu memadam sebut harga ini?')) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuotations(prev => prev.filter(q => q.id !== id));
        notify('success', 'Sebut harga berjaya dipadam.');
      } else {
        notify('error', 'Gagal memadam dari pelayan.');
      }
    } catch {
      notify('error', 'Ralat rangkaian berlaku.');
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: 'Draft' | 'Sent' | 'Accepted' | 'Rejected') => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal_status: nextStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setQuotations(prev => prev.map(q => q.id === id ? updated : q));
        notify('success', `Status sebut harga dikemaskini kepada "${nextStatus}".`);
      } else {
        notify('error', 'Gagal mengemaskini status.');
      }
    } catch {
      notify('error', 'Ralat rangkaian.');
    }
  };

  // Convert an accepted quotation into an active ERP Project in the Directory
  const handleConvertToProject = async (quote: Quotation) => {
    const client = clients.find(c => c.id === quote.client_id);
    const surveyor = surveyors.find(s => s.id === (quote as any).meta?.surveyorId) || surveyors[0];
    
    const newProjectPayload = {
      title: quote.subject,
      client_id: quote.client_id,
      job_type: (quote as any).meta?.table === 'II' ? 'Strata' : 'Cadastral',
      lot_numbers: 'Sila Nyatakan Lot',
      mukim: client?.mukim || 'Mukim Rasah',
      daerah: client?.daerah || 'Seremban',
      negeri: 'Negeri Sembilan',
      coordinates_wgs84: '2.7258, 101.9423',
      coordinates_cassini: 'Cassini Negeri Sembilan',
      survey_plan_no: 'Pending',
      status: 'Inquiry',
      total_fee: quote.amount,
      sst_amount: quote.sst_amount,
      final_total: quote.total,
      ls_assigned_id: surveyor?.id || 'ls-1',
      chargeable_hours: 0
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjectPayload)
      });
      if (res.ok) {
        const newProj = await res.json();
        setProjects(prev => [newProj, ...prev]);
        notify('success', `Sebut harga berjaya didaftarkan sebagai Projek Aktif ERP! No Projek: ${newProj.id}`);
        setActiveTab('Projects');
      } else {
        notify('error', 'Gagal mendaftar projek.');
      }
    } catch {
      notify('error', 'Ralat rangkaian.');
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.nama || 'Syarikat Tidak Ditemui';
  const getSurveyorName = (id: string) => surveyors.find(s => s.id === id)?.nama || 'Sr Haji Ahmad Rafie';

  return (
    <div className="space-y-6">
      
      {/* 1. ACTION HEADER */}
      {!isCreating && !selectedQuote && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Bina Sebut Harga Resmi LJT</h3>
            <p className="text-xs text-slate-500">Gunakan kalkulator rasmi LJT (Kadar 2026) untuk menghasilkan sebut harga dalam format Bahasa Melayu atau English.</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center space-x-2 shadow-sm transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Bina Sebut Harga Baru</span>
          </button>
        </div>
      )}

      {/* 2. DASHBOARD STATS ROW (Only when list) */}
      {!isCreating && !selectedQuote && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">JUMLAH SEBUT HARGA</span>
            <div className="text-3xl font-extrabold text-[#18181A] my-1">{quotations.length}</div>
            <span className="text-[10px] text-slate-500">Jumlah keseluruhan berdaftar</span>
          </div>
          <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#0CA678] font-bold">DITERIMA (ACCEPTED)</span>
            <div className="text-3xl font-extrabold text-[#0CA678] my-1">
              {quotations.filter(q => q.proposal_status === 'Accepted').length}
            </div>
            <span className="text-[10px] text-slate-500">Telah bertukar menjadi projek</span>
          </div>
          <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#f76707] font-bold">DALAM PROSES (SENT)</span>
            <div className="text-3xl font-extrabold text-[#f76707] my-1">
              {quotations.filter(q => q.proposal_status === 'Sent').length}
            </div>
            <span className="text-[10px] text-slate-500">Menunggu maklum balas klien</span>
          </div>
          <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">NILAI KONTRAK AKTIF</span>
            <div className="text-2xl font-black text-slate-900 my-1">
              RM {quotations.filter(q => q.proposal_status === 'Accepted').reduce((a, b) => a + b.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500">Jumlah nilai projek LJT diluluskan</span>
          </div>
        </div>
      )}

      {/* 2. MAIN LIST VIEW */}
      {!isCreating && !selectedQuote && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:max-w-xs shadow-3xs">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Cari tajuk atau klien..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="text-xs bg-transparent outline-none w-full"
              />
            </div>
            <div className="flex items-center space-x-1">
              {(['All', 'Draft', 'Sent', 'Accepted', 'Rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition ${statusFilter === f ? 'bg-[#18181A] text-white' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-400 font-mono">
                  <th className="p-4">Rujukan / ID</th>
                  <th className="p-4">Butiran Projek / Klien</th>
                  <th className="p-4">Subtotal (RM)</th>
                  <th className="p-4">SST 6% (RM)</th>
                  <th className="p-4">Jumlah Besar (RM)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {quotations
                  .filter(q => {
                    const matchSearch = q.subject.toLowerCase().includes(searchTerm.toLowerCase()) || getClientName(q.client_id).toLowerCase().includes(searchTerm.toLowerCase());
                    const matchStatus = statusFilter === 'All' ? true : q.proposal_status === statusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map(q => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-mono font-bold text-slate-600 uppercase">
                        HMG-QT-{q.id.split('-')[1]?.substring(0, 4) || '2026'}-{q.id.split('-')[1]?.substring(4, 8) || '0124'}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#18181A] text-[13px]">{q.subject}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-tight">{getClientName(q.client_id)}</div>
                      </td>
                      <td className="p-4 font-mono text-slate-700 font-medium">
                        RM {q.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono text-slate-500">
                        RM {q.sst_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono text-slate-900 font-bold">
                        RM {q.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${
                          q.proposal_status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          q.proposal_status === 'Sent' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          q.proposal_status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {q.proposal_status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 p-1.5 rounded-lg transition"
                          title="Lihat & Print"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Status update menu inline */}
                        <select
                          value={q.proposal_status}
                          onChange={e => handleUpdateStatus(q.id, e.target.value as any)}
                          className="text-[10px] font-bold border border-slate-200 rounded-lg p-1 bg-white outline-none cursor-pointer text-slate-700"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        {q.proposal_status === 'Accepted' && (
                          <button
                            onClick={() => handleConvertToProject(q)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition"
                            title="Convert to Project"
                          >
                            Daftar Projek
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteQuotation(q.id)}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition"
                          title="Padam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE 7-TABLE CALCULATOR INTERFACE */}
      {isCreating && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Input Panel */}
          <div className="lg:col-span-7 bg-white border border-slate-200 p-6 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-base font-sans uppercase tracking-tight">Kalkulator Yuran Ukur LJT</h3>
              </div>
              <button 
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* General Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Klien Utama</label>
                <select 
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:border-slate-400 outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Jurukur Berlesen</label>
                <select 
                  value={surveyorId}
                  onChange={e => setSurveyorId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:border-slate-400 outline-none"
                >
                  {surveyors.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.license_number})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Skema Kadar LJT (Rate Sheet)</label>
                <select 
                  value={selectedRateSheetId}
                  onChange={e => setSelectedRateSheetId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white focus:border-teal-500 outline-none font-semibold text-teal-700"
                >
                  {rateSheets.map(sheet => (
                    <option key={sheet.id} value={sheet.id}>{sheet.name} {sheet.id === activeRateSheetId ? '(Sistem)' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Tajuk Projek / Skop Kerja</label>
                <input 
                  type="text" 
                  placeholder="Sila nyatakan skop ukuran (cth: Cadastral Survey of Proposed Lot...)" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-slate-400 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">SST Pajakan / Tempoh Masa (Minggu)</label>
                <input 
                  type="number" 
                  value={timelineWeeks}
                  onChange={e => setTimelineWeeks(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-slate-400 outline-none"
                />
              </div>
            </div>

            {/* LJT TABLE CHOOSER */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Pilih Jadual Kadar Upah LJT</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'I', label: 'T.I - Bangunan' },
                  { key: 'II', label: 'T.II - Strata' },
                  { key: 'III', label: 'T.III - Pertanian' },
                  { key: 'IV', label: 'T.IV - Lombong' },
                  { key: 'V', label: 'T.V - Terowong' },
                  { key: 'VI', label: 'T.VI - Amalgamasi' },
                  { key: 'VII', label: 'T.VII - Am/Khas' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setTable(tab.key as any)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition ${
                      table === tab.key ? 'bg-[#18181A] text-white border-[#18181A]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DYNAMIC FORMS BY JADUAL */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Tetapan Spesifik Jadual {table}</h4>
              
              {table === 'I' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Kategori Bangunan</label>
                    <select value={t1Cat} onChange={e => setT1Cat(e.target.value as any)} className="w-full border p-1.5 bg-white rounded-md">
                      <option value="Kediaman">Kediaman (Standard)</option>
                      <option value="Komersial">Komersial (x1.2)</option>
                      <option value="Industri">Industri (x1.5)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Bilangan Lot</label>
                    <input type="number" value={t1Lots} onChange={e => setT1Lots(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Keluasan Setiap Lot (sm)</label>
                    <input type="number" value={t1Area} onChange={e => setT1Area(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Batu Sempadan Baru (Pcs)</label>
                    <input type="number" value={t1BatuBaru} onChange={e => setT1BatuBaru(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Batu Refix Semula (Pcs)</label>
                    <input type="number" value={t1BatuRefix} onChange={e => setT1BatuRefix(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Garisan Azimut (Meter)</label>
                    <input type="number" value={t1Azimut} onChange={e => setT1Azimut(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Party Wall (Unit)</label>
                    <input type="number" value={t1PartyWall} onChange={e => setT1PartyWall(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  
                  {/* Boolean additions */}
                  <div className="sm:col-span-2 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t1Digital} onChange={e => setT1Digital(e.target.checked)} />
                      <span>Digital Data (20%)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t1Pegging} onChange={e => setT1Pegging(e.target.checked)} />
                      <span>Lot Pegging (65%)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t1AsBuilt} onChange={e => setT1AsBuilt(e.target.checked)} />
                      <span>As-Built (+RM3,800)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t1Offset} onChange={e => setT1Offset(e.target.checked)} />
                      <span>Offset Survey (80%)</span>
                    </label>
                  </div>
                </div>
              )}

              {table === 'II' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Kategori Strata</label>
                    <select value={t2Cat} onChange={e => setT2Cat(e.target.value as any)} className="w-full border p-1.5 bg-white rounded-md">
                      <option value="Kediaman">Kediaman</option>
                      <option value="Lain">Lain (Komersial/Mixed)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Bilangan Blok</label>
                    <input type="number" value={t2Blocks} onChange={e => setT2Blocks(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Bilangan Petak (Parcels)</label>
                    <input type="number" value={t2Units} onChange={e => setT2Units(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Aksesori Petak</label>
                    <input type="number" value={t2Accessories} onChange={e => setT2Accessories(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Luas Harta Bersama (sm)</label>
                    <input type="number" value={t2CommonArea} onChange={e => setT2CommonArea(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Dinding Sempadan (Party Wall)</label>
                    <input type="number" value={t2PartyWalls} onChange={e => setT2PartyWalls(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t2Sifus} onChange={e => setT2Sifus(e.target.checked)} />
                      <span>Sijil SiFUS</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t2SyerSemen} onChange={e => setT2SyerSemen(e.target.checked)} />
                      <span>Unit Syer Sementara</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t2LowCost} onChange={e => setT2LowCost(e.target.checked)} />
                      <span>Skim Kos Rendah</span>
                    </label>
                  </div>
                </div>
              )}

              {table === 'III' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Bilangan Lot Pertanian</label>
                    <input type="number" value={t3Lots} onChange={e => setT3Lots(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Keluasan Setiap Lot (Hektar)</label>
                    <input type="number" step="0.1" value={t3AreaHa} onChange={e => setT3AreaHa(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Batu Sempadan Baru (Pcs)</label>
                    <input type="number" value={t3BatuBaru} onChange={e => setT3BatuBaru(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Garisan Azimut (Meter)</label>
                    <input type="number" value={t3Azimut} onChange={e => setT3Azimut(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Jarak Dari Jalan Raya (km)</label>
                    <input type="number" value={t3DistKm} onChange={e => setT3DistKm(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="sm:col-span-2 grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t3Digital} onChange={e => setT3Digital(e.target.checked)} />
                      <span>Digital Data (20%)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t3Restricted} onChange={e => setT3Restricted(e.target.checked)} />
                      <span>Berbahaya (+25%)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer font-medium">
                      <input type="checkbox" checked={t3FixedTime} onChange={e => setT3FixedTime(e.target.checked)} />
                      <span>Escort needed (+50%)</span>
                    </label>
                  </div>
                </div>
              )}

              {table === 'IV' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Keluasan Lombong (Hektar)</label>
                    <input type="number" value={t4AreaHa} onChange={e => setT4AreaHa(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="flex items-center h-full pt-4">
                    <label className="flex items-center space-x-2 cursor-pointer font-bold">
                      <input type="checkbox" checked={t4Digital} onChange={e => setT4Digital(e.target.checked)} />
                      <span>Sertakan Digital Data (20%)</span>
                    </label>
                  </div>
                </div>
              )}

              {table === 'V' && (
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-mono font-bold text-slate-400">Panjang Galeri/Terowong (Meter)</label>
                  <input type="number" value={t5Length} onChange={e => setT5Length(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md max-w-xs" />
                </div>
              )}

              {table === 'VI' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Bilangan Lot Asal</label>
                    <input type="number" value={t6Lots} onChange={e => setT6Lots(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Luas Lot Asal (sm)</label>
                    <input type="number" value={t6Area} onChange={e => setT6Area(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                  </div>
                </div>
              )}

              {table === 'VII' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400">Kaedah Ukuran</label>
                    <select value={t7Method} onChange={e => setT7Method(e.target.value as any)} className="w-full border p-1.5 bg-white rounded-md">
                      <option value="Hourly">Kadar Jam Bekerja</option>
                      <option value="Area">Kadar Keluasan (Ha)</option>
                    </select>
                  </div>
                  {t7Method === 'Hourly' ? (
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Bilangan Jam Anggaran</label>
                      <input type="number" value={t7Hours} onChange={e => setT7Hours(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-slate-400">Anggaran Keluasan (Hektar)</label>
                      <input type="number" value={t7AreaHa} onChange={e => setT7AreaHa(Number(e.target.value))} className="w-full border p-1.5 bg-white rounded-md" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* REIMBURSEMENT ACCORDION */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Yuran Tuntutan Sebenar (Reimbursements)</h4>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Jadual LJT Penyatuan Am</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Mesyuarat/Site (Jam)</label>
                  <input type="number" value={rSiteVisits} onChange={e => setRSiteVisits(Number(e.target.value))} className="w-full border p-1 rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Tuntutan Mileage (km)</label>
                  <input type="number" value={rMileage} onChange={e => setRMileage(Number(e.target.value))} className="w-full border p-1 rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Hotel (Malam)</label>
                  <input type="number" value={rHotel} onChange={e => setRHotel(Number(e.target.value))} className="w-full border p-1 rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Saksi Pakar (Hari)</label>
                  <input type="number" value={rExpertWitnessDays} onChange={e => setRExpertWitnessDays(Number(e.target.value))} className="w-full border p-1 rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Saksi Pakar (Kes)</label>
                  <input type="number" value={rExpertWitnessCases} onChange={e => setRExpertWitnessCases(Number(e.target.value))} className="w-full border p-1 rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Pelan Linen A1 (Pcs)</label>
                  <input type="number" value={rLinenA1} onChange={e => setRLinenA1(Number(e.target.value))} className="w-full border p-1 rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Pelan Linen A2 (Pcs)</label>
                  <input type="number" value={rLinenA2} onChange={e => setRLinenA2(Number(e.target.value))} className="w-full border p-1 rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Jumlah Salinan Pelan</label>
                  <input type="number" value={rCopies} onChange={e => setRCopies(Number(e.target.value))} className="w-full border p-1 rounded-md" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveQuotation}
                className="flex-1 bg-[#18181A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg shadow-xs transition"
              >
                Simpan & Daftar Rekod
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Batal
              </button>
            </div>

          </div>

          {/* Real-time Invoice & Document Preview Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Fee breakdown */}
            <div className="bg-[#18181A] text-white p-6 rounded-2xl space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Calculator className="w-24 h-24" />
              </div>
              <div className="border-b border-white/10 pb-3">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">LIVE FEE CALCULATOR</span>
                <h4 className="font-extrabold text-white text-sm uppercase tracking-tight">Anggaran Yuran Rasmi LJT</h4>
              </div>

              <div className="space-y-3 text-xs max-h-[300px] overflow-y-auto pr-1">
                {feeItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <div className="space-y-0.5 max-w-[70%]">
                      <p className="font-bold text-slate-200">{item.label}</p>
                      {item.desc && <p className="text-[9px] text-slate-400 font-medium">{item.desc}</p>}
                    </div>
                    <span className="font-mono text-slate-100 font-bold">
                      RM {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-bold">
                  <span>JUMLAH BERSIH (SUBTOTAL)</span>
                  <span className="font-mono">
                    RM {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>SST MALAYSIA (6%)</span>
                  <span className="font-mono">
                    RM {sst.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-base text-white font-black pt-2 border-t border-white/5">
                  <span>JUMLAH BESAR</span>
                  <span className="font-mono text-emerald-400">
                    RM {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Documentation Quick Tips block */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-slate-700">
                <Briefcase className="w-4 h-4" />
                <h5 className="font-bold text-xs uppercase tracking-wider">Peraturan Kadar Ukur LJT</h5>
              </div>
              <ul className="text-[11px] text-slate-500 space-y-2 list-disc pl-4 font-medium leading-relaxed">
                <li>Semua pengiraan tertakluk di bawah <strong>Jadual Upah Ukur LJT Malaysia</strong>.</li>
                <li>Fi Pelan Pra-Hitungan mempunyai had minimum sebanyak <strong>RM 3,000.00</strong> bagi setiap sebut harga.</li>
                <li>Penyediaan data digital wajib disertakan dengan kadar minimum <strong>20%</strong> dari jumlah ukuran primer.</li>
                <li>Tuntutan lawatan tapak dihadkan kepada <strong>RM 2,600.00 sehari</strong>.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* 4. PROFESSIONAL BRANDED DOCUMENT PREVIEW & EXPORT (BM / EN toggle) */}
      {selectedQuote && (
        <div className="space-y-6">
          
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedQuote(null)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition"
              >
                Kembali ke Board
              </button>
              <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setPreviewDocType('Quotation')}
                  className={`px-3 py-1.5 text-xs font-bold transition ${previewDocType === 'Quotation' ? 'bg-[#18181A] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Sebut Harga (Quote)
                </button>
                <button
                  onClick={() => setPreviewDocType('Proposal')}
                  className={`px-3 py-1.5 text-xs font-bold transition ${previewDocType === 'Proposal' ? 'bg-[#18181A] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Kertas Proposal Penuh
                </button>
              </div>
              <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setPreviewLang('BM')}
                  className={`px-3 py-1.5 text-xs font-bold transition ${previewLang === 'BM' ? 'bg-[#18181A] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  BM
                </button>
                <button
                  onClick={() => setPreviewLang('EN')}
                  className={`px-3 py-1.5 text-xs font-bold transition ${previewLang === 'EN' ? 'bg-[#18181A] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (isIframe()) {
                    notify('error', 'Cetak disekat di dalam frame pratonton. Sila klik "Open in new tab" terlebih dahulu!');
                    alert('FUNGSI CETAK DIHADANG DI DALAM IFRAME:\n\nSila buka aplikasi ini dalam Tab Baru terlebih dahulu menggunakan butang "Open in new tab" (ikon anak panah/segiempat di penjuru kanan atas panel pratonton) untuk membolehkan pencetakan atau simpanan PDF berfungsi dengan sempurna.');
                  } else {
                    window.print();
                  }
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg shadow transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>

          {isIframe() && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Notifikasi Sistem (Sekatan Iframe Pelayar)</p>
                  <p className="text-amber-700/95 mt-0.5 font-medium">
                    Fungsi <strong>Cetak / PDF</strong> dihalang secara automatik oleh pelayar web apabila aplikasi ini berjalan di dalam frame pratonton AI Studio.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 rounded px-2.5 py-1 uppercase tracking-wider">
                  Sila Buka Tab Baru
                </span>
              </div>
            </div>
          )}

          {/* Letterhead Container */}
          <div className="bg-white border border-slate-300 p-8 sm:p-12 max-w-4xl mx-auto shadow-md font-sans text-slate-800 leading-relaxed print:border-none print:shadow-none print:p-0">
            
            {/* Elegant Header Letterhead */}
            <div className="border-b-4 border-[#18181A] pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-start space-x-3.5">
                <HMLogo size={52} />
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-[#18181A] tracking-tighter">HMGeomatics Sdn Bhd</h1>
                  <p className="text-[10px] font-mono text-slate-500 font-bold uppercase">LESEN JURU_UKUR TANAH NEGERI SEMBILAN • NO. PENDAFTARAN: LJT/NS/2026/0421</p>
                  <p className="text-xs text-slate-500 font-medium max-w-sm">
                    Seremban, Negeri Sembilan, Malaysia <br />
                    No Telefon: +606-7648321 | Emel: office@hmgeomatics.com
                  </p>
                </div>
              </div>
              <div className="text-right sm:text-right space-y-1.5 text-xs">
                <p className="font-mono font-bold text-slate-900">
                  REF NO: HMG-{previewDocType === 'Quotation' ? 'QT' : 'PROP'}-2026-{selectedQuote.id.split('-')[1]?.substring(0, 4) || '0142'}
                </p>
                <p className="text-slate-500">Tarikh: {new Date(selectedQuote.created_at).toLocaleDateString()}</p>
                <p className="text-slate-500">Tempoh Sah: 30 Hari</p>
              </div>
            </div>

            {/* Client block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 text-xs">
              <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="font-mono font-bold text-slate-400 uppercase text-[9px]">{previewLang === 'BM' ? 'DISEDIAKAN KEPADA:' : 'PREPARED FOR:'}</p>
                <p className="font-bold text-slate-950 text-[13px]">{getClientName(selectedQuote.client_id)}</p>
                <p className="text-slate-600 font-medium">
                  {clients.find(c => c.id === selectedQuote.client_id)?.alamat || 'Alamat Klien'} <br />
                  Mukim: {clients.find(c => c.id === selectedQuote.client_id)?.mukim || 'Mukim Rasah'}
                </p>
              </div>
              <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="font-mono font-bold text-slate-400 uppercase text-[9px]">{previewLang === 'BM' ? 'DISEDIAKAN OLEH:' : 'PREPARED BY:'}</p>
                <p className="font-bold text-slate-950 text-[13px]">{getSurveyorName((selectedQuote as any).meta?.surveyorId)}</p>
                <p className="text-slate-600 font-medium">
                  Licensed Surveyor (Lembaga Jurukur Tanah Malaysia) <br />
                  SST Reg: 6% Service Tax registered.
                </p>
              </div>
            </div>

            {/* Subject / Scope */}
            <div className="my-6 border-b border-slate-200 pb-4">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-1">
                {previewLang === 'BM' ? 'SKOP BEKERJA / SEBUT HARGA PROJEK' : 'SCOPE OF SURVEY / FEE PROPOSAL'}
              </h2>
              <p className="text-xs font-bold text-slate-600">
                {selectedQuote.subject}
              </p>
            </div>

            {/* EXECUTIVE SUMMARY (Only if Proposal) */}
            {previewDocType === 'Proposal' && (
              <div className="my-6 space-y-3 text-xs leading-relaxed font-medium text-slate-600 border-b border-slate-200 pb-6">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                  {previewLang === 'BM' ? '1. RINGKASAN EKSEKUTIF' : '1. EXECUTIVE SUMMARY'}
                </h3>
                {previewLang === 'BM' ? (
                  <p>
                    HMGeomatics Sdn Bhd dengan sukacitanya membentangkan cadangan teknikal dan yuran ukuran bagi melaksanakan ukuran kadaster mengikut akta yang ditetapkan. Kami adalah firma jurukur berlesen di Negeri Sembilan dengan reputasi tinggi dalam khidmat kawalan sempadan, Strata, dan Topografi. Skop ukuran dicadangkan akan diketuai oleh Sr Haji Ahmad Rafie bin Mokhtar, disokong oleh peralatan GNSS Leica GS18 T dan Trimble Total Station.
                  </p>
                ) : (
                  <p>
                    HMGeomatics Sdn Bhd is pleased to present this technical and financial survey proposal to perform cadastral boundary and engineering surveys as requested. As a premium accredited land surveying firm in Negeri Sembilan, we guarantee high compliance with the LJT board regulations. The field work will be supervised directly by our accredited licensed surveyor using high-precision Trimble instrumentation.
                  </p>
                )}

                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider pt-2">
                  {previewLang === 'BM' ? '2. JADUAL MILESTONE PROJEK' : '2. PROJECT TIMELINE & MILESTONES'}
                </h3>
                <table className="w-full text-left border-collapse border border-slate-200 my-2">
                  <thead>
                    <tr className="bg-slate-50 text-[9px] font-bold text-slate-500 uppercase border-b border-slate-200">
                      <th className="p-2 border-r border-slate-200">Milestone Phase</th>
                      <th className="p-2">Duration (Weeks)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 font-bold">1. Mobilization & Field Survey</td>
                      <td className="p-2">2 - 3 Weeks</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 font-bold">2. Calculation & Drafting Plans</td>
                      <td className="p-2">1 - 2 Weeks</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 font-bold">3. JUPEM Submission & Approval</td>
                      <td className="p-2">3 - 4 Weeks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Fee table */}
            <div className="my-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">
                  {previewDocType === 'Quotation' ? 
                    (previewLang === 'BM' ? 'PECAHAN ANGGARAN YURAN UKUR LJT' : 'LJT OFFICIAL SURVEY FEE BREAKDOWN') :
                    (previewLang === 'BM' ? '3. RINGKASAN KEWANGAN CADANGAN PROPOSAL' : '3. FINANCIAL PROPOSAL BREAKDOWN')
                  }
                </h3>
                {((selectedQuote as any).meta?.rateSheetName) && (
                  <span className="text-[9px] text-teal-700 bg-teal-50 border border-teal-100 rounded px-2 py-0.5 font-bold uppercase tracking-wide">
                    {previewLang === 'BM' ? 'Skema Kadar: ' : 'Rate Sheet: '}
                    {(selectedQuote as any).meta.rateSheetName}
                  </span>
                )}
              </div>
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase text-[9px]">
                    <th className="p-3 border-r border-slate-200">{previewLang === 'BM' ? 'Deskripsi Perkhidmatan Ukur' : 'Survey Service Description'}</th>
                    <th className="p-3 text-right">{previewLang === 'BM' ? 'Jumlah (RM)' : 'Amount (RM)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {((selectedQuote as any).meta?.feeItems || []).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 border-r border-slate-200 font-semibold">
                        <div>{item.label}</div>
                        {item.desc && <div className="text-[10px] text-slate-400 mt-0.5 font-normal">{item.desc}</div>}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700">
                        RM {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {((selectedQuote as any).meta?.feeItems || []).length === 0 && (
                    <tr>
                      <td className="p-3 border-r border-slate-200 font-semibold">Bayaran standard sebut harga</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-700">
                        RM {selectedQuote.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                    <td className="p-3 text-right border-r border-slate-200 uppercase tracking-tight text-[10px] text-slate-500">
                      {previewLang === 'BM' ? 'YURAN BERSIH (SUBTOTAL)' : 'SUBTOTAL SURVEY FEES'}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-900 text-sm">
                      RM {selectedQuote.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="p-3 text-right border-r border-slate-200 uppercase tracking-tight text-[10px] text-slate-500">
                      {previewLang === 'BM' ? 'CUKAI PERKHIDMATAN SST MALAYSIA (6%)' : 'SST 6% SERVICE TAX'}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500 text-sm">
                      RM {selectedQuote.sst_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-[#18181A] text-white font-black border-t-2 border-slate-950">
                    <td className="p-3 text-right border-r border-white/10 uppercase tracking-tight text-[10px] text-slate-300">
                      {previewLang === 'BM' ? 'JUMLAH BESAR SEBUT HARGA' : 'GRAND TOTAL PAYABLE'}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400 text-base">
                      RM {selectedQuote.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Terms and conditions */}
            <div className="my-8 text-[11px] leading-relaxed font-medium text-slate-500 space-y-2 border-t border-slate-200 pt-6">
              <p className="font-bold text-slate-900 uppercase text-[10px]">
                {previewLang === 'BM' ? 'TERMA DAN SYARAT PEMBAYARAN LJT:' : 'PAYMENT TERMS & LJT LEGISLATION:'}
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>
                  {previewLang === 'BM' ? 
                    'Deposit 50% wajib didepositkan sejurus selepas penerimaan sebut harga sebelum kerja lapangan bermula.' : 
                    'A 50% mobilization deposit is strictly required upon official quote acceptance before field work can commence.'
                  }
                </li>
                <li>
                  {previewLang === 'BM' ? 
                    'Bayaran baki 50% hendaklah dilunaskan dalam tempoh 14 hari selepas pelan akui PA disiapkan atau diserahkan.' : 
                    'The remaining 50% balance shall be payable within 14 days upon delivery of certified plans.'
                  }
                </li>
                <li>Semua kadar dikawal selia di bawah Akta Jurukur Tanah Berlesen 1958.</li>
              </ol>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-12 text-xs">
              <div className="space-y-16">
                <p className="text-slate-500 uppercase tracking-wider text-[10px]">
                  {previewLang === 'BM' ? 'PENGAKUAN JURU_UKUR BERLESEN:' : 'LICENSED LAND SURVEYOR APPROVAL:'}
                </p>
                <div className="space-y-1 border-t border-slate-300 pt-2">
                  <p className="font-bold text-slate-900">{getSurveyorName((selectedQuote as any).meta?.surveyorId)}</p>
                  <p className="text-slate-500 font-mono text-[10px]">
                    {surveyors.find(s => s.id === (selectedQuote as any).meta?.surveyorId)?.license_number || 'LLS/NS/2026/0421'}
                  </p>
                  <p className="font-bold text-slate-400 uppercase text-[9px]">HMGeomatics Sdn Bhd Stamp</p>
                </div>
              </div>
              <div className="space-y-16">
                <p className="text-slate-500 uppercase tracking-wider text-[10px]">
                  {previewLang === 'BM' ? 'PENERIMAAN KLIEN / COP RASMI:' : 'CLIENT ACCEPTANCE & SIGN-OFF:'}
                </p>
                <div className="space-y-1 border-t border-slate-300 pt-2">
                  <p className="text-slate-400 italic">Signature / Cop Syarikat</p>
                  <p className="text-slate-500 text-[10px]">{previewLang === 'BM' ? 'Tarikh Kelulusan Klien:' : 'Client Approval Date:'}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
