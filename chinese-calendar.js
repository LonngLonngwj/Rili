// ===== 中国日历数据 =====

// 农历月份名称
const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月',
                      '七月', '八月', '九月', '十月', '冬月', '腊月'];

// 农历日期名称
const LUNAR_DAYS = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

// 天干地支
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 农历数据：每年的月份天数和闰月信息
// 格式：{ 月份天数数组, 闰月月份（0表示无闰月）}
const LUNAR_DATA = {
    2023: { months: [29, 30, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30], leapMonth: 2 }, // 癸卯年，闰二月
    2024: { months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30], leapMonth: 0 }, // 甲辰年
    2025: { months: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], leapMonth: 6 }, // 乙巳年，闰六月
    2026: { months: [30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29, 30], leapMonth: 0 }, // 丙午年
    2027: { months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], leapMonth: 0 }, // 丁未年
    2028: { months: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], leapMonth: 0 }, // 戊申年
    2029: { months: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 29], leapMonth: 0 }, // 己酉年
    2030: { months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], leapMonth: 0 }, // 庚戌年
};

// 已知的农历正月初一公历日期
const LUNAR_NEW_YEAR_DATES = {
    2023: new Date(2023, 0, 22),  // 2023年1月22日
    2024: new Date(2024, 1, 10),  // 2024年2月10日
    2025: new Date(2025, 0, 29),  // 2025年1月29日
    2026: new Date(2026, 1, 17),  // 2026年2月17日
    2027: new Date(2027, 1, 6),   // 2027年2月6日
    2028: new Date(2028, 0, 26),  // 2028年1月26日
    2029: new Date(2029, 1, 13),  // 2029年2月13日
    2030: new Date(2030, 1, 3),   // 2030年2月3日
};

class ChineseCalendar {
    /**
     * 获取农历信息
     * @param {Date} date 公历日期
     * @returns {Object} 农历信息
     */
    static getLunarDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        // 找到该日期所属的农历年份
        let lunarYear = year;
        let lunarNewYear = LUNAR_NEW_YEAR_DATES[year];

        // 如果当前日期在春节之前，属于上一年的农历
        if (lunarNewYear && date < lunarNewYear) {
            lunarYear = year - 1;
            lunarNewYear = LUNAR_NEW_YEAR_DATES[lunarYear];
        }

        // 如果没有数据，使用简化计算
        if (!lunarNewYear) {
            return this.getSimpleLunarDate(date);
        }

