// Authentication Verification
const userProfile = JSON.parse(localStorage.getItem('journalEdge_userProfile'));
if (!localStorage.getItem('journalEdge_auth') || !userProfile) {
    window.location.href = 'index.html';
}
document.getElementById('userNameDisplay').innerText = userProfile.firstName;

// Global State
let allAccounts = JSON.parse(localStorage.getItem('journalEdge_accounts')) || [];
let activeAccountId = localStorage.getItem('journalEdge_activeAccountId') || null;
let allTrades = JSON.parse(localStorage.getItem('journalEdge_trades')) || [];
let activeAccountTrades = [];
let activeTradeId = null;
let equityChart = null;

// Initialization
document.getElementById('openTime').value = new Date().toISOString().slice(0, 16);
initAccounts();

// --- Account Management Logic ---
function initAccounts() {
    if (allAccounts.length === 0 || !activeAccountId) {
        showAccountModal(true); // Force modal if no account selected
    } else {
        loadActiveAccount();
    }
}

function showAccountModal(force = false) {
    document.getElementById('accountModal').style.display = 'flex';
    document.getElementById('closeModalBtn').style.display = force ? 'none' : 'block';
    renderModalAccounts();
}

function renderModalAccounts() {
    const list = document.getElementById('modalExistingAccounts');
    list.innerHTML = '';

    if (allAccounts.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No accounts found. Create one below.</p>';
        return;
    }

    allAccounts.forEach(acc => {
        const item = document.createElement('div');
        item.className = `account-item ${acc.id === activeAccountId ? 'active' : ''}`;
        item.innerHTML = `
            <div class="acc-info" onclick="selectAccount('${acc.id}')" style="flex: 1;">
                <h4>${acc.nickname} ${acc.id === activeAccountId ? '(Active)' : ''}</h4>
                <p>${acc.platform} | Starting Bal: $${acc.balance.toLocaleString()}</p>
            </div>
            <button class="btn-delete" onclick="deleteAccount('${acc.id}', event)"><i class="fas fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
}

function selectAccount(id) {
    activeAccountId = id;
    localStorage.setItem('journalEdge_activeAccountId', id);
    document.getElementById('accountModal').style.display = 'none';
    loadActiveAccount();
}

function deleteAccount(id, event) {
    event.stopPropagation(); // Stop click from triggering selectAccount
    if (confirm("Delete this account and ALL its trades permanently?")) {
        allAccounts = allAccounts.filter(a => a.id !== id);
        allTrades = allTrades.filter(t => t.accountId !== id);

        localStorage.setItem('journalEdge_accounts', JSON.stringify(allAccounts));
        localStorage.setItem('journalEdge_trades', JSON.stringify(allTrades));

        if (activeAccountId === id) {
            activeAccountId = null;
            localStorage.removeItem('journalEdge_activeAccountId');
        }

        renderModalAccounts();
        if (allAccounts.length === 0) {
            document.getElementById('closeModalBtn').style.display = 'none';
        }
    }
}

document.getElementById('saveAccountBtn').addEventListener('click', () => {
    const balance = document.getElementById('setupBalance').value;
    const platform = document.getElementById('setupPlatform').value;
    const nickname = document.getElementById('setupNickname').value || `${platform} Account`;

    if (!balance) return alert("Please enter starting balance.");

    const newAcc = { id: Date.now().toString(), nickname, platform, balance: parseFloat(balance) };
    allAccounts.push(newAcc);
    localStorage.setItem('journalEdge_accounts', JSON.stringify(allAccounts));
    selectAccount(newAcc.id);
});

function loadActiveAccount() {
    const activeAcc = allAccounts.find(a => a.id === activeAccountId);
    if (!activeAcc) return showAccountModal(true);

    document.getElementById('activeAccountTitle').innerText = `- ${activeAcc.nickname} (${activeAcc.platform})`;
    activeAccountTrades = allTrades.filter(t => t.accountId === activeAccountId);

    renderSidebarAccounts();
    updateDashboard();
}

// --- Sidebar & Layout Controls ---
document.getElementById('toggleSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('hidden');
});
document.getElementById('openModalFromSidebar').addEventListener('click', () => showAccountModal(false));
document.getElementById('closeModalBtn').addEventListener('click', () => document.getElementById('accountModal').style.display = 'none');

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('journalEdge_auth');
    window.location.href = 'index.html';
});

function renderSidebarAccounts() {
    const list = document.getElementById('sidebarAccountList');
    list.innerHTML = '';
    allAccounts.forEach(acc => {
        const item = document.createElement('div');
        item.className = `account-item ${acc.id === activeAccountId ? 'active' : ''}`;
        item.onclick = () => selectAccount(acc.id);
        item.innerHTML = `<div class="acc-info"><h4>${acc.nickname}</h4><p>${acc.platform}</p></div>`;
        list.appendChild(item);
    });
}

// --- Trade Logic ---
function saveTrades() {
    // Update global array and save to local storage
    const otherTrades = allTrades.filter(t => t.accountId !== activeAccountId);
    allTrades = [...otherTrades, ...activeAccountTrades];
    localStorage.setItem('journalEdge_trades', JSON.stringify(allTrades));
    updateDashboard();
}

document.getElementById('openTradeBtn').addEventListener('click', () => {
    const trade = {
        id: Date.now().toString(),
        accountId: activeAccountId,
        asset: document.getElementById('asset').value,
        direction: document.getElementById('direction').value,
        entryPrice: document.getElementById('entryPrice').value,
        lotSize: document.getElementById('lotSize').value,
        openTime: document.getElementById('openTime').value,
        tags: document.getElementById('tags').value,
        status: 'Open',
        pnl: 0
    };

    activeAccountTrades.push(trade);
    saveTrades();
    alert("Trade Opened Successfully!");
});

function openCloseModal(id) {
    activeTradeId = id;
    document.getElementById('closeTime').value = new Date().toISOString().slice(0, 16);
    document.getElementById('closeModal').style.display = 'flex';
}

document.getElementById('cancelClose').addEventListener('click', () => document.getElementById('closeModal').style.display = 'none');

document.getElementById('confirmClose').addEventListener('click', () => {
    const tradeIndex = activeAccountTrades.findIndex(t => t.id === activeTradeId);
    if (tradeIndex > -1) {
        activeAccountTrades[tradeIndex].status = 'Closed';
        activeAccountTrades[tradeIndex].closeTime = document.getElementById('closeTime').value;
        activeAccountTrades[tradeIndex].exitPrice = document.getElementById('exitPrice').value;
        activeAccountTrades[tradeIndex].pnl = parseFloat(document.getElementById('closePnl').value) || 0;
        saveTrades();
    }
    document.getElementById('closeModal').style.display = 'none';
});

// --- Dashboard & Charts ---
function updateDashboard() {
    const closedTrades = activeAccountTrades.filter(t => t.status === 'Closed');
    const openTrades = activeAccountTrades.filter(t => t.status === 'Open');

    const totalPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = closedTrades.filter(t => t.pnl > 0);
    const losses = closedTrades.filter(t => t.pnl < 0);

    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? grossProfit : 0) : (grossProfit / grossLoss);

    document.getElementById('netPnl').innerText = `$${totalPnl.toFixed(2)}`;
    document.getElementById('netPnl').className = totalPnl >= 0 ? 'profit' : 'loss';
    document.getElementById('winRate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('profitFactor').innerText = profitFactor.toFixed(2);
    document.getElementById('activeTrades').innerText = openTrades.length;
    document.getElementById('closedTrades').innerText = closedTrades.length;

    renderTable();
    renderChart(closedTrades);
}

function renderTable() {
    const tbody = document.getElementById('tradeBody');
    tbody.innerHTML = '';
    const sortedTrades = [...activeAccountTrades].sort((a, b) => new Date(b.openTime) - new Date(a.openTime));

    sortedTrades.forEach(t => {
        const tr = document.createElement('tr');
        const isClosed = t.status === 'Closed';
        tr.innerHTML = `
            <td class="${isClosed ? 'status-closed' : 'status-open'}">${t.status}</td>
            <td>${t.asset}</td>
            <td>${t.direction}</td>
            <td>${new Date(t.openTime).toLocaleString()}</td>
            <td>${t.entryPrice}</td>
            <td>${t.lotSize}</td>
            <td class="${isClosed ? (t.pnl >= 0 ? 'profit' : 'loss') : ''}">${isClosed ? '$' + t.pnl.toFixed(2) : '-'}</td>
            <td>${!isClosed ? `<button class="btn-close" onclick="openCloseModal('${t.id}')">Close</button>` : 'Done'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderChart(closedTrades) {
    const ctx = document.getElementById('equityCurve').getContext('2d');
    const activeAcc = allAccounts.find(a => a.id === activeAccountId);
    const startingBalance = activeAcc ? activeAcc.balance : 0;

    const chronological = [...closedTrades].sort((a, b) => new Date(a.closeTime) - new Date(b.closeTime));

    let currentEquity = startingBalance;
    const dataPoints = [startingBalance];
    const labels = ['Start'];

    chronological.forEach((t, i) => {
        currentEquity += t.pnl;
        dataPoints.push(currentEquity);
        labels.push(`Trade ${i + 1}`);
    });

    if (equityChart) equityChart.destroy();
    equityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Account Equity ($)', data: dataPoints, borderColor: '#2962ff', backgroundColor: 'rgba(41, 98, 255, 0.1)', borderWidth: 2, fill: true, tension: 0.1 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#333' }, ticks: { color: '#888' } }, x: { grid: { display: false }, ticks: { color: '#888' } } } }
    });
}

// --- CSV Export (Active Account Only) ---
document.getElementById('exportCsvBtn').addEventListener('click', () => {
    if (!activeAccountTrades || activeAccountTrades.length === 0) return alert("No trades to export for this account.");

    const headers = ['Trade ID', 'Asset', 'Direction', 'Status', 'Entry Time', 'Exit Time', 'Lot Size', 'Entry Price', 'Exit Price', 'Stop Loss', 'Take Profit', 'Net P&L'];
    const csvRows = [headers.join(',')];

    activeAccountTrades.forEach(t => {
        const row = [t.id, t.asset, t.direction, t.status, t.openTime, t.closeTime || '', t.lotSize, t.entryPrice, t.exitPrice || '', t.stopLoss || '', t.takeProfit || '', t.pnl || ''];
        csvRows.push(row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `JournalEdge_${activeAccountId}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});