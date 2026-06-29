/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Project, Submission, Equipment, Payroll, BoundaryDispute, Quotation, LicensedSurveyor } from '../types';

export const SEED_SURVEYORS: LicensedSurveyor[] = [
  {
    id: 'ls-1',
    nama: 'Sr Haji Ahmad Rafie bin Mokhtar',
    license_number: 'LLS/NS/2026/0421',
    renewal_date: '2027-03-31',
    pii_membership_no: 'PII-9423M',
    chargeable_rate: 350,
  },
  {
    id: 'ls-2',
    nama: 'Sr Lee Xian Sheng',
    license_number: 'LLS/NS/2025/0812',
    renewal_date: '2027-06-30',
    pii_membership_no: 'PII-10256M',
    chargeable_rate: 300,
  }
];

export const SEED_CLIENTS: Client[] = [
  {
    id: 'client-1',
    nama: 'Seremban Heights Development Sdn Bhd',
    mykad_roc: '199801048291 (458291-K)',
    email: 'projects@serembanheights.com.my',
    telefon: '+606-7648321',
    alamat: 'Level 5, Wisma Heights, Jalan Jati, 70000 Seremban, Negeri Sembilan',
    mukim: 'Mukim Rasah',
    daerah: 'Seremban',
    negeri: 'Negeri Sembilan',
    poa_ref: 'POA-NS-2026-901',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'client-2',
    nama: 'Encik Kamaruddin bin Awang',
    mykad_roc: '620815-05-5231',
    email: 'kamaruddin62@gmail.com',
    telefon: '+6012-3456789',
    alamat: 'No. 42, Lorong Cempaka 3, Taman Cempaka, 71000 Port Dickson, Negeri Sembilan',
    mukim: 'Mukim Si Rusa',
    daerah: 'Port Dickson',
    negeri: 'Negeri Sembilan',
    poa_ref: 'POA-PD-2026-042',
    created_at: '2026-03-10T11:30:00Z',
  },
  {
    id: 'client-3',
    nama: 'Simen Teras Maju Sdn Bhd',
    mykad_roc: '201202094211 (1004211-T)',
    email: 'land-admin@simenteras.com',
    telefon: '+606-6791244',
    alamat: 'Lot 102, Kawasan Perindustrian Senawang, 70450 Seremban, Negeri Sembilan',
    mukim: 'Mukim Ampangan',
    daerah: 'Seremban',
    negeri: 'Negeri Sembilan',
    poa_ref: 'N/A',
    created_at: '2026-04-01T14:15:00Z',
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'project-1',
    title: 'Boundary Subdivision & Residential Lots Seremban Heights (Phase 4B)',
    client_id: 'client-1',
    job_type: 'Cadastral',
    lot_numbers: 'Lot 10452 to Lot 10480',
    mukim: 'Mukim Rasah',
    daerah: 'Seremban',
    negeri: 'Negeri Sembilan',
    coordinates_wgs84: '2.6942, 101.9125',
    coordinates_cassini: 'N: 14210.54, E: 8492.32 (Cassini Negeri Sembilan)',
    survey_plan_no: 'PA 92104',
    status: 'JUPEM_Submission',
    total_fee: 45000,
    sst_amount: 3600,
    final_total: 48600,
    ls_assigned_id: 'ls-1',
    chargeable_hours: 48.5,
    created_at: '2026-01-20T08:30:00Z',
  },
  {
    id: 'project-2',
    title: 'Strata Survey of Nilai Boulevard Condominiums (Block A & B)',
    client_id: 'client-1',
    job_type: 'Strata',
    lot_numbers: 'Lot 24500 (GRN 48291)',
    mukim: 'Mukim Labu',
    daerah: 'Seremban',
    negeri: 'Negeri Sembilan',
    coordinates_wgs84: '2.8124, 101.7941',
    coordinates_cassini: 'N: 24590.11, E: -4290.45 (Cassini Negeri Sembilan)',
    survey_plan_no: 'PA 95400',
    status: 'Field_Work',
    total_fee: 120000,
    sst_amount: 9600,
    final_total: 129600,
    ls_assigned_id: 'ls-2',
    chargeable_hours: 112,
    created_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 'project-3',
    title: 'Boundary Re-establishment of Kampung Baru Rasah Lot 42',
    client_id: 'client-2',
    job_type: 'Cadastral',
    lot_numbers: 'Lot 42',
    mukim: 'Mukim Rasah',
    daerah: 'Seremban',
    negeri: 'Negeri Sembilan',
    coordinates_wgs84: '2.7121, 101.9314',
    coordinates_cassini: 'N: 12340.21, E: 9020.12 (Cassini Negeri Sembilan)',
    survey_plan_no: 'PA 82194',
    status: 'Completed',
    total_fee: 4200,
    sst_amount: 336,
    final_total: 4536,
    ls_assigned_id: 'ls-1',
    chargeable_hours: 12.0,
    created_at: '2026-03-12T10:00:00Z',
  },
  {
    id: 'project-4',
    title: 'Topographic & Utility Survey for Senawang Quarry expansion',
    client_id: 'client-3',
    job_type: 'Topographic',
    lot_numbers: 'Lot 918 (Quarry Area)',
    mukim: 'Mukim Ampangan',
    daerah: 'Seremban',
    negeri: 'Negeri Sembilan',
    coordinates_wgs84: '2.6841, 101.9892',
    coordinates_cassini: 'N: 10420.15, E: 12940.88 (Cassini Negeri Sembilan)',
    survey_plan_no: 'N/A (Topo Map)',
    status: 'Computation',
    total_fee: 18500,
    sst_amount: 1480,
    final_total: 19980,
    ls_assigned_id: 'ls-2',
    chargeable_hours: 34.5,
    created_at: '2026-04-05T09:30:00Z',
  }
];

