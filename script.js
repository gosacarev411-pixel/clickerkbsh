let state = {
    money: 10,
    energy: 100,
    mood: 100,
    day: 1,
    job: '',
    story: 'Ты просыпаешься на скамейке в парке. В кармане 10 долларов. Пора что-то менять.'
};

function updateUI() {
    document.getElementById('money').textContent = state.money;
    document.getElementById('energy').textContent = state.energy;
    document.getElementById('mood').textContent = state.mood;
    document.getElementById('day').textContent = state.day;
    document.getElementById('story').textContent = state.story;

    // Проверка на победу
    if (state.money >= 1000000) {
        state.story = 'ПОЗДРАВЛЯЕМ! Ты стал миллионером! Твоя история успеха началась с 10 долларов.';
        document.getElementById('actions').style.display = 'none';
        document.getElementById('high-risk').style.display = 'none';
        document.getElementById('sleep-btn').style.display = 'none';
    }

    // Если энергии нет, можно только спать
    if (state.energy <= 0) {
        document.getElementById('actions').style.display = 'none';
        document.getElementById('high-risk').style.display = 'none';
        document.getElementById('sleep-btn').style.display = 'inline-block';
    } else {
        // Открываем новые действия по мере роста капитала
        document.getElementById('sleep-btn').style.display = 'none';
        document.getElementById('actions').style.display = 'block';
        if (state.money >= 50) {
            document.getElementById('high-risk').style.display = 'block';
        } else {
            document.getElementById('high-risk').style.display = 'none';
        }
    }
}

function work(type) {
    if (state.energy <= 0) return;

    switch(type) {
        case 'busker':
            state.money += 5;
            state.energy -= 10;
            state.mood -= 5;
            state.story = 'Ты спел пару песен Цоя в переходе. Прохожие накидали 5 долларов. Голова гудит.';
            break;
        case 'bottle':
            state.money += 15;
            state.energy -= 20;
            state.story = 'Обход мусорок занял 4 часа. Выручка со стеклотары — 15 долларов.';
            break;
        case 'taxi':
            if (state.money < 50) {
                state.story = 'Нет денег даже на бензин.';
                return;
            }
            const taxiEarn = Math.floor(Math.random() * 200) + 100;
            state.money = state.money - 50 + taxiEarn;
            state.energy -= 40;
            state.mood -= 10;
            state.story = `Ты взял старую машину напрокат. Вечером в кармане на ${taxiEarn} долларов больше.`;
            break;
    }
    updateUI();
}

function gamble(type) {
    if (state.energy <= 0) return;
    if (type === 'casino') {
        const bet = 20;
        if (state.money < bet) {
            state.story = 'У тебя нет 20 долларов для входа.';
            return;
        }
        state.money -= bet;
        if (Math.random() > 0.7) { // 30% шанс выиграть
            const win = bet * 5;
            state.money += win;
            state.mood += 20;
            state.story = `Невероятная удача! Ты выиграл ${win} долларов!`;
        } else {
            state.mood -= 30;
            state.story = 'Охрана вывела тебя из подвала. Минус 20 долларов.';
        }
        state.energy -= 25;
        updateUI();
    }
}

function nextDay() {
    state.day++;
    state.energy = 100;
    state.mood = Math.min(100, state.mood + 20);
    state.story = `Наступил новый день. Энергия восстановилась. В твоем кошельке ${state.money}$`;
    updateUI();
}

// Инициализация
updateUI();
