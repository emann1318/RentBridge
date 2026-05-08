@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
}

body {
  @apply font-sans bg-slate-50 text-slate-900 antialiased;
}

.card-high-density {
  @apply bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden;
}

.stat-label {
  @apply text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1;
}

.btn-primary-dense {
  @apply bg-slate-900 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors;
}

