// 游戏配置
const BOARD_WIDTH = 4;
const BOARD_HEIGHT = 5;
const CELL_SIZE = 75;

// 方块类型定义（宽x高）
const BLOCK_TYPES = {
    CAO: { width: 2, height: 2, name: '曹操', class: 'cao' },
    GUAN: { width: 2, height: 1, name: '关羽', class: 'guan' },
    ZHANG: { width: 1, height: 2, name: '张飞', class: 'zhang' },
    ZHAO: { width: 1, height: 2, name: '赵云', class: 'zhao' },
    MA: { width: 1, height: 2, name: '马超', class: 'ma' },
    HUANG: { width: 1, height: 2, name: '黄忠', class: 'huang' },
    SOLDIER: { width: 1, height: 1, name: '士兵', class: 'soldier' }
};

// 游戏状态
let blocks = [];
let board = [];
let selectedBlock = null;
let moveCount = 0;
let gameWon = false;
let startX = 0;
let startY = 0;

// 初始化游戏
function initGame() {
    blocks = [];
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
    moveCount = 0;
    gameWon = false;
    document.getElementById('moves').innerHTML = `<i class="fa fa-step-forward"></i> 移动次数: ${moveCount}`;

    // 移除任何胜利消息
    const oldMessage = document.querySelector('.win-message');
    if (oldMessage) oldMessage.remove();

    // 创建标准布局
    createBlock(BLOCK_TYPES.CAO, 1, 0);          // 曹操
    createBlock(BLOCK_TYPES.GUAN, 1, 2);         // 关羽
    createBlock(BLOCK_TYPES.ZHANG, 0, 0);        // 张飞
    createBlock(BLOCK_TYPES.ZHAO, 0, 2);         // 赵云
    createBlock(BLOCK_TYPES.MA, 3, 0);           // 马超
    createBlock(BLOCK_TYPES.HUANG, 3, 2);        // 黄忠
    createBlock(BLOCK_TYPES.SOLDIER, 0, 4);      // 左下士兵
    createBlock(BLOCK_TYPES.SOLDIER, 1, 3);      // 中间左士兵
    createBlock(BLOCK_TYPES.SOLDIER, 2, 3);      // 中间右士兵
    createBlock(BLOCK_TYPES.SOLDIER, 3, 4);      // 右下士兵

    renderBoard();

    // 添加出口标记
    const gameBoard = document.querySelector('.game-board');
    const exit = document.createElement('div');
    exit.className = 'exit';
    gameBoard.appendChild(exit);
}

// 创建方块
function createBlock(type, x, y) {
    const block = {
        type: type,
        x: x,
        y: y,
        element: null
    };

    blocks.push(block);

    // 更新棋盘数组
    for (let dy = 0; dy < type.height; dy++) {
        for (let dx = 0; dx < type.width; dx++) {
            board[y + dy][x + dx] = block;
        }
    }
}

// 渲染棋盘
function renderBoard() {
    const gameBoard = document.querySelector('.game-board');
    gameBoard.innerHTML = '';

    blocks.forEach(block => {
        const blockElement = document.createElement('div');
        blockElement.className = `block ${block.type.class}`;
        blockElement.style.width = `${block.type.width * CELL_SIZE}px`;
        blockElement.style.height = `${block.type.height * CELL_SIZE}px`;
        blockElement.style.left = `${block.x * CELL_SIZE}px`;
        blockElement.style.top = `${block.y * CELL_SIZE}px`;
        blockElement.textContent = block.type.name;

        // 添加触摸支持
        blockElement.addEventListener('mousedown', (e) => selectBlock(e, block));
        blockElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            selectBlock(e, block);
        });

        block.element = blockElement;
        gameBoard.appendChild(blockElement);

        // 添加初始动画
        blockElement.style.opacity = '0';
        blockElement.style.transform = 'scale(0.8)';

        setTimeout(() => {
            blockElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            blockElement.style.opacity = '1';
            blockElement.style.transform = 'scale(1)';
        }, 100 * blocks.indexOf(block));
    });
}

// 选择方块
function selectBlock(e, block) {
    if (gameWon) return;
    e.preventDefault();

    selectedBlock = block;

    // 记录起始位置
    if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    } else {
        startX = e.clientX;
        startY = e.clientY;
    }

    // 添加选中效果
    blocks.forEach(b => {
        b.element.style.boxShadow = '';
        b.element.style.zIndex = '1';
    });

    block.element.style.boxShadow = '0 0 15px 5px rgba(255, 215, 0, 0.7)';
    block.element.style.zIndex = '2';

    // 添加移动事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
}

