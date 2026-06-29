/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RateSheet } from '../types';
import { Plus, Trash2, Save, FileSpreadsheet, Settings2, Info, Check, Copy } from 'lucide-react';

interface RateSheetsManagerProps {
  rateSheets: RateSheet[];
  activeRateSheetId: string;
  setActiveRateSheetId: (id: string) => void;
  setRateSheets: (sheets: RateSheet[]) => void;
  notify: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

type RatesSection = 'table1' | 'table2' | 'table3' | 'reimburse';

export default function RateSheetsManager({
  rateSheets,
  activeRateSheetId,
  setActiveRateSheetId,
  setRateSheets,
  notify
}: RateSheetsManagerProps) {
  const [selectedSheetId, setSelectedSheetId] = useState<string>(activeRateSheetId);
  const [newSheetName, setNewSheetName] = useState('');
  const [activeSubSection, setActiveSubSection] = useState<RatesSection>('table1');

  // Find selected sheet
  const selectedSheet = rateSheets.find(s => s.id === selectedSheetId) || rateSheets[0];

  // Handle value change for numeric fields
  const handleRateChange = (field: keyof Omit<RateSheet, 'id' | 'name' | 'isDefault'>, value: number) => {
    const updatedSheets = rateSheets.map(sheet => {
      if (sheet.id === selectedSheetId) {
        return { ...sheet, [field]: value };
      }
      return sheet;
    });
    setRateSheets(updatedSheets);
  };

  // Create a new Rate Sheet (cloned from selected)
  const handleCreateRateSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim()) {
      notify('error', 'Please enter a valid name for the new rate sheet.');
      return;
    }

    const newId = `rates-${Date.now()}`;
    const newSheet: RateSheet = {
      ...selectedSheet,
      id: newId,
      name: newSheetName.trim(),
      isDefault: false
    };

