import { format, parseISO, isValid, startOfDay, subDays, subMonths, endOfDay } from 'date-fns';
import { DATE_FORMAT, PHONE_PREFIXES } from '@/constants/common';
import { DateRange } from 'react-day-picker';
import { InquiryDateRangeFilterTab } from '@/enums/inquiry';

/**
 * Formats a date string or Date object using date-fns
 */
export const formatDate = (date: string | Date | number, formatStr: string = DATE_FORMAT.DEFAULT): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatStr);
};

/**
 * Formats a number with commas
 */
export const formatNumber = (num: number | string): string => {
  if (num === undefined || num === null) return '0';
  const val = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(val)) return '0';
  return val.toLocaleString('ko-KR');
};

/**
 * Formats a number as Korean Won (KRW)
 */
export const formatCurrency = (num: number | string, displayWon = true): string => {
  if (!displayWon) return formatNumber(num);
  return `${formatNumber(num)}원`;
};

/**
 * Formats a Korean phone number
 */
export const formatKoreanPhoneInput = (value: string): string => {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 11);
  const areaLength = digits.startsWith('02') ? 2 : 3;

  if (digits.length <= areaLength) return digits;

  const area = digits.slice(0, areaLength);
  const rest = digits.slice(areaLength);
  // mobile is always 3-4-4; a landline middle group only grows to 4 once the tail needs it
  const middleLength = digits.startsWith('01') || rest.length > 7 ? 4 : Math.min(rest.length, 3);

  if (rest.length <= middleLength) return `${area}-${rest}`;

  return `${area}-${rest.slice(0, middleLength)}-${rest.slice(middleLength)}`;
};

/**
 * Strips the display formatting off a phone number: 010-1234-5678 -> 01012345678
 */
export const toPlainPhone = (phone: string): string => phone.replace(/[^0-9]/g, '');

/**
 * Formats a string of numbers into a Korean phone number format
 * Support: 02-xxx-xxxx, 0xx-xxxx-xxxx, 0xx-xxx-xxxx
 */
export const formatKoreanPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    if (cleaned.startsWith('02')) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 9 && cleaned.startsWith('02')) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone;
};

/**
 * Splits a phone number into an array of 3 parts
 */
export const splitPhone = (phone: string): [string, string, string] => {
  if (!phone) return ['', '', ''];
  const formatted = formatKoreanPhone(phone);
  const parts = formatted.split('-');
  if (parts.length === 3) {
    return [parts[0], parts[1], parts[2]] as [string, string, string];
  }
  return [phone, '', ''];
};

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function splitPhonePattern(phone: string) {
  const digits = phone.replace(/\D/g, '');

  const matchedPrefix = [...PHONE_PREFIXES].sort((a, b) => b.length - a.length).find((prefix) => digits.startsWith(prefix));

  if (!matchedPrefix) return null;

  const rest = digits.slice(matchedPrefix.length);

  if (rest.length !== 7 && rest.length !== 8) return null;

  const part3 = rest.slice(-4);
  const part2 = rest.slice(0, -4);

  if (part2.length !== 3 && part2.length !== 4) return null;

  return {
    part1: matchedPrefix,
    part2,
    part3,
    formatted: `${matchedPrefix}-${part2}-${part3}`,
  };
}

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes < 1024 ** 4) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;

  return `${(bytes / 1024 ** 4).toFixed(1)} TB`;
};

export const getDateRangeByTab = (value: string): DateRange | undefined => {
  const today = new Date();

  switch (value) {
    case InquiryDateRangeFilterTab.ONE_WEEK:
      return { from: startOfDay(subDays(today, 6)), to: endOfDay(today) };
    case InquiryDateRangeFilterTab.ONE_MONTH:
      return { from: startOfDay(subMonths(today, 1)), to: endOfDay(today) };
    case InquiryDateRangeFilterTab.THREE_MONTHS:
      return { from: startOfDay(subMonths(today, 3)), to: endOfDay(today) };
    case InquiryDateRangeFilterTab.SIX_MONTHS:
      return { from: startOfDay(subMonths(today, 6)), to: endOfDay(today) };
    default:
      return undefined;
  }
};
