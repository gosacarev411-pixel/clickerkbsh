// Безопасная инициализация Telegram WebApp (если скрипт заблокирован или открыт в обычном браузере)
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

// Загрузка через Telegram CloudStorage или localStorage
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
    const name = document.getElementById('username-input').value.trim();
    if (name.length < 2) { alert("Имя должно быть от 2 символов!"); return; }
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
    document.getEleme


ntById('price-it').innerText = getCost(2000000, upgrades.it).toLocaleString() + ' ₽';
    document.getElementById('price-space').innerText = getCost(15000000, upgrades.space).toLocaleString() + ' ₽';

    updateHungerUI();
    checkRank();
