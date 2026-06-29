/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Load seed data
import {
  SEED_SURVEYORS,
  SEED_CLIENTS,
  SEED_PROJECTS,
  SEED_SUBMISSIONS,
  SEED_EQUIPMENT,
  SEED_PAYROLL,
  SEED_DISPUTES,
  SEED_QUOTATIONS,
} from './src/server/seed';

import { Client, Project, Submission, Equipment, Payroll, BoundaryDispute, Quotation, LicensedSurveyor, Leave, Attendance, JobSchedule } from './src/types';

let _filename = '';
let _dirname = '';

try {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.url) {
    // @ts-ignore
    _filename = fileURLToPath(import.meta.url);
    _dirname = path.dirname(_filename);
  }
} catch (e) {
  // Ignore
}

const resolvedFilename = _filename || (typeof __filename !== 'undefined' ? __filename : '');
const resolvedDirname = _dirname || (typeof __dirname !== 'undefined' ? __dirname : '');

// In-memory data store for live CRUD interaction
let surveyors: LicensedSurveyor[] = [...SEED_SURVEYORS];
let clients: Client[] = [...SEED_CLIENTS];
let projects: Project[] = [...SEED_PROJECTS];
let submissions: Submission[] = [...SEED_SUBMISSIONS];
let equipment: Equipment[] = [...SEED_EQUIPMENT];
let payrolls: Payroll[] = [...SEED_PAYROLL];
let disputes: BoundaryDispute[] = [...SEED_DISPUTES];
let quotations: Quotation[] = [...SEED_QUOTATIONS];

// In-memory lists for leave and attendance
let leaves: Leave[] = [
  {
    id: 'leave-1',
    employee_name: 'Irwan Shah bin Ramli',
    leave_type: 'Annual',
    start_date: '2026-06-10',
    end_date: '2026-06-12',
    days: 3,
    reason: 'Family event in Seremban HQ',
    status: 'Approved',
    created_at: '2026-06-01T08:00:00Z',
  },
  {
    id: 'leave-2',
    employee_name: 'Amirul bin Zainuddin',
    leave_type: 'Medical',
    start_date: '2026-06-18',
    end_date: '2026-06-18',
    days: 1,
    reason: 'Dental appointment & checkup',
    status: 'Approved',
    created_at: '2026-06-17T09:30:00Z',
  },
  {
    id: 'leave-3',
    employee_name: 'Faridah binti Abdul Rahman',
    leave_type: 'Annual',
    start_date: '2026-07-02',
    end_date: '2026-07-05',
    days: 4,
    reason: 'Annual family trip',
    status: 'Pending',
    created_at: '2026-06-20T10:15:00Z',
  }
];

let attendances: Attendance[] = [
  {
    id: 'att-1',
    employee_name: 'Irwan Shah bin Ramli',
    date: '2026-06-24',
    check_in_time: '08:15',
    check_out_time: '17:30',
    status: 'On_Time',
    location: 'Seremban Heights (Lot 10452 Site)',
    remarks: 'Field boundary re-surveying project'
  },
  {
    id: 'att-2',
    employee_name: 'Amirul bin Zainuddin',
    date: '2026-06-24',
    check_in_time: '08:28',
    check_out_time: '17:45',
    status: 'On_Time',
    location: 'Seremban Heights (Lot 10452 Site)',
    remarks: 'Assisting field team with total station'
  },
  {
    id: 'att-3',
    employee_name: 'Faridah binti Abdul Rahman',
    date: '2026-06-24',
    check_in_time: '08:45',
    check_out_time: '18:00',
    status: 'Late',
    location: 'HMGeomatics Seremban HQ Office',
    remarks: 'Heavy traffic at highway'
  },
  {
    id: 'att-4',
    employee_name: 'Irwan Shah bin Ramli',
    date: '2026-06-23',
    check_in_time: '08:05',
    check_out_time: '17:00',
    status: 'On_Time',
    location: 'HQ & Site Visit Labu',
    remarks: 'Total station calibration check'
  }
];

