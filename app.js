/**
 * Cashbook - Core Application Logic
 */

// --- Constants & Defaults ---
const DEFAULT_CATEGORIES = [
    { id: '1', name: 'Food', icon: 'utensils', color: '#f87171' },
    { id: '2', name: 'Transport', icon: 'car', color: '#60a5fa' },
    { id: '3', name: 'Rent', icon: 'home', color: '#fbbf24' },
    { id: '4', name: 'Utilities', icon: 'zap', color: '#a78bfa' },
    { id: '5', name: 'Salary', icon: 'banknote', color: '#34d399' },
    { id: '6', name: 'Shopping', icon: 'shopping-bag', color: '#f472b6' },
    { id: '7', name: 'Entertainment', icon: 'play', color: '#fb7185' },
    { id: '8', name: 'Health', icon: 'heart', color: '#fca5a5' },
    { id: '9', name: 'Misc', icon: 'grid', color: '#94a3b8' }
];

// --- State Management ---
let state = {
    transactions: JSON.parse(localStorage.getItem('transactions')) || [],
    categories: JSON.parse(localStorage.getItem('categories')) || DEFAULT_CATEGORIES,
    currentView: 'home',
    filterType: 'all', // all, weekly, monthly, yearly
    filterValue: '',
    statsFilterType: 'all',
    statsFilterValue: '',
};

const saveState = () => {
    localStorage.setItem('transactions', JSON.stringify(state.transactions));
    localStorage.setItem('categories', JSON.stringify(state.categories));
};

