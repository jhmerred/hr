export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: "public" | "substitute" | "labor";
}

// 한국 공휴일 fallback (API 실패 시 사용)
const FALLBACK_HOLIDAYS: Record<number, Holiday[]> = {
  2025: [
    { date: "2025-01-01", name: "신정", type: "public" },
    { date: "2025-01-28", name: "설날 연휴", type: "public" },
    { date: "2025-01-29", name: "설날", type: "public" },
    { date: "2025-01-30", name: "설날 연휴", type: "public" },
    { date: "2025-03-01", name: "삼일절", type: "public" },
    { date: "2025-05-01", name: "근로자의 날", type: "labor" },
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
  ],
  2026: [
    { date: "2026-01-01", name: "신정", type: "public" },
    { date: "2026-02-16", name: "설날 연휴", type: "public" },
    { date: "2026-02-17", name: "설날", type: "public" },
    { date: "2026-02-18", name: "설날 연휴", type: "public" },
    { date: "2026-03-01", name: "삼일절", type: "public" },
    { date: "2026-03-02", name: "삼일절 대체공휴일", type: "substitute" },
    { date: "2026-05-01", name: "근로자의 날", type: "labor" },
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
  ],
  2027: [
    { date: "2027-01-01", name: "신정", type: "public" },
    { date: "2027-02-06", name: "설날 연휴", type: "public" },
    { date: "2027-02-07", name: "설날", type: "public" },
    { date: "2027-02-08", name: "설날 연휴", type: "public" },
    { date: "2027-03-01", name: "삼일절", type: "public" },
    { date: "2027-05-01", name: "근로자의 날", type: "labor" },
    { date: "2027-05-05", name: "어린이날", type: "public" },
    { date: "2027-05-13", name: "부처님오신날", type: "public" },
    { date: "2027-06-06", name: "현충일", type: "public" },
    { date: "2027-08-15", name: "광복절", type: "public" },
    { date: "2027-09-14", name: "추석 연휴", type: "public" },
    { date: "2027-09-15", name: "추석", type: "public" },
    { date: "2027-09-16", name: "추석 연휴", type: "public" },
    { date: "2027-10-03", name: "개천절", type: "public" },
    { date: "2027-10-09", name: "한글날", type: "public" },
    { date: "2027-12-25", name: "크리스마스", type: "public" },
  ],
};

// Nager.Date API에서 한국 공휴일 가져오기 (fallback 포함)
async function fetchHolidaysFromAPI(year: number): Promise<Holiday[]> {
  try {
    const res = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/KR`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const holidays = data.map(
      (h: { date: string; localName: string; name: string }) => ({
        date: h.date,
        name: h.localName || h.name,
        type: "public" as const,
      })
    );
    // 근로자의 날 추가
    holidays.push({ date: `${year}-05-01`, name: "근로자의 날", type: "labor" as const });
    return holidays;
  } catch {
    // API 실패 시 fallback 데이터 사용
    console.log(`[holidays] API failed for ${year}, using fallback`);
    return FALLBACK_HOLIDAYS[year] || [];
  }
}

// 메인
export async function getHolidays(year: number): Promise<Holiday[]> {
  const all = await fetchHolidaysFromAPI(year);
  all.sort((a, b) => a.date.localeCompare(b.date));
  const seen = new Set<string>();
  return all.filter((h) => {
    if (seen.has(h.date)) return false;
    seen.add(h.date);
    return true;
  });
}

export async function getHolidayMap(
  year: number
): Promise<Map<string, Holiday>> {
  const holidays = await getHolidays(year);
  return new Map(holidays.map((h) => [h.date, h]));
}

export async function isHolidayAsync(
  date: string
): Promise<Holiday | undefined> {
  const year = new Date(date).getFullYear();
  const holidays = await getHolidays(year);
  return holidays.find((h) => h.date === date);
}

// 동기 버전 (클라이언트에서 이미 받아온 holidays 배열 사용)
export function isHolidaySync(
  date: string,
  holidays: Holiday[]
): Holiday | undefined {
  return holidays.find((h) => h.date === date);
}

// UTC가 아닌 로컬 타임존 기준 날짜 문자열 (YYYY-MM-DD)
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return formatLocalDate(new Date());
}

export function isWeekend(date: string): boolean {
  const d = new Date(date + "T00:00:00");
  return d.getDay() === 0 || d.getDay() === 6;
}

export function isWorkday(date: string, holidays: Holiday[]): boolean {
  return !isWeekend(date) && !isHolidaySync(date, holidays);
}

// 두 날짜 사이의 실제 근무일 수 계산 (공휴일+주말 제외)
export function calcBusinessDays(
  start: string,
  end: string,
  holidays: Holiday[] = []
): number {
  if (!start || !end) return 0;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  let count = 0;
  const cur = new Date(s);
  while (cur <= e) {
    const dateStr = formatLocalDate(cur);
    if (isWorkday(dateStr, holidays)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

// 특정 월의 달력 데이터 생성
export interface CalendarDay {
  date: string;
  day: number;
  dayOfWeek: number;
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
  holiday?: Holiday;
}

export function getMonthCalendar(
  year: number,
  month: number,
  holidays: Holiday[]
): CalendarDay[] {
  const today = todayStr();
  const holidayMap = new Map(holidays.map((h) => [h.date, h]));

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const days: CalendarDay[] = [];
  const cur = new Date(startDate);

  while (cur <= endDate) {
    const dateStr = formatLocalDate(cur);
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
  days: string;
  description: string;
  paid: boolean;
}

export const LEGAL_LEAVE_POLICIES: LegalLeavePolicy[] = [
  {
    name: "연차유급휴가",
    category: "법정",
    days: "15~25일 (근속 기반)",
    description:
      "1년 이상 근무 시 15일, 이후 2년마다 1일 추가. 1년 미만 시 월 1일.",
    paid: true,
  },
  {
    name: "출산전후휴가",
    category: "법정",
    days: "90일 (다태아 120일)",
    description:
      "출산 전후 90일간 부여. 최초 60일은 유급, 이후 30일은 고용보험에서 지급.",
    paid: true,
  },
  {
    name: "배우자 출산휴가",
    category: "법정",
    days: "10일",
    description:
      "배우자 출산 시 10일간 유급 휴가. 출산일로부터 90일 이내 사용.",
    paid: true,
  },
  {
    name: "육아휴직",
    category: "법정",
    days: "최대 1년",
    description:
      "만 8세 이하 또는 초등학교 2학년 이하 자녀 양육을 위한 휴직.",
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
    description:
      "근로자가 인공수정 또는 체외수정 등 난임치료를 받는 경우.",
    paid: true,
  },
  {
    name: "경조사휴가",
    category: "약정",
    days: "회사 규정",
    description:
      "결혼, 사망 등 경조사 시 부여. 일수는 회사 취업규칙에 따름.",
    paid: true,
  },
  {
    name: "공가",
    category: "법정",
    days: "필요 기간",
    description:
      "예비군 훈련, 민방위 훈련, 선거권 행사 등 법률로 정한 의무 수행 시.",
    paid: true,
  },
];
