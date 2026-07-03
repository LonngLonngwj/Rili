const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join('C:', 'Users', 'shabo', 'Downloads', '学生个人课表_24111321.json'), 'utf8'));
const sheet = raw.Sheet1;

// 检查周一的字段名
console.log('第3行所有字段:', Object.keys(sheet[2]));
console.log('');

// 时间段配置
const timeSlots = [
    { period: '1-2', start: '08:10', end: '09:55' },
    { period: '3-4', start: '10:10', end: '11:55' },
    { period: '5-6', start: '14:10', end: '15:55' },
    { period: '7-8', start: '16:10', end: '17:55' },
    { period: '9-10', start: '19:10', end: '20:55' },
];

const colors = ['#E07A5F', '#3D405B', '#81B29A', '#F2CC8F', '#457B9D', '#E63946', '#9B59B6', '#1ABC9C'];
let colorIndex = 0;
function getNextColor() { return colors[colorIndex++ % colors.length]; }

// 星期映射
const dayKeys = ['__EMPTY', '__EMPTY_1', '__EMPTY_2', '__EMPTY_3', '__EMPTY_4', '__EMPTY_5', '__EMPTY_6'];
const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function parseCourseCell(cellText, dayOfWeek, timeSlot) {
    if (!cellText || cellText.trim() === '' || cellText.trim() === ' ') return [];

    const courses = [];
    // 按 ◆ 或 ★ 分割多个课程（保留分隔符）
    const parts = cellText.split(/(?=[◆★])/);
    const blocks = parts.filter(p => p.trim());

    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length < 2) continue;

        let courseName = lines[0].replace(/[◆★]/g, '').trim();
        if (!courseName) continue;

        let teacher = '', weeks = '', location = '';

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();

            // 周数: "9,16[周]" 或 "1-9,11-16[周]"
            const weekMatch = line.match(/^([\d,\-]+)\[周\]$/);
            if (weekMatch) { weeks = weekMatch[1]; continue; }

            // 节次标记跳过
            if (line.match(/^\[.+\]节$/)) continue;

            // 教室/地点
            if (line.match(/[A-Z]\d/) || line.includes('教室') || line.includes('实训室') || line.includes('网球场')) {
                location = line;
                continue;
            }

            // 班级信息跳过
            if (line.startsWith('(')) continue;

            // 教师（不超过8个字的短行）
            if (!teacher && line.length <= 10) {
                teacher = line;
            }
        }

        courses.push({
            courseName,
            teacher,
            location,
            dayOfWeek,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            weeks,
            color: getNextColor()
        });
    }
    return courses;
}

const allCourses = [];

// 第3行(index 2)到第7行(index 6)是5个大节
for (let rowIdx = 2; rowIdx <= 6; rowIdx++) {
    const row = sheet[rowIdx];
    if (!row) continue;

    const timeSlotInfo = row['泉州职业技术大学 丛龙辉 学生个人课表'];
    if (!timeSlotInfo) continue;

    const timeSlot = timeSlots[rowIdx - 2];
    if (!timeSlot) continue;

    console.log(`解析 ${timeSlotInfo.split('\n')[0]} (${timeSlot.start}-${timeSlot.end}):`);

    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const cellKey = dayKeys[dayIdx];
        const cellText = row[cellKey];

        if (cellText && cellText.trim() && cellText.trim() !== ' ') {
            const courses = parseCourseCell(cellText, dayIdx + 1, timeSlot);
            if (courses.length > 0) {
                console.log(`  ${dayNames[dayIdx]}: ${courses.length} 门课`);
                allCourses.push(...courses);
            }
        }
    }
}

console.log(`\n总计解析 ${allCourses.length} 门课程`);

// 按星期和时间排序
allCourses.sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.startTime.localeCompare(b.startTime);
});

// 输出 JSON
fs.writeFileSync('courses.json', JSON.stringify(allCourses, null, 2), 'utf8');
console.log('已保存到 courses.json\n');

allCourses.forEach((c, i) => {
    console.log(`${i + 1}. [周${dayNames[c.dayOfWeek-1]}] ${c.courseName} | ${c.teacher} | ${c.startTime}-${c.endTime} | 第${c.weeks}周 | ${c.location}`);
});
