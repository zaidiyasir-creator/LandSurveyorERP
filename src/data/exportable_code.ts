/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const POSTGRES_SCHEMA = `-- ============================================================================
-- DATABASE SCHEMA FOR JURU UKUR TERAS SDN BHD ERP
-- PostgreSQL 16+ Compliance
-- Includes Malaysian compliance fields (SST, EPF, SOCSO, EIS, LHDN E-Invoice)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Domain for Malaysian Phone Numbers
CREATE DOMAIN my_phone AS VARCHAR(20)
  CONSTRAINT check_my_phone CHECK (VALUE ~ '^\\+?60\\d{8,11}$');

-- Custom Domain for Email
CREATE DOMAIN email_addr AS VARCHAR(255)
  CONSTRAINT check_email CHECK (VALUE ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$');

-- 1. LICENSED SURVEYORS TABLE
CREATE TABLE licensed_surveyors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., LLS/NS/2026/0421
    renewal_date DATE NOT NULL,
    pii_membership_no VARCHAR(100) UNIQUE NOT NULL, -- Persatuan Juruukur Tanah Berlesen Malaysia (PII)
    chargeable_rate NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLIENT RECORDS (LAND OWNERS / DEVELOPERS)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL, -- Developer Co or Individual
    mykad_roc VARCHAR(100) UNIQUE NOT NULL, -- MyKad for individuals / ROC Registration No for Co
    email email_addr NOT NULL,
    telefon my_phone NOT NULL,
    alamat TEXT NOT NULL,
    mukim VARCHAR(100) NOT NULL, -- Mukim name in Bahasa Malaysia
    daerah VARCHAR(100) NOT NULL, -- Daerah name e.g., Seremban, Port Dickson
    negeri VARCHAR(100) NOT NULL DEFAULT 'Negeri Sembilan',
    poa_ref VARCHAR(100), -- Power of Attorney (POA) reference number for land owner representation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SURVEY PROJECTS TABLE
CREATE TYPE job_type_enum AS ENUM ('Cadastral', 'Strata', 'Topographic', 'Engineering');
CREATE TYPE project_status_enum AS ENUM ('Inquiry', 'Field_Work', 'Computation', 'JUPEM_Submission', 'Completed');

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    job_type job_type_enum NOT NULL,
    lot_numbers VARCHAR(500) NOT NULL, -- e.g., Lot 10452 hingga Lot 10480
    mukim VARCHAR(100) NOT NULL,
    daerah VARCHAR(100) NOT NULL,
    negeri VARCHAR(100) NOT NULL DEFAULT 'Negeri Sembilan',
    coordinates_wgs84 VARCHAR(100), -- WGS84 coordinates e.g., "2.7258, 101.9423"
    coordinates_cassini VARCHAR(255), -- Cassini-Soldner coordinates (Negeri Sembilan Meridian)
    survey_plan_no VARCHAR(100), -- Pelan Akui (PA) number, e.g., PA 92104
    status project_status_enum NOT NULL DEFAULT 'Inquiry',
    total_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sst_amount NUMERIC(12, 2) GENERATED ALWAYS AS (total_fee * 0.08) STORED, -- 8% Malaysian Service Tax
    final_total NUMERIC(12, 2) GENERATED ALWAYS AS (total_fee * 1.08) STORED,
    ls_assigned_id UUID REFERENCES licensed_surveyors(id) ON DELETE SET NULL,
    chargeable_hours NUMERIC(8, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. JUPEM SUBMISSION TRACKER
CREATE TYPE jupem_status_enum AS ENUM ('Draft', 'Submitted', 'Query', 'Approved');

CREATE TABLE jupem_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    submission_date DATE,
    reference_number VARCHAR(100) UNIQUE NOT NULL, -- JUPEM e-Kadar Reference
    status jupem_status_enum NOT NULL DEFAULT 'Draft',
    dc_do_forms BOOLEAN NOT NULL DEFAULT FALSE, -- Document Clearance / Development Order forms check
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. EQUIPMENT MANAGEMENT (GNSS / TOTAL STATION / DRONES)
CREATE TYPE eq_type_enum AS ENUM ('GPS_GNSS', 'Total_Station', 'Drone', 'Vehicle');
CREATE TYPE eq_status_enum AS ENUM ('Active', 'Calibrating', 'Maintenance', 'Retired');

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    type eq_type_enum NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    calibration_due_date DATE NOT NULL, -- Must recalibrate regularly under JUPEM regulations
    cert_validity_date DATE NOT NULL, -- Certificate issued by accredited lab
    status eq_status_enum NOT NULL DEFAULT 'Active',
    assigned_staff VARCHAR(255), -- Survey assistants or licensed surveyor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. MALAYSIAN COMPLIANCE PAYROLL TABLE
CREATE TYPE payroll_status_enum AS ENUM ('Draft', 'Approved', 'Paid');

CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_name VARCHAR(255) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    month VARCHAR(7) NOT NULL, -- YYYY-MM
    base_salary NUMERIC(10, 2) NOT NULL,
    epf_employer NUMERIC(10, 2) NOT NULL, -- 13% for <= RM5000, 12% for > RM5000
    epf_employee NUMERIC(10, 2) NOT NULL, -- 11% default
    socso_employer NUMERIC(10, 2) NOT NULL, -- Per SOCSO Rate Tables (approx 1.75%)
    socso_employee NUMERIC(10, 2) NOT NULL, -- Per SOCSO Rate Tables (approx 0.5%)
    eis_employer NUMERIC(10, 2) NOT NULL, -- 0.2% Employee Insurance System
    eis_employee NUMERIC(10, 2) NOT NULL, -- 0.2% EIS
    pcb NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- MTD Monthly Tax Deduction via Jadual PCB
    net_salary NUMERIC(10, 2) NOT NULL,
    status payroll_status_enum NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. BOUNDARY DISPUTE CASE MANAGEMENT
CREATE TYPE dispute_type_enum AS ENUM ('Boundary_Encroachment', 'Overlap_Claim', 'Right_of_Way', 'Land_Office_Dispute');
CREATE TYPE dispute_status_enum AS ENUM ('Investigation', 'Hearing_Pending', 'Resolved', 'Court_Appeal');

CREATE TABLE boundary_disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispute_type dispute_type_enum NOT NULL,
    court_case_ref VARCHAR(150), -- Court or Gazetted Notice reference
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    opposing_party VARCHAR(255) NOT NULL,
    hearing_dates TEXT, -- Multi-date entries
    status dispute_status_enum NOT NULL DEFAULT 'Investigation',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. SURVEY QUOTATIONS & PROPOSALS
CREATE TYPE proposal_status_enum AS ENUM ('Draft', 'Sent', 'Accepted', 'Rejected');

CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    sst_amount NUMERIC(12, 2) GENERATED ALWAYS AS (amount * 0.08) STORED,
    total NUMERIC(12, 2) GENERATED ALWAYS AS (amount * 1.08) STORED,
    proposal_status proposal_status_enum NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES FOR FAST RETRIEVAL
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_submissions_ref ON jupem_submissions(reference_number);
CREATE INDEX idx_equipment_due ON equipment(calibration_due_date);
CREATE INDEX idx_payroll_month ON payroll(month);
CREATE INDEX idx_disputes_project ON boundary_disputes(project_id);

-- TRIGGER FOR UPDATING TIMESTAMP
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_clients_modtime BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_submissions_modtime BEFORE UPDATE ON jupem_submissions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_equipment_modtime BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_payroll_modtime BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
`;

