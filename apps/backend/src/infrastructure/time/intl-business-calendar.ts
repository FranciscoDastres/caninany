import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type {
  BusinessCalendar,
  BusinessDay,
} from "../../application/ports/business-calendar.port";

@Injectable()
export class IntlBusinessCalendar implements BusinessCalendar {
  private readonly timeZone: string;
  private readonly openingHour: number;
  private readonly closingHour: number;
  private readonly dateFormatter: Intl.DateTimeFormat;
  private readonly offsetFormatter: Intl.DateTimeFormat;

  constructor(config: ConfigService) {
    this.timeZone = config.getOrThrow<string>("BUSINESS_TIMEZONE");
    this.openingHour = config.getOrThrow<number>("BUSINESS_OPENING_HOUR");
    this.closingHour = config.getOrThrow<number>("BUSINESS_CLOSING_HOUR");
    this.dateFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: this.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    this.offsetFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: this.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
  }

  getBusinessDay(date: string): BusinessDay {
    const nextDate = new Date(`${date}T00:00:00.000Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const nextDateString = nextDate.toISOString().slice(0, 10);
    const dayStart = this.toUtc(date, 0);
    const nextDayStart = this.toUtc(nextDateString, 0);

    return {
      dayStart,
      dayEnd: new Date(nextDayStart.getTime() - 1),
      opening: this.toUtc(date, this.openingHour),
      closing: this.toUtc(date, this.closingHour),
    };
  }

  getTimeZone(): string {
    return this.timeZone;
  }

  getDateForInstant(instant: Date): string {
    const parts = this.dateFormatter.formatToParts(instant);
    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
  }

  private toUtc(date: string, hour: number): Date {
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) {
      throw new Error(`Invalid business date: ${date}`);
    }

    const wallClockAsUtc = new Date(Date.UTC(year, month - 1, day, hour));
    let offset = this.getOffsetMilliseconds(wallClockAsUtc);
    let result = new Date(wallClockAsUtc.getTime() - offset);
    const correctedOffset = this.getOffsetMilliseconds(result);

    if (correctedOffset !== offset) {
      offset = correctedOffset;
      result = new Date(wallClockAsUtc.getTime() - offset);
    }

    return result;
  }

  private getOffsetMilliseconds(instant: Date): number {
    const parts = this.offsetFormatter.formatToParts(instant);
    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    );

    return (
      Date.UTC(
        values.year ?? 0,
        (values.month ?? 1) - 1,
        values.day ?? 1,
        values.hour ?? 0,
        values.minute ?? 0,
        values.second ?? 0,
      ) - instant.getTime()
    );
  }
}
