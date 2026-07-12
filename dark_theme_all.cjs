const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.tsx'))
  .map(f => path.join(dir, f));
files.push(path.join(__dirname, 'src', 'App.tsx'));
files.push(path.join(__dirname, 'src', 'components', 'ui', 'KpiCard.tsx'));
files.push(path.join(__dirname, 'src', 'components', 'ui', 'DataTable.tsx'));

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Convert remaining white and light colors
    content = content.replace(/bg-white/g, 'bg-[#1a1a1a]');
    content = content.replace(/text-white/g, 'text-slate-200');
    content = content.replace(/border-white/g, 'border-slate-700');
    content = content.replace(/bg-slate-50/g, 'bg-[#111]');
    content = content.replace(/bg-slate-100/g, 'bg-[#1a1a1a]');
    content = content.replace(/border-slate-100/g, 'border-slate-800');
    content = content.replace(/border-slate-200/g, 'border-slate-700');
    content = content.replace(/text-slate-900/g, 'text-slate-100');
    content = content.replace(/text-slate-800/g, 'text-slate-200');
    content = content.replace(/text-slate-700/g, 'text-slate-300');
    content = content.replace(/shadow-xl/g, 'shadow-2xl shadow-black/50');

    // Standardize forms
    content = content.replace(/className="w-full text-sm/g, 'className="w-full bg-[#1a1a1a] text-slate-200 border-slate-700 focus:border-blue-500 text-sm');
    content = content.replace(/w-full px-3 py-2 rounded-lg border focus:outline-hidden focus:border-blue-500/g, 'w-full px-3 py-2 rounded-lg border bg-[#1a1a1a] text-slate-200 border-slate-700 focus:outline-hidden focus:border-blue-500');
    
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fully dark-themed ' + f);
  }
});
