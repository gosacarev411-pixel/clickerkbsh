// --- ИГРОВОЙ СКРИПТ (ИСПРАВЛЕНА ОШИБКА СИНТАКСИСА) ---

let score = parseFloat(localStorage.getItem('hamster_score')) || 0;
let donateBalance = parseInt(localStorage.getItem('hamster_donate')) || 0;
let maxEnergy = 500;
let profitPerClick = parseFloat(localStorage.getItem('hamster_profit')) || 0.000001;
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

// DOM элементы
const scoreEl = document.getElementById('score');
const donateBalanceEl = document.getElementById('donate-balance');
const coinEl = document.getElementById('coin');
const coinSkinImg = document.getElementById('coin-skin-img');
const coinDefaultIcon = document.getElementById('coin-default-icon');
const energyTextEl = document.getElementById('energy-text');
const energyProgressEl = document.getElementById('energy-progress');

let timerDisplayEl = document.getElementById('regeneration-timer');
if (!timerDisplayEl && energyTextEl) {
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

// ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ ИНТЕРФЕЙСА
function updateUI() {
    if (scoreEl) {
        scoreEl.textContent = score.toFixed(6);
    }
    if (donateBalanceEl) donateBalanceEl.textContent = donateBalance;
    if (energyTextEl) energyTextEl.textContent = `${Math.floor(energy)} / ${maxEnergy}`;
    
    const energyPercent = (energy / maxEnergy) * 100;
    if (energyProgressEl) energyProgressEl.style.width = `${energyPercent}%`;

    if (timerDisplayEl) {
        if (isRegenerating) {
            if (regenerationTimeLeft < 0) regenerationTimeLeft = 0;
            const minutes = Math.floor(regenerationTimeLeft / 60);
            const seconds = regenerationTimeLeft % 60;
            timerDisplayEl.textContent = `Восстановление: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timerDisplayEl.style.display = 'block';
        } else {


timerDisplayEl.style.display = 'none';
        }
    }

    updateSkinDisplay();
    updateShopUI();
    renderSkins();
    renderTopList();
}

function updateSkinDisplay() {
    const skin = skinsData.find(s => s.id === currentSkinId);
    if (!coinSkinImg || !coinDefaultIcon) return;
    if (skin && skin.img) {
        coinSkinImg.src = skin.img;
        coinSkinImg.style.display = 'block';
        coinDefaultIcon.style.display = 'none';
    } else {
        coinSkinImg.style.display = 'none';
        coinDefaultIcon.style.display = 'block';
        coinDefaultIcon.textContent = skin ? skin.icon : '🍾';
    }
}

function updateShopUI() {
    const clickCostEl = document.getElementById('upgrade-click-cost');
    const miningCostEl = document.getElementById('upgrade-mining-cost');
    if (clickCostEl) clickCostEl.textContent = `Цена: ${clickUpgradeCost.toFixed(2)} 🪙`;
    if (miningCostEl) miningCostEl.textContent = `Цена: ${miningUpgradeCost.toFixed(2)} 🪙`;
}

function renderSkins() {
    const container = document.getElementById('skins-container');
    if (!container) return;
    container.innerHTML = '';

    skinsData.forEach(skin => {
        const isOwned = ownedSkins.includes(skin.id);
        const isEquipped = currentSkinId === skin.id;
        
        let btnText = 'Купить (' + skin.price + ' 💎)';
        if (isEquipped) {
            btnText = 'Надето';
        } else if (isOwned) {
            btnText = 'Надеть';
        }

        const card = document.createElement('div');
        card.className = 'skin-card';
        card.innerHTML = `
            <img src="${skin.img || 'https://cdn-icons-png.flaticon.com/512/2738/2738245.png'}" alt="${skin.name}">
            <h4>${skin.name}</h4>
            <button class="skin-action-btn ${isEquipped ? 'equipped' : ''}">${btnText}</button>
        `;

        card.querySelector('button').addEventListener('click', () => {
            if (isOwned) {
                currentSkinId = skin.id;
                updateUI();
                saveGameData();
            } else {
                if (donateBalance >= skin.price) {
                    donateBalance -= skin.price;
                    ownedSkins.push(skin.id);
                    currentSkinId = skin.id;
                    updateUI();
                    saveGameData();
                } else {
                    alert('Недостаточно кристаллов 💎!');
                }
            }
        });

        container.appendChild(card);
    });
}

function renderTopList() {
    const container = document.getElementById('top-list-container');
    if (!container) return;
    const fakePlayers = [
        { name: 'CryptoKing', score: 12.5 },
        { name: 'Satoshi_N', score: 8.2 },
        { name: 'TelegramUser', score: 5.1 },
        { name: 'Вы (Игрок)', score: score }
    ];
    fakePlayers.sort((a, b) => b.score - a.score);

    container.innerHTML = '';
    fakePlayers.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'top-item';
        item.innerHTML = `<span>#${index + 1} ${p.name}</span> <span>${p.score.toFixed(6)} 🪙</span>`;
        container.appendChild(item);
    });
}

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

if (isRegenerating) {
    startRegenerationTimer(false);
} else {
    updateUI();
}

if (coinEl) {
    coinEl.addEventListener('click', (e) => {
        if (!isRegenerating && energy >= energyCost) {
            score += profitPerClick;
            energy -= energyCost;
            updateUI();
            saveGameData();
            
            createFloatingText(e.c


lientX, e.clientY, `+0.000001`);

            coinEl.style.transform = 'scale(0.9)';
            setTimeout(() => {
                coinEl.style.transform = 'scale(1)';
            }, 100);

            if (energy < energyCost) {
                energy = 0;
                startRegenerationTimer(true);
            }
        }
    });
}

setInterval(() => {
    if (miningPower > 0) {
        score += miningPower;
        updateUI();
        saveGameData();
    }
}, 1000);

function startRegenerationTimer(createNew = true) {
    isRegenerating = true;
    if (createNew) {
        regenerationTimeLeft = TOTAL_REGEN_TIME;
        let endTime = Math.floor(Date.now() / 1000) + TOTAL_REGEN_TIME;
        localStorage.setItem('hamster_endTime', endTime);
    }
    updateUI();
    saveGameData();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        let savedEndTime = localStorage.getItem('hamster_endTime');
        if (savedEndTime) {
            let currentTime = Math.floor(Date.now() / 1000);
            regenerationTimeLeft = parseInt(savedEndTime) - currentTime;
        } else {
            regenerationTimeLeft--;
        }

        updateUI();

        if (regenerationTimeLeft <= 0) {
            clearInterval(timerInterval);
            energy = maxEnergy;
            isRegenerating = false;
            regenerationTimeLeft = TOTAL_REGEN_TIME;
            localStorage.removeItem('hamster_endTime');
            updateUI();
            saveGameData();
        }
    }, 1000);
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'fixed';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = '#00cec9';
    el.style.fontSize = '18px';
    el.style.fontWeight = 'bold';
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 0.6s ease-out';
    el.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(el);
    setTimeout(() => {
        el.style.top = `${y - 60}px`;
        el.style.opacity = '0';
    }, 20);
    setTimeout(() => el.remove(), 650);
}

