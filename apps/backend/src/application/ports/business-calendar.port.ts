export const BUSINESS_CALENDAR = Symbol("BUSINESS_CALENDAR");

export interface BusinessDay {
  dayStart: Date;
  dayEnd: Date;
  opening: Date;
  closing: Date;
}

export interface BusinessCalendar {
  getBusinessDay(date: string): BusinessDay;
  getDateForInstant(instant: Date): string;
  getTimeZone(): string;
}