export const SEED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    project_id: 'project-1',
    submission_date: '2026-05-10',
    reference_number: 'JUPEM.NS.240/12/2026/L4',
    status: 'Submitted',
    dc_do_forms: true,
    remarks: 'Submitted to JUPEM NS via JUPEM e-Kadar. Pending Certified Plan review.',
  },
  {
    id: 'sub-2',
    project_id: 'project-3',
    submission_date: '2026-04-01',
    reference_number: 'JUPEM.NS.110/05/2026/S1',
    status: 'Approved',
    dc_do_forms: true,
    remarks: 'Certified Plan approved. Plan No: PA 82194. Certificate issued by the Director of Mapping.',
  }
];

export const SEED_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1',
    nama: 'Leica GS18 T GNSS SmartAntenna',
    type: 'GPS_GNSS',
    serial_number: 'GS18-829104',
    calibration_due_date: '2026-12-15',
    cert_validity_date: '2026-12-14',
    status: 'Active',
    assigned_staff: 'Irwan Shah bin Ramli',
  },
  {
    id: 'eq-2',
    nama: 'Trimble S7 1" Robotic Total Station',
    type: 'Total_Station',
    serial_number: 'TS7-9321045',
    calibration_due_date: '2026-05-10', // Calibration overdue/passed for testing UI
    cert_validity_date: '2026-05-09',
    status: 'Calibrating',
    assigned_staff: 'Amirul bin Zainuddin',
  },
  {
    id: 'eq-3',
    nama: 'DJI Matrice 350 RTK + Zenmuse P1',
    type: 'Drone',
    serial_number: 'M350-RTK-59218',
    calibration_due_date: '2026-08-30',
    cert_validity_date: '2026-08-29',
    status: 'Active',
    assigned_staff: 'Sr Lee Xian Sheng',
  },
  {
    id: 'eq-4',
    nama: 'Toyota Hilux 2.4G (Field Vehicle)',
    type: 'Vehicle',
    serial_number: 'WXE 9421 (Plate)',
    calibration_due_date: '2026-10-10', // Puspakom inspection due
    cert_validity_date: '2026-10-09',
    status: 'Active',
    assigned_staff: 'Survey Team Alpha',
  }
];

export const SEED_PAYROLL: Payroll[] = [
  {
    id: 'pay-1',
    employee_name: 'Irwan Shah bin Ramli',
    designation: 'Senior Survey Assistant',
    month: '2026-06',
    base_salary: 3800,
    epf_employer: 494, // 13%
    epf_employee: 418, // 11%
    socso_employer: 66.50, // approx 1.75% max tier
    socso_employee: 19.00, // approx 0.5% max tier
    eis_employer: 7.60,
    eis_employee: 7.60,
    pcb: 145.20, // Jadual PCB MTD
    net_salary: 3210.20, // 3800 - 418 - 19.00 - 7.60 - 145.20
    status: 'Paid',
  },
  {
    id: 'pay-2',
    employee_name: 'Amirul bin Zainuddin',
    designation: 'Survey Assistant',
    month: '2026-06',
    base_salary: 2800,
    epf_employer: 364,
    epf_employee: 308,
    socso_employer: 49.00,
    socso_employee: 14.00,
    eis_employer: 5.60,
    eis_employee: 5.60,
    pcb: 45.00,
    net_salary: 2427.40,
    status: 'Approved',
  },
  {
    id: 'pay-3',
    employee_name: 'Faridah binti Abdul Rahman',
    designation: 'Finance & HR Administrator',
    month: '2026-06',
    base_salary: 4200,
    epf_employer: 546,
    epf_employee: 462,
    socso_employer: 73.50,
    socso_employee: 21.00,
    eis_employer: 8.40,
    eis_employee: 8.40,
    pcb: 185.50,
    net_salary: 3523.10,
    status: 'Draft',
  }
];

export const SEED_DISPUTES: BoundaryDispute[] = [
  {
    id: 'disp-1',
    dispute_type: 'Boundary_Encroachment',
    court_case_ref: 'GN-NS-48291-2026',
    project_id: 'project-3',
    opposing_party: 'Syarikat Pembinaan Rasah Sdn Bhd',
    hearing_dates: '2026-07-14 (Seremban Land Office)',
    status: 'Hearing_Pending',
    remarks: 'Dispute over Lot 42 boundary stone in Mukim Rasah relocated by the neighboring construction contractor. HMGeomatics supplied the authentic Certified Plan.',
  }
];

export const SEED_QUOTATIONS: Quotation[] = [
  {
    id: 'quote-1',
    client_id: 'client-1',
    subject: 'Quotation for Cadastral Survey of Proposed Mixed Development at Labu',
    amount: 145000,
    sst_amount: 11600,
    total: 156600,
    proposal_status: 'Accepted',
    created_at: '2026-05-01T10:00:00Z',
  },
  {
    id: 'quote-2',
    client_id: 'client-3',
    subject: 'Fee Proposal for Boundary Re-establishment at Kawasan Perindustrian Senawang',
    amount: 8500,
    sst_amount: 680,
    total: 9180,
    proposal_status: 'Sent',
    created_at: '2026-06-15T11:00:00Z',
  }
];