let schedules: JobSchedule[] = [
  {
    id: 'sched-1',
    project_id: 'proj-1',
    title: 'Seremban Heights Lot 10452 Cadastral Re-Survey',
    surveyor_id: 'surv-1',
    team_leader: 'Irwan Shah bin Ramli',
    team_members: ['Amirul bin Zainuddin', 'Zulhilmi bin Rosli'],
    start_date: '2026-06-24',
    end_date: '2026-06-25',
    status: 'In_Progress',
    survey_type: 'Cadastral',
    equipment_ids: ['eq-1', 'eq-4'],
    daerah: 'Seremban',
    mukim: 'Mukim Rasah',
    notes: 'Static GNSS observations and pegging. Weather permitting.',
    weather_condition: 'Sunny',
    gps_baseline_observed: true,
    baseline_length_m: 1420.5
  },
  {
    id: 'sched-2',
    project_id: 'proj-2',
    title: 'Labu Agricultural Boundary Settlement',
    surveyor_id: 'surv-1',
    team_leader: 'Amirul bin Zainuddin',
    team_members: ['Suresh Kumar a/l Muniandy'],
    start_date: '2026-06-22',
    end_date: '2026-06-23',
    status: 'Completed',
    survey_type: 'Cadastral',
    equipment_ids: ['eq-2', 'eq-4'],
    daerah: 'Seremban',
    mukim: 'Mukim Labu',
    notes: 'Cleared overgrown bushes to find old boundary stones.',
    weather_condition: 'Overcast',
    gps_baseline_observed: false
  },
  {
    id: 'sched-3',
    project_id: 'proj-3',
    title: 'Port Dickson Beach Resort Topographic Drone Mapping',
    surveyor_id: 'surv-2',
    team_leader: 'Irwan Shah bin Ramli',
    team_members: ['Zulhilmi bin Rosli', 'Hafizul bin Mohamad'],
    start_date: '2026-06-28',
    end_date: '2026-06-29',
    status: 'Scheduled',
    survey_type: 'Topographic',
    equipment_ids: ['eq-3', 'eq-4'],
    daerah: 'Port Dickson',
    mukim: 'Mukim PD',
    notes: 'Aerial photogrammetry flight plan approved by CAAM. Fly at 100m AGL.',
    weather_condition: 'Sunny',
    gps_baseline_observed: false
  }
];


