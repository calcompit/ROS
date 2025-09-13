import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Thailand timezone utilities
export const THAILAND_TIMEZONE = 'Asia/Bangkok';
export const THAILAND_OFFSET = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds

/**
 * Convert date to Thailand timezone
 */
export function toThailandTime(date: Date | string | null | undefined): Date {
  if (!date) return new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(dateObj.getTime() + THAILAND_OFFSET);
}

/**
 * Format date in Thailand locale
 */
export function formatThailandDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date || date === '') return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  return dateObj.toLocaleDateString('th-TH', {
    timeZone: THAILAND_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  });
}

/**
 * Format date and time in Thailand locale
 */
export function formatThailandDateTime(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  return dateObj.toLocaleString('th-TH', {
    timeZone: THAILAND_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  });
}

/**
 * Get current time in Thailand
 */
export function getThailandNow(): Date {
  return new Date(Date.now() + THAILAND_OFFSET);
}

/**
 * Format relative time (e.g., "2 hours ago") in Thailand timezone
 */
export function formatThailandRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'Unknown time';
  
  const now = getThailandNow();
  const targetDate = toThailandTime(date);
  
  // Check if date is valid
  if (isNaN(targetDate.getTime())) return 'Invalid date';
  
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'เมื่อสักครู่';
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} สัปดาห์ที่แล้ว`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} เดือนที่แล้ว`;
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ปีที่แล้ว`;
}
