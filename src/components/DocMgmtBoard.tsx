import { useState, useEffect, FormEvent } from 'react';
import { 
  FileText, Folder, HardDrive, Cpu, Search, Plus, Calendar, AlertTriangle, 
  RefreshCw, Send, Copy, Download, BadgeAlert, Eye, Trash2, 
  ShieldCheck, Info, ExternalLink
} from 'lucide-react';
import { Client, Project, LicensedSurveyor } from '../types';

interface Props {
  clients: Client[];
  projects: Project[];
  surveyors: LicensedSurveyor[];
  notify: (type: 'success' | 'error', message: string) => void;
}

const DOC_TYPES = [
  { code: 'LIC', desc: 'Licenses & Certificates', retention: 'Lifetime' },
  { code: 'JUPEM', desc: 'JUPEM Letters & Approvals', retention: '15 years' },
  { code: 'CALIB', desc: 'Equipment Calibration Certificates', retention: '5 years' },
  { code: 'INV', desc: 'Invoices & Receipts', retention: '7 years' }
];

export default function DocMgmtBoard({ clients, projects, surveyors, notify }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'paperless' | 'nextcloud' | 'calibration' | 'transmittal'>('paperless');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2026-06-25 09:12:00');
  const [searchQuery, setSearchQuery] = useState('');

  // Nextcloud Workspace Dynamic configuration
  const [ncServer, setNcServer] = useState('drive.jteras.com');
  const [ncFolder, setNcFolder] = useState('01_Project_Documents');
  const [ncUser, setNcUser] = useState('hmgeomatics_admin');

  useEffect(() => {
    const rawUrl = localStorage.getItem('hmgeomatics_nc_server_url') || 'https://drive.jteras.com';
    setNcServer(rawUrl.replace('https://', '').replace('http://', ''));

    const folder = localStorage.getItem('hmgeomatics_nc_root_folder') || '01_Project_Documents';
    setNcFolder(folder);

    const user = localStorage.getItem('hmgeomatics_nc_username') || 'hmgeomatics_admin';
    setNcUser(user);
  }, [activeSubTab]);

  const [paperlessDocs, setPaperlessDocs] = useState([
    { id: '1', refNo: 'HMG-LIC-2026-001', name: 'Licensed Land Surveyor License - Sr Haji Ahmad Rafie', type: 'LIC', projectTag: 'HMG-2026-0001', clientTag: 'Seremban Heights Development', uploadedAt: '2026-01-05', retention: 'Lifetime' },
    { id: '2', refNo: 'HMG-CALIB-2026-003', name: 'Total Station Leica TS16 Calibration Certificate (SIRIM)', type: 'CALIB', projectTag: 'HMG-2026-0001', clientTag: 'Seremban Heights Development', uploadedAt: '2026-01-14', retention: '5 years' },
    { id: '3', refNo: 'HMG-JUPEM-2026-004', name: 'JUPEM Approval Letter for Pre-Computation Plan Lot 1247', type: 'JUPEM', projectTag: 'HMG-2026-0001', clientTag: 'Seremban Heights Development', uploadedAt: '2026-04-22', retention: '15 years' }
  ]);

  const [nextcloudFiles, setNextcloudFiles] = useState([
    { name: 'Lot1247_Labu_Cadastral_Working.dwg', folder: '03_CAD', size: '14.5 MB', date: '2026-04-20', type: 'dwg' },
    { name: 'Field_Notes_Labu_Lot1247.pdf', folder: '02_Fieldwork', size: '4.8 MB', date: '2026-04-13', type: 'pdf' },
    { name: 'GPS_Observation_Raw_Log_20260412.xlsx', folder: '02_Fieldwork', size: '180 KB', date: '2026-04-12', type: 'xlsx' }
  ]);

  const [expiryInstruments, setExpiryInstruments] = useState([
    { id: '1', name: 'Total Station Leica TS16', serial: 'TS16-2024-0041', category: 'Total Station', expiryDate: '2026-10-14' },
    { id: '2', name: 'GNSS Trimble R12i Receiver', serial: 'R12I-2023-0017', category: 'GPS GNSS', expiryDate: '2026-07-10' },
    { id: '3', name: 'Auto Level Sokkia B40', serial: 'B40-2022-0008', category: 'Total Station', expiryDate: '2026-06-01' }
  ]);

  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: 'Welcome! I am the HMGeomatics Document Assistant. Ask me to find files, classify papers into Paperless-ngx, organize CAD files, check calibration, or draft transmittal letters.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const [formData, setFormData] = useState({ name: '', type: 'JUPEM', projectTag: 'HMG-2026-0001', clientTag: 'Seremban Heights Development' });
  const [transmittalProj, setTransmittalProj] = useState('HMG-2026-0001');
  const [transmittalSurveyor, setTransmittalSurveyor] = useState('Sr Haji Ahmad Rafie bin Mokhtar');
  const [draftedLetter, setDraftedLetter] = useState('');

  useEffect(() => {
    const proj = projects.find(p => p.id === transmittalProj) || { title: 'Pecahan Lot 1247 Mukim Labu', lot_numbers: 'Lot 1247', mukim: 'Mukim Labu', daerah: 'Seremban' };
    const dateToday = '25 June 2026';
    setDraftedLetter(`Our Reference: HMG-LETTER-2026-042\nDate: ${dateToday}\n\nDirector of Survey and Mapping Negeri Sembilan\nDepartment of Survey and Mapping Malaysia (JUPEM)\nLevel 4, Wisma Persekutuan, 70000 Seremban, Negeri Sembilan.\n\nDear Sir,\n\nSUBMISSION OF SURVEY PLAN AND SUPPORTING DOCUMENTS FOR CADASTRAL APPLICATION\nPROJECT: ${proj.title.toUpperCase()}\nLOT NO: ${proj.lot_numbers}, MUKIM: ${proj.mukim.toUpperCase()}, DISTRICT: ${proj.daerah.toUpperCase()}\n\nWe refer to the above-mentioned matter.\n\n2. On behalf of our client, we submit the survey application documents for approval. This survey was led by accredited licensed surveyor, Sr ${transmittalSurveyor} in accordance with the Licensed Land Surveyors Act 1958.\n\nYours faithfully,\nHMGeomatics Licensed Land Surveyors`);
  }, [transmittalProj, transmittalSurveyor, projects]);

  const handleManualUpload = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const refNo = `HMG-${formData.type}-2026-${paperlessDocs.length + 1}`;
    const newDoc = {
      id: String(paperlessDocs.length + 1),
      refNo,
      name: formData.name,
      type: formData.type,
      projectTag: formData.projectTag,
      clientTag: formData.clientTag,
      uploadedAt: '2026-06-25',
      retention: '7 years'
    };
    setPaperlessDocs([newDoc, ...paperlessDocs]);
    notify('success', `Document registered as ${refNo}`);
    setFormData(prev => ({ ...prev, name: '' }));
  };

  const handleRenewInstrument = (id: string) => {
    setExpiryInstruments(prev => prev.map(item => item.id === id ? { ...item, expiryDate: '2027-06-25' } : item));
    notify('success', 'Calibration successfully renewed!');
  };

  const handleSamplePrompt = (index: number) => {
    let reply = '';
    if (index === 1) reply = `**JUPEM Approval Classified!**\n- **Reference**: HMG-JUPEM-2026-012\n- **Folder Path**: HMG-2026-0002_Setia_Heights/05_JUPEM/\n- **Retention**: 15 Years (Mandatory)`;
    if (index === 2) reply = `### EXPIRY MONITORING REPORT\n- **Auto Level Sokkia B40**: Expired on 01 June 2026 (RED).\n- **GNSS Trimble R12i**: Expiring 10 July 2026 (ORANGE).`;
    if (index === 3) reply = `**Search Results for project HMG-2026-0001 (Lot 1247 Labu):**\n- Paperless: 3 documents found.\n- Nextcloud: CAD files and field notes found.`;
    if (index === 4) reply = `### e-Kadar Submission Checklist:\n- 🟢 Form 5C (Application Form): Ready.\n- 🟢 Pre-Computation Plan (Precomp): Ready in Nextcloud.\n- 🔴 LJT Deposit Receipt: Missing (RM3,000).`;
    if (index === 5) reply = `Official Transmittal Letter drafted for project HMG-2026-0001. Ready to copy.`;

    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: `Simulation preset ${index}` },
      { sender: 'assistant', text: reply, isSuggestedAction: index === 5, suggestedCode: draftedLetter }
    ]);
  };

  const handleSendChat = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = `Logged query. You can use the simulation presets below to draft transmittal letters, check calibration compliance, or categorize JUPEM approvals quickly.`;
      const textLower = userText.toLowerCase();
      if (textLower.includes('approval') || textLower.includes('kelulusan')) reply = `**JUPEM approval letter detected!** Recommended reference: **HMG-JUPEM-2026-012**. File in \`05_JUPEM\`.`;
      else if (textLower.includes('expired') || textLower.includes('expiry') || textLower.includes('calibration')) reply = `**Expiry Alert:** Auto Level has expired. Please renew calibration.`;
      setChatMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* HEADER INTEGRATION BAR */}
      <div className="bg-[#18181A] p-4 text-white rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-400">
            <HardDrive className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">HMGeomatics Dual-Repository Integration</h3>
          </div>
          <p className="text-xs text-slate-400">Centralized Archive: Official files in Paperless-ngx & CAD in Nextcloud WebDAV.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>Paperless Port 8010</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span>{ncServer}</span>
          </div>
          <button onClick={() => { setIsSyncing(true); setTimeout(() => { setIsSyncing(false); setLastSyncTime(new Date().toLocaleString()); notify('success', 'Two-way sync complete!'); }, 1000); }} className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Files'}</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap border-b border-slate-200">
        {[
          { id: 'paperless', label: 'Paperless-ngx OCR Archive', icon: FileText },
          { id: 'nextcloud', label: 'Nextcloud Workspaces', icon: Folder },
          { id: 'calibration', label: 'Calibration & Expiry', icon: BadgeAlert },
          { id: 'transmittal', label: 'Draft Transmittal', icon: Info }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold transition cursor-pointer ${isActive ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1 */}
          {activeSubTab === 'paperless' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-extrabold text-slate-900 text-sm">Paperless-ngx Archive</h3>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input type="text" placeholder="Search archive..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="text-xs pl-8 pr-3 py-1.5 border rounded-lg bg-white outline-none focus:border-teal-500" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 font-bold text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Ref No</th>
                      <th className="p-3">Document Name</th>
                      <th className="p-3">Project Tag</th>
                      <th className="p-3">Retention</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {paperlessDocs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.refNo.toLowerCase().includes(searchQuery.toLowerCase())).map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-[10px] font-bold text-slate-900">{doc.refNo}</td>
                        <td className="p-3 text-slate-800">{doc.name}</td>
                        <td className="p-3 text-teal-700">{doc.projectTag}</td>
                        <td className="p-3 text-slate-500">{doc.retention}</td>
                        <td className="p-3 text-center flex items-center justify-center space-x-1">
                          <button onClick={() => notify('success', `Metadata: ${doc.name}`)} className="p-1 hover:bg-slate-100 rounded cursor-pointer" title="View Metadata"><Eye className="w-3.5 h-3.5 text-slate-500" /></button>
                          <button onClick={() => notify('success', `Downloading ${doc.refNo}`)} className="p-1 hover:bg-slate-100 rounded text-teal-600 cursor-pointer" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 border-t bg-slate-50">
                <h4 className="font-bold text-xs text-slate-700 mb-3 flex items-center space-x-1"><Cpu className="w-4 h-4 text-teal-600" /><span>Manual Document Classification</span></h4>
                <form onSubmit={handleManualUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input type="text" placeholder="Document Name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="p-2 border rounded-lg text-xs bg-white col-span-2 outline-none focus:border-teal-500" required />
                  <select value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))} className="p-2 border rounded-lg text-xs bg-white outline-none focus:border-teal-500">
                    {DOC_TYPES.map(t => <option key={t.code} value={t.code}>{t.code} - {t.desc}</option>)}
                  </select>
                  <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs p-2 rounded-lg col-span-3 cursor-pointer">Register Document</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2 */}
          {activeSubTab === 'nextcloud' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Nextcloud Workspaces</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Server: <strong className="text-teal-700 font-mono">{ncServer}</strong> | Folder: <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold">/{ncFolder}</span> | Sync User: <code className="text-slate-600 font-mono">{ncUser}</code>
                  </p>
                </div>
                <button onClick={() => {
                  const name = prompt('File name:');
                  if (name) setNextcloudFiles([{ name, folder: ncFolder, size: '1.2 MB', date: '2026-06-29', type: name.split('.').pop() || 'pdf' }, ...nextcloudFiles]);
                }} className="bg-teal-600 text-white text-xs px-2.5 py-1.5 rounded font-semibold cursor-pointer hover:bg-teal-700 transition">Upload Working File</button>
              </div>
              <div className="divide-y text-slate-700">
                {nextcloudFiles.map((file, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition px-2 rounded-lg">
                    <div>
                      <p className="font-bold text-slate-800">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{file.folder} | {file.size}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => notify('success', `Previewing ${file.name}`)} className="p-1 hover:bg-slate-100 rounded cursor-pointer" title="View"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => notify('success', `Downloading`)} className="p-1 hover:bg-slate-100 rounded text-teal-600 cursor-pointer" title="Download"><Download className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setNextcloudFiles(nextcloudFiles.filter((_, i) => i !== idx))} className="p-1 hover:bg-slate-100 text-slate-300 hover:text-red-600 rounded cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3 */}
          {activeSubTab === 'calibration' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Calibration & Expiry Compliance</h3>
              <div className="border rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left divide-y text-slate-700">
                  <thead className="bg-slate-50 font-semibold text-slate-500">
                    <tr>
                      <th className="p-3">Device / License</th>
                      <th className="p-3">Expiry Date</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium">
                    {expiryInstruments.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.serial}</p>
                        </td>
                        <td className="p-3 font-mono">{item.expiryDate}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleRenewInstrument(item.id)} className="bg-slate-900 text-white hover:bg-slate-800 text-[10px] px-2 py-1 rounded cursor-pointer">Renew</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4 */}
          {activeSubTab === 'transmittal' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">Transmittal Letter Generator</h3>
                <button onClick={() => { navigator.clipboard.writeText(draftedLetter); notify('success', 'Copied draft!'); }} className="bg-slate-900 hover:bg-slate-800 text-teal-300 text-xs px-2.5 py-1.5 rounded-lg cursor-pointer">Copy Draft</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-lg border">
                  <label className="block font-semibold text-slate-600">Select Surveyor</label>
                  <select value={transmittalSurveyor} onChange={e => setTransmittalSurveyor(e.target.value)} className="w-full p-2 border rounded bg-white outline-none focus:border-teal-500">
                    {surveyors.map(s => <option key={s.id} value={s.nama}>{s.nama}</option>)}
                  </select>
                  <label className="block font-semibold text-slate-600">Select Project</label>
                  <select value={transmittalProj} onChange={e => setTransmittalProj(e.target.value)} className="w-full p-2 border rounded bg-white outline-none focus:border-teal-500">
                    {projects.map(p => <option key={p.id} value={p.id}>{p.id} - {p.title}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <pre className="p-3 bg-slate-950 text-slate-200 text-[10px] font-mono rounded-xl h-60 overflow-auto whitespace-pre-wrap leading-relaxed border border-slate-800">{draftedLetter}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CHAT */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col h-[520px]">
          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider pb-2 border-b">Document Assistant AI</h4>
          <div className="flex-1 overflow-y-auto space-y-2.5 my-3 text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-2.5 rounded-xl max-w-[90%] leading-relaxed ${msg.sender === 'assistant' ? 'bg-white border text-slate-800' : 'bg-teal-700 text-white font-semibold'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.isSuggestedAction && msg.suggestedCode && (
                    <button onClick={() => { navigator.clipboard.writeText(msg.suggestedCode || ''); notify('success', 'Copied draft!'); }} className="bg-slate-950 text-teal-300 text-[9px] font-bold px-2 py-1 rounded block w-full text-center mt-2 cursor-pointer">Copy Letter Draft</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 pb-2 border-t pt-2">
            <span className="block text-[8px] font-bold uppercase text-slate-400">Simulation Shortcuts</span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 1, label: 'JUPEM Approval' },
                { id: 2, label: 'Expiry Report' },
                { id: 3, label: 'Search Files' },
                { id: 4, label: 'e-Kadar Checklist' },
                { id: 5, label: 'Draft Transmittal' }
              ].map(prompt => (
                <button key={prompt.id} onClick={() => handleSamplePrompt(prompt.id)} className="text-[10px] bg-white hover:bg-teal-50 px-2 py-1 border border-slate-200 rounded font-semibold transition cursor-pointer">
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendChat} className="flex space-x-1.5 border-t pt-2">
            <input type="text" placeholder="Ask assistant..." value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 text-xs border rounded-lg p-2 bg-white outline-none" />
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-teal-400 p-2 rounded-lg cursor-pointer">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
