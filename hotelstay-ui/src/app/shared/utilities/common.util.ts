/**
 * Date utility functions
 */
export class DateUtil {
  /**
   * Calculate number of nights between two dates
   */
  static calculateNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Format date to ISO string (YYYY-MM-DD)
   */
  static formatToISODate(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Format date to display format (e.g., "Jan 15, 2024")
   */
  static formatToDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Check if date is valid
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Check if checkout date is after checkin date
   */
  static isCheckoutAfterCheckin(checkIn: string, checkOut: string): boolean {
    return new Date(checkOut) > new Date(checkIn);
  }

  /**
   * Check if date is in the future
   */
  static isFutureDate(dateString: string): boolean {
    return new Date(dateString) > new Date();
  }

  /**
   * Get minimum checkout date (checkin + 1 day)
   */
  static getMinCheckoutDate(checkInDate: string): string {
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + 1);
    return this.formatToISODate(date);
  }

  /**
   * Check if checkin date is within 24 hours from now
   */
  static isWithin24Hours(checkInDate: string): boolean {
    const checkIn = new Date(checkInDate);
    const now = new Date();
    const diffTime = checkIn.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours > 0 && diffHours < 24;
  }

  /**
   * Get hours until checkin
   */
  static getHoursUntilCheckin(checkInDate: string): number {
    const checkIn = new Date(checkInDate);
    const now = new Date();
    const diffTime = checkIn.getTime() - now.getTime();
    return Math.round(diffTime / (1000 * 60 * 60));
  }
}

/**
 * Price calculation utilities
 */
export class PriceUtil {
  /**
   * Calculate total price
   */
  static calculateTotal(nightlyRate: number, numberOfNights: number): number {
    return Math.round(nightlyRate * numberOfNights * 100) / 100;
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string = '£'): string {
    return `${currency}${price.toFixed(2)}`;
  }

  /**
   * Format price with currency code
   */
  static formatPriceWithCode(price: number, currencyCode: string = 'GBP'): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
    }).format(price);
  }
}

/**
 * String utilities
 */
export class StringUtil {
  /**
   * Capitalize first letter
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert enum value to display string
   */
  static enumToDisplayString(value: string): string {
    return value
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Truncate string to max length
   */
  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  }
}
