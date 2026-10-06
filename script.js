Text(x, y, text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = '#fff';
    el.style.fontSize = '24px';
    el.style.fontWeight = 'bold';
    el.style.pointerEvents = 'none';
    el.style.transition = 'all 0.6s ease-out';
    el.style.transform = 'translate(-50%, -50%)';

    document.body.appendChild(el);

    setTimeout(() => {
        el.style.top = `${y - 60}px`;
        el.style.opacity = '0';
    }, 20);

    setTimeout(() => {
        el.remove();
    }, 680);
}

buyBoostBtn.addEventListener('click', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        alert('Запрос на оплату отправлен!');
    } else {
        alert('Покупка доступна только внутри приложения Telegram.');
    }
});

// Анимация падающей матрицы на заднем плане
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const characters = '0123456789ABCDEFGHJKLMNOPQRSTUVWXYZ<>';
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);

let drops = [];
for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff66';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 33);





