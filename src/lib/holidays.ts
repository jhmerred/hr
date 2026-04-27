export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: "public" | "substitute"; // 법정 / 대체
}

// 2026년 한국 법정 공휴일
// 음력 공휴일(설날, 추석, 부처님오신날)은 해당 연도 양력 변환 적용
// 대체공휴일: 설날/추석/어린이날이 주말과 겹칠 경우 적용
const HOLIDAYS_2026: Holiday[] = [
  { date: "2026-01-01", name: "신정", type: "public" },
  { date: "2026-02-16", name: "설날 연휴", type: "public" },
  { date: "2026-02-17", name: "설날", type: "public" },
  { date: "2026-02-18", name: "설날 연휴", type: "public" },
  { date: "2026-03-01", name: "삼일절", type: "public" },
  { date: "2026-03-02", name: "삼일절 대체공휴일", type: "substitute" },
  { date: "2026-05-05", name: "어린이날", type: "public" },
  { date: "2026-05-24", name: "부처님오신날", type: "public" },
  { date: "2026-05-25", name: "부처님오신날 대체공휴일", type: "substitute" },
  { date: "2026-06-06", name: "현충일", type: "public" },
  { date: "2026-08-15", name: "광복절", type: "public" },
  { date: "2026-09-24", name: "추석 연휴", type: "public" },
  { date: "2026-09-25", name: "추석", type: "public" },
  { date: "2026-09-26", name: "추석 연휴", type: "public" },
  { date: "2026-10-03", name: "개천절", type: "public" },
  { date: "2026-10-09", name: "한글날", type: "public" },
  { date: "2026-12-25", name: "크리스마스", type: "public" },
];

const HOLIDAYS_2025: Holiday[] = [
  { date: "2025-01-01", name: "신정", type: "public" },
  { date: "2025-01-28", name: "설날 연휴", type: "public" },
  { date: "2025-01-29", name: "설날", type: "public" },
  { date: "2025-01-30", name: "설날 연휴", type: "public" },
  { date: "2025-03-01", name: "삼일절", type: "public" },
  { date: "2025-05-05", name: "어린이날", type: "public" },
  { date: "2025-05-06", name: "부처님오신날", type: "public" },
  { date: "2025-06-06", name: "현충일", type: "public" },
  { date: "2025-08-15", name: "광복절", type: "public" },
  { date: "2025-10-03", name: "개천절", type: "public" },
  { date: "2025-10-05", name: "추석 연휴", type: "public" },
  { date: "2025-10-06", name: "추석", type: "public" },
  { date: "2025-10-07", name: "추석 연휴", type: "public" },
  { date: "2025-10-08", name: "추석 대체공휴일", type: "substitute" },
  { date: "2025-10-09", name: "한글날", type: "public" },
  { date: "2025-12-25", name: "크리스마스", type: "public" },
];

const ALL_HOLIDAYS: Record<number, Holiday[]> = {
  2025: HOLIDAYS_2025,
  2026: HOLIDAYS_2026,
};

export function getHolidays(year: number): Holiday[] {
  return ALL_HOLIDAYS[year] || [];
}

export function getHolidayMap(year: number): Map<string, Holiday> {
  return new Map(getHolidays(year).map((h) => [h.date, h]));
}

export function isHoliday(date: string): Holiday | undefined {
  const year = new Date(date).getFullYear();
  return getHolidays(year).find((h) => h.date === date);
}

export function isWeekend(date: string): boolean {
  const d = new Date(date);
  return d.getDay() === 0 || d.getDay() === 6;
}

export function isWorkday(date: string): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

// 두 날짜 사이의 실제 근무일 수 계산 (공휴일+주말 제외)
export function calcBusinessDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const dateStr = cur.toISOString().split("T")[0];
    if (isWorkday(dateStr)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// 특정 월의 모든 날짜 정보 생성
export interface CalendarDay {
  date: string;
  day: number;
  dayOfWeek: number; // 0=일, 6=토
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
  holiday?: Holiday;
}

export function getMonthCalendar(year: number, month: number): CalendarDay[] {
  const today = new Date().toISOString().split("T")[0];
  const holidayMap = getHolidayMap(year);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 달력 시작: 첫 주 일요일
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 달력 끝: 마지막 주 토요일
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const days: CalendarDay[] = [];
  const cur = new Date(startDate);

  while (cur <= endDate) {
    const dateStr = cur.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      day: cur.getDate(),
      dayOfWeek: cur.getDay(),
      isToday: dateStr === today,
      isWeekend: cur.getDay() === 0 || cur.getDay() === 6,
      isCurrentMonth: cur.getMonth() === month,
      holiday: holidayMap.get(dateStr),
    });
    cur.setDate(cur.getDate() + 1);
  }

  return days;
}

// 한국 법정 휴가 제도
export interface LegalLeavePolicy {
  name: string;
  category: "법정" | "약정";
  days: string; // 일수 설명
  description: string;
  paid: boolean;
}

export const LEGAL_LEAVE_POLICIES: LegalLeavePolicy[] = [
  {
    name: "연차유급휴가",
    category: "법정",
    days: "15~25일 (근속 기반)",
    description: "1년 이상 근무 시 15일, 이후 2년마다 1일 추가. 1년 미만 시 월 1일.",
    paid: true,
  },
  {
    name: "출산전후휴가",
    category: "법정",
    days: "90일 (다태아 120일)",
    description: "출산 전후 90일간 부여. 최초 60일은 유급, 이후 30일은 고용보험에서 지급.",
    paid: true,
  },
  {
    name: "배우자 출산휴가",
    category: "법정",
    days: "10일",
    description: "배우자 출산 시 10일간 유급 휴가. 출산일로부터 90일 이내 사용.",
    paid: true,
  },
  {
    name: "육아휴직",
    category: "법정",
    days: "최대 1년",
    description: "만 8세 이하 또는 초등학교 2학년 이하 자녀 양육을 위한 휴직.",
    paid: false,
  },
  {
    name: "가족돌봄휴가",
    category: "법정",
    days: "연 10일",
    description: "가족의 질병, 사고, 노령으로 인한 돌봄이 필요한 경우.",
    paid: false,
  },
  {
    name: "생리휴가",
    category: "법정",
    days: "월 1일",
    description: "여성 근로자가 청구 시 월 1일의 생리휴가 부여. 무급.",
    paid: false,
  },
  {
    name: "난임치료휴가",
    category: "법정",
    days: "연 3일 (최초 1일 유급)",
    description: "근로자가 인공수정 또는 체외수정 등 난임치료를 받는 경우.",
    paid: true,
  },
  {
    name: "경조사휴가",
    category: "약정",
    days: "회사 규정",
    description: "결혼, 사망 등 경조사 시 부여. 일수는 회사 취업규칙에 따름.",
    paid: true,
  },
  {
    name: "공가",
    category: "법정",
    days: "필요 기간",
    description: "예비군 훈련, 민방위 훈련, 선거권 행사 등 법률로 정한 의무 수행 시.",
    paid: true,
  },
];
