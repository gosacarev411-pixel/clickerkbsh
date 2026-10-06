let score = parseFloat(localStorage.getItem('hamster_score')) || 0;
let donateBalance = parseInt(localStorage.getItem('hamster_donate')) || 0;
let maxEnergy = 500;
let profitPerClick = parseFloat(localStorage.getItem('hamster_profit')) || 0.000000001;
let miningPower = parseFloat(localStorage.getItem('hamster_mining')) || 0;
let energyCost = 1;

let clickUpgradeCost = parseFloat(localStorage.getItem('hamster_click_cost')) || 1.0;
let miningUpgradeCost = parseFloat(localStorage.getItem('hamster_mining_cost')) || 5.0;

const skinsData = [
    { id: 0, name: 'Классическая', price: 0, img: '', icon: '🍾' },
    { id: 1, name: 'Золотая бутылка', price: 50, img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { id: 2, name: 'Неоновая кола', price: 100, img: 'https://cdn-icons-png.flaticon.com/512/2738/2738245.png' },
    { id: 3, name: 'Энергетик', price: 200, img: 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png' },
    { id: 4, name: 'Космический зелей', price: 350, img: 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png' },
    { id: 5, name: 'Алмазный сосуд', price: 500, img: 'https://cdn-icons-png.flaticon.com/512/4208/4208753.png' }
];

let ownedSkins = JSON.parse(localStorage.getItem('hamster_owned_skins')) || [0];
let currentSkinId = parseInt(localStorage.getItem('hamster_current_skin')) || 0;

let isRegenerating = localStorage.getItem('hamster_isRegenerating') === 'true';
let energy = localStorage.getItem('hamster_energy') !== null ? parseFloat(localStorage.getItem('hamster_energy')) : 500;

let regenerationTimeLeft = 30 * 60;
let timerInterval = null;
const TOTAL_REGEN_TIME = 30 * 60;

let savedEndTime = localStorage.getItem('hamster_endTime');
if (isRegenerating && savedEndTime) {
    let currentTime = Math.floor(Date.now() / 1000);
    let timeLeft = parseInt(savedEndTime) - currentTime;
    if (timeLeft <= 0) {
        energy = maxEnergy;
        isRegenerating = false;
        localStorage.removeItem('hamster_endTime');
    } else {
        regenerationTimeLeft = timeLeft;
        energy = 0;
    }
}

const scoreEl = document.getElementById('score');
const donateBalanceEl = document.getElementById('donate-balance');
const coinEl = document.getElementById('coin');
const coinSkinImg = document.getElementById('coin-skin-img');
const coinDefaultIcon = document.getElementById('coin-default-icon');
const energyTextEl = document.getElementById('energy-text');
const energyProgressEl = document.getElementById('energy-progress');

let timerDisplayEl = document.getElementById('regeneration-timer');
if (!timerDisplayEl) {
    timerDisplayEl = document.createElement('div');
    timerDisplayEl.id = 'regeneration-timer';
    energyTextEl.parentNode.parentNode.insertBefore(timerDisplayEl, energyTextEl.parentNode.nextSibling);
}

function saveGameData() {
    localStorage.setItem('hamster_score', score);
    localStorage.setItem('hamster_donate', donateBalance);
    localStorage.setItem('hamster_energy', energy);
    localStorage.setItem('hamster_profit', profitPerClick);
    localStorage.setItem('hamster_mining', miningPower);
    localStorage.setItem('hamster_click_cost', clickUpgradeCost);
    localStorage.setItem('hamster_mining_cost', miningUpgradeCost);
    localStorage.setItem('hamster_isRegenerating', isRegenerating);
    localStorage.setItem('hamster_owned_skins', JSON.stringify(ownedSkins));
    localStorage.setItem('hamster_current_skin', currentSkinId);
}

if (isRegenerating) {
    startRegenerationTimer(false);
} else {
    updateUI();
}

coin
