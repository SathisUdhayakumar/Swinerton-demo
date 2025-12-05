'use client';

interface SegmentControlProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SegmentControl({ tabs, activeTab, onTabChange }: SegmentControlProps) {
  return (
    <div 
      role="tablist" 
      aria-label="Workflow type"
      className="flex bg-slate-100 rounded-lg p-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === tab.id
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}