const buyClickBtn = document.getElementById('buy-click-upgrade');
if (buyClickBtn) {
    buyClickBtn.addEventListener('click', () => {
        if (score >= clickUpgradeCost) {
            score -= clickUpgradeCost;
            profitPerClick += 0.000001;
            clickUpgradeCost *= 1.5;
            updateUI();
            saveGameData();
        } else {
            alert('Недостаточно монет!');
        }
    });
}

const buyMiningBtn = document.getElementById('buy-mining-upgrade');
if (buyMiningBtn) {
    buyMiningBtn.addEventListener('click', () => {
        if (score >= miningUpgradeCost) {
            score -= miningUpgradeCost;
            miningPower += 0.000001;
            miningUpgradeCost *= 1.5;
            updateUI();
            saveGameData();
        } else {
            alert('Недостаточно монет!');
        }
    });
}

const donate100 = document.getElementById('donate-100-btn');
if (donate100) {
    donate100.addEventListener('click', () => {
        donateBalance += 100;
        updateUI();
        saveGameData();
        alert('Куплено 100 кристаллов 💎!');
    });
}

const donate500 = document.getElementById('donate-500-btn');
if (donate500) {
    donate500.addEventListener('click', () => {
        donateBalance += 500;
        updateUI();
        saveGameData();
        alert('Куплено 500 кристаллов 💎!');
    });
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (target) target.classList.add('


active');
    });
});

const canvas = document.getElementById('space-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let stars = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1
    }));

    function drawSpace() {
        ctx.fillStyle = '#0b091a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        stars.forEach(star => {
            ctx.globalAlpha = Math.random() * 0.8 + 0.2;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            star.y += star.speed;
            if (star.y > canvas.height) star.y = 0;
        });
        requestAnimationFrame(drawSpace);
    }
    drawSpace();
}