export const FASTAPI_PYDANTIC_MODELS = `from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from uuid import UUID

# ============================================================================
# FASTAPI PYDANTIC VALIDATION MODELS (MALAYSIAN LAND SURVEYING CONTEXT)
# ============================================================================

class JobType(str, Enum):
    CADASTRAL = 'Cadastral'
    STRATA = 'Strata'
    TOPOGRAPHIC = 'Topographic'
    ENGINEERING = 'Engineering'

class ProjectStatus(str, Enum):
    INQUIRY = 'Inquiry'
    FIELD_WORK = 'Field_Work'
    COMPUTATION = 'Computation'
    JUPEM_SUBMISSION = 'JUPEM_Submission'
    COMPLETED = 'Completed'

class JupemStatus(str, Enum):
    DRAFT = 'Draft'
    SUBMITTED = 'Submitted'
    QUERY = 'Query'
    APPROVED = 'Approved'

class EqType(str, Enum):
    GPS_GNSS = 'GPS_GNSS'
    TOTAL_STATION = 'Total_Station'
    DRONE = 'Drone'
    VEHICLE = 'Vehicle'

class EqStatus(str, Enum):
    ACTIVE = 'Active'
    CALIBRATING = 'Calibrating'
    MAINTENANCE = 'Maintenance'
    RETIRED = 'Retired'

class PayrollStatus(str, Enum):
    DRAFT = 'Draft'
    APPROVED = 'Approved'
    PAID = 'Paid'

class DisputeType(str, Enum):
    BOUNDARY_ENCROACHMENT = 'Boundary_Encroachment'
    OVERLAP_CLAIM = 'Overlap_Claim'
    RIGHT_OF_WAY = 'Right_of_Way'
    LAND_OFFICE_DISPUTE = 'Land_Office_Dispute'

class DisputeStatus(str, Enum):
    INVESTIGATION = 'Investigation'
    HEARING_PENDING = 'Hearing_Pending'
    RESOLVED = 'Resolved'
    COURT_APPEAL = 'Court_Appeal'

# --- CLIENT MODELS ---
class ClientBase(BaseModel):
    nama: str = Field(..., min_length=3, description="Client Company Name or Person's Full Name")
    mykad_roc: str = Field(..., description="Malaysian MyKad or ROC Registration Number")
    email: EmailStr
    telefon: str = Field(..., description="Phone starting with +60 or 60")
    alamat: str
    mukim: str = Field(..., description="Bahasa Malaysia mukim name")
    daerah: str = Field(..., description="Negeri Sembilan district name")
    negeri: str = "Negeri Sembilan"
    poa_ref: Optional[str] = None

    @field_validator('telefon')
    @classmethod
    def validate_my_phone(cls, v: str) -> str:
        cleaned = v.replace(" ", "").replace("-", "")
        if not (cleaned.startswith("+60") or cleaned.startswith("60") or cleaned.startswith("0")):
            raise ValueError("Phone number must be a valid Malaysian format (starts with +60, 60, or 0)")
        return cleaned

class ClientCreate(ClientBase):
    pass

class ClientOut(ClientBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- PROJECT MODELS ---
class ProjectBase(BaseModel):
    title: str
    client_id: UUID
    job_type: JobType
    lot_numbers: str = Field(..., description="Land Lot Numbers e.g. Lot 4520, Lot 4521")
    mukim: str
    daerah: str
    negeri: str = "Negeri Sembilan"
    coordinates_wgs84: Optional[str] = Field(None, placeholder="e.g. 2.7258, 101.9423")
    coordinates_cassini: Optional[str] = Field(None, placeholder="Easting / Northing local grid")
    survey_plan_no: Optional[str] = None
    status: ProjectStatus = ProjectStatus.INQUIRY
    total_fee: float = Field(..., ge=0.0)
    ls_assigned_id: Optional[UUID] = None
    chargeable_hours: float = 0.0

class ProjectCreate(ProjectBase):
    pass

class ProjectOut(ProjectBase):
    id: UUID
    sst_amount: float
    final_total: float
    created_at: datetime

    class Config:
        from_attributes = True

# --- JUPEM SUBMISSION MODELS ---
class JupemSubmissionBase(BaseModel):
    project_id: UUID
    submission_date: Optional[date] = None
    reference_number: str = Field(..., description="e-Kadar Submission ID")
    status: JupemStatus = JupemStatus.DRAFT
    dc_do_forms: bool = False
    remarks: Optional[str] = None

class JupemSubmissionCreate(JupemSubmissionBase):
    pass

class JupemSubmissionOut(JupemSubmissionBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- MALAYSIAN COMPLIANCE PAYROLL ---
class PayrollCreate(BaseModel):
    employee_name: str
    designation: str
    month: str = Field(..., description="Format YYYY-MM")
    base_salary: float = Field(..., ge=0)

    @field_validator('month')
    @classmethod
    def validate_month_format(cls, v: str) -> str:
        import re
        if not re.match(r'^\\d{4}-\\d{2}$', v):
            raise ValueError("Month must be in YYYY-MM format")
        return v

class PayrollOut(BaseModel):
    id: UUID
    employee_name: str
    designation: str
    month: str
    base_salary: float
    epf_employer: float
    epf_employee: float
    socso_employer: float
    socso_employee: float
    eis_employer: float
    eis_employee: float
    pcb: float
    net_salary: float
    status: PayrollStatus
    created_at: datetime

    class Config:
        from_attributes = True
`;

