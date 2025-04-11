// 将 deleteCourse 函数移至全局作用域
function deleteCourse(day, startIndex, duration) {
    for (let i = 0; i < duration; i++) {
        const index = startIndex + i;
        const cell = document.querySelector(`td[data-day="${day}"][data-time-index="${index}"]`);
        if (cell) {
            cell.classList.remove('course-cell');
            cell.style.display = '';
            cell.innerHTML = '';
            cell.rowSpan = 1;
        }
    }

    // 更新本地存储
    let courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses = courses.filter(course => !(course.day === day && course.startIndex === startIndex));
    localStorage.setItem('courses', JSON.stringify(courses));
}

document.addEventListener('DOMContentLoaded', function () {
    // 定义时间段
    const timeSlots = [
        { start: "08:00", end: "08:45" },
        { start: "08:55", end: "09:40" },
        { start: "10:10", end: "10:55" },
        { start: "11:05", end: "11:50" },
        { start: "14:20", end: "15:05" },
        { start: "15:15", end: "16:00" },
        { start: "16:30", end: "17:15" },
        { start: "17:25", end: "18:10" },
        { start: "19:00", end: "19:45" },
        { start: "19:55", end: "20:40" },
        { start: "20:50", end: "21:35" }
    ];

    // 生成表格时间行
    const tbody = document.querySelector('#timetable tbody');
    timeSlots.forEach((slot, index) => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = `${slot.start} - ${slot.end}`;
        timeCell.classList.add('time-cell');
        row.appendChild(timeCell);

        // 添加7列（周一到周日）
        for (let i = 1; i <= 7; i++) {
            const cell = document.createElement('td');
            cell.dataset.day = i;
            cell.dataset.timeIndex = index;
            cell.addEventListener('click', function () {
                if (!cell.classList.contains('course-cell')) {
                    openModal(i, index);
                }
            });
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    });

    // 填充时间选择下拉框
    const startTimeSelect = document.getElementById('startTime');
    timeSlots.forEach((slot, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${slot.start} - ${slot.end}`;
        startTimeSelect.appendChild(option);
    });

    // 模态框相关
    const modal = document.getElementById('courseModal');
    const addButton = document.getElementById('addCourseBtn');
    const closeButton = document.querySelector('.close');
    const courseForm = document.getElementById('courseForm');

    // 打开模态框
    function openModal(day, timeIndex) {
        document.getElementById('weekday').value = day;
        document.getElementById('startTime').value = timeIndex;
        modal.style.display = 'block';
    }

    // 关闭模态框
    function closeModal() {
        modal.style.display = 'none';
        courseForm.reset();
    }

    // 添加课程按钮点击事件
    addButton.addEventListener('click', function () {
        openModal(1, 0); // 默认选中周一第一节课
    });

    // 关闭按钮点击事件
    closeButton.addEventListener('click', closeModal);

    // 点击模态框外部关闭
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // 表单提交事件
    courseForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // 获取表单数据
        const courseName = document.getElementById('courseName').value;
        const teacher = document.getElementById('courseTeacher').value;
        const location = document.getElementById('courseLocation').value;
        const weekday = parseInt(document.getElementById('weekday').value);
        const startTimeIndex = parseInt(document.getElementById('startTime').value);
        const duration = parseInt(document.getElementById('duration').value);

        // 添加课程
        addCourse(courseName, teacher, location, weekday, startTimeIndex, duration);

        // 关闭模态框
        closeModal();
    });

    // 修改课程单元格点击事件，支持删除课程
    function addCourse(name, teacher, location, day, startIndex, duration) {
        // 检查课程时间是否冲突
        for (let i = 0; i < duration; i++) {
            const index = startIndex + i;
            if (index >= timeSlots.length) continue;

            const cell = document.querySelector(`td[data-day="${day}"][data-time-index="${index}"]`);
            if (cell && cell.classList.contains('course-cell')) {
                alert('所选时间段已有课程安排！');
                return;
            }
        }

        // 获取要修改的单元格
        const startCell = document.querySelector(`td[data-day="${day}"][data-time-index="${startIndex}"]`);
        if (!startCell) return;

        // 设置课程信息
        startCell.classList.add('course-cell');
        startCell.innerHTML = `
            <div class="course-name">${name}</div>
            <div class="course-info">${teacher || '无教师'}</div>
            <div class="course-info">${location || '无地点'}</div>
            <button class="delete-btn" onclick="deleteCourse(${day}, ${startIndex}, ${duration})">删除</button>
        `;

        // 如果课程跨多个时间段，合并单元格
        if (duration > 1) {
            startCell.rowSpan = duration;

            for (let i = 1; i < duration; i++) {
                const index = startIndex + i;
                if (index >= timeSlots.length) continue;

                const cellToHide = document.querySelector(`td[data-day="${day}"][data-time-index="${index}"]`);
                if (cellToHide) {
                    cellToHide.style.display = 'none';
                }
            }
        }

        // 保存课程到本地存储
        const courseData = { name, teacher, location, day, startIndex, duration };
        let courses = JSON.parse(localStorage.getItem('courses')) || [];
        courses.push(courseData);
        localStorage.setItem('courses', JSON.stringify(courses));
    }

    // 添加整体清除功能
    function clearAllCourses() {
        const cells = document.querySelectorAll('.course-cell');
        cells.forEach(cell => {
            cell.classList.remove('course-cell');
            cell.style.display = '';
            cell.innerHTML = '';
            cell.rowSpan = 1;
        });

        // 清空本地存储
        localStorage.removeItem('courses');
    }

    // 页面加载时恢复保存的课程
    function loadCourses() {
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        courses.forEach(course => {
            addCourse(
                course.name,
                course.teacher,
                course.location,
                course.day,
                course.startIndex,
                course.duration
            );
        });
    }

    // 添加清除按钮
    const clearButton = document.createElement('button');
    clearButton.textContent = '清除所有课程';
    clearButton.classList.add('clear-btn');
    clearButton.addEventListener('click', clearAllCourses);
    document.querySelector('.container').appendChild(clearButton);

    // 加载保存的课程
    loadCourses();

    // 添加搜索功能
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    // 搜索功能
    searchBtn.addEventListener('click', function () {
        searchCourse();
    });

    // 回车键触发搜索
    searchInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            searchCourse();
        }
    });

    // 清除搜索结果
    clearSearchBtn.addEventListener('click', function () {
        searchInput.value = '';
        clearHighlights();
    });

    // 搜索课程函数
    function searchCourse() {
        // 清除之前的高亮
        clearHighlights();

        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) return;

        // 从本地存储获取课程数据
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        let found = false;

        // 遍历所有课程寻找匹配项
        courses.forEach(course => {
            // 检查课程名、教师名和时间是否匹配
            const nameMatch = course.name.toLowerCase().includes(searchTerm);
            const teacherMatch = course.teacher && course.teacher.toLowerCase().includes(searchTerm);

            // 检查时间匹配（查找指定的时间点，如 "08:00"、"14:20" 等）
            let timeMatch = false;
            if (searchTerm.match(/^\d{1,2}:\d{2}$/)) {
                const slotIndex = timeSlots.findIndex(slot =>
                    slot.start.includes(searchTerm) || slot.end.includes(searchTerm)
                );
                timeMatch = (slotIndex !== -1 && slotIndex === course.startIndex);
            }

            if (nameMatch || teacherMatch || timeMatch) {
                // 找到匹配的课程，高亮显示
                highlightCourse(course.day, course.startIndex);
                found = true;
            }
        });

        if (!found) {
            alert('未找到匹配的课程！');
        }
    }

    // 高亮显示课程
    function highlightCourse(day, startIndex) {
        const cell = document.querySelector(`td[data-day="${day}"][data-time-index="${startIndex}"]`);
        if (cell) {
            // 添加高亮类
            cell.classList.add('highlight-course');

            // 滚动到可见区域
            cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // 清除所有高亮
    function clearHighlights() {
        const highlightedCells = document.querySelectorAll('.highlight-course');
        highlightedCells.forEach(cell => {
            cell.classList.remove('highlight-course');
        });
    }
});
