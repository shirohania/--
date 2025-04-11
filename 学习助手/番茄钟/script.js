// 选项卡切换
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有选项卡的活动状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 激活当前选项卡
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// 番茄钟功能
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const timerStatus = document.getElementById('timer-status');
const progressRing = document.getElementById('progress-ring');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const pomodoroBtn = document.getElementById('pomodoro-btn');
const shortBreakBtn = document.getElementById('short-break-btn');
const longBreakBtn = document.getElementById('long-break-btn');
const completedCount = document.getElementById('completed-count');
const timerCompleteSound = document.getElementById('timer-complete');

// 番茄钟设置
const timerSettings = {
    pomodoro: 25 * 60, // 25分钟工作
    shortBreak: 5 * 60, // 5分钟短休息
    longBreak: 15 * 60 // 15分钟长休息
};

let timer;
let timeLeft = timerSettings.pomodoro;
let timerMode = 'pomodoro';
let isRunning = false;
let pomodoroCount = 0;
let originalTime = timerSettings.pomodoro;

// 进度环相关计算
const progressRingCircle = document.querySelector('.progress-ring-circle');
const circumference = progressRingCircle.getTotalLength();
progressRingCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressRingCircle.style.strokeDashoffset = '0';

// 更新计时器显示
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    minutesDisplay.textContent = minutes < 10 ? `0${minutes}` : minutes;
    secondsDisplay.textContent = seconds < 10 ? `0${seconds}` : seconds;

    // 更新进度环
    const offset = circumference - (timeLeft / originalTime) * circumference;
    progressRingCircle.style.strokeDashoffset = offset;

    // 根据模式更新颜色
    if (timerMode === 'pomodoro') {
        progressRingCircle.style.stroke = '#e74c3c';
        timerStatus.textContent = '工作时间';
    } else if (timerMode === 'shortBreak') {
        progressRingCircle.style.stroke = '#3498db';
        timerStatus.textContent = '短休息';
    } else {
        progressRingCircle.style.stroke = '#2ecc71';
        timerStatus.textContent = '长休息';
    }
}

// 开始计时器
function startTimer() {
    if (isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timer);
            timerCompleteSound.play();

            if (timerMode === 'pomodoro') {
                pomodoroCount++;
                completedCount.textContent = pomodoroCount;

                // 每完成4个番茄，建议长休息
                if (pomodoroCount % 4 === 0) {
                    showNotification('番茄周期完成！建议进行长休息。');
                    setTimerMode('longBreak');
                } else {
                    showNotification('工作时间结束！休息一下吧。');
                    setTimerMode('shortBreak');
                }
            } else {
                showNotification('休息结束！开始新的工作吧。');
                setTimerMode('pomodoro');
            }

            isRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }, 1000);
}

// 暂停计时器
function pauseTimer() {
    if (!isRunning) return;

    clearInterval(timer);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 重置计时器
function resetTimer() {
    clearInterval(timer);
    timeLeft = originalTime;
    isRunning = false;
    updateTimerDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 设置计时器模式
function setTimerMode(mode) {
    // 移除所有模式按钮的活动状态
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    timerMode = mode;
    timeLeft = timerSettings[mode];
    originalTime = timerSettings[mode];

    // 根据模式激活相应按钮
    if (mode === 'pomodoro') {
        pomodoroBtn.classList.add('active');
    } else if (mode === 'shortBreak') {
        shortBreakBtn.classList.add('active');
    } else {
        longBreakBtn.classList.add('active');
    }

    resetTimer();
}

// 显示通知
function showNotification(message) {
    // 检查是否已存在通知
    let notification = document.querySelector('.notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.classList.add('show');

    // 5秒后隐藏通知
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// 添加事件监听
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
pomodoroBtn.addEventListener('click', () => setTimerMode('pomodoro'));
shortBreakBtn.addEventListener('click', () => setTimerMode('shortBreak'));
longBreakBtn.addEventListener('click', () => setTimerMode('longBreak'));

// 初始化计时器显示
updateTimerDisplay();

// 闹钟功能
const alarmTime = document.getElementById('alarm-time');
const alarmName = document.getElementById('alarm-name');
const setAlarmBtn = document.getElementById('set-alarm-btn');
const alarmsContainer = document.getElementById('alarms-container');
const alarmSound = document.getElementById('alarm-sound');

// 存储闹钟
let alarms = JSON.parse(localStorage.getItem('alarms')) || [];

// 设置闹钟
function setAlarm() {
    if (!alarmTime.value) {
        showNotification('请设置闹钟时间');
        return;
    }

    const time = alarmTime.value;
    const name = alarmName.value || '闹钟';
    const id = Date.now();

    alarms.push({ id, time, name });
    saveAlarms();
    renderAlarms();

    // 重置表单
    alarmTime.value = '';
    alarmName.value = '';

    showNotification(`闹钟已设置: ${name} - ${formatTime(time)}`);
}

// 删除闹钟
function deleteAlarm(id) {
    alarms = alarms.filter(alarm => alarm.id !== id);
    saveAlarms();
    renderAlarms();
    showNotification('闹钟已删除');
}

// 保存闹钟到本地存储
function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

// 渲染闹钟列表
function renderAlarms() {
    alarmsContainer.innerHTML = '';

    if (alarms.length === 0) {
        alarmsContainer.innerHTML = `
            <div class="empty-alarm">
                <i class="fa fa-bell-slash"></i>
                <p>尚未设置任何闹钟</p>
            </div>
        `;
        return;
    }

    alarms.sort((a, b) => a.time.localeCompare(b.time)).forEach(alarm => {
        const alarmItem = document.createElement('div');
        alarmItem.className = 'alarm-item';
        alarmItem.setAttribute('data-id', alarm.id);

        alarmItem.innerHTML = `
            <div class="alarm-info">
                <div class="alarm-time">${formatTime(alarm.time)}</div>
                <div class="alarm-name">${alarm.name}</div>
            </div>
            <button class="alarm-delete"><i class="fa fa-trash"></i></button>
        `;

        // 添加删除事件
        alarmItem.querySelector('.alarm-delete').addEventListener('click', () => {
            deleteAlarm(alarm.id);
        });

        alarmsContainer.appendChild(alarmItem);
    });
}

// 检查闹钟
function checkAlarms() {
    if (alarms.length === 0) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    alarms.forEach(alarm => {
        if (alarm.time === currentTime) {
            triggerAlarm(alarm);
        }
    });
}

// 触发闹钟
function triggerAlarm(alarm) {
    const alarmItem = document.querySelector(`.alarm-item[data-id="${alarm.id}"]`);
    if (alarmItem) {
        alarmItem.classList.add('alarm-active');
    }

    showNotification(`闹钟时间到! ${alarm.name}`);
    alarmSound.loop = true;
    alarmSound.play();

    // 创建闹钟提示弹窗
    const alarmAlert = document.createElement('div');
    alarmAlert.className = 'notification show';
    alarmAlert.style.cursor = 'pointer';
    alarmAlert.innerHTML = `
        <div>${alarm.name} - 时间到了!</div>
        <button id="stop-alarm" style="margin-top:10px;padding:5px 10px;background:#fff;color:#4a6572;border:none;border-radius:5px;">
            停止闹铃
        </button>
    `;
    document.body.appendChild(alarmAlert);

    // 停止闹铃按钮
    document.getElementById('stop-alarm').addEventListener('click', () => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        alarmAlert.remove();
        if (alarmItem) {
            alarmItem.classList.remove('alarm-active');
        }
    });
}

// 格式化时间显示
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? '下午' : '上午';
    const hour12 = hour % 12 || 12;
    return `${period} ${hour12}:${minutes}`;
}

// 添加事件监听
setAlarmBtn.addEventListener('click', setAlarm);

// 初始化闹钟
renderAlarms();

// 每分钟检查一次闹钟
setInterval(checkAlarms, 60000);
// 立即检查一次
checkAlarms();
