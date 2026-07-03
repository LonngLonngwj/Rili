// ===== 数据管理 =====
class DataManager {
    constructor() {
        this.schedules = JSON.parse(localStorage.getItem('calendar_schedules') || '[]');
        this.timetable = JSON.parse(localStorage.getItem('calendar_timetable') || '[]');
    }

    saveSchedules() {
        localStorage.setItem('calendar_schedules', JSON.stringify(this.schedules));
    }

    saveTimetable() {
        localStorage.setItem('calendar_timetable', JSON.stringify(this.timetable));
    }

    addSchedule(item) {
        item.id = generateId();
        this.schedules.push(item);
        this.saveSchedules();
        return item;
    }

    updateSchedule(id, updates) {
        const index = this.schedules.findIndex(s => s.id === id);
        if (index !== -1) {
            this.schedules[index] = { ...this.schedules[index], ...updates };
            this.saveSchedules();
            return true;
        }
        return false;
    }

    deleteSchedule(id) {
        this.schedules = this.schedules.filter(s => s.id !== id);
        this.saveSchedules();
    }

    getSchedulesByDate(date) {
        const dateStr = formatDate(date);
        return this.schedules
            .filter(s => s.date === dateStr)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    addTimetableItem(item) {
        item.id = generateId();
        this.timetable.push(item);
        this.saveTimetable();
        return item;
    }

    updateTimetableItem(id, updates) {
        const index = this.timetable.findIndex(t => t.id === id);
        if (index !== -1) {
            this.timetable[index] = { ...this.timetable[index], ...updates };
            this.saveTimetable();
            return true;
        }
        return false;
    }

    deleteTimetableItem(id) {
        this.timetable = this.timetable.filter(t => t.id !== id);
        this.saveTimetable();
    }

    clearTimetable() {
        this.timetable = [];
        this.saveTimetable();
    }

    getTimetableByDay(dayOfWeek) {
        return this.timetable
            .filter(t => t.dayOfWeek === dayOfWeek)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    hasEventsOnDate(date) {
        const dateStr = formatDate(date);
        return this.schedules.some(s => s.date === dateStr);
    }

    importTimetable(items) {
        const validItems = items.filter(item => {
            return item.courseName &&
                   item.dayOfWeek >= 1 && item.dayOfWeek <= 7 &&
                   item.startTime && item.endTime;
        }).map(item => ({
            ...item,
            id: generateId()
        }));

        this.timetable = [...this.timetable, ...validItems];
        this.saveTimetable();
        return validItems.length;
    }

    exportTimetable() {
        return JSON.stringify(this.timetable, null, 2);
    }
}

// ===== 课程时间段配置 =====
const TIME_SLOTS = [
    { period: '1-2', start: '08:10', end: '09:55', label: '第1-2节', group: '上午' },
    { period: '3-4', start: '10:10', end: '11:55', label: '第3-4节', group: '上午' },
    { period: '5-6', start: '14:10', end: '15:55', label: '第5-6节', group: '下午' },
    { period: '7-8', start: '16:10', end: '17:55', label: '第7-8节', group: '下午' },
    { period: '9-10', start: '19:10', end: '20:55', label: '第9-10节', group: '晚上' },
];

// ===== 示例课表数据 =====
const SAMPLE_TIMETABLE = [
    { courseName: '高等数学A', teacher: '张明教授', location: '教学楼A301', dayOfWeek: 1, startTime: '08:10', endTime: '09:55', color: '#E07A5F' },
    { courseName: '大学英语(二)', teacher: '李华老师', location: '外语楼B205', dayOfWeek: 1, startTime: '10:10', endTime: '11:55', color: '#3D405B' },
    { courseName: '程序设计基础', teacher: '王强教授', location: '计算机中心C102', dayOfWeek: 1, startTime: '14:10', endTime: '15:55', color: '#81B29A' },
    { courseName: '线性代数', teacher: '刘芳教授', location: '教学楼A301', dayOfWeek: 2, startTime: '08:10', endTime: '09:55', color: '#F2CC8F' },
    { courseName: '数据结构', teacher: '陈刚教授', location: '计算机中心C103', dayOfWeek: 2, startTime: '10:10', endTime: '11:55', color: '#457B9D' },
    { courseName: '体育', teacher: '赵伟老师', location: '体育馆', dayOfWeek: 2, startTime: '14:10', endTime: '15:55', color: '#E63946' },
    { courseName: '形势与政策', teacher: '孙丽老师', location: '教学楼A501', dayOfWeek: 2, startTime: '19:10', endTime: '20:55', color: '#9B59B6' },
    { courseName: '大学物理', teacher: '周明教授', location: '理学楼D401', dayOfWeek: 3, startTime: '08:10', endTime: '09:55', color: '#E07A5F' },
    { courseName: '高等数学A', teacher: '张明教授', location: '教学楼A301', dayOfWeek: 3, startTime: '10:10', endTime: '11:55', color: '#E07A5F' },
    { courseName: '思想政治理论', teacher: '孙丽老师', location: '教学楼A501', dayOfWeek: 3, startTime: '14:10', endTime: '15:55', color: '#3D405B' },
    { courseName: '大学英语(二)', teacher: '李华老师', location: '外语楼B205', dayOfWeek: 4, startTime: '08:10', endTime: '09:55', color: '#3D405B' },
    { courseName: '程序设计基础', teacher: '王强教授', location: '计算机中心C102', dayOfWeek: 4, startTime: '10:10', endTime: '11:55', color: '#81B29A' },
    { courseName: '大学物理实验', teacher: '周明教授', location: '理学楼D201', dayOfWeek: 4, startTime: '14:10', endTime: '15:55', color: '#457B9D' },
    { courseName: '线性代数', teacher: '刘芳教授', location: '教学楼A301', dayOfWeek: 5, startTime: '08:10', endTime: '09:55', color: '#F2CC8F' },
    { courseName: '数据结构', teacher: '陈刚教授', location: '计算机中心C103', dayOfWeek: 5, startTime: '10:10', endTime: '11:55', color: '#457B9D' },
    { courseName: '大学物理', teacher: '周明教授', location: '理学楼D401', dayOfWeek: 5, startTime: '14:10', endTime: '15:55', color: '#E07A5F' },
];

// ===== 日历应用 =====
class CalendarApp {
    constructor() {
        this.data = new DataManager();
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentTab = 'schedule';
        this.editingId = null;
        this.yearMonthInitialized = false;
        this.weekSelectBound = false;

        // 周数设置
        this.settings = this.loadSettings();
        this.currentWeek = this.settings.currentWeek || 1;

        this.initElements();
        this.bindEvents();
        this.render();
    }

    loadSettings() {
        const saved = localStorage.getItem('calendar_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            // 自动计算当前周数
            settings.currentWeek = this.calculateCurrentWeek(settings.semesterStart);
            return settings;
        }
        const today = new Date();
        const dayOfWeek = today.getDay() || 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek + 1);
        const year = monday.getFullYear();
        const month = String(monday.getMonth() + 1).padStart(2, '0');
        const day = String(monday.getDate()).padStart(2, '0');
        const semesterStart = `${year}-${month}-${day}`;
        return {
            semesterStart: semesterStart,
            totalWeeks: 20,
            currentWeek: this.calculateCurrentWeek(semesterStart)
        };
    }

    calculateCurrentWeek(semesterStart) {
        if (!semesterStart) return 1;
        const start = new Date(semesterStart);
        const today = new Date();
        const diffTime = today.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const week = Math.floor(diffDays / 7) + 1;
        return Math.max(1, Math.min(week, 20));
    }

    saveSettings() {
        localStorage.setItem('calendar_settings', JSON.stringify(this.settings));
    }

    initElements() {
        this.miniCalDays = document.getElementById('miniCalDays');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.yearSelect = document.getElementById('yearSelect');
        this.monthSelect = document.getElementById('monthSelect');
        this.selectedDateTitle = document.getElementById('selectedDateTitle');
        this.scheduleList = document.getElementById('scheduleList');
        this.timetableGrid = document.getElementById('timetableGrid');
        this.todaySummary = document.getElementById('todaySummary');
        this.classCount = document.getElementById('classCount');
        this.weekSelect = document.getElementById('weekSelect');
        this.prevWeekBtn = document.getElementById('prevWeek');
        this.nextWeekBtn = document.getElementById('nextWeek');
        this.btnAddSchedule = document.getElementById('btnAddSchedule');
        this.btnAddTimetable = document.getElementById('btnAddTimetable');
        this.btnImport = document.getElementById('btnImport');
        this.btnClearTimetable = document.getElementById('btnClearTimetable');
        this.btnTimetableSettings = document.getElementById('btnTimetableSettings');
        this.settingsModal = document.getElementById('settingsModal');
        this.scheduleModal = document.getElementById('scheduleModal');
        this.timetableModal = document.getElementById('timetableModal');
        this.importModal = document.getElementById('importModal');
        this.scheduleForm = document.getElementById('scheduleForm');
        this.timetableForm = document.getElementById('timetableForm');
        this.schedColorPicker = document.getElementById('schedColorPicker');
        this.ttColorPicker = document.getElementById('ttColorPicker');
        this.jsonFileInput = document.getElementById('jsonFileInput');
        this.tabs = document.querySelectorAll('.tab');
        this.tabPanels = document.querySelectorAll('.tab-panel');
    }

    bindEvents() {
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        this.yearSelect.addEventListener('change', () => {
            this.currentDate.setFullYear(parseInt(this.yearSelect.value));
            this.renderMiniCalendar();
        });
        this.monthSelect.addEventListener('change', () => {
            this.currentDate.setMonth(parseInt(this.monthSelect.value));
            this.renderMiniCalendar();
        });
        this.prevWeekBtn.addEventListener('click', () => this.changeWeek(-1));
        this.nextWeekBtn.addEventListener('click', () => this.changeWeek(1));
        this.btnAddSchedule.addEventListener('click', () => this.openScheduleModal());
        this.btnAddTimetable.addEventListener('click', () => this.openTimetableModal());
        this.btnImport.addEventListener('click', () => this.openImportModal());

        // 文件上传
        this.jsonFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.btnImportJson = document.getElementById('btnImportJson');
        this.btnExportJson = document.getElementById('btnExportJson');
        this.btnImportJson.addEventListener('click', () => this.importFromJson());
        this.btnExportJson.addEventListener('click', () => this.exportToJson());
        this.btnClearTimetable.addEventListener('click', () => this.clearTimetable());
        this.btnTimetableSettings.addEventListener('click', () => this.openSettingsModal());

        // 设置模态框事件
        document.getElementById('weekMinus').addEventListener('click', () => this.adjustTotalWeeks(-1));
        document.getElementById('weekPlus').addEventListener('click', () => this.adjustTotalWeeks(1));
        document.getElementById('btnSaveSettings').addEventListener('click', () => this.saveSettingsAndClose());

        // 学期开始日期改变时更新当前周
        document.getElementById('semesterStart').addEventListener('change', () => {
            const startDate = document.getElementById('semesterStart').value;
            if (startDate) {
                const newWeek = this.calculateCurrentWeek(startDate);
                document.getElementById('currentWeek').value = newWeek;
            }
        });
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(btn.dataset.modal));
        });
        this.scheduleForm.addEventListener('submit', (e) => this.handleScheduleSubmit(e));
        this.timetableForm.addEventListener('submit', (e) => this.handleTimetableSubmit(e));
        this.initColorPicker(this.schedColorPicker);
        this.initColorPicker(this.ttColorPicker);
        [this.scheduleModal, this.timetableModal, this.importModal, this.settingsModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal.id);
            });
        });
    }

    initColorPicker(picker) {
        const options = picker.querySelectorAll('.color-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                options.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }

    getSelectedColor(picker) {
        const active = picker.querySelector('.color-option.active');
        return active ? active.dataset.color : '#E07A5F';
    }

    setSelectedColor(picker, color) {
        const options = picker.querySelectorAll('.color-option');
        options.forEach(o => {
            o.classList.toggle('active', o.dataset.color === color);
        });
    }

    // ===== 渲染 =====
    render() {
        this.renderMiniCalendar();
        this.renderSelectedDate();
        this.renderScheduleList();
        this.renderTimetable();
        this.renderTodaySummary();
    }

    renderMiniCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        this.initYearMonthSelectors();
        const lunarDate = ChineseCalendar.getLunarDate(new Date(year, month, 1));
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay() || 7;
        const totalDays = lastDay.getDate();
        this.miniCalDays.innerHTML = '';
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i > 0; i--) {
            const day = prevMonthLastDay - i + 1;
            const date = new Date(year, month - 1, day);
            this.miniCalDays.appendChild(this.createDayElement(date, day, true));
        }
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(year, month, i);
            this.miniCalDays.appendChild(this.createDayElement(date, i, false));
        }
        const remaining = 42 - (startDay - 1 + totalDays);
        for (let i = 1; i <= remaining; i++) {
            const date = new Date(year, month + 1, i);
            this.miniCalDays.appendChild(this.createDayElement(date, i, true));
        }
    }

    initYearMonthSelectors() {
        if (this.yearMonthInitialized) {
            this.yearSelect.value = this.currentDate.getFullYear();
            this.monthSelect.value = this.currentDate.getMonth();
            return;
        }
        const currentYear = this.currentDate.getFullYear();
        for (let y = currentYear - 5; y <= currentYear + 5; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            this.yearSelect.appendChild(opt);
        }
        for (let m = 1; m <= 12; m++) {
            const opt = document.createElement('option');
            opt.value = m - 1;
            opt.textContent = m;
            this.monthSelect.appendChild(opt);
        }
        this.yearSelect.value = currentYear;
        this.monthSelect.value = this.currentDate.getMonth();
        this.yearMonthInitialized = true;
    }

    createDayElement(date, dayNum, isOtherMonth) {
        const el = document.createElement('div');
        el.className = 'mini-day';
        const lunar = ChineseCalendar.getLunarDate(date);
        const holiday = ChineseCalendar.getHoliday(date);
        const isWorkday = ChineseCalendar.isWorkday(date);
        const lunarText = lunar.day === 1 ? lunar.monthName : lunar.dayName;
        const dayContent = document.createElement('div');
        dayContent.className = 'day-content';
        const gregorianDay = document.createElement('div');
        gregorianDay.className = 'gregorian-day';
        gregorianDay.textContent = dayNum;
        dayContent.appendChild(gregorianDay);
        const lunarDay = document.createElement('div');
        lunarDay.className = 'lunar-day';
        if (holiday) {
            lunarDay.textContent = holiday.name;
            lunarDay.classList.add('holiday-text');
        } else {
            lunarDay.textContent = lunarText;
            if (lunar.day === 1) {
                lunarDay.classList.add('lunar-month');
            }
        }
        dayContent.appendChild(lunarDay);
        el.appendChild(dayContent);
        if (isOtherMonth) el.classList.add('other-month');
        if (isToday(date)) el.classList.add('today');
        if (isSameDay(date, this.selectedDate)) el.classList.add('selected');
        if (this.data.hasEventsOnDate(date)) el.classList.add('has-event');
        if (holiday && holiday.type === 'holiday') {
            el.classList.add('holiday');
        } else if (isWorkday) {
            el.classList.add('workday');
        }
        el.addEventListener('click', () => {
            this.selectedDate = new Date(date);
            this.render();
        });
        return el;
    }

    renderSelectedDate() {
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const solarDateStr = this.selectedDate.toLocaleDateString('zh-CN', options);
        const lunar = ChineseCalendar.getLunarDate(this.selectedDate);
        const holiday = ChineseCalendar.getHoliday(this.selectedDate);
        const festival = ChineseCalendar.getFestival(this.selectedDate);
        let dateStr = solarDateStr + ` (${lunar.monthName}${lunar.dayName})`;
        if (holiday) {
            dateStr += ` ${holiday.emoji} ${holiday.name}`;
        } else if (festival.lunar) {
            dateStr += ` 🏮 ${festival.lunar}`;
        } else if (festival.solar) {
            dateStr += ` 🎉 ${festival.solar}`;
        }
        this.selectedDateTitle.textContent = dateStr;
    }

    renderScheduleList() {
        const schedules = this.data.getSchedulesByDate(this.selectedDate);
        if (schedules.length === 0) {
            this.scheduleList.innerHTML = '<div class="schedule-empty"><div class="empty-icon">📝</div><p>这一天还没有安排</p><span class="hint">点击上方"添加日程"按钮创建新事件</span></div>';
            return;
        }
        this.scheduleList.innerHTML = schedules.map((s, index) => `
            <div class="schedule-card" style="animation-delay: ${index * 0.1}s">
                <div class="schedule-color" style="background: ${s.color}"></div>
                <div class="schedule-info">
                    <div class="schedule-title">${escapeHtml(s.title)}</div>
                    ${s.description ? `<div class="schedule-desc">${escapeHtml(s.description)}</div>` : ''}
                </div>
                <div class="schedule-time">
                    <div class="time">${s.startTime}</div>
                    <div class="date">${s.endTime}</div>
                </div>
                <div class="schedule-actions">
                    <button onclick="app.openScheduleModal('${s.id}')" title="编辑">✏️</button>
                    <button class="delete" onclick="app.deleteSchedule('${s.id}')" title="删除">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    renderTimetable() {
        const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const today = new Date();
        this.initWeekSelector();
        const totalClasses = this.data.timetable.length;
        this.classCount.textContent = `共 ${totalClasses} 门课程`;
        const weekDates = this.getWeekDates();
        let html = '<div class="timetable-grid-container"><table class="timetable-table"><thead><tr><th>节次 / 时间</th>';
        dayNames.forEach((name, index) => {
            const date = weekDates[index];
            const dateStr = formatDateShort(date);
            const isToday = date.toDateString() === today.toDateString();
            html += `<th class="${isToday ? 'today-col' : ''}"><div class="day-name">${name}</div><div class="day-date">${dateStr}</div></th>`;
        });
        html += '</tr></thead><tbody>';
        TIME_SLOTS.forEach(slot => {
            html += `<tr><td class="time-cell"><div class="period-label">${slot.label}</div><div class="time-range">${slot.start}-${slot.end}</div><div class="group-tag">${slot.group}</div></td>`;
            for (let day = 1; day <= 7; day++) {
                const date = weekDates[day - 1];
                const isToday = date.toDateString() === today.toDateString();
                const classInSlot = this.findClassInTimeSlot(day, slot);
                html += `<td class="${isToday ? 'today-cell' : ''}" data-day="${day}" data-slot="${slot.period}">`;
                if (classInSlot) {
                    html += this.renderGridClassCard(classInSlot);
                } else {
                    html += '<div class="empty-cell-hint">+</div>';
                }
                html += '</td>';
            }
            html += '</tr>';
        });
        html += '</tbody></table></div>';
        this.timetableGrid.innerHTML = html;
        document.querySelectorAll('.timetable-table td:not(.time-cell)').forEach(td => {
            td.addEventListener('click', (e) => {
                if (e.target.closest('.grid-class-card')) return;
                const day = parseInt(td.dataset.day);
                const slotPeriod = td.dataset.slot;
                if (slotPeriod) this.openTimetableModal(null, day, slotPeriod);
            });
        });
    }

    initWeekSelector() {
        if (!this.weekSelectBound) {
            const totalWeeks = this.settings.totalWeeks;
            for (let w = 1; w <= totalWeeks; w++) {
                const opt = document.createElement('option');
                opt.value = w;
                opt.textContent = `第${w}周`;
                this.weekSelect.appendChild(opt);
            }
            this.weekSelect.value = this.currentWeek;
            this.weekSelect.addEventListener('change', () => {
                this.currentWeek = parseInt(this.weekSelect.value);
                this.settings.currentWeek = this.currentWeek;
                this.render();
            });
            this.weekSelectBound = true;
        }
        this.weekSelect.value = this.currentWeek;
    }

    findClassInTimeSlot(dayOfWeek, slot) {
        return this.data.timetable.find(t => {
            if (t.dayOfWeek !== dayOfWeek) return false;
            if (t.startTime !== slot.start || t.endTime !== slot.end) return false;
            // 检查当前周是否在课程周数范围内
            if (t.weeks && !this.isClassInCurrentWeek(t.weeks)) return false;
            return true;
        });
    }

    isClassInCurrentWeek(weeksStr) {
        if (!weeksStr) return true;
        const currentWeek = this.currentWeek;
        const weeks = this.parseWeeks(weeksStr);
        return weeks.includes(currentWeek);
    }

    parseWeeks(weeksStr) {
        const weeks = [];
        const parts = weeksStr.split(',');
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                for (let i = start; i <= end; i++) {
                    weeks.push(i);
                }
            } else {
                weeks.push(parseInt(part));
            }
        }
        return weeks;
    }

    renderGridClassCard(item) {
        const color = item.color || '#81B29A';
        const isInCurrentWeek = this.isClassInCurrentWeek(item.weeks);
        const opacityStyle = isInCurrentWeek ? '' : 'opacity: 0.4; filter: grayscale(50%);';
        return `<div class="grid-class-card" style="--card-color: ${color}; ${opacityStyle}" data-id="${item.id}"><div class="course-name">${escapeHtml(item.courseName)}</div><div class="class-location">📍 ${escapeHtml(item.location || '未设置')}</div>${item.teacher ? `<div class="class-teacher">👨‍🏫 ${escapeHtml(item.teacher)}</div>` : ''}${item.weeks ? `<div class="class-weeks">📅 第${item.weeks}周</div>` : ''}<div class="grid-actions"><button onclick="event.stopPropagation(); app.openTimetableModal('${item.id}')" title="编辑">✏️</button><button class="delete" onclick="event.stopPropagation(); app.deleteTimetableItem('${item.id}')" title="删除">🗑️</button></div></div>`;
    }

    renderTodaySummary() {
        const today = new Date();
        const todaySchedules = this.data.getSchedulesByDate(today);
        const todayDow = today.getDay() || 7;
        const todayClasses = this.data.getTimetableByDay(todayDow);
        const lunar = ChineseCalendar.getLunarDate(today);
        const festival = ChineseCalendar.getFestival(today);
        const holiday = ChineseCalendar.getHoliday(today);
        let html = '<div style="margin-bottom: 16px; padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-md);">';
        html += '<div style="font-weight: 500; margin-bottom: 8px; color: var(--text-primary);">📅 今日信息</div>';
        html += `<div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">农历 ${lunar.yearGanZhi}年（${lunar.shengXiao}年）${lunar.monthName}${lunar.dayName}</div>`;
        if (holiday && holiday.type === 'holiday') {
            html += `<div style="font-size: 13px; color: #E63946; margin-bottom: 4px;">${holiday.emoji} ${holiday.name}</div>`;
        } else if (holiday && holiday.type === 'workday') {
            html += `<div style="font-size: 13px; color: #F57C00; margin-bottom: 4px;">${holiday.emoji} ${holiday.name}</div>`;
        }
        if (festival.solar) html += `<div style="font-size: 13px; color: var(--accent-tertiary); margin-bottom: 4px;">🎉 公历节日：${festival.solar}</div>`;
        if (festival.lunar) html += `<div style="font-size: 13px; color: var(--accent-tertiary);">🏮 农历节日：${festival.lunar}</div>`;
        html += '</div>';
        html += '<div style="margin-bottom: 16px;">';
        html += `<div style="font-weight: 500; margin-bottom: 8px; color: var(--text-primary);">📌 今日日程 (${todaySchedules.length} 条)</div>`;
        if (todaySchedules.length === 0) {
            html += '<div class="summary-empty">今天没有安排</div>';
        } else {
            todaySchedules.forEach(s => {
                html += `<div class="summary-item" style="border-left-color: ${s.color}"><div class="time">${s.startTime}</div><div class="title">${escapeHtml(s.title)}</div></div>`;
            });
        }
        html += '</div><div>';
        html += `<div style="font-weight: 500; margin-bottom: 8px; color: var(--text-primary);">📚 今日课程 (${todayClasses.length} 节)</div>`;
        if (todayClasses.length === 0) {
            html += '<div class="summary-empty">今天没课</div>';
        } else {
            todayClasses.forEach(c => {
                html += `<div class="summary-item class-item" style="border-left-color: ${c.color}"><div class="time">${c.startTime}</div><div class="title">${escapeHtml(c.courseName)}</div></div>`;
            });
        }
        html += '</div>';
        this.todaySummary.innerHTML = html;
    }

    // ===== 工具方法 =====
    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderMiniCalendar();
    }

    changeWeek(delta) {
        this.currentWeek += delta;
        if (this.currentWeek < 1) this.currentWeek = 1;
        if (this.currentWeek > this.settings.totalWeeks) this.currentWeek = this.settings.totalWeeks;
        this.settings.currentWeek = this.currentWeek;
        this.render();
    }

    getWeekMonday(weekNum) {
        const start = new Date(this.settings.semesterStart);
        const monday = new Date(start);
        monday.setDate(start.getDate() + (weekNum - 1) * 7);
        return monday;
    }

    getWeekDates() {
        const monday = this.getWeekMonday(this.currentWeek);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
        return dates;
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        this.tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Panel`);
        });
    }

    // ===== 模态框 =====
    openScheduleModal(id = null) {
        this.editingId = id;
        const modal = this.scheduleModal;
        const title = document.getElementById('scheduleModalTitle');
        if (id) {
            title.textContent = '编辑日程';
            const schedule = this.data.schedules.find(s => s.id === id);
            if (schedule) {
                document.getElementById('schedId').value = id;
                document.getElementById('schedTitle').value = schedule.title;
                document.getElementById('schedDesc').value = schedule.description || '';
                document.getElementById('schedDate').value = schedule.date;
                document.getElementById('schedStart').value = schedule.startTime;
                document.getElementById('schedEnd').value = schedule.endTime;
                this.setSelectedColor(this.schedColorPicker, schedule.color);
            }
        } else {
            title.textContent = '添加日程';
            this.scheduleForm.reset();
            document.getElementById('schedDate').value = formatDate(this.selectedDate);
            this.setSelectedColor(this.schedColorPicker, '#E07A5F');
        }
        modal.classList.add('active');
    }

    openTimetableModal(id = null, dayOfWeek = null, slotPeriod = null) {
        this.editingId = id;
        const modal = this.timetableModal;
        const title = document.getElementById('timetableModalTitle');

        // 初始化周数网格
        this.initWeekGrid();

        if (id) {
            title.textContent = '编辑课程';
            const item = this.data.timetable.find(t => t.id === id);
            if (item) {
                document.getElementById('ttId').value = id;
                document.getElementById('ttCourse').value = item.courseName;
                document.getElementById('ttTeacher').value = item.teacher || '';
                document.getElementById('ttLocation').value = item.location || '';
                document.getElementById('ttDay').value = item.dayOfWeek;
                const period = this.getTimeToPeriod(item.startTime, item.endTime);
                document.getElementById('ttPeriod').value = period;
                this.setSelectedColor(this.ttColorPicker, item.color);
                // 恢复周数选择
                if (item.weeks) {
                    this.selectWeeksFromStr(item.weeks);
                }
            }
        } else {
            title.textContent = '添加课程';
            this.timetableForm.reset();
            if (dayOfWeek) document.getElementById('ttDay').value = dayOfWeek;
            if (slotPeriod) document.getElementById('ttPeriod').value = slotPeriod;
            this.setSelectedColor(this.ttColorPicker, '#81B29A');
            // 默认全选
            this.selectAllWeeks();
        }
        modal.classList.add('active');
    }

    initWeekGrid() {
        const grid = document.getElementById('weekGrid');
        const totalWeeks = this.settings.totalWeeks || 20;
        grid.innerHTML = '';
        for (let i = 1; i <= totalWeeks; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'week-grid-btn';
            btn.textContent = i;
            btn.dataset.week = i;
            btn.addEventListener('click', () => {
                btn.classList.toggle('selected');
                this.updateWeeksInput();
            });
            grid.appendChild(btn);
        }
    }

    updateWeeksInput() {
        const selected = document.querySelectorAll('.week-grid-btn.selected');
        const weeks = Array.from(selected).map(b => parseInt(b.dataset.week));
        document.getElementById('ttWeeks').value = this.weeksTostr(weeks);
    }

    weeksTostr(weeks) {
        if (weeks.length === 0) return '';
        weeks.sort((a, b) => a - b);
        const ranges = [];
        let start = weeks[0], end = weeks[0];
        for (let i = 1; i < weeks.length; i++) {
            if (weeks[i] === end + 1) {
                end = weeks[i];
            } else {
                ranges.push(start === end ? `${start}` : `${start}-${end}`);
                start = weeks[i];
                end = weeks[i];
            }
        }
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        return ranges.join(',');
    }

    selectWeeksFromStr(weeksStr) {
        if (!weeksStr) return this.selectAllWeeks();
        const weeks = this.parseWeeks(weeksStr);
        document.querySelectorAll('.week-grid-btn').forEach(btn => {
            const w = parseInt(btn.dataset.week);
            btn.classList.toggle('selected', weeks.includes(w));
        });
        this.updateWeeksInput();
    }

    selectAllWeeks() {
        document.querySelectorAll('.week-grid-btn').forEach(btn => btn.classList.add('selected'));
        this.updateWeeksInput();
    }

    clearAllWeeks() {
        document.querySelectorAll('.week-grid-btn').forEach(btn => btn.classList.remove('selected'));
        this.updateWeeksInput();
    }

    selectOddWeeks() {
        document.querySelectorAll('.week-grid-btn').forEach(btn => {
            const w = parseInt(btn.dataset.week);
            btn.classList.toggle('selected', w % 2 === 1);
        });
        this.updateWeeksInput();
    }

    selectEvenWeeks() {
        document.querySelectorAll('.week-grid-btn').forEach(btn => {
            const w = parseInt(btn.dataset.week);
            btn.classList.toggle('selected', w % 2 === 0);
        });
        this.updateWeeksInput();
    }

    openImportModal() {
        this.importModal.classList.add('active');
    }

    openSettingsModal() {
        document.getElementById('semesterStart').value = this.settings.semesterStart;
        document.getElementById('totalWeeks').value = this.settings.totalWeeks;
        const total = this.settings.totalWeeks;
        const currentWeekSelect = document.getElementById('currentWeek');
        currentWeekSelect.innerHTML = '';
        for (let i = 1; i <= total; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `第${i}周`;
            currentWeekSelect.appendChild(opt);
        }
        currentWeekSelect.value = this.currentWeek;
        this.settingsModal.classList.add('active');
    }

    adjustTotalWeeks(delta) {
        const input = document.getElementById('totalWeeks');
        let value = parseInt(input.value) + delta;
        if (value < 1) value = 1;
        if (value > 30) value = 30;
        input.value = value;
        // 更新当前周下拉框
        const currentWeekSelect = document.getElementById('currentWeek');
        const oldVal = currentWeekSelect.value;
        currentWeekSelect.innerHTML = '';
        for (let i = 1; i <= value; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `第${i}周`;
            currentWeekSelect.appendChild(opt);
        }
        currentWeekSelect.value = Math.min(oldVal, value);
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        this.editingId = null;
    }

    closeAllModals() {
        this.closeModal('scheduleModal');
        this.closeModal('timetableModal');
        this.closeModal('importModal');
        this.closeModal('settingsModal');
    }

    // ===== 表单提交 =====
    handleScheduleSubmit(e) {
        e.preventDefault();
        const data = {
            title: document.getElementById('schedTitle').value.trim(),
            description: document.getElementById('schedDesc').value.trim(),
            date: document.getElementById('schedDate').value,
            startTime: document.getElementById('schedStart').value,
            endTime: document.getElementById('schedEnd').value,
            color: this.getSelectedColor(this.schedColorPicker)
        };
        if (this.editingId) {
            this.data.updateSchedule(this.editingId, data);
        } else {
            this.data.addSchedule(data);
        }
        this.closeModal('scheduleModal');
        this.render();
    }

    handleTimetableSubmit(e) {
        e.preventDefault();
        const period = document.getElementById('ttPeriod').value;
        const time = this.getPeriodToTime(period);
        const data = {
            courseName: document.getElementById('ttCourse').value.trim(),
            teacher: document.getElementById('ttTeacher').value.trim(),
            location: document.getElementById('ttLocation').value.trim(),
            dayOfWeek: parseInt(document.getElementById('ttDay').value),
            startTime: time.start,
            endTime: time.end,
            weeks: document.getElementById('ttWeeks').value,
            color: this.getSelectedColor(this.ttColorPicker)
        };
        if (this.editingId) {
            this.data.updateTimetableItem(this.editingId, data);
        } else {
            this.data.addTimetableItem(data);
        }
        this.closeModal('timetableModal');
        this.render();
    }

    getPeriodToTime(period) {
        const map = {
            '1-2': { start: '08:10', end: '09:55' },
            '3-4': { start: '10:10', end: '11:55' },
            '5-6': { start: '14:10', end: '15:55' },
            '7-8': { start: '16:10', end: '17:55' },
            '9-10': { start: '19:10', end: '20:55' }
        };
        return map[period] || map['1-2'];
    }

    getTimeToPeriod(startTime, endTime) {
        const map = {
            '08:10-09:55': '1-2',
            '10:10-11:55': '3-4',
            '14:10-15:55': '5-6',
            '16:10-17:55': '7-8',
            '19:10-20:55': '9-10'
        };
        return map[`${startTime}-${endTime}`] || '1-2';
    }

    // ===== 删除操作 =====
    deleteSchedule(id) {
        if (confirm('确定要删除这条日程吗？')) {
            this.data.deleteSchedule(id);
            this.render();
        }
    }

    deleteTimetableItem(id) {
        if (confirm('确定要删除这门课程吗？')) {
            this.data.deleteTimetableItem(id);
            this.render();
        }
    }

    clearTimetable() {
        if (confirm('确定要清空所有课程吗？此操作不可撤销。')) {
            this.data.clearTimetable();
            this.render();
        }
    }

    // ===== 导入功能 =====
    importSampleData() {
        if (this.data.timetable.length > 0) {
            if (!confirm('导入将追加到现有课表，是否继续？')) return;
        }
        const count = this.data.importTimetable(SAMPLE_TIMETABLE);
        alert(`成功导入 ${count} 门课程！`);
        this.closeModal('importModal');
        this.render();
    }

    importFromJson() {
        const jsonStr = document.getElementById('importJson').value.trim();
        if (!jsonStr) {
            alert('请输入 JSON 数据或上传文件');
            return;
        }
        try {
            const data = JSON.parse(jsonStr);
            if (!Array.isArray(data)) {
                alert('数据格式错误：应为数组格式');
                return;
            }
            if (this.data.timetable.length > 0) {
                if (!confirm('导入将追加到现有课表，是否继续？')) return;
            }
            const count = this.data.importTimetable(data);
            alert(`成功导入 ${count} 门课程！`);
            document.getElementById('importJson').value = '';
            this.jsonFileInput.value = '';
            this.closeModal('importModal');
            this.render();
        } catch (e) {
            alert('JSON 格式错误：' + e.message);
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('importJson').value = e.target.result;
        };
        reader.readAsText(file);
    }

    exportToJson() {
        const json = this.data.exportTimetable();
        document.getElementById('importJson').value = json;
        document.getElementById('importJson').select();
        document.execCommand('copy');
        alert('课表数据已复制到剪贴板！');
    }

    saveSettingsAndClose() {
        this.settings.semesterStart = document.getElementById('semesterStart').value;
        this.settings.totalWeeks = parseInt(document.getElementById('totalWeeks').value);
        this.settings.currentWeek = parseInt(document.getElementById('currentWeek').value);
        this.currentWeek = this.settings.currentWeek;
        this.saveSettings();
        this.closeModal('settingsModal');
        this.render();
        // 显示保存成功提示
        this.showToast('✅ 设置已保存');
    }

    showToast(message) {
        // 移除旧的提示
        const oldToast = document.querySelector('.toast');
        if (oldToast) oldToast.remove();

        // 创建新提示
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 2秒后自动消失
        setTimeout(() => {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// ===== 初始化应用 =====
const app = new CalendarApp();

// ===== 深色模式切换 =====
const themeToggle = document.getElementById('themeToggle');
const isDarkMode = localStorage.getItem('darkMode') === 'true';

if (isDarkMode) {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    themeToggle.textContent = isDark ? '☀️' : '🌙';
});