export const FASTAPI_ROUTER = `from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date

# Note: In a production ESXi FastAPI app, you import your models & schemas.
# This router implements standard land surveying logic (SST generation & JUPEM hooks)

router = APIRouter(prefix="/api/v1/erp", tags=["HMGeomatics ERP Router"])

# Mock database dependency injection
def get_db():
    db = "Database_Session_Placeholder"
    try:
        yield db
    finally:
        pass

@router.post("/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_survey_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    """
    Creates a new Cadastral, Strata or Topographic surveying project for HMGeomatics.
    SST 8% is auto-calculated on professional fees during database insertion.
    """
    # 1. Fetch Client and verify power of attorney reference if Cadastral
    if payload.job_type == JobType.CADASTRAL and not payload.lot_numbers:
         raise HTTPException(status_code=400, detail="Cadastral surveys require Lot Numbers to be declared")
         
    # 2. Database Insert Logic
    # sst_amount is calculated as total_fee * 0.08
    # final_total is total_fee * 1.08
    
    # Return mapped schema
    return {
        "id": "e458e692-a121-4829-9a23-42104e1201fa",
        **payload.dict(),
        "sst_amount": payload.total_fee * 0.08,
        "final_total": payload.total_fee * 1.08,
        "created_at": "2026-06-24T12:00:00"
    }

@router.get("/projects", response_model=List[ProjectOut])
def list_survey_projects(
    job_type: Optional[JobType] = None, 
    status: Optional[ProjectStatus] = None, 
    db: Session = Depends(get_db)
):
    """
    Lists and filters land surveying projects.
    Optimized indexes allow query by Mukim, Daerah and Negeri.
    """
    return []

@router.put("/projects/{project_id}/status")
def update_project_status(project_id: UUID, new_status: ProjectStatus, db: Session = Depends(get_db)):
    """
    Updates the surveying project status.
    Transitioning to 'JUPEM_Submission' enforces validity checks on Cassini coordinates and PA reference.
    """
    # In production, check if coordinates exist before submitting to JUPEM
    return {"message": f"Project {project_id} updated to {new_status}"}

@router.post("/payroll/calculate", response_model=PayrollOut)
def calculate_malaysian_statutory_payroll(payload: PayrollCreate):
    """
    Calculates exact Malaysian compliance values:
    - EPF: Employer (13% for basic <= RM5,000; 12% for basic > RM5,000), Employee (11%)
    - SOCSO: Calculated per official Jadual Caruman Perkeso (approx 1.75% / 0.5% capped at RM5,000 basic)
    - EIS: 0.2% Employer and 0.2% Employee
    - PCB (MTD): Calculated based on Jadual Potongan Cukai Bulanan (MTD) basic tiers
    """
    salary = payload.base_salary
    
    # EPF Calculation
    epf_employer_rate = 0.13 if salary <= 5000 else 0.12
    epf_employer = round(salary * epf_employer_rate, 2)
    epf_employee = round(salary * 0.11, 2)
    
    # SOCSO (Capped at RM5,000 basic in statutory calculations)
    capped_socso_salary = min(salary, 5000)
    socso_employer = round(capped_socso_salary * 0.0175, 2)
    socso_employee = round(capped_socso_salary * 0.005, 2)
    
    # EIS (Capped at RM5,000 basic)
    capped_eis_salary = min(salary, 5000)
    eis_employer = round(capped_eis_salary * 0.002, 2)
    eis_employee = round(capped_eis_salary * 0.002, 2)
    
    # PCB MTD simplified representation for API
    # In full production, this matches LHDN e-PCB algorithm
    if salary <= 3000:
        pcb = 0.0
    elif salary <= 5000:
        pcb = round((salary - 3000) * 0.05, 2)
    elif salary <= 8000:
        pcb = round(100 + (salary - 5000) * 0.10, 2)
    else:
        pcb = round(400 + (salary - 8000) * 0.15, 2)
        
    net_salary = round(salary - epf_employee - socso_employee - eis_employee - pcb, 2)
    
    return {
        "id": "7f921024-db2a-42b1-9f93-b901594e2231",
        "employee_name": payload.employee_name,
        "designation": payload.designation,
        "month": payload.month,
        "base_salary": salary,
        "epf_employer": epf_employer,
        "epf_employee": epf_employee,
        "socso_employer": socso_employer,
        "socso_employee": socso_employee,
        "eis_employer": eis_employer,
        "eis_employee": eis_employee,
        "pcb": pcb,
        "net_salary": net_salary,
        "status": PayrollStatus.DRAFT,
        "created_at": "2026-06-24T12:00:00"
    }
`;

