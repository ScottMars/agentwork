import { formatDistanceToNow as formatDistance, format } from "date-fns"

// Форматирование времени "прошло с момента"
export function formatTimeAgo(date: Date | number): string {
  return formatDistance(date, { addSuffix: true })
}

// Форматирование даты и времени
export function formatDateTime(date: Date | number): string {
  return format(date, "PPpp") // Например: "Apr 29, 2023, 1:30 PM"
}

// Проверка, прошло ли определенное количество времени
export function hasTimePassed(date: Date | number, milliseconds: number): boolean {
  return Date.now() - (date instanceof Date ? date.getTime() : date) > milliseconds
}

// Получение разницы во времени в миллисекундах
export function getTimeDifference(date1: Date | number, date2: Date | number): number {
  const time1 = date1 instanceof Date ? date1.getTime() : date1
  const time2 = date2 instanceof Date ? date2.getTime() : date2
  return Math.abs(time1 - time2)
}