// 处理鼠标移动
function handleMouseMove(e) {
    handleMove(e.clientX, e.clientY);
}

// 处理触摸移动
function handleTouchMove(e) {
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
}

// 统一处理移动
function handleMove(clientX, clientY) {
    if (!selectedBlock) return;

    // 计算移动的距离
    const dx = clientX - startX;
    const dy = clientY - startY;

    // 判断移动方向和距离
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        // 确定主要移动方向
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平移动
            tryMoveBlock(selectedBlock, dx > 0 ? 1 : -1, 0);
        } else {
            // 垂直移动
            tryMoveBlock(selectedBlock, 0, dy > 0 ? 1 : -1);
        }

        // 更新起始位置
        startX = clientX;
        startY = clientY;
    }
}

// 处理鼠标释放
function handleMouseUp() {
    releaseBlock();
}

// 处理触摸结束
function handleTouchEnd() {
    releaseBlock();
}

// 释放方块的统一处理
function releaseBlock() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);

    if (selectedBlock) {
        selectedBlock.element.style.boxShadow = '';
        selectedBlock.element.style.zIndex = '1';
        selectedBlock = null;
    }
}

// 尝试移动方块
function tryMoveBlock(block, dx, dy) {
    const newX = block.x + dx;
    const newY = block.y + dy;

    // 检查新位置是否有效
    if (!isValidMove(block, newX, newY)) return;

    // 更新棋盘数组
    for (let y = 0; y < block.type.height; y++) {
        for (let x = 0; x < block.type.width; x++) {
            board[block.y + y][block.x + x] = null;
        }
    }

    block.x = newX;
    block.y = newY;

    for (let y = 0; y < block.type.height; y++) {
        for (let x = 0; x < block.type.width; x++) {
            board[block.y + y][block.x + x] = block;
        }
    }

    // 使用CSS过渡使移动更平滑
    block.element.style.transition = 'left 0.2s ease, top 0.2s ease';
    block.element.style.left = `${block.x * CELL_SIZE}px`;
    block.element.style.top = `${block.y * CELL_SIZE}px`;

    // 增加移动计数
    moveCount++;
    document.getElementById('moves').innerHTML = `<i class="fa fa-step-forward"></i> 移动次数: ${moveCount}`;

    // 检查胜利条件
    setTimeout(() => {
        checkWinCondition();
    }, 200); // 等待移动完成后检查
}

// 检查移动是否有效
function isValidMove(block, newX, newY) {
    // 检查是否在棋盘内
    if (newX < 0 || newY < 0 ||
        newX + block.type.width > BOARD_WIDTH ||
        newY + block.type.height > BOARD_HEIGHT) {
        return false;
    }

    // 检查路径上是否有其他方块
    for (let y = 0; y < block.type.height; y++) {
        for (let x = 0; x < block.type.width; x++) {
            const boardValue = board[newY + y][newX + x];
            if (boardValue && boardValue !== block) {
                return false;
            }
        }
    }

    return true;
}

// 检查胜利条件
function checkWinCondition() {
    // 找到曹操方块
    const cao = blocks.find(block => block.type === BLOCK_TYPES.CAO);

    // 如果曹操到达出口（底部中间）
    if (cao.y === 3 && cao.x === 1) {
        gameWon = true;

        // 显示胜利消息
        const gameBoard = document.querySelector('.game-board');
        const winMessage = document.createElement('div');
        winMessage.className = 'win-message';

        // 创建更丰富的胜利信息
        winMessage.innerHTML = `
            <h3><i class="fa fa-trophy"></i> 恭喜你!</h3>
            <p>曹操成功逃出华容道!</p>
            <p>你用了 <strong>${moveCount}</strong> 步完成</p>
            <button id="play-again"><i class="fa fa-refresh"></i> 再来一次</button>
        `;

        gameBoard.appendChild(winMessage);

        // 添加按钮事件
        setTimeout(() => {
            document.getElementById('play-again').addEventListener('click', initGame);
        }, 100);

        // 让曹操方块庆祝胜利
        cao.element.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
        cao.element.style.transform = 'translateY(20px) scale(1.1)';
        cao.element.style.boxShadow = '0 0 20px gold';
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    initGame();

    // 重置按钮事件
    document.getElementById('reset-btn').addEventListener('click', initGame);
});
