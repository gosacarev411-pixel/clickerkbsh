// Безопасная инициализация Telegram WebApp
const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : {
    expand: () => {},
    CloudStorage: null,
    HapticFeedback: null
};

try {
    tg.expand();
} catch (e) {}

let playerName = '';
let balance = 0;
let totalEarned = 0;
let crystals = 5;
let clickPower = 1;
let passiveIncome = 0;
let hunger = 100;

let upgrades = {
    hat: 0,
    shawarma: 0,
    factory: 0,
    oil: 0,
    it: 0,
    space: 0
};

const ranks = [
    { name: "Бродяга", threshold: 0, avatar: "📦" },
    { name: "Работяга", threshold: 5000, avatar: "🧥" },
    { name: "Стартапер", threshold: 100000, avatar: "💻" },
    { name: "Бизнесмен", threshold: 2000000, avatar: "👔" },
    { name: "Олигарх", threshold: 50000000, avatar: "🚗" },
    { name: "🏆 Миллиардер", threshold: 1000000000, avatar: "🏝️" }
];

function loadGame() {
    if (tg.CloudStorage) {
        tg.CloudStorage.getItem('save_game_all', (err, val) => {
            if (!err && val) {
                try {
                    const data = JSON.parse(val);
                    restoreData(data);
                } catch (e) { console.error(e); }
            }
            initApp();
        });
    } else {
        const saved = localStorage.getItem('save_game_all');
        if (saved) {
            try { restoreData(JSON.parse(saved)); } catch (e) {}
        }
        initApp();
    }
}

function restoreData(data) {
    playerName = data.playerName || '';
    balance = data.balance || 0;
    totalEarned = data.totalEarned || 0;
    crystals = data.crystals !== undefined ? data.crystals : 5;
    clickPower = data.clickPower || 1;
    passiveIncome = data.passiveIncome || 0;
    hunger = data.hunger !== undefined ? data.hunger : 100;
    if (data.upgrades) upgrades = data.upgrades;
}

function saveGame() {
    const data = { playerName, balance, totalEarned, crystals, clickPower, passiveIncome, hunger, upgrades };
    const str = JSON.stringify(data);
    if (tg.CloudStorage) {
        tg.CloudStorage.setItem('save_game_all', str);
    } else {
        localStorage.setItem('save_game_all', str);
    }
}

function initApp() {
    if (playerName) {
        document.getElementById('modal-reg').classList.add('hidden');
        updateUI();
    }
}

window.onload = loadGame;

function saveName() {
    const input = document.getElementById('username-input');
    if (!input) return;
    const name = input.value.trim();
    if (name.length < 2) { 
        alert("Имя должно быть от 2 символов!"); 
        return; 
    }
    playerName = name;
    document.getElementById('modal-reg').classList.add('hidden');
    saveGame();
    updateUI();
}

function switchScreen(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    el.classList.add('active');
}

function getCost(base, count) {
    return Math.floor(base * Math.pow(1.22, count));
}

function updateUI() {
    document.getElementById('player-name').innerText = playerName;
    document.getElementById('balance').innerText = balance.toLocaleString();
    document.getElementById('crystals-count').innerText = crystals;
    document.getElementById('passive-income').innerText = passiveIncome.toLocaleString();
    document.getElementById('click-power-val').innerText = clickPower.toLocaleString();
    
    document.getElementById('price-hat').innerText = getCost(50, upgrades.hat).toLocaleString() + ' ₽';
    document.getElementById('price-shawarma').innerText = getCost(500, upgrades.shawarma).toLocaleString() + ' ₽';
    document.getElementById('price-factory').innerText = getCost(10000, upgrades.factory).toLocaleString() + ' ₽';
    document.getElementById('price-oil').innerText = getCost(250000, upgrades.oil).toLocaleString() + ' ₽';
    document.getElementById('price-it').innerText = getCost(200


0000, upgrades.it).toLocaleString() + ' ₽';
    document.getElementById('price-space').innerText = getCost(15000000, upgrades.space).toLocaleString() + ' ₽';

    updateHungerUI();
    checkRank();
}