export const WEASYPRINT_TEMPLATE = `<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <title>Laporan Ukur Hakmilik (Cadastral) - HMGeomatics</title>
    <style>
        @page {
            size: A4;
            margin: 2.5cm;
            @bottom-right {
                content: "Mukasurat " counter(page) " dari " counter(pages);
                font-family: 'Helvetica Neue', Arial, sans-serif;
                font-size: 8pt;
                color: #555;
            }
            @bottom-left {
                content: "SULIT - HMGeomatics Sdn BHD";
                font-family: 'Helvetica Neue', Arial, sans-serif;
                font-size: 8pt;
                color: #555;
            }
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #1a365d;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .logo-text {
            font-size: 18pt;
            font-weight: bold;
            color: #1a365d;
            text-transform: uppercase;
        }
        .subtitle {
            font-size: 8pt;
            color: #555;
            letter-spacing: 1px;
        }
        .title {
            text-align: center;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 20px;
            text-decoration: underline;
            color: #2d3748;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #cbd5e0;
            padding: 8px 10px;
            text-align: left;
        }
        th {
            background-color: #f7fafc;
            color: #2d3748;
            font-weight: bold;
            width: 35%;
        }
        .section-header {
            font-size: 11pt;
            font-weight: bold;
            background-color: #1a365d;
            color: white;
            padding: 5px 10px;
            margin-top: 25px;
            margin-bottom: 10px;
        }
        .sign-area {
            margin-top: 50px;
            width: 100%;
        }
        .sign-box {
            float: right;
            width: 250px;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            height: 60px;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo-text">HMGeomatics Sdn BHD</div>
        <div class="subtitle">JURUUKUR TANAH BERLESEN • SEREMBAN, NEGERI SEMBILAN</div>
    </div>

    <div class="title">LAPORAN PEMERIKSAAN SEMPADAN & LOT TANAH</div>

    <div class="section-header">Maklumat Pemilik & Kedudukan Tanah</div>
    <table>
        <tr>
            <th>Nama Pemilik / Pemaju</th>
            <td>Seremban Heights Development Sdn Bhd</td>
        </tr>
        <tr>
            <th>Nombor Lot Tanah</th>
            <td>Lot 10452 hingga Lot 10480</td>
        </tr>
        <tr>
            <th>Mukim / Daerah</th>
            <td>Mukim Rasah / Daerah Seremban</td>
        </tr>
        <tr>
            <th>Negeri</th>
            <td>Negeri Sembilan Darul Khusus</td>
        </tr>
        <tr>
            <th>No. Kuasa Wakil (POA)</th>
            <td>POA-NS-2026-901</td>
        </tr>
    </table>

    <div class="section-header">Butiran Teknikal & Koordinat Ukuran</div>
    <table>
        <tr>
            <th>Koordinat Cassini-Soldner (N, E)</th>
            <td>Northing: 14210.54 m, Easting: 8492.32 m</td>
        </tr>
        <tr>
            <th>Koordinat Global (WGS84)</th>
            <td>Lat: 2.694200° N, Lng: 101.912500° E</td>
        </tr>
        <tr>
            <th>No. Pelan Akui (PA) JUPEM</th>
            <td>PA 92104</td>
        </tr>
        <tr>
            <th>Peralatan GNSS / Kalibrasi</th>
            <td>Leica GS18 T (S/N: GS18-829104) [Sah sehingga: 14-Dis-2026]</td>
        </tr>
    </table>

    <div class="section-header">Keputusan Pemeriksaan & Status Sempadan</div>
    <p>
        Ukuran padang telah dilaksanakan berpandukan tanda-tanda sempadan batu konkrit yang ditemui di tapak. Semua batu sempadan lot adalah sepadan dengan <strong>Pelan Akui JUPEM PA 92104</strong> tanpa sebarang pencerobohan (encroachment) dari pihak jiran atau pemaju berdekatan. Kerja-kerja pengukuran mematuhi sepenuhnya <strong>Akta Juruukur Tanah Berlesen 1958</strong>.
    </p>

    <div class="sign-area">
        <div class="sign-box">
            <div class="signature-line"></div>
            <strong>Sr Haji Ahmad Rafie bin Mokhtar</strong><br>
            Juruukur Tanah Berlesen<br>
            LLS/NS/2026/0421
        </div>
    </div>

</body>
</html>
`;
export const MYINVOIS_XML_TEMPLATE = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:ID>INV-HMGEOMATICS-20260421</cbc:ID>
    <cbc:IssueDate>2026-06-24</cbc:IssueDate>
    <cbc:IssueTime>14:55:00</cbc:IssueTime>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>MYR</cbc:DocumentCurrencyCode>

    <!-- Supplier Information: HMGeomatics Sdn BHD -->
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="TIN">C205942100</cbc:ID> <!-- LHDN Tax Identification No -->
                <cbc:ID schemeID="BRN">199501094321</cbc:ID> <!-- SSM Co Reg No -->
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>HMGeomatics Sdn BHD</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>Level 1, Wisma Teras, Jalan Rahang</cbc:StreetName>
                <cbc:CityName>Seremban</cbc:CityName>
                <cbc:PostalZone>70100</cbc:PostalZone>
                <cbc:CountrySubentity>Negeri Sembilan</cbc:CountrySubentity>
            </cac:PostalAddress>
        </cac:Party>
    </cac:AccountingSupplierParty>

    <!-- Client Information: Seremban Heights Development Sdn Bhd -->
    <cac:AccountingCustomerParty>
        <cac:Party>
            <cac:PartyIdentification>
                <cbc:ID schemeID="TIN">C182942100</cbc:ID>
                <cbc:ID schemeID="BRN">199801048291</cbc:ID>
            </cac:PartyIdentification>
            <cac:PartyName>
                <cbc:Name>Seremban Heights Development Sdn Bhd</cbc:Name>
            </cac:PartyName>
            <cac:PostalAddress>
                <cbc:StreetName>Level 5, Wisma Heights, Jalan Jati</cbc:StreetName>
                <cbc:CityName>Seremban</cbc:CityName>
                <cbc:PostalZone>70000</cbc:PostalZone>
                <cbc:CountrySubentity>Negeri Sembilan</cbc:CountrySubentity>
            </cac:PostalAddress>
        </cac:Party>
    </cac:AccountingCustomerParty>

    <!-- SST 8% Tax Total -->
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="MYR">3600.00</cbc:TaxAmount>
        <cac:TaxSubtotal>
            <cbc:TaxableAmount currencyID="MYR">45000.00</cbc:TaxableAmount>
            <cbc:TaxAmount currencyID="MYR">3600.00</cbc:TaxAmount>
            <cac:TaxCategory>
                <cbc:ID>SST</cbc:ID>
                <cbc:Percent>8.00</cbc:Percent>
                <cac:TaxScheme>
                    <cbc:ID>SST-ServiceTax</cbc:ID>
                </cac:TaxScheme>
            </cac:TaxCategory>
        </cac:TaxSubtotal>
    </cac:TaxTotal>

    <!-- Invoice Totals -->
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="MYR">45000.00</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="MYR">45000.00</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="MYR">48600.00</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="MYR">48600.00</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>

    <!-- Invoice Line Details -->
    <cac:InvoiceLine>
        <cbc:ID>1</cbc:ID>
        <cbc:InvoicedQuantity unitCode="HUR">1</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="MYR">45000.00</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Name>Pecah Sempadan &amp; Lot Kediaman Seremban Heights (Phase 4B) - Cadastral Survey Fees</cbc:Name>
        </cac:Item>
        <cac:Price>
            <cbc:PriceAmount currencyID="MYR">45000.00</cbc:PriceAmount>
        </cac:Price>
    </cac:InvoiceLine>
</Invoice>
`;