        // 计算距离正月初一的天数
        const diffTime = date.getTime() - lunarNewYear.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return this.getSimpleLunarDate(date);
        }

        // 获取该年的农历数据
        const lunarData = LUNAR_DATA[lunarYear];
        if (!lunarData) {
            return this.getSimpleLunarDate(date);
        }

        const monthDays = lunarData.months;
        const leapMonth = lunarData.leapMonth;

        // 定位农历月份和日期
        let lunarMonth = 0;
        let lunarDay = diffDays + 1;
        let isLeapMonth = false;

        // 遍历所有月份（包括闰月）
        for (let i = 0; i < 13; i++) {
            let daysInMonth;

            // 判断是否是闰月
            if (leapMonth > 0 && i === leapMonth) {
                // 闰月：使用前一个月的天数
                daysInMonth = monthDays[leapMonth - 1];
                isLeapMonth = true;
            } else if (leapMonth > 0 && i > leapMonth) {
                // 闰月之后的月份
                daysInMonth = monthDays[i - 1];
                isLeapMonth = false;
            } else {
                // 正常月份
                daysInMonth = monthDays[i];
                isLeapMonth = false;
            }

            if (lunarDay <= daysInMonth) {
                lunarMonth = isLeapMonth ? leapMonth - 1 : (leapMonth > 0 && i > leapMonth ? i - 1 : i);
                break;
            }
            lunarDay -= daysInMonth;
        }

        return {
            year: lunarYear,
            month: lunarMonth,
            day: lunarDay,
            monthName: LUNAR_MONTHS[lunarMonth],
            dayName: LUNAR_DAYS[lunarDay - 1] || '初一',
            yearGanZhi: TIAN_GAN[(lunarYear - 4) % 10] + DI_ZHI[(lunarYear - 4) % 12],
            shengXiao: SHENG_XIAO[(lunarYear - 4) % 12],
            isLeapMonth: isLeapMonth
        };
    }

    /**
     * 简化的农历计算（用于没有数据的年份）
     */
    static getSimpleLunarDate(date) {
        const baseDate = LUNAR_NEW_YEAR_DATES[2026];
        if (!baseDate) {
            return {
                year: date.getFullYear(),
                month: 0,
                day: 1,
                monthName: '正月',
                dayName: '初一',
                yearGanZhi: '丙午',
                shengXiao: '马',
                isLeapMonth: false
            };
        }

        const diffTime = date.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let year = 2026;
        let month = 0;
        let day = diffDays + 1;

        const monthDays = LUNAR_DATA[2026]?.months || [29, 30, 29, 30, 29, 30, 29, 29, 30, 29, 30, 29];

        for (let i = 0; i < 12; i++) {
            if (day <= monthDays[i]) {
                month = i;
                break;
            }
            day -= monthDays[i];
        }

        return {
            year: year,
            month: month,
            day: day,
            monthName: LUNAR_MONTHS[month],
            dayName: LUNAR_DAYS[day - 1] || '初一',
            yearGanZhi: TIAN_GAN[(year - 4) % 10] + DI_ZHI[(year - 4) % 12],
            shengXiao: SHENG_XIAO[(year - 4) % 12],
            isLeapMonth: false
        };
    }

    /**
     * 获取节假日信息
     */
    static getHoliday(date) {
        const dateStr = formatDate(date);
        return ALL_HOLIDAYS[dateStr] || null;
    }

    /**
     * 判断是否是调休上班日
     */
    static isWorkday(date) {
        const holiday = this.getHoliday(date);
        return holiday && holiday.type === 'workday';
    }

    /**
     * 判断是否是周末
     */
    static isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    }

    /**
     * 获取传统节日
     */
    static getFestival(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const lunar = this.getLunarDate(date);

        const solarFestivals = {
            '1-1': '元旦',
            '2-14': '情人节',
            '3-8': '妇女节',
            '3-12': '植树节',
            '4-1': '愚人节',
            '5-1': '劳动节',
            '5-4': '青年节',
            '6-1': '儿童节',
            '7-1': '建党节',
            '8-1': '建军节',
            '9-10': '教师节',
            '10-1': '国庆节',
            '12-25': '圣诞节',
        };

        const lunarFestivals = {
            '1-1': '春节',
            '1-15': '元宵节',
            '5-5': '端午节',
            '7-7': '七夕',
            '7-15': '中元节',
            '8-15': '中秋节',
            '9-9': '重阳节',
            '12-30': '除夕',
        };

        const solarKey = `${month}-${day}`;
        const lunarKey = `${lunar.month + 1}-${lunar.day}`;

        return {
            solar: solarFestivals[solarKey] || null,
            lunar: lunarFestivals[lunarKey] || null,
            holiday: this.getHoliday(date)
        };
    }
}

