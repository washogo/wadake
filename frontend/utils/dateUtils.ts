import { 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO, 
  format,
  getMonth,
  getYear,
  startOfYear,
  endOfYear
} from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * 日付文字列をDateオブジェクトに変換
 */
export const parseDate = (dateString: string): Date => {
  return parseISO(dateString)
}

/**
 * 日付を日本語形式でフォーマット
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseDate(date) : date
  return format(dateObj, 'yyyy/MM/dd', { locale: ja })
}

/**
 * 指定された日付が今月かどうかを判定
 */
export const isCurrentMonth = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseDate(date) : date
  const now = new Date()
  
  return getMonth(dateObj) === getMonth(now) && getYear(dateObj) === getYear(now)
}

/**
 * 指定された日付が今年かどうかを判定
 */
export const isCurrentYear = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseDate(date) : date
  const now = new Date()
  
  return getYear(dateObj) === getYear(now)
}

/**
 * 今月の開始日と終了日を取得
 */
export const getCurrentMonthInterval = () => {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now)
  }
}

/**
 * 今年の開始日と終了日を取得
 */
export const getCurrentYearInterval = () => {
  const now = new Date()
  return {
    start: startOfYear(now),
    end: endOfYear(now)
  }
}

/**
 * 指定された日付が期間内かどうかを判定
 */
export const isWithinDateRange = (
  date: Date | string, 
  start: Date, 
  end: Date
): boolean => {
  const dateObj = typeof date === 'string' ? parseDate(date) : date
  return isWithinInterval(dateObj, { start, end })
}

/**
 * 今月の日付かどうかを判定（期間指定版）
 */
export const isCurrentMonthByInterval = (date: Date | string): boolean => {
  const interval = getCurrentMonthInterval()
  return isWithinDateRange(date, interval.start, interval.end)
}

/**
 * 今年の日付かどうかを判定（期間指定版）
 */
export const isCurrentYearByInterval = (date: Date | string): boolean => {
  const interval = getCurrentYearInterval()
  return isWithinDateRange(date, interval.start, interval.end)
} 