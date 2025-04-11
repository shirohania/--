// 游戏变量
let score = 0;
let gameRunning = false;
let speed = 2; // 初始下落速度
let blocks = [];
let animationId;
let blockHeight = 60;
let missedBlocks = 0;
let currentSong = 'twinkle';
let gameCompleted = false; // 新增：标记游戏是否完成

// 更新曲谱集合 - 使用1-7代表完整八度音阶
const songs = {
    'twinkle': [
        // 小星星曲谱 - 每个数字代表对应的音轨(1-7)
        1, 1, 5, 5, 6, 6, 5,
        4, 4, 3, 3, 2, 2, 1,
        5, 5, 4, 4, 3, 3, 2,
        5, 5, 4, 4, 3, 3, 2,
        1, 1, 5, 5, 6, 6, 5,
        4, 4, 3, 3, 2, 2, 1
    ],
    'happy-birthday': [
        // 生日快乐歌曲谱
        5, 5, 6, 5, 1, 7,
        5, 5, 6, 5, 2, 1,
        5, 5, 5, 3, 1, 7, 6,
        4, 4, 3, 1, 2, 1
    ],
    'jingle-bells': [
        // 铃儿响叮当曲谱
        3, 3, 3, 3, 3, 3, 3, 5, 1, 2, 3,
        4, 4, 4, 4, 4, 3, 3, 3, 3, 2, 2, 3, 2, 5,
        3, 3, 3, 3, 3, 3, 3, 5, 1, 2, 3,
        4, 4, 4, 4, 4, 3, 3, 3, 5, 5, 4, 2, 1
    ]
};

// DOM 元素
const gameBoard = document.getElementById('game-board');
const lanes = document.querySelectorAll('.lane');
const keys = document.querySelectorAll('.key');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('final-score');
const gameOverDisplay = document.getElementById('game-over');
const songChoice = document.getElementById('song-choice');

// 音频元素 - 现在有7个音符
const noteAudios = [
    document.getElementById('note-1'),
    document.getElementById('note-2'),
    document.getElementById('note-3'),
    document.getElementById('note-4'),
    document.getElementById('note-5'),
    document.getElementById('note-6'),
    document.getElementById('note-7')
];
const failSound = document.getElementById('fail-sound');

// 初始化
function init() {
    // 添加按键监听
    document.addEventListener('keydown', handleKeyPress);

    // 点击钢琴键盘
    keys.forEach((key, index) => {
        key.addEventListener('click', () => {
            playNote(index);
            checkBlocksForLane(index);
        });
    });

    // 开始游戏按钮
    startBtn.addEventListener('click', startGame);

    // 重新开始按钮
    restartBtn.addEventListener('click', () => {
        gameOverDisplay.style.display = 'none';
        startGame();
    });

    // 曲目选择变更
    songChoice.addEventListener('change', (e) => {
        currentSong = e.target.value;
    });
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    score = 0;
    missedBlocks = 0;
    blocks = [];
    speed = 2;
    gameRunning = true;
    gameCompleted = false;

    // 清除所有音符块
    clearBlocks();

    // 更新显示
    scoreDisplay.textContent = `得分: ${score}`;
    gameOverDisplay.style.display = 'none';

    // 开始下落方块
    generateBlocks();
    animateBlocks();

    // 改变按钮文字
    startBtn.innerHTML = '<i class="fa fa-pause"></i> 游戏中...';
    startBtn.disabled = true;
}

// 生成下落音符块
function generateBlocks() {
    let songNotes = songs[currentSong];
    let delay = 0;
    let totalBlocks = songNotes.length;
    let blockCount = 0;

    songNotes.forEach((lane, index) => {
        setTimeout(() => {
            if (gameRunning) {
                createBlock(lane - 1); // 将音轨索引(1-7)转换为索引(0-6)
                blockCount++;

                // 检查是否所有音符都已生成
                if (blockCount === totalBlocks) {
                    setTimeout(checkGameCompletion, 5000); // 等待最后几个方块有机会被点击
                }
            }
        }, delay);
        delay += 1000; // 每个音符间隔1秒
    });
}

// 新增：检查游戏是否完成
function checkGameCompletion() {
    if (!gameRunning) return;

    // 检查是否所有方块都已结束
    const activeBlocks = blocks.filter(block => !block.hit && block.position <= 400);

    if (activeBlocks.length === 0 && gameRunning) {
        gameCompleted = true;
        completeGame();
    }
}

// 新增：完成游戏
function completeGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    // 显示游戏完成界面
    finalScoreDisplay.textContent = `恭喜完成！你的得分: ${score}`;
    gameOverDisplay.style.display = 'block';

    // 重置开始按钮
    startBtn.innerHTML = '<i class="fa fa-play"></i> 开始游戏';
    startBtn.disabled = false;
}

// 创建单个下落方块
function createBlock(laneIndex) {
    const block = document.createElement('div');
    block.className = 'block';
    block.style.height = `${blockHeight}px`;
    block.style.top = `-${blockHeight}px`;

    // 将方块放入对应音轨
    lanes[laneIndex].appendChild(block);

    // 存储方块信息
    blocks.push({
        element: block,
        lane: laneIndex,
        position: -blockHeight,
        hit: false
    });
}

// 动画更新方块位置
function animateBlocks() {
    animationId = requestAnimationFrame(animateBlocks);

    updateBlocks();
    checkMissedBlocks();

    // 检查游戏结束条件
    if (missedBlocks >= 3) {
        endGame();
    }
}

// 更新所有方块位置
function updateBlocks() {
    blocks.forEach(block => {
        if (!block.hit) {
            block.position += speed;
            block.element.style.top = `${block.position}px`;
        }
    });
}

// 检查是否有错过的方块
function checkMissedBlocks() {
    blocks.forEach(block => {
        // 如果方块超出底部且未被点击
        if (block.position > 400 && !block.hit) {
            block.hit = true;
            block.element.style.backgroundColor = '#ff3b30';
            missedBlocks++;

            // 播放失败音效
            failSound.currentTime = 0;
            failSound.play();

            // 一段时间后移除方块
            setTimeout(() => {
                if (block.element.parentNode) {
                    block.element.parentNode.removeChild(block.element);
                }
            }, 300);
        }
    });
}

// 处理键盘按下事件
function handleKeyPress(e) {
    const key = e.key.toLowerCase();

    // 将键盘1-7映射到音轨0-6
    if (key >= '1' && key <= '7') {
        const laneIndex = parseInt(key) - 1;
        playNote(laneIndex);
        checkBlocksForLane(laneIndex);
    }

    // 新增：支持asdf和jkl键操作
    switch (key) {
        case 'a': // Do
            playNote(0);
            checkBlocksForLane(0);
            break;
        case 's': // Re
            playNote(1);
            checkBlocksForLane(1);
            break;
        case 'd': // Mi
            playNote(2);
            checkBlocksForLane(2);
            break;
        case 'f': // Fa
            playNote(3);
            checkBlocksForLane(3);
            break;
        case 'j': // Sol
            playNote(4);
            checkBlocksForLane(4);
            break;
        case 'k': // La
            playNote(5);
            checkBlocksForLane(5);
            break;
        case 'l': // Si
            playNote(6);
            checkBlocksForLane(6);
            break;
    }
}

// 播放音符
function playNote(index) {
    // 添加可视反馈
    keys[index].classList.add('active');

    // 播放音符
    noteAudios[index].currentTime = 0;
    noteAudios[index].play();

    // 短暂延迟后移除反馈
    setTimeout(() => {
        keys[index].classList.remove('active');
    }, 200);
}

// 检查特定音轨的方块
function checkBlocksForLane(laneIndex) {
    if (!gameRunning) return;

    const laneBlocks = blocks.filter(block =>
        block.lane === laneIndex &&
        !block.hit &&
        block.position > 320 &&
        block.position < 400);

    if (laneBlocks.length > 0) {
        // 找到最近的方块并标记为已点击
        const closestBlock = laneBlocks.reduce((prev, curr) =>
            (prev.position > curr.position) ? prev : curr);

        closestBlock.hit = true;
        closestBlock.element.style.background = 'linear-gradient(to bottom, #30d158, #2ecc71)';

        // 增加分数
        score += 10;
        scoreDisplay.textContent = `得分: ${score}`;

        // 一段时间后移除方块
        setTimeout(() => {
            if (closestBlock.element.parentNode) {
                closestBlock.element.parentNode.removeChild(closestBlock.element);
            }
        }, 100);
    } else {
        // 没有方块可点击时减分
        score = Math.max(0, score - 5);
        scoreDisplay.textContent = `得分: ${score}`;
    }
}

// 结束游戏
function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    // 显示游戏结束界面
    finalScoreDisplay.textContent = `游戏结束！你的得分: ${score}`;
    gameOverDisplay.style.display = 'block';

    // 重置开始按钮
    startBtn.innerHTML = '<i class="fa fa-play"></i> 开始游戏';
    startBtn.disabled = false;
}

// 清除所有方块
function clearBlocks() {
    lanes.forEach(lane => {
        while (lane.firstChild) {
            lane.removeChild(lane.firstChild);
        }
    });
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', init);