// ===== 节假日数据 =====
const HOLIDAYS_2023 = {
    '2023-01-01': { type: 'holiday', name: '元旦', emoji: '🎉' },
    '2023-01-02': { type: 'holiday', name: '元旦', emoji: '🎉' },
    '2023-01-21': { type: 'holiday', name: '除夕', emoji: '🧧' },
    '2023-01-22': { type: 'holiday', name: '春节', emoji: '🧧' },
    '2023-01-23': { type: 'holiday', name: '初二', emoji: '🧧' },
    '2023-01-24': { type: 'holiday', name: '初三', emoji: '🧧' },
    '2023-01-25': { type: 'holiday', name: '初四', emoji: '🧧' },
    '2023-01-26': { type: 'holiday', name: '初五', emoji: '🧧' },
    '2023-01-27': { type: 'holiday', name: '初六', emoji: '🧧' },
    '2023-01-28': { type: 'holiday', name: '初七', emoji: '🧧' },
    '2023-01-29': { type: 'holiday', name: '初八', emoji: '🧧' },
    '2023-01-28': { type: 'workday', name: '春节调休', emoji: '💼' },
    '2023-02-04': { type: 'workday', name: '春节调休', emoji: '💼' },
    '2023-04-05': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2023-05-01': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2023-05-02': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2023-05-03': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2023-04-23': { type: 'workday', name: '劳动节调休', emoji: '💼' },
    '2023-05-06': { type: 'workday', name: '劳动节调休', emoji: '💼' },
    '2023-06-22': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2023-06-23': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2023-06-24': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2023-09-29': { type: 'holiday', name: '中秋节', emoji: '🥮' },
    '2023-09-30': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-10-01': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-10-02': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-10-03': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-10-04': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-10-05': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-10-06': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-10-07': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-10-08': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2023-09-29': { type: 'workday', name: '国庆调休', emoji: '💼' },
    '2023-10-07': { type: 'workday', name: '国庆调休', emoji: '💼' },
};

const HOLIDAYS_2024 = {
    '2024-01-01': { type: 'holiday', name: '元旦', emoji: '🎉' },
    '2024-02-10': { type: 'holiday', name: '除夕', emoji: '🧧' },
    '2024-02-11': { type: 'holiday', name: '春节', emoji: '🧧' },
    '2024-02-12': { type: 'holiday', name: '初二', emoji: '🧧' },
    '2024-02-13': { type: 'holiday', name: '初三', emoji: '🧧' },
    '2024-02-14': { type: 'holiday', name: '初四', emoji: '🧧' },
    '2024-02-15': { type: 'holiday', name: '初五', emoji: '🧧' },
    '2024-02-16': { type: 'holiday', name: '初六', emoji: '🧧' },
    '2024-02-17': { type: 'holiday', name: '初七', emoji: '🧧' },
    '2024-02-18': { type: 'holiday', name: '初八', emoji: '🧧' },
    '2024-02-04': { type: 'workday', name: '春节调休', emoji: '💼' },
    '2024-04-04': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2024-04-05': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2024-04-06': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2024-05-01': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2024-05-02': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2024-05-03': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2024-05-04': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2024-05-05': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2024-04-28': { type: 'workday', name: '劳动节调休', emoji: '💼' },
    '2024-05-11': { type: 'workday', name: '劳动节调休', emoji: '💼' },
    '2024-06-08': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2024-06-09': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2024-06-10': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2024-09-15': { type: 'holiday', name: '中秋节', emoji: '🥮' },
    '2024-09-16': { type: 'holiday', name: '中秋节', emoji: '🥮' },
    '2024-09-17': { type: 'holiday', name: '中秋节', emoji: '🥮' },
    '2024-10-01': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2024-10-02': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2024-10-03': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2024-10-04': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2024-10-05': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2024-10-06': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2024-10-07': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2024-09-29': { type: 'workday', name: '国庆调休', emoji: '💼' },
    '2024-10-12': { type: 'workday', name: '国庆调休', emoji: '💼' },
};