function updateHungerUI() {
    document.getElementById('hunger-bar').style.width = hunger + '%';
    document.getElementById('hunger-text').innerText = hunger;
    const bar = document.getElementById('hunger-bar');
    bar.style.backgroundColor = hunger > 50 ? 'var(--success-color)' : (hunger > 20 ? '#ffa502' : 'var(--danger-color)');
}

function checkRank() {
    for (let i = ranks.length - 1; i >= 0; i--) {
        if (totalEarned >= ranks[i].threshold) {
            document.getElementById('player-rank').innerText = ranks[i].name;
            document.getElementById('avatar-icon').innerText = ranks[i].avatar;
            if (i === ranks.length - 1 && totalEarned >= 1000000000) {
                document.getElementById('win-modal').classList.remove('hidden');
            }
            break;
        }
    }
}

// Игровой цикл
setInterval(() => {
    if (!playerName) return;
    if (hunger > 0) {
        hunger = Math.max(0, hunger - 1);
        updateHungerUI();
    }
    if (passiveIncome > 0 && hunger > 0) {
        balance += passiveIncome;
        totalEarned += passiveIncome;
        updateUI();
    }
}, 1000);

// Автосохранение
setInterval(() => {
    if (playerName) saveGame();
}, 10000);

function tapMoney(event) {
    if (hunger <= 0) { 
        alert("Ты истощен! Срочно купи еды во вкладке Еда!"); 
        return; 
    }
    balance += clickPower;
    totalEarned += clickPower;
    updateUI();
    
    if (tg && tg.HapticFeedback) {
        try { tg.HapticFeedback.impactOccurred('light'); } catch(e) {}
    }

    const el = document.createElement('div');
    el.className = 'floating-number';
    el.innerText = '+' + clickPower;
    const rect = event.currentTarget.getBoundingClientRect();
    el.style.left = (event.clientX - rect.left) + 'px';
    el.style.top = (event.clientY - rect.top) + 'px';
    event.currentTarget.appendChild(el);
    setTimeout(() => el.remove(), 700);
}

function buyFood(cost, restore) {
    if (balance < cost) { 
        alert("Не хватает рублей!"); 
        return; 
    }
    if (hunger >= 100) { 
        alert("Ты уже полностью сыт!"); 
        return; 
    }
    balance -= cost;
    hunger = Math.min(100, hunger + restore);
    saveGame();
    updateUI();
    if (tg && tg.HapticFeedback) {
        try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
    }
}

function buyUpgrade(type) {
    let baseCost = 50, boost = 1;
    if (type === 'shawarma') { baseCost = 500; boost = 10; }
    if (type === 'factory') { baseCost = 10000; boost = 250; }
    if (type === 'oil') { baseCost = 250000; boost = 5000; }
    if (type === 'it') { baseCost = 2000000; boost = 40000; }
    if (type === 'space') { baseCost = 15000000; boost = 300000; }

    let cost = getCost(baseCost, upgrades[type]);
    if (balance < cost) { 
        alert("Не хватает рублей для покупки!"); 
        return; 
    }

    balance -= cost;
    upgrades[type]++;

    if (type === 'hat') { 
        clickPower += 1; 
    } else { 
        passiveIncome += boost; 
    }

    saveGame();
    updateUI();
    if (tg && tg.HapticFeedback) {
        try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
    }
}

function buyDonate(type) {
    if (type === 'boost') {
        if (crystals < 50) { alert("Нужно 50 кристаллов!"); return; }
        crystals -= 50;
        clickPower *= 2;
        passiveIncome *= 2;
        alert("Буст активирован! Доход и клики удвоены.");
    } else if (type === 'money') {
        if (crystals < 100) { alert("Нужно 100 кристаллов!"); return; }
        crystals -= 100;
        let pack = passiveIncome * 86400 * 3;
        if (pack === 0) pack = 5000;
        balance += pack;
        totalEarned += pack;
    }
    saveGame();
    updateUI();
    if (tg && tg.HapticFeedback) {
upgrades.it
upgrades.it
try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
    }
}
