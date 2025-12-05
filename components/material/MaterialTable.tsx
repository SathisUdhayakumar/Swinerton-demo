'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Material {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitCost: string;
  availableQuantity: number;
  statusQuantity: string;
}

const materials: Material[] = [
  { id: 'HVAC-01', description: 'Mechanical - HVAC part 1', unit: 'EA', quantity: 45, unitCost: '-', availableQuantity: 40, statusQuantity: '40/0/0/0/0/0/0/0/0' },
  { id: 'HVAC-02', description: 'Mechanical - HVAC part 2', unit: 'KG', quantity: 62, unitCost: '-', availableQuantity: 92, statusQuantity: '92/0/0/0/0/0/0/0/0' },
  { id: 'HVAC-03', description: 'Mechanical - HVAC part 3', unit: 'EA', quantity: 34, unitCost: '-', availableQuantity: 29, statusQuantity: '29/0/0/0/0/0/0/0/0' },
  { id: 'ELEC-01', description: 'Electrical part 1', unit: 'EA', quantity: 51, unitCost: '-', availableQuantity: 95, statusQuantity: '95/0/0/0/0/0/0/0/0' },
  { id: 'ELEC-02', description: 'Electrical part 2', unit: '12', quantity: 44, unitCost: '-', availableQuantity: 13, statusQuantity: '13/0/0/0/0/0/0/0/0' },
  { id: 'ELEC-03', description: 'Electrical part 3', unit: 'EA', quantity: 50, unitCost: '-', availableQuantity: 62, statusQuantity: '62/0/0/0/0/0/0/0/0' },
  { id: 'FIRE-01', description: 'Fire Suppression part 1', unit: 'EA', quantity: 22, unitCost: '-', availableQuantity: 81, statusQuantity: '81/0/0/0/0/0/0/0/0' },
  { id: 'FIRE-02', description: 'Fire Suppression part 2', unit: 'KG', quantity: 32, unitCost: '-', availableQuantity: 87, statusQuantity: '87/0/0/0/0/0/0/0/0' },
  { id: 'FIRE-03', description: 'Fire Suppression part 3', unit: 'EA', quantity: 17, unitCost: '-', availableQuantity: 93, statusQuantity: '93/0/0/0/0/0/0/0/0' },
];

interface MaterialTableProps {
  projectId: string;
}

export function MaterialTable({ projectId }: MaterialTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === materials.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(materials.map((m) => m.id)));
    }
  };

  const filteredMaterials = materials.filter((m) =>
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Title and Actions */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Material</h1>
        <div className="flex items-center gap-3">
          <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-0">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Open AI Assistant
          </Button>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-2 mb-4">
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <Button className="bg-[#fbbf24] hover:bg-[#f59e0b] text-white border-0 ml-2">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-md relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
          />
        </div>
        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
        </Button>
        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Column
        </Button>
        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Group
        </Button>
      </div>

      {/* Material Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === materials.length}
                    onChange={toggleAll}
                    className="w-4 h-4 text-[#1e3a5f] border-slate-300 rounded focus:ring-[#1e3a5f]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Material ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Material Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Unit</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Unit Cost</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Available Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status Quantity</th>
                <th className="px-4 py-3 text-left">
                  <button className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(material.id)}
                      onChange={() => toggleRow(material.id)}
                      className="w-4 h-4 text-[#1e3a5f] border-slate-300 rounded focus:ring-[#1e3a5f]"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">{material.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{material.description}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{material.unit}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{material.quantity}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{material.unitCost}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{material.availableQuantity}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-mono">{material.statusQuantity}</td>
                  <td className="px-4 py-3">
                    <button className="text-slate-400 hover:text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            {selectedRows.size} Selected (Max 5000 Selection allowed)
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              1-9 (9 Total)
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="px-3 py-1 text-sm font-medium text-white bg-[#1e3a5f] rounded">1</button>
              <button className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-900 rounded">2</button>
              <button className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-900 rounded">3</button>
              <button className="p-1 text-slate-600 hover:text-slate-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <select className="ml-2 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                <option>Show 50</option>
                <option>Show 100</option>
                <option>Show 200</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

