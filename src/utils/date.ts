import dayjs from "dayjs";

export function getCalendarDays(yearMonth: string): string[] {
  const firstDay = dayjs(`${yearMonth}-01`);
  const startOfGrid = firstDay.subtract(firstDay.day(), "day");
  const days: string[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(startOfGrid.add(i, "day").format("YYYY-MM-DD"));
  }
  return days;
}

export function getMonthRange(yearMonth: string): { start: string; end: string } {
  const d = dayjs(`${yearMonth}-01`);
  return { start: d.format("YYYY-MM-DD"), end: d.endOf("month").format("YYYY-MM-DD") };
}