const HOLIDAYS_2025 = {
    '2025-01-01': { type: 'holiday', name: '元旦', emoji: '🎉' },
    '2025-01-28': { type: 'holiday', name: '除夕', emoji: '🧧' },
    '2025-01-29': { type: 'holiday', name: '春节', emoji: '🧧' },
    '2025-01-30': { type: 'holiday', name: '初二', emoji: '🧧' },
    '2025-01-31': { type: 'holiday', name: '初三', emoji: '🧧' },
    '2025-02-01': { type: 'holiday', name: '初四', emoji: '🧧' },
    '2025-02-02': { type: 'holiday', name: '初五', emoji: '🧧' },
    '2025-02-03': { type: 'holiday', name: '初六', emoji: '🧧' },
    '2025-02-04': { type: 'holiday', name: '初七', emoji: '🧧' },
    '2025-01-26': { type: 'workday', name: '春节调休', emoji: '💼' },
    '2025-02-08': { type: 'workday', name: '春节调休', emoji: '💼' },
    '2025-04-04': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2025-04-05': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2025-04-06': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2025-05-01': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2025-05-02': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2025-05-03': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2025-05-04': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2025-05-05': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2025-04-27': { type: 'workday', name: '劳动节调休', emoji: '💼' },
    '2025-05-31': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2025-06-01': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2025-06-02': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2025-10-01': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2025-10-02': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2025-10-03': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2025-10-04': { type: 'holiday', name: '中秋节', emoji: '🥮' },
    '2025-10-05': { type: 'holiday', name: '国庆中秋', emoji: '🥮🇨🇳' },
    '2025-10-06': { type: 'holiday', name: '国庆中秋', emoji: '🥮🇨🇳' },
    '2025-10-07': { type: 'holiday', name: '国庆中秋', emoji: '🥮🇨🇳' },
    '2025-10-08': { type: 'holiday', name: '国庆中秋', emoji: '🥮🇨🇳' },
    '2025-09-28': { type: 'workday', name: '国庆调休', emoji: '💼' },
    '2025-10-11': { type: 'workday', name: '国庆调休', emoji: '💼' },
};

const HOLIDAYS_2026 = {
    '2026-01-01': { type: 'holiday', name: '元旦', emoji: '🎉' },
    '2026-01-02': { type: 'holiday', name: '元旦', emoji: '🎉' },
    '2026-01-03': { type: 'holiday', name: '元旦', emoji: '🎉' },
    '2026-02-16': { type: 'holiday', name: '除夕', emoji: '🧧' },
    '2026-02-17': { type: 'holiday', name: '春节', emoji: '🧧' },
    '2026-02-18': { type: 'holiday', name: '初二', emoji: '🧧' },
    '2026-02-19': { type: 'holiday', name: '初三', emoji: '🧧' },
    '2026-02-20': { type: 'holiday', name: '初四', emoji: '🧧' },
    '2026-02-21': { type: 'holiday', name: '初五', emoji: '🧧' },
    '2026-02-22': { type: 'holiday', name: '初六', emoji: '🧧' },
    '2026-02-14': { type: 'workday', name: '春节调休', emoji: '💼' },
    '2026-02-28': { type: 'workday', name: '春节调休', emoji: '💼' },
    '2026-04-04': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2026-04-05': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2026-04-06': { type: 'holiday', name: '清明节', emoji: '🍃' },
    '2026-05-01': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2026-05-02': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2026-05-03': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2026-05-04': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2026-05-05': { type: 'holiday', name: '劳动节', emoji: '💪' },
    '2026-04-26': { type: 'workday', name: '劳动节调休', emoji: '💼' },
    '2026-05-09': { type: 'workday', name: '劳动节调休', emoji: '💼' },
    '2026-06-19': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2026-06-20': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2026-06-21': { type: 'holiday', name: '端午节', emoji: '🐲' },
    '2026-09-25': { type: 'holiday', name: '中秋节', emoji: '🥮' },
    '2026-09-26': { type: 'holiday', name: '中秋节', emoji: '🥮' },
    '2026-09-27': { type: 'holiday', name: '中秋节', emoji: '🥮' },
    '2026-10-01': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2026-10-02': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2026-10-03': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2026-10-04': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2026-10-05': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2026-10-06': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2026-10-07': { type: 'holiday', name: '国庆节', emoji: '🇨🇳' },
    '2026-09-27': { type: 'workday', name: '国庆调休', emoji: '💼' },
    '2026-10-10': { type: 'workday', name: '国庆调休', emoji: '💼' },
};

// 合并所有节假日
const ALL_HOLIDAYS = {
    ...HOLIDAYS_2024,
    ...HOLIDAYS_2025,
    ...HOLIDAYS_2026
};

// 导出
window.ChineseCalendar = ChineseCalendar;
window.LUNAR_MONTHS = LUNAR_MONTHS;
window.LUNAR_DAYS = LUNAR_DAYS;
