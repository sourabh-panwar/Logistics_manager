import os

files_to_update = [
    '/home/vivek/Logistics_manager/frontend/app/dispatch/page.tsx',
    '/home/vivek/Logistics_manager/frontend/app/active-deliveries/page.tsx',
    '/home/vivek/Logistics_manager/frontend/app/completed-deliveries/page.tsx'
]

replacements = {
    'bg-[#f7f6f2]': 'bg-dark-main bg-dot-pattern',
    'bg-white': 'bg-dark-card',
    'bg-stone-50': 'bg-white/5',
    'border-stone-200': 'border-white/10',
    'border-stone-300': 'border-white/20',
    'border-stone-100': 'border-white/5',
    'border-stone-800': 'border-white/20',
    'border-stone-700': 'border-white/20',
    'text-stone-950': 'text-white',
    'text-stone-900': 'text-white',
    'text-stone-800': 'text-stone-300',
    'text-stone-700': 'text-stone-400',
    'text-stone-600': 'text-stone-400',
    'text-stone-500': 'text-stone-400',
    'text-stone-400': 'text-stone-500',
    'bg-stone-950': 'bg-white',
    'text-white transition hover:bg-stone-800': 'text-black transition hover:bg-stone-200',
    'hover:border-stone-950': 'hover:border-white',
    'divide-stone-100': 'divide-white/5',
    'bg-emerald-50': 'bg-emerald-500/10',
    'border-emerald-200': 'border-emerald-500/30',
    'text-emerald-950': 'text-emerald-400',
    'text-teal-700': 'text-white/60',
    'bg-teal-50': 'bg-white/10',
    'border-teal-200': 'border-white/20',
    'text-teal-950': 'text-white',
    'hover:border-rose-300 hover:text-rose-700': 'hover:border-rose-500/50 hover:text-rose-400'
}

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r') as f:
        content = f.read()
    
    # special manual fixes before global string replacement
    
    # 1. Update the button colors that might have "bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
    content = content.replace('bg-stone-950 px-5 py-3 text-sm font-semibold text-white', 'bg-white px-5 py-3 text-sm font-semibold text-black')
    content = content.replace('bg-stone-950 px-4 py-3 text-sm font-semibold text-white', 'bg-white px-4 py-3 text-sm font-semibold text-black')
    
    # 2. Map component text if any - skip
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(file_path, 'w') as f:
        f.write(content)

print("Replacement complete.")
