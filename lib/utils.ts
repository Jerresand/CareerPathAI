import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date in a way that's consistent between server and client rendering
 * to avoid hydration errors.
 * 
 * @param date The date to format
 * @param format The format to use (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, format: 'yyyy-MM-dd' | 'display' = 'yyyy-MM-dd'): string {
  // Convert to Date object if it's not already
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (format === 'display') {
    // For display purposes, but still consistent between server/client
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  }
  
  // Default format: yyyy-MM-dd (ISO format without time)
  return dateObj.toISOString().split('T')[0];
}