    const updated = [...rateSheets, newSheet];
    setRateSheets(updated);
    setSelectedSheetId(newId);
    setNewSheetName('');
    notify('success', `New Rate Sheet "${newSheet.name}" successfully created!`);
  };

  // Set the selected rate sheet as the globally active one
  const handleApplyActive = () => {
    setActiveRateSheetId(selectedSheetId);
    notify('success', `"${selectedSheet.name}" is now the active rate sheet for all new quotations!`);
  };

  // Delete a custom rate sheet
  const handleDeleteSheet = (id: string) => {
    if (id === 'default-rate-sheet') {
      notify('error', 'The official LJT rate sheet cannot be deleted.');
      return;
    }
    if (id === activeRateSheetId) {
      notify('error', 'Cannot delete the currently active rate sheet. Switch to another sheet first.');
      return;
    }

    const updated = rateSheets.filter(s => s.id !== id);
    setRateSheets(updated);
    if (selectedSheetId === id) {
      setSelectedSheetId('default-rate-sheet');
    }
    notify('success', 'Custom price rate sheet deleted.');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-slate-800">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <FileSpreadsheet className="w-5 h-5 text-teal-600" />
          <div>
            <h4 className="font-bold text-sm tracking-tight text-slate-900">Official LJT Schedule & Custom Pricing Rates</h4>
            <p className="text-[11px] text-slate-500">Configure default pricing factors, multipliers, and reimbursement rate cards for client quotations.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedSheetId === activeRateSheetId ? (
            <span className="inline-flex items-center space-x-1 bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1 rounded-md text-[11px] font-bold">
              <Check className="w-3 h-3" />
              <span>ACTIVE SYSTEM RATES</span>
            </span>
          ) : (
            <button
              onClick={handleApplyActive}
              className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-md shadow-xs transition"
            >
              Use This Rate Card
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Selector & Creator */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Choose Pricing Template</label>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {rateSheets.map(sheet => (
                <div 
                  key={sheet.id}
                  onClick={() => setSelectedSheetId(sheet.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold cursor-pointer transition flex items-center justify-between ${
                    selectedSheetId === sheet.id
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="truncate max-w-[80%]">
                    <span className="block truncate">{sheet.name}</span>
                    {sheet.id === activeRateSheetId && (
                      <span className={`text-[9px] font-bold uppercase block ${selectedSheetId === sheet.id ? 'text-teal-300' : 'text-teal-600'}`}>
                        • In-Use
                      </span>
                    )}
                  </div>
                  {!sheet.isDefault && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSheet(sheet.id);
                      }}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* New Custom Sheet Form */}
          <form onSubmit={handleCreateRateSheet} className="p-3 bg-slate-50 border border-slate-150 rounded-lg space-y-2.5">
            <div className="flex items-center space-x-1.5 text-slate-700 border-b pb-1">
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-bold uppercase">Clone Selection</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Developer Discount Sheet"
              value={newSheetName}
              onChange={e => setNewSheetName(e.target.value)}
              className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-md outline-none text-slate-850"
            />
            <button
              type="submit"
              className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[10px] font-bold py-1.5 rounded-md transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Clone to Custom Sheet</span>
            </button>
          </form>

        </div>

        {/* Right Column: Dynamic Form Parameters */}
        <div className="lg:col-span-3 border border-slate-150 rounded-xl overflow-hidden shadow-xs">
          
          {/* Subsection Tabs */}
          <div className="flex bg-slate-50 border-b border-slate-150 overflow-x-auto text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveSubSection('table1')}
              className={`px-4 py-3 border-r border-slate-150 shrink-0 transition ${
                activeSubSection === 'table1' ? 'bg-white text-slate-900 border-b-2 border-b-teal-500' : 'hover:bg-slate-100'
              }`}
            >
              Table I & VI (Buildings)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubSection('table2')}
              className={`px-4 py-3 border-r border-slate-150 shrink-0 transition ${
                activeSubSection === 'table2' ? 'bg-white text-slate-900 border-b-2 border-b-teal-500' : 'hover:bg-slate-100'
              }`}
            >
              Table II (Strata)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubSection('table3')}
              className={`px-4 py-3 border-r border-slate-150 shrink-0 transition ${
                activeSubSection === 'table3' ? 'bg-white text-slate-900 border-b-2 border-b-teal-500' : 'hover:bg-slate-100'
              }`}
            >
              Table III, IV, V & VII
            </button>
            <button
              type="button"
              onClick={() => setActiveSubSection('reimburse')}
              className={`px-4 py-3 shrink-0 transition ${
                activeSubSection === 'reimburse' ? 'bg-white text-slate-900 border-b-2 border-b-teal-500' : 'hover:bg-slate-100'
              }`}
            >
              Reimbursement Rates
            </button>
          </div>

          {/* Form fields depending on selected template */}
          <div className="p-5 space-y-5 bg-white text-xs">
            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg flex items-start space-x-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                You are currently viewing and modifying coefficients for <strong>{selectedSheet.name}</strong>. 
                All modifications persist immediately and can be loaded dynamically when creating a Sebut Harga.
              </span>
            </div>

            {/* TAB 1: TABLE 1 */}
            {activeSubSection === 'table1' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table I Base Fee (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t1BaseFee}
                    onChange={e => handleRateChange('t1BaseFee', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table I Min Pre-computation Fee (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t1MinPrecomp}
                    onChange={e => handleRateChange('t1MinPrecomp', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table I Rate Per Lot (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t1LotRate}
                    onChange={e => handleRateChange('t1LotRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">New Sempadan Stone Rate (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t1BatuBaruRate}
                    onChange={e => handleRateChange('t1BatuBaruRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Stone Refixing Rate (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t1BatuRefixRate}
                    onChange={e => handleRateChange('t1BatuRefixRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Azimut Connection Line Rate (RM/m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedSheet.t1AzimutRate}
                    onChange={e => handleRateChange('t1AzimutRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Party Wall Fee per Unit (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t1PartyWallRate}
                    onChange={e => handleRateChange('t1PartyWallRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Consulting Fee Percentage (%)</label>
                  <input
                    type="number"
                    value={selectedSheet.t1ConsultantPct}
                    onChange={e => handleRateChange('t1ConsultantPct', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Digital Data Supplement Percentage (%)</label>
                  <input
                    type="number"
                    value={selectedSheet.t1DigitalPct}
                    onChange={e => handleRateChange('t1DigitalPct', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: STRATA */}
            {activeSubSection === 'table2' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Strata Consultation Minimum Fee (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t2ConsultantMin}
                    onChange={e => handleRateChange('t2ConsultantMin', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Jadual Petak / Parcel Fee (RM/unit)</label>
                  <input
                    type="number"
                    value={selectedSheet.t2JadualPetakRate}
                    onChange={e => handleRateChange('t2JadualPetakRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Low-Cost Block Certification (RM/block)</label>
                  <input
                    type="number"
                    value={selectedSheet.t2LowCostPerakuanRate}
                    onChange={e => handleRateChange('t2LowCostPerakuanRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Residential Block Certification (RM/block)</label>
                  <input
                    type="number"
                    value={selectedSheet.t2KediamanPerakuanRate}
                    onChange={e => handleRateChange('t2KediamanPerakuanRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Commercial/Other Block Cert (RM/block)</label>
                  <input
                    type="number"
                    value={selectedSheet.t2LainPerakuanRate}
                    onChange={e => handleRateChange('t2LainPerakuanRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Provisional Unit Syer per Block (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t2SyerSemenRate}
                    onChange={e => handleRateChange('t2SyerSemenRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Common Area Survey Rate (RM/sqm)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedSheet.t2CommonAreaRate}
                    onChange={e => handleRateChange('t2CommonAreaRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Strata Party Wall Rate (RM/unit)</label>
                  <input
                    type="number"
                    value={selectedSheet.t2PartyWallRate}
                    onChange={e => handleRateChange('t2PartyWallRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: AGRICULTURE / MINING / OTHER */}
            {activeSubSection === 'table3' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-b sm:col-span-2 pb-2 mb-2 font-bold text-slate-900 border-slate-100">
                  Jadual III (Agriculture/Pertanian) & Jadual IV (Mining)
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table III Base Fee (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t3BaseFee}
                    onChange={e => handleRateChange('t3BaseFee', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table III Min Precomp Fee (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t3MinPrecomp}
                    onChange={e => handleRateChange('t3MinPrecomp', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table III New Stone Rate (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t3BatuBaruRate}
                    onChange={e => handleRateChange('t3BatuBaruRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table IV Base Fee (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t4BaseFee}
                    onChange={e => handleRateChange('t4BaseFee', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table IV Mining Rate (RM/Hectare)</label>
                  <input
                    type="number"
                    value={selectedSheet.t4PerHaRate}
                    onChange={e => handleRateChange('t4PerHaRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table IV Min Mining Fee (RM)</label>
                  <input
                    type="number"
                    value={selectedSheet.t4MinAreaFee}
                    onChange={e => handleRateChange('t4MinAreaFee', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>

                <div className="border-b sm:col-span-2 pb-2 mb-2 pt-2 font-bold text-slate-900 border-slate-100">
                  Jadual V (Tunnel) & Jadual VII (Hourly/Khas)
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Tunnel Survey Rate (RM/meter)</label>
                  <input
                    type="number"
                    value={selectedSheet.t5PerMeterRate}
                    onChange={e => handleRateChange('t5PerMeterRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table VII Hourly Rate (RM/hour)</label>
                  <input
                    type="number"
                    value={selectedSheet.t7HourlyRate}
                    onChange={e => handleRateChange('t7HourlyRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Table VII Special Area Rate (RM/Ha)</label>
                  <input
                    type="number"
                    value={selectedSheet.t7AreaHaRate}
                    onChange={e => handleRateChange('t7AreaHaRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: REIMBURSEMENT */}
            {activeSubSection === 'reimburse' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Meeting & Site Visits (RM/hour)</label>
                  <input
                    type="number"
                    value={selectedSheet.rSiteVisitRate}
                    onChange={e => handleRateChange('rSiteVisitRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Expert Witness Rate (RM/day)</label>
                  <input
                    type="number"
                    value={selectedSheet.rExpertDayRate}
                    onChange={e => handleRateChange('rExpertDayRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Expert Witness per Case (RM/case)</label>
                  <input
                    type="number"
                    value={selectedSheet.rExpertCaseRate}
                    onChange={e => handleRateChange('rExpertCaseRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Travel / Mileage Claims (RM/km)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={selectedSheet.rMileageRate}
                    onChange={e => handleRateChange('rMileageRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Hotel Out-station Rate (RM/night)</label>
                  <input
                    type="number"
                    value={selectedSheet.rHotelRate}
                    onChange={e => handleRateChange('rHotelRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Linen Copy Print A1 (RM/pcs)</label>
                  <input
                    type="number"
                    value={selectedSheet.rLinenA1Rate}
                    onChange={e => handleRateChange('rLinenA1Rate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Linen Copy Print A2 (RM/pcs)</label>
                  <input
                    type="number"
                    value={selectedSheet.rLinenA2Rate}
                    onChange={e => handleRateChange('rLinenA2Rate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">Extra Paper Copy Rate (RM/copy)</label>
                  <input
                    type="number"
                    value={selectedSheet.rPaperCopyRate}
                    onChange={e => handleRateChange('rPaperCopyRate', Number(e.target.value))}
                    className="w-full border p-2 bg-slate-50 hover:bg-slate-100 rounded-md outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