async function startServer() {
  const app = express();
  app.use(express.json());

  // ---------------------------------------------------------
  // CLIENTS API
  // ---------------------------------------------------------
  app.get('/api/clients', (req, res) => {
    res.json(clients);
  });

  app.post('/api/clients', (req, res) => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...req.body
    };
    clients.push(newClient);
    res.status(201).json(newClient);
  });

  app.put('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...req.body };
      res.json(clients[index]);
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  });

  app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    clients = clients.filter(c => c.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // SURVEYORS API
  // ---------------------------------------------------------
  app.get('/api/surveyors', (req, res) => {
    res.json(surveyors);
  });

  app.post('/api/surveyors', (req, res) => {
    const newLS: LicensedSurveyor = {
      id: `ls-${Date.now()}`,
      ...req.body
    };
    surveyors.push(newLS);
    res.status(201).json(newLS);
  });

  app.put('/api/surveyors/:id', (req, res) => {
    const { id } = req.params;
    const index = surveyors.findIndex(s => s.id === id);
    if (index !== -1) {
      surveyors[index] = { ...surveyors[index], ...req.body };
      res.json(surveyors[index]);
    } else {
      res.status(404).json({ error: 'Surveyor not found' });
    }
  });

  app.delete('/api/surveyors/:id', (req, res) => {
    const { id } = req.params;
    surveyors = surveyors.filter(s => s.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // PROJECTS API
  // ---------------------------------------------------------
  app.get('/api/projects', (req, res) => {
    res.json(projects);
  });

  app.post('/api/projects', (req, res) => {
    const total_fee = Number(req.body.total_fee || 0);
    const sst_amount = total_fee * 0.08;
    const final_total = total_fee * 1.08;

    const newProject: Project = {
      id: `project-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...req.body,
      total_fee,
      sst_amount,
      final_total
    };
    projects.push(newProject);
    res.status(201).json(newProject);
  });

  app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      const total_fee = Number(req.body.total_fee ?? projects[index].total_fee);
      const sst_amount = total_fee * 0.08;
      const final_total = total_fee * 1.08;

      projects[index] = {
        ...projects[index],
        ...req.body,
        total_fee,
        sst_amount,
        final_total
      };
      res.json(projects[index]);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  });

  app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    projects = projects.filter(p => p.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // SUBMISSIONS API
  // ---------------------------------------------------------
  app.get('/api/submissions', (req, res) => {
    res.json(submissions);
  });

  app.post('/api/submissions', (req, res) => {
    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      ...req.body
    };
    submissions.push(newSub);
    res.status(201).json(newSub);
  });

  app.put('/api/submissions/:id', (req, res) => {
    const { id } = req.params;
    const index = submissions.findIndex(s => s.id === id);
    if (index !== -1) {
      submissions[index] = { ...submissions[index], ...req.body };
      res.json(submissions[index]);
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  });

  app.delete('/api/submissions/:id', (req, res) => {
    const { id } = req.params;
    submissions = submissions.filter(s => s.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // EQUIPMENT API
  // ---------------------------------------------------------
  app.get('/api/equipment', (req, res) => {
    res.json(equipment);
  });

  app.post('/api/equipment', (req, res) => {
    const newEq: Equipment = {
      id: `eq-${Date.now()}`,
      ...req.body
    };
    equipment.push(newEq);
    res.status(201).json(newEq);
  });

  app.put('/api/equipment/:id', (req, res) => {
    const { id } = req.params;
    const index = equipment.findIndex(e => e.id === id);
    if (index !== -1) {
      equipment[index] = { ...equipment[index], ...req.body };
      res.json(equipment[index]);
    } else {
      res.status(404).json({ error: 'Equipment not found' });
    }
  });

  app.delete('/api/equipment/:id', (req, res) => {
    const { id } = req.params;
    equipment = equipment.filter(e => e.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // PAYROLL API (Calculates epf, socso, eis, pcb based on salary)
  // ---------------------------------------------------------
  app.get('/api/payroll', (req, res) => {
    res.json(payrolls);
  });

  app.post('/api/payroll', (req, res) => {
    const base_salary = Number(req.body.base_salary || 0);

    // EPF Calculation: 13% employer if <= RM5,000, else 12%
    const epf_employer_rate = base_salary <= 5000 ? 0.13 : 0.12;
    const epf_employer = Math.round(base_salary * epf_employer_rate * 100) / 100;
    const epf_employee = Math.round(base_salary * 0.11 * 100) / 100;

    // SOCSO: Employer 1.75%, Employee 0.5% (capped at 5000)
    const capped_socso = Math.min(base_salary, 5000);
    const socso_employer = Math.round(capped_socso * 0.0175 * 100) / 100;
    const socso_employee = Math.round(capped_socso * 0.005 * 100) / 100;

    // EIS: 0.2% each (capped at 5000)
    const capped_eis = Math.min(base_salary, 5000);
    const eis_employer = Math.round(capped_eis * 0.002 * 100) / 100;
    const eis_employee = Math.round(capped_eis * 0.002 * 100) / 100;

    // PCB simplified formulation matching Jadual PCB basic tiers
    let pcb = 0;
    if (base_salary > 8000) {
      pcb = Math.round((400 + (base_salary - 8000) * 0.15) * 100) / 100;
    } else if (base_salary > 5000) {
      pcb = Math.round((100 + (base_salary - 5000) * 0.10) * 100) / 100;
    } else if (base_salary > 3000) {
      pcb = Math.round(((base_salary - 3000) * 0.05) * 100) / 100;
    }

    const net_salary = Math.round((base_salary - epf_employee - socso_employee - eis_employee - pcb) * 100) / 100;

    const newPayroll: Payroll = {
      id: `pay-${Date.now()}`,
      epf_employer,
      epf_employee,
      socso_employer,
      socso_employee,
      eis_employer,
      eis_employee,
      pcb,
      net_salary,
      ...req.body,
      base_salary,
    };
    payrolls.push(newPayroll);
    res.status(201).json(newPayroll);
  });

  app.put('/api/payroll/:id', (req, res) => {
    const { id } = req.params;
    const index = payrolls.findIndex(p => p.id === id);
    if (index !== -1) {
      const base_salary = Number(req.body.base_salary ?? payrolls[index].base_salary);

      const epf_employer_rate = base_salary <= 5000 ? 0.13 : 0.12;
      const epf_employer = Math.round(base_salary * epf_employer_rate * 100) / 100;
      const epf_employee = Math.round(base_salary * 0.11 * 100) / 100;

      const capped_socso = Math.min(base_salary, 5000);
      const socso_employer = Math.round(capped_socso * 0.0175 * 100) / 100;
      const socso_employee = Math.round(capped_socso * 0.005 * 100) / 100;

      const capped_eis = Math.min(base_salary, 5000);
      const eis_employer = Math.round(capped_eis * 0.002 * 100) / 100;
      const eis_employee = Math.round(capped_eis * 0.002 * 100) / 100;

      let pcb = 0;
      if (base_salary > 8000) {
        pcb = Math.round((400 + (base_salary - 8000) * 0.15) * 100) / 100;
      } else if (base_salary > 5000) {
        pcb = Math.round((100 + (base_salary - 5000) * 0.10) * 100) / 100;
      } else if (base_salary > 3000) {
        pcb = Math.round(((base_salary - 3000) * 0.05) * 100) / 100;
      }

      const net_salary = Math.round((base_salary - epf_employee - socso_employee - eis_employee - pcb) * 100) / 100;

      payrolls[index] = {
        ...payrolls[index],
        ...req.body,
        base_salary,
        epf_employer,
        epf_employee,
        socso_employer,
        socso_employee,
        eis_employer,
        eis_employee,
        pcb,
        net_salary
      };
      res.json(payrolls[index]);
    } else {
      res.status(404).json({ error: 'Payroll entry not found' });
    }
  });

  app.delete('/api/payroll/:id', (req, res) => {
    const { id } = req.params;
    payrolls = payrolls.filter(p => p.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // DISPUTES API
  // ---------------------------------------------------------
  app.get('/api/disputes', (req, res) => {
    res.json(disputes);
  });

  app.post('/api/disputes', (req, res) => {
    const newDispute: BoundaryDispute = {
      id: `disp-${Date.now()}`,
      ...req.body
    };
    disputes.push(newDispute);
    res.status(201).json(newDispute);
  });

  app.put('/api/disputes/:id', (req, res) => {
    const { id } = req.params;
    const index = disputes.findIndex(d => d.id === id);
    if (index !== -1) {
      disputes[index] = { ...disputes[index], ...req.body };
      res.json(disputes[index]);
    } else {
      res.status(404).json({ error: 'Dispute case not found' });
    }
  });

  app.delete('/api/disputes/:id', (req, res) => {
    const { id } = req.params;
    disputes = disputes.filter(d => d.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // QUOTATIONS API
  // ---------------------------------------------------------
  app.get('/api/quotations', (req, res) => {
    res.json(quotations);
  });

  app.post('/api/quotations', (req, res) => {
    const amount = Number(req.body.amount || 0);
    const sst_amount = amount * 0.08;
    const total = amount * 1.08;

    const newQuote: Quotation = {
      id: `quote-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...req.body,
      amount,
      sst_amount,
      total
    };
    quotations.push(newQuote);
    res.status(201).json(newQuote);
  });

  app.put('/api/quotations/:id', (req, res) => {
    const { id } = req.params;
    const index = quotations.findIndex(q => q.id === id);
    if (index !== -1) {
      const amount = Number(req.body.amount ?? quotations[index].amount);
      const sst_amount = amount * 0.08;
      const total = amount * 1.08;

      quotations[index] = {
        ...quotations[index],
        ...req.body,
        amount,
        sst_amount,
        total
      };
      res.json(quotations[index]);
    } else {
      res.status(404).json({ error: 'Quotation not found' });
    }
  });

  app.delete('/api/quotations/:id', (req, res) => {
    const { id } = req.params;
    quotations = quotations.filter(q => q.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // LEAVES API
  // ---------------------------------------------------------
  app.get('/api/leaves', (req, res) => {
    res.json(leaves);
  });

  app.post('/api/leaves', (req, res) => {
    const newLeave: Leave = {
      id: `leave-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'Pending',
      ...req.body
    };
    leaves.push(newLeave);
    res.status(201).json(newLeave);
  });

  app.put('/api/leaves/:id', (req, res) => {
    const { id } = req.params;
    const index = leaves.findIndex(l => l.id === id);
    if (index !== -1) {
      leaves[index] = { ...leaves[index], ...req.body };
      res.json(leaves[index]);
    } else {
      res.status(404).json({ error: 'Leave request not found' });
    }
  });

  app.delete('/api/leaves/:id', (req, res) => {
    const { id } = req.params;
    leaves = leaves.filter(l => l.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // ATTENDANCES API
  // ---------------------------------------------------------
  app.get('/api/attendances', (req, res) => {
    res.json(attendances);
  });

  app.post('/api/attendances', (req, res) => {
    const newAttendance: Attendance = {
      id: `att-${Date.now()}`,
      ...req.body
    };
    attendances.push(newAttendance);
    res.status(201).json(newAttendance);
  });

  app.put('/api/attendances/:id', (req, res) => {
    const { id } = req.params;
    const index = attendances.findIndex(a => a.id === id);
    if (index !== -1) {
      attendances[index] = { ...attendances[index], ...req.body };
      res.json(attendances[index]);
    } else {
      res.status(404).json({ error: 'Attendance record not found' });
    }
  });

  app.delete('/api/attendances/:id', (req, res) => {
    const { id } = req.params;
    attendances = attendances.filter(a => a.id !== id);
    res.json({ success: true });
  });

  // ---------------------------------------------------------
  // JOB SCHEDULING API
  // ---------------------------------------------------------
  app.get('/api/schedules', (req, res) => {
    res.json(schedules);
  });

  app.post('/api/schedules', (req, res) => {
    const newSchedule: JobSchedule = {
      id: `sched-${Date.now()}`,
      ...req.body
    };
    schedules.push(newSchedule);
    res.status(201).json(newSchedule);
  });

  app.put('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    const index = schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      schedules[index] = { ...schedules[index], ...req.body };
      res.json(schedules[index]);
    } else {
      res.status(404).json({ error: 'Job Schedule not found' });
    }
  });

  app.delete('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    schedules = schedules.filter(s => s.id !== id);
    res.json({ success: true });
  });


  // ---------------------------------------------------------
  // DEPLOYMENT VITE MIDDLEWARE OR STATIC FILES
  // ---------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    // Serve production built files
    // In production, server.cjs is in the dist folder, so resolvedDirname is the dist folder itself.
    const distPath = resolvedDirname;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HMGeomatics ERP] Server is running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
