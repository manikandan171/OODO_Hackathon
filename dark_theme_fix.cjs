const fs = require('fs');
const files = [
  'src/components/TripsView.tsx',
  'src/components/MaintenanceView.tsx',
  'src/components/FuelExpensesView.tsx',
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Replace light theme input/select/textarea classes with dark theme ones
    content = content.replace(/bg-white/g, 'bg-[#1a1a1a]');
    content = content.replace(/text-slate-900/g, 'text-slate-100');
    content = content.replace(/text-slate-800/g, 'text-slate-200');
    content = content.replace(/text-slate-700/g, 'text-slate-300');
    content = content.replace(/bg-slate-50/g, 'bg-[#111]');
    content = content.replace(/bg-slate-100/g, 'bg-[#1a1a1a]');
    content = content.replace(/border-slate-200/g, 'border-slate-700');
    content = content.replace(/border-slate-300/g, 'border-slate-600');
    content = content.replace(/shadow-xl/g, 'shadow-2xl shadow-black/50');

    // Replace text-white with text-slate-200
    content = content.replace(/text-white/g, 'text-slate-200');
    
    // Ensure all standard inputs get a consistent dark styling
    content = content.replace(/w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:border-blue-500/g, 'w-full px-3 py-2 rounded-lg border bg-[#1a1a1a] text-slate-200 border-slate-700 focus:outline-hidden focus:border-blue-500');

    fs.writeFileSync(f, content, 'utf8');
    console.log('Processed ' + f);
  }
});
