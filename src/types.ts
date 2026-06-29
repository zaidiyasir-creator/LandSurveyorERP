/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string;
  nama: string;
  mykad_roc: string;
  email: string;
  telefon: string;
  alamat: string;
  mukim: string;
  daerah: string;
  negeri: string;
  poa_ref: string; // Power of Attorney Reference
  created_at: string;
}

export type JobType = 'Cadastral' | 'Strata' | 'Topographic' | 'Engineering';

export interface Project {
  id: string;
  title: string;
  client_id: string;
  job_type: JobType;
  lot_numbers: string; // e.g., Lot 4502, Lot 4503
  mukim: string; // e.g., Mukim Rasah, Mukim Ampangan
  daerah: string; // e.g., Seremban, Port Dickson
  negeri: string; // e.g., Negeri Sembilan
  coordinates_wgs84: string; // Lat/Lng e.g. "2.7258, 101.9423"
  coordinates_cassini: string; // Cassini Easting/Northing e.g. "E: 421000, N: 301000"
  survey_plan_no: string; // e.g., PA 89210
  status: 'Inquiry' | 'Field_Work' | 'Computation' | 'JUPEM_Submission' | 'Completed';
  total_fee: number;
  sst_amount: number; // 8% SST
  final_total: number;
  ls_assigned_id: string; // Licensed Surveyor ID
  chargeable_hours: number;
  created_at: string;
}

export interface Submission {
  id: string;
  project_id: string;
  submission_date: string;
  reference_number: string; // e.g., JUPEM.NS.120/12/2026
  status: 'Draft' | 'Submitted' | 'Query' | 'Approved';
  dc_do_forms: boolean; // DC & DO forms received
  remarks: string;
}

export interface Equipment {
  id: string;
  nama: string;
  type: 'GPS_GNSS' | 'Total_Station' | 'Drone' | 'Vehicle';
  serial_number: string;
  calibration_due_date: string;
  cert_validity_date: string;
  status: 'Active' | 'Calibrating' | 'Maintenance' | 'Retired';
  assigned_staff: string;
}

export interface Payroll {
  id: string;
  employee_name: string;
  designation: string;
  month: string; // e.g., "2026-06"
  base_salary: number;
  epf_employer: number;
  epf_employee: number;
  socso_employer: number;
  socso_employee: number;
  eis_employer: number;
  eis_employee: number;
  pcb: number; // Monthly tax deduction (LHDN)
  net_salary: number;
  status: 'Draft' | 'Approved' | 'Paid';
}

export interface BoundaryDispute {
  id: string;
  dispute_type: 'Boundary_Encroachment' | 'Overlap_Claim' | 'Right_of_Way' | 'Land_Office_Dispute';
  court_case_ref: string; // Court Case or Gazetted Notice Ref
  project_id: string;
  opposing_party: string;
  hearing_dates: string;
  status: 'Investigation' | 'Hearing_Pending' | 'Resolved' | 'Court_Appeal';
  remarks: string;
}

export interface Quotation {
  id: string;
  client_id: string;
  subject: string;
  amount: number;
  sst_amount: number;
  total: number;
  proposal_status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  created_at: string;
}

export interface LicensedSurveyor {
  id: string;
  nama: string;
  license_number: string; // e.g., LLS 0542
  renewal_date: string;
  pii_membership_no: string; // PII Membership number
  chargeable_rate: number; // RM per hour
}

export interface RateSheet {
  id: string;
  name: string;
  isDefault: boolean;
  // Table I (Buildings)
  t1BaseFee: number;
  t1MinPrecomp: number;
  t1LotRate: number;
  t1BatuBaruRate: number;
  t1BatuRefixRate: number;
  t1AzimutRate: number;
  t1PartyWallRate: number;
  t1ConsultantPct: number; // e.g. 10 for 10%
  t1DigitalPct: number;    // e.g. 20 for 20%
  // Table II (Strata)
  t2ConsultantMin: number;
  t2JadualPetakRate: number;
  t2LowCostPerakuanRate: number;
  t2KediamanPerakuanRate: number;
  t2LainPerakuanRate: number;
  t2SyerSemenRate: number;
  t2CommonAreaRate: number;
  t2PartyWallRate: number;
  // Table III (Agricultural)
  t3BaseFee: number;
  t3MinPrecomp: number;
  t3BatuBaruRate: number;
  t3BatuRefixRate: number;
  t3AzimutRate: number;
  t3RestrictedPct: number; // e.g. 25 for 25%
  t3FixedTimePct: number;   // e.g. 50 for 50%
  // Table IV (Mining)
  t4BaseFee: number;
  t4MinAreaFee: number;
  t4PerHaRate: number;
  // Table V (Tunnel)
  t5MinFee: number;
  t5PerMeterRate: number;
  // Table VII (General)
  t7HourlyRate: number;
  t7AreaHaRate: number;
  // Reimbursements
  rSiteVisitRate: number;
  rExpertDayRate: number;
  rExpertCaseRate: number;
  rMileageRate: number;
  rHotelRate: number;
  rLinenA1Rate: number;
  rLinenA2Rate: number;
  rPaperCopyRate: number;
}

export interface Leave {
  id: string;
  employee_name: string;
  leave_type: 'Annual' | 'Medical' | 'Emergency' | 'Unpaid' | 'Maternity/Paternity';
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_name: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  status: 'On_Time' | 'Late' | 'Absent' | 'Half_Day';
  location?: string;
  remarks?: string;
}

export interface JobSchedule {
  id: string;
  project_id: string;
  title: string;
  surveyor_id: string; // Licensed Surveyor or lead engineer
  team_leader: string; // Lead technician / Field coordinator
  team_members: string[]; // List of helper technicians
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  status: 'Scheduled' | 'In_Progress' | 'Completed' | 'Delayed' | 'Cancelled';
  survey_type: JobType;
  equipment_ids: string[]; // List of calibration equipment used
  daerah: string; // e.g. Seremban, Port Dickson, Jelebu, Jempol, Kuala Pilah, Rembau, Tampin
  mukim: string;
  notes?: string;
  weather_condition?: 'Sunny' | 'Rainy' | 'Overcast' | 'Stormy';
  gps_baseline_observed?: boolean; // GNSS static survey specific
  baseline_length_m?: number; // Distance in meters
}