// --- Utils ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getWeekRange = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const start = new Date(d.setDate(diff));
    const end = new Date(new Date(start).setDate(start.getDate() + 6));
    const fmt = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} - ${fmt(end)}, ${start.getFullYear()}`;
};

const getWeekId = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const sunday = new Date(d.setDate(diff));
    return sunday.toISOString().split('T')[0];
};

const getMonthId = (dateStr) => {
    return dateStr.substring(0, 7); // YYYY-MM
};

const getYearId = (dateStr) => {
    return dateStr.substring(0, 4); // YYYY
};

const generateFilterOptions = (type, currentValue) => {
    if (type === 'all') return '';
    
    const values = new Set();
    state.transactions.forEach(t => {
        if (type === 'weekly') values.add(getWeekId(t.date));
        else if (type === 'monthly') values.add(getMonthId(t.date));
        else if (type === 'yearly') values.add(getYearId(t.date));
    });
    
    // If no transactions, add current period as default
    if (values.size === 0) {
        const now = new Date().toISOString().split('T')[0];
        if (type === 'weekly') values.add(getWeekId(now));
        else if (type === 'monthly') values.add(getMonthId(now));
        else if (type === 'yearly') values.add(getYearId(now));
    }
    
    const sortedValues = Array.from(values).sort((a, b) => b.localeCompare(a));
    
    return sortedValues.map(val => {
        let label = val;
        if (type === 'weekly') label = getWeekRange(val);
        else if (type === 'monthly') {
            const [y, m] = val.split('-');
            label = new Date(y, parseInt(m) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        return `<option value="${val}" ${val === currentValue ? 'selected' : ''}>${label}</option>`;
    }).join('');
};

// --- View Rendering ---
const views = {
    home: () => {
        let transactions = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Apply Filters
        if (state.filterType !== 'all') {
            if (state.filterType === 'weekly') {
                transactions = transactions.filter(t => getWeekId(t.date) === state.filterValue);
            } else if (state.filterType === 'monthly') {
                transactions = transactions.filter(t => getMonthId(t.date) === state.filterValue);
            } else if (state.filterType === 'yearly') {
                transactions = transactions.filter(t => getYearId(t.date) === state.filterValue);
            }
        }

        // Group by date
        const groups = transactions.reduce((acc, t) => {
            const date = t.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(t);
            return acc;
        }, {});

        const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

        let html = `
            <div class="animate-fade-in-up">
                <header class="mb-6 flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-bold">Cashbook</h1>
                        <p class="text-slate-500 text-sm">Track your daily cash flow</p>
                    </div>
                </header>
                
                <div class="grid grid-cols-1 gap-4 mb-8">
                    <div class="card bg-primary text-white overflow-hidden relative">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <p class="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
                        <h2 class="text-3xl font-bold">${formatCurrency(transactions.reduce((acc, t) => acc + t.amount, 0))}</h2>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="card flex flex-col justify-between">
                            <p class="text-slate-400 text-[10px] font-medium uppercase mb-1">Income</p>
                            <p class="text-green-500 font-bold text-lg">${formatCurrency(transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0))}</p>
                        </div>
                        <div class="card flex flex-col justify-between">
                            <p class="text-slate-400 text-[10px] font-medium uppercase mb-1">Expenses</p>
                            <p class="text-red-500 font-bold text-lg">${formatCurrency(Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0)))}</p>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-4 mb-4">
                    <h3 class="font-bold">History</h3>
                    <div class="flex gap-2">
                        <select id="filter-type-select" class="!py-1 !px-2 !text-xs !w-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-500 font-semibold outline-none">
                            <option value="all" ${state.filterType === 'all' ? 'selected' : ''}>All Time</option>
                            <option value="weekly" ${state.filterType === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="monthly" ${state.filterType === 'monthly' ? 'selected' : ''}>Monthly</option>
                            <option value="yearly" ${state.filterType === 'yearly' ? 'selected' : ''}>Yearly</option>
                        </select>
                        ${state.filterType !== 'all' ? `
                            <select id="filter-value-select" class="!py-1 !px-2 !text-xs !w-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-500 font-semibold outline-none">
                                ${generateFilterOptions(state.filterType, state.filterValue)}
                            </select>
                        ` : ''}
                    </div>
                </div>

                <div class="space-y-6">
                    ${sortedDates.length === 0 ? `
                        <div class="py-12 text-center">
                            <div class="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="receipt" class="text-slate-400"></i>
                            </div>
                            <p class="text-slate-400 text-sm">No transactions yet.<br>Tap the + button to add one.</p>
                        </div>
                    ` : sortedDates.map(date => `
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">${formatDate(date)}</p>
                            <div class="space-y-2">
                                ${groups[date].map(t => {
                                    const cat = state.categories.find(c => c.id === t.categoryId) || { icon: 'grid', color: '#94a3b8' };
                                    return `
                                        <div class="transaction-item flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800 transition-colors" onclick="editTransaction('${t.id}')">
                                            <div class="flex items-center flex-1">
                                                <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" style="background-color: ${cat.color}20; color: ${cat.color}">
                                                    <i data-lucide="${cat.icon}" class="w-5 h-5"></i>
                                                </div>
                                                <div class="flex-1">
                                                    <p class="font-semibold text-sm">${t.description}</p>
                                                    <p class="text-slate-400 text-[10px]">${t.categoryName}</p>
                                                </div>
                                            </div>
                                            <p class="font-bold text-sm ${t.amount < 0 ? 'text-red-500' : 'text-green-500'}">
                                                ${t.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(t.amount))}
                                            </p>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        return html;
    },
    stats: () => {
        // Apply Filters
        let filteredTxns = [...state.transactions];
        if (state.statsFilterType !== 'all') {
            if (state.statsFilterType === 'weekly') {
                filteredTxns = filteredTxns.filter(t => getWeekId(t.date) === state.statsFilterValue);
            } else if (state.statsFilterType === 'monthly') {
                filteredTxns = filteredTxns.filter(t => getMonthId(t.date) === state.statsFilterValue);
            } else if (state.statsFilterType === 'yearly') {
                filteredTxns = filteredTxns.filter(t => getYearId(t.date) === state.statsFilterValue);
            }
        }

        const expensesByCategory = {};
        filteredTxns.filter(t => t.amount < 0).forEach(t => {
            expensesByCategory[t.categoryName] = (expensesByCategory[t.categoryName] || 0) + Math.abs(t.amount);
        });

        const totalIncome = filteredTxns.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
        const totalExpense = Object.values(expensesByCategory).reduce((acc, val) => acc + val, 0);
        const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
        const filterLabel = { all: 'All Time', weekly: 'This Week', monthly: 'This Month', yearly: 'This Year' };

        return `
            <div class="animate-fade-in-up">
                <div class="flex flex-col gap-4 mb-6">
                    <h1 class="text-2xl font-bold">Analytics</h1>
                    <div class="flex gap-2">
                        <select id="stats-filter-type" style="padding: 4px 8px; font-size: 0.75rem; width: auto; background: white; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; font-weight: 600; outline: none;">
                            <option value="all" ${state.statsFilterType === 'all' ? 'selected' : ''}>All Time</option>
                            <option value="weekly" ${state.statsFilterType === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="monthly" ${state.statsFilterType === 'monthly' ? 'selected' : ''}>Monthly</option>
                            <option value="yearly" ${state.statsFilterType === 'yearly' ? 'selected' : ''}>Yearly</option>
                        </select>
                        ${state.statsFilterType !== 'all' ? `
                            <select id="stats-filter-value" style="padding: 4px 8px; font-size: 0.75rem; width: auto; background: white; border: 1px solid #e2e8f0; border-radius: 8px; color: #64748b; font-weight: 600; outline: none;">
                                ${generateFilterOptions(state.statsFilterType, state.statsFilterValue)}
                            </select>
                        ` : ''}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="card flex flex-col justify-between">
                        <p class="text-slate-400 text-[10px] font-medium uppercase mb-1">Income</p>
                        <p class="text-green-500 font-bold text-lg">${formatCurrency(totalIncome)}</p>
                    </div>
                    <div class="card flex flex-col justify-between">
                        <p class="text-slate-400 text-[10px] font-medium uppercase mb-1">Expenses</p>
                        <p class="text-red-500 font-bold text-lg">${formatCurrency(totalExpense)}</p>
                    </div>
                </div>

                <div class="card mb-6">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-4 text-center">Expense Breakdown (${filterLabel[state.statsFilter||'all']})</p>
                    <div class="relative h-64">
                        <canvas id="expenseChart"></canvas>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <h3 class="font-bold">Category Breakdown</h3>
                    <div class="space-y-3">
                        ${sortedCategories.length === 0 ? `
                            <p class="text-slate-400 text-sm italic">No expense data to analyze yet.</p>
                        ` : sortedCategories.map(([name, amount]) => {
                            const cat = state.categories.find(c => c.name === name) || { color: '#94a3b8' };
                            const percent = ((amount / totalExpense) * 100).toFixed(1);
                            return `
                                <div class="card !p-4 flex items-center justify-between">
                                    <div class="flex items-center flex-1">
                                        <div class="w-8 h-8 rounded-lg mr-3" style="background-color: ${cat.color}20; color: ${cat.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <i data-lucide="${cat.icon || 'tag'}" class="w-4 h-4"></i>
                                        </div>
                                        <div class="flex-1 mr-4">
                                            <div class="flex justify-between mb-1">
                                                <span class="text-sm font-semibold">${name}</span>
                                                <span class="text-xs text-slate-400">${percent}%</span>
                                            </div>
                                            <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div class="h-full rounded-full" style="background-color: ${cat.color}; width: ${percent}%"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="font-bold text-sm text-red-500">${formatCurrency(amount)}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    categories: () => `
        <div class="animate-fade-in-up">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold">Categories</h1>
                <button id="add-category-btn" class="text-primary font-bold text-sm">+ Add New</button>
            </div>
            <div class="grid grid-cols-2 gap-4">
                ${state.categories.map(c => `
                    <div class="card relative group">
                        <button onclick="deleteCategory('${c.id}')" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                        <div class="flex flex-col items-center">
                            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style="background-color: ${c.color}20; color: ${c.color}">
                                <i data-lucide="${c.icon}" class="w-6 h-6"></i>
                            </div>
                            <span class="font-medium text-sm">${c.name}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `,
    settings: () => `
        <div class="animate-fade-in-up">
            <h1 class="text-2xl font-bold mb-6">Settings</h1>
            <div class="space-y-4">
                <button id="export-btn" class="card w-full flex items-center justify-between">
                    <div class="flex items-center">
                        <i data-lucide="download" class="mr-3 text-primary"></i>
                        <span>Export to Excel</span>
                    </div>
                    <i data-lucide="chevron-right" class="text-slate-300"></i>
                </button>
                <button id="import-btn" class="card w-full flex items-center justify-between">
                    <div class="flex items-center">
                        <i data-lucide="upload" class="mr-3 text-green-500"></i>
                        <span>Import from Excel</span>
                    </div>
                    <i data-lucide="chevron-right" class="text-slate-300"></i>
                </button>
                <input type="file" id="import-file-input" accept=".xlsx, .xls" style="display:none;">
                <div class="card flex justify-between items-center">
                    <div class="flex items-center">
                        <i data-lucide="moon" class="mr-3 text-slate-500"></i>
                        <span>Dark Mode</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="dark-mode-toggle" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
        </div>
    `
};

const switchView = (viewName) => {
    state.currentView = viewName;
    const content = document.getElementById('app-content');
    content.innerHTML = views[viewName]();
    
    // Update nav colors
    ['home', 'stats', 'categories', 'settings'].forEach(v => {
        const btn = document.getElementById(`nav-${v}`);
        if (btn) {
            if (v === viewName) {
                btn.classList.add('text-primary');
                btn.classList.remove('text-slate-400');
            } else {
                btn.classList.remove('text-primary');
                btn.classList.add('text-slate-400');
            }
        }
    });

    lucide.createIcons();
    if (viewName === 'stats') {
        initChart(state.statsFilterType, state.statsFilterValue);
        const statsTypeSelect = document.getElementById('stats-filter-type');
        const statsValueSelect = document.getElementById('stats-filter-value');
        
        if (statsTypeSelect) {
            statsTypeSelect.onchange = (e) => {
                state.statsFilterType = e.target.value;
                if (state.statsFilterType !== 'all') {
                    const options = new Set();
                    state.transactions.forEach(t => {
                        if (state.statsFilterType === 'weekly') options.add(getWeekId(t.date));
                        else if (state.statsFilterType === 'monthly') options.add(getMonthId(t.date));
                        else if (state.statsFilterType === 'yearly') options.add(getYearId(t.date));
                    });
                    const sorted = Array.from(options).sort((a,b) => b.localeCompare(a));
                    state.statsFilterValue = sorted[0] || new Date().toISOString().split('T')[0];
                }
                switchView('stats');
            };
        }
        if (statsValueSelect) {
            statsValueSelect.onchange = (e) => {
                state.statsFilterValue = e.target.value;
                switchView('stats');
            };
        }
    }
    
    if (viewName === 'home') {
        const typeSelect = document.getElementById('filter-type-select');
        const valueSelect = document.getElementById('filter-value-select');
        
        if (typeSelect) {
            typeSelect.onchange = (e) => {
                state.filterType = e.target.value;
                if (state.filterType !== 'all') {
                    const options = new Set();
                    state.transactions.forEach(t => {
                        if (state.filterType === 'weekly') options.add(getWeekId(t.date));
                        else if (state.filterType === 'monthly') options.add(getMonthId(t.date));
                        else if (state.filterType === 'yearly') options.add(getYearId(t.date));
                    });
                    const sorted = Array.from(options).sort((a,b) => b.localeCompare(a));
                    state.filterValue = sorted[0] || new Date().toISOString().split('T')[0];
                }
                switchView('home');
            };
        }
        if (valueSelect) {
            valueSelect.onchange = (e) => {
                state.filterValue = e.target.value;
                switchView('home');
            };
        }
    }
    if (viewName === 'settings') {
        document.getElementById('export-btn').onclick = exportToExcel;
        document.getElementById('import-btn').onclick = () => document.getElementById('import-file-input').click();
        document.getElementById('import-file-input').onchange = importFromExcel;
        document.getElementById('dark-mode-toggle').onclick = toggleDarkMode;
        document.getElementById('dark-mode-toggle').checked = document.documentElement.classList.contains('dark');
    }
    if (viewName === 'categories') {
        document.getElementById('add-category-btn').onclick = showAddCategoryModal;
    }
};

const editTransaction = (id) => {
    const t = state.transactions.find(item => item.id === id);
    if (!t) return;

    const categoriesOptions = state.categories.map(c => `<option value="${c.id}" ${c.id === t.categoryId ? 'selected' : ''}>${c.name}</option>`).join('');
    
    showModal(`
        <div class="p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Edit Transaction</h2>
                <div class="flex gap-4">
                    <button id="delete-t-btn" class="text-red-500"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                    <button id="close-modal" class="text-slate-400"><i data-lucide="x"></i></button>
                </div>
            </div>
            <form id="edit-transaction-form" class="space-y-4">
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Amount</label>
                    <input type="number" id="t-amount" value="${Math.abs(t.amount)}" step="0.01" required>
                </div>
                <div class="flex gap-4">
                    <button type="button" id="type-expense" class="flex-1 py-3 rounded-xl border-2 ${t.amount < 0 ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 bg-slate-50 text-slate-400'} font-bold">Expense</button>
                    <button type="button" id="type-income" class="flex-1 py-3 rounded-xl border-2 ${t.amount >= 0 ? 'border-green-500 bg-green-50 text-green-600' : 'border-slate-100 bg-slate-50 text-slate-400'} font-bold">Income</button>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Description</label>
                    <input type="text" id="t-desc" value="${t.description}" required>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Category</label>
                    <select id="t-category" required>
                        ${categoriesOptions}
                    </select>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Date & Time</label>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <input type="date" id="t-date" value="${t.date}" required style="flex: 1;">
                        <button type="button" id="open-cal-edit" style="padding: 10px 14px; background:#6366f1; color:white; border-radius:10px; border:none; cursor:pointer; flex-shrink:0;" title="Open calendar">
                            <i data-lucide="calendar" style="width:18px;height:18px;"></i>
                        </button>
                    </div>
                    <input type="time" id="t-time" value="${t.time || '00:00'}" required>
                </div>
                <button type="submit" class="btn-primary w-full mt-4" style="padding: 16px; font-size: 1rem; border-radius: 14px;">Update Transaction</button>
            </form>
        </div>
    `);

    // Wire up calendar button for edit
    const dateInput = document.getElementById('t-date');
    document.getElementById('open-cal-edit').onclick = () => {
        try {
            dateInput.showPicker();
        } catch (e) {
            dateInput.focus();
            dateInput.click();
        }
    };

    let type = t.amount < 0 ? 'expense' : 'income';
    
    document.getElementById('type-expense').onclick = () => {
        type = 'expense';
        document.getElementById('type-expense').className = 'flex-1 py-3 rounded-xl border-2 border-red-500 bg-red-50 text-red-600 font-bold';
        document.getElementById('type-income').className = 'flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-bold';
    };
    document.getElementById('type-income').onclick = () => {
        type = 'income';
        document.getElementById('type-income').className = 'flex-1 py-3 rounded-xl border-2 border-green-500 bg-green-50 text-green-600 font-bold';
        document.getElementById('type-expense').className = 'flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-bold';
    };

    document.getElementById('delete-t-btn').onclick = () => {
        if (confirm('Delete this transaction?')) {
            state.transactions = state.transactions.filter(item => item.id !== id);
            saveState();
            hideModal();
            switchView('home');
        }
    };

    document.getElementById('close-modal').onclick = hideModal;
    document.getElementById('edit-transaction-form').onsubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('t-amount').value);
        const desc = document.getElementById('t-desc').value;
        const catId = document.getElementById('t-category').value;
        const date = document.getElementById('t-date').value;
        const time = document.getElementById('t-time').value;
        const category = state.categories.find(c => c.id === catId);

        t.description = desc;
        t.amount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
        t.categoryId = catId;
        t.categoryName = category.name;
        t.date = date;
        t.time = time;

        saveState();
        hideModal();
        switchView('home');
    };
};

const showAddCategoryModal = () => {
    showModal(`
        <div class="p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">New Category</h2>
                <button id="close-modal" class="text-slate-400"><i data-lucide="x"></i></button>
            </div>
            <form id="category-form" class="space-y-4">
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Category Name</label>
                    <input type="text" id="cat-name" placeholder="e.g. Travel" required>
                </div>
                <div>
                    <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Color</label>
                    <input type="color" id="cat-color" value="#6366f1" class="h-12 p-1">
                </div>
                <button type="submit" class="btn-primary w-full mt-4">Add Category</button>
            </form>
        </div>
    `);

    document.getElementById('close-modal').onclick = hideModal;
    document.getElementById('category-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value;
        const color = document.getElementById('cat-color').value;

        state.categories.push({
            id: Date.now().toString(),
            name: name,
            icon: 'tag',
            color: color
        });

        saveState();
        hideModal();
        switchView('categories');
    };
};

const deleteCategory = (id) => {
    if (confirm('Delete this category? Transactions using it will still be saved but category info might be missing.')) {
        state.categories = state.categories.filter(c => c.id !== id);
        saveState();
        switchView('categories');
    }
};

const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
};

const exportToExcel = () => {
    const data = state.transactions.map(t => ({
        Date: t.date,
        Time: t.time || '00:00',
        Description: t.description,
        Category: t.categoryName,
        Amount: t.amount
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Cashbook_Export.xlsx");
};

const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const wb = XLSX.read(evt.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws);
            let imported = 0;
            rows.forEach(row => {
                const rowDate = typeof row.Date === 'number'
                    ? new Date(Math.round((row.Date - 25569) * 86400 * 1000)).toISOString().split('T')[0]
                    : String(row.Date);
                const rowTime = row.Time ? String(row.Time) : '00:00';
                const rowAmount = parseFloat(row.Amount);
                const rowDesc = String(row.Description);

                // Duplicate Detection
                const isDuplicate = state.transactions.some(t => 
                    t.date === rowDate && 
                    t.time === rowTime && 
                    t.description === rowDesc && 
                    t.amount === rowAmount
                );

                if (isDuplicate) return;

                if (!row.Date || !row.Description || row.Amount === undefined) return;
                const cat = state.categories.find(c => c.name === row.Category) || state.categories[state.categories.length - 1];
                state.transactions.push({
                    id: Date.now().toString() + Math.random(),
                    description: rowDesc,
                    amount: rowAmount,
                    categoryId: cat.id,
                    categoryName: cat.name,
                    date: rowDate,
                    time: rowTime
                });
                imported++;
            });
            saveState();
            e.target.value = '';
            if (imported < rows.length) {
                alert(`Import complete! Added ${imported} new transaction(s). Skipped ${rows.length - imported} duplicates.`);
            } else {
                alert(`Successfully imported all ${imported} transaction(s)!`);
            }
            switchView('home');
        } catch (err) {
            alert('Import failed. Please make sure the file matches the export format.');
        }
    };
    reader.readAsBinaryString(file);
};

// --- Modals ---
const showModal = (contentHtml) => {
    const container = document.getElementById('modal-container');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = contentHtml;
    container.classList.remove('hidden');
    
    setTimeout(() => {
        backdrop.classList.add('opacity-100');
        content.classList.remove('translate-y-full');
    }, 10);

    lucide.createIcons();
};

const hideModal = () => {
    const container = document.getElementById('modal-container');
    const backdrop = document.getElementById('modal-backdrop');
    const content = document.getElementById('modal-content');
    
    backdrop.classList.remove('opacity-100');
    content.classList.add('translate-y-full');
    
    setTimeout(() => {
        container.classList.add('hidden');
    }, 300);
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Apply dark mode from storage
    if (localStorage.getItem('darkMode') === 'true' || 
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }

    switchView('home');

    // Nav Events
    document.getElementById('nav-home').onclick = () => switchView('home');
    document.getElementById('nav-stats').onclick = () => switchView('stats');
    document.getElementById('nav-categories').onclick = () => switchView('categories');
    document.getElementById('nav-settings').onclick = () => switchView('settings');
    
    document.getElementById('fab-add').onclick = () => {
        const categoriesOptions = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        showModal(`
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-bold">Add Transaction</h2>
                    <button id="close-modal" class="text-slate-400"><i data-lucide="x"></i></button>
                </div>
                <form id="transaction-form" class="space-y-4">
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Amount</label>
                        <input type="number" id="t-amount" placeholder="0.00" step="0.01" required>
                    </div>
                    <div class="flex gap-4">
                        <button type="button" id="type-expense" class="flex-1 py-3 rounded-xl border-2 border-red-500 bg-red-50 text-red-600 font-bold">Expense</button>
                        <button type="button" id="type-income" class="flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-bold">Income</button>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Description</label>
                        <input type="text" id="t-desc" placeholder="What was this for?" required>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Category</label>
                        <select id="t-category" required>
                            ${categoriesOptions}
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Date & Time</label>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <input type="date" id="t-date" value="${new Date().toISOString().split('T')[0]}" required style="flex: 1;">
                            <button type="button" id="open-cal-add" style="padding: 10px 14px; background:#6366f1; color:white; border-radius:10px; border:none; cursor:pointer; flex-shrink:0;" title="Open calendar">
                                <i data-lucide="calendar" style="width:18px;height:18px;"></i>
                            </button>
                        </div>
                        <input type="time" id="t-time" value="${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}" required>
                    </div>
                    <button type="submit" class="btn-primary w-full mt-4" style="padding: 16px; font-size: 1rem; border-radius: 14px;">Save Transaction</button>
                </form>
            </div>
        `);

        // Wire up calendar button for add
        const dateInput = document.getElementById('t-date');
        document.getElementById('open-cal-add').onclick = () => {
            try {
                dateInput.showPicker();
            } catch (e) {
                dateInput.focus();
                dateInput.click();
            }
        };

        let type = 'expense';
        document.getElementById('type-expense').onclick = () => {
            type = 'expense';
            document.getElementById('type-expense').className = 'flex-1 py-3 rounded-xl border-2 border-red-500 bg-red-50 text-red-600 font-bold';
            document.getElementById('type-income').className = 'flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-bold';
        };
        document.getElementById('type-income').onclick = () => {
            type = 'income';
            document.getElementById('type-income').className = 'flex-1 py-3 rounded-xl border-2 border-green-500 bg-green-50 text-green-600 font-bold';
            document.getElementById('type-expense').className = 'flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-bold';
        };

        document.getElementById('close-modal').onclick = hideModal;
        document.getElementById('transaction-form').onsubmit = (e) => {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('t-amount').value);
            const desc = document.getElementById('t-desc').value;
            const catId = document.getElementById('t-category').value;
            const date = document.getElementById('t-date').value;
            const time = document.getElementById('t-time').value;
            const category = state.categories.find(c => c.id === catId);

            state.transactions.push({
                id: Date.now().toString(),
                description: desc,
                amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
                categoryId: catId,
                categoryName: category.name,
                date: date,
                time: time
            });

            saveState();
            hideModal();
            switchView('home');
        };
    };

    // Global background click to close modal
    document.getElementById('modal-backdrop').onclick = hideModal;
});

const initChart = (filterType = 'all', filterValue = '') => {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;

    let txns = [...state.transactions];
    if (filterType !== 'all') {
        if (filterType === 'weekly') {
            txns = txns.filter(t => getWeekId(t.date) === filterValue);
        } else if (filterType === 'monthly') {
            txns = txns.filter(t => getMonthId(t.date) === filterValue);
        } else if (filterType === 'yearly') {
            txns = txns.filter(t => getYearId(t.date) === filterValue);
        }
    }

    const expensesByCategory = {};
    txns.filter(t => t.amount < 0).forEach(t => {
        expensesByCategory[t.categoryName] = (expensesByCategory[t.categoryName] || 0) + Math.abs(t.amount);
    });

    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#6366f1', '#ec4899', '#8b5cf6', '#fbbf24', '#34d399', '#f472b6', '#fb7185', '#94a3b8'
                ],
                borderWidth: 0,
                spacing: 5
            }]
        },
        options: {
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 10 }
                    }
                }
            }
        }
    });
};
