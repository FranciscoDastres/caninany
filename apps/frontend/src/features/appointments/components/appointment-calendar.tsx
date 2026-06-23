import type {
  AppointmentCalendarDayDto,
  AppointmentService,
} from "@caninany/shared";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
} from "lucide-react";
import type { JSX } from "react";
import { useMemo, useState } from "react";

import { useAppointmentCalendar } from "../hooks/use-appointment-calendar";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_MONTH_OFFSET = 5;
const MONTH_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  month: "long",
  year: "numeric",
});
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});
const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const selectedDateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

interface AppointmentCalendarProps {
  error?: string | undefined;
  onSelect: (startsAt: string | null) => void;
  petWeightKg: number;
  selectedStartsAt: string;
  service: AppointmentService;
}

export function AppointmentCalendar({
  error,
  onSelect,
  petWeightKg,
  selectedStartsAt,
  service,
}: AppointmentCalendarProps): JSX.Element {
  const currentMonth = useMemo(() => toMonthKey(new Date()), []);
  const maximumMonth = useMemo(
    () => moveMonth(currentMonth, MAX_MONTH_OFFSET),
    [currentMonth],
  );
  const [month, setMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const validWeight = Number.isFinite(petWeightKg) && petWeightKg >= 0.5;
  const calendar = useAppointmentCalendar({
    month,
    service,
    petWeightKg: validWeight ? petWeightKg : 0.5,
    enabled: expanded && validWeight,
  });
  const selectedDay =
    calendar.data?.days.find((day) => day.date === selectedDate) ?? null;
  const selectedLabel =
    selectedStartsAt && calendar.data
      ? formatSelectedDateTime(selectedStartsAt, calendar.data.timeZone)
      : "Selecciona un día y una hora";
  const firstDayOffset = getFirstDayOffset(month);

  const selectDay = (day: AppointmentCalendarDayDto): void => {
    setSelectedDate(day.date);
    onSelect(null);
  };

  return (
    <div className="grid gap-3">
      <label className="text-sm font-extrabold text-[#443846]">
        Día y hora preferidos
      </label>
      <button
        type="button"
        className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-xl border bg-white px-4 text-left transition ${
          error
            ? "border-red-400"
            : expanded
              ? "border-[#9b6e9e] ring-4 ring-[#9b6e9e]/10"
              : "border-[#d9d1da]"
        }`}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="flex items-center gap-3">
          <CalendarDays className="size-5 text-[#8f6291]" />
          <span>
            <span className="block text-sm font-bold text-[#403441]">
              {selectedLabel}
            </span>
            <span className="mt-0.5 block text-xs text-[#756e77]">
              Disponibilidad actualizada en tiempo real
            </span>
          </span>
        </span>
        <ChevronDown
          className={`size-5 text-[#6b646d] transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {error ? (
        <p className="text-xs font-semibold text-red-700">{error}</p>
      ) : null}

      {expanded ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-[#ddd4de] bg-white shadow-[0_20px_60px_rgba(116,71,118,0.12)]">
          {!validWeight ? (
            <div className="grid min-h-56 place-items-center px-6 text-center">
              <div>
                <Clock3 className="mx-auto size-8 text-[#8f6291]" />
                <p className="mt-4 font-display text-2xl text-[#744776]">
                  Primero indica el peso.
                </p>
                <p className="mt-2 text-sm leading-6 text-[#756e77]">
                  La duración cambia según el servicio y tamaño de tu mascota.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-[#e9e3ea] px-4 py-4 sm:px-6">
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full border border-[#ddd5df] text-[#8f6291] disabled:opacity-30"
                  disabled={month === currentMonth}
                  aria-label="Mes anterior"
                  onClick={() => {
                    setMonth((value) => moveMonth(value, -1));
                    setSelectedDate(null);
                    onSelect(null);
                  }}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="text-center">
                  <p className="font-display text-2xl capitalize text-[#744776]">
                    {formatMonth(month)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#756e77]">
                    Atención de {calendar.data?.durationMinutes ?? "–"} minutos
                  </p>
                </div>
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full border border-[#ddd5df] text-[#8f6291] disabled:opacity-30"
                  disabled={month === maximumMonth}
                  aria-label="Mes siguiente"
                  onClick={() => {
                    setMonth((value) => moveMonth(value, 1));
                    setSelectedDate(null);
                    onSelect(null);
                  }}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>

              {calendar.isPending ? (
                <div className="grid min-h-80 place-items-center text-[#6b646d]">
                  <RefreshCw className="size-6 animate-spin" />
                </div>
              ) : calendar.isError || !calendar.data ? (
                <div className="grid min-h-72 place-items-center px-6 text-center">
                  <div>
                    <p className="font-bold text-red-700">
                      No pudimos cargar la agenda.
                    </p>
                    <button
                      type="button"
                      className="mt-4 text-sm font-extrabold text-[#8f6291]"
                      onClick={() => void calendar.refetch()}
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-[1fr_0.9fr]">
                  <div className="border-b border-[#e9e3ea] p-4 sm:p-6 lg:border-b-0 lg:border-r">
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#756e77]">
                      {WEEKDAYS.map((weekday) => (
                        <span key={weekday} className="py-2">
                          {weekday}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDayOffset }).map(
                        (_, index) => (
                          <span key={`empty-${index}`} />
                        ),
                      )}
                      {calendar.data.days.map((day) => (
                        <CalendarDay
                          key={day.date}
                          day={day}
                          selected={selectedDate === day.date}
                          onSelect={() => selectDay(day)}
                        />
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#e9e3ea] pt-4 text-xs font-semibold text-[#6b646d]">
                      <Legend color="bg-[#f0e8f1]" label="Con horas" />
                      <Legend color="bg-[#f0e8f1]" label="Con pedidos" />
                      <Legend color="bg-[#efebf0]" label="Sin disponibilidad" />
                    </div>
                  </div>

                  <DaySchedule
                    day={selectedDay}
                    selectedStartsAt={selectedStartsAt}
                    timeZone={calendar.data.timeZone}
                    onSelect={onSelect}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

interface CalendarDayProps {
  day: AppointmentCalendarDayDto;
  onSelect: () => void;
  selected: boolean;
}

function CalendarDay({
  day,
  onSelect,
  selected,
}: CalendarDayProps): JSX.Element {
  const dayNumber = Number(day.date.slice(-2));
  const full = !day.isPast && day.availableCount === 0;

  return (
    <button
      type="button"
      disabled={day.isPast}
      className={`relative min-h-16 rounded-xl border p-1.5 text-left transition sm:min-h-20 sm:p-2 ${
        selected
          ? "border-[#8f6291] bg-[#f0e8f1] ring-2 ring-[#8f6291]/15"
          : day.isPast
            ? "border-transparent bg-[#f7f5f7] text-[#bbb5bd]"
            : full
              ? "border-[#eaddec] bg-[#faf6fa]"
              : day.busyCount > 0
                ? "border-[#eaddec] bg-[#faf6fa] hover:border-[#bd8cc0]"
                : "border-[#f0e8f1] bg-[#f8f4f8] hover:border-[#a985ad]"
      }`}
      onClick={onSelect}
    >
      <span className="block text-sm font-extrabold">{dayNumber}</span>
      {!day.isPast ? (
        <span className="mt-1 hidden text-[10px] font-bold leading-4 sm:block">
          {day.availableCount > 0
            ? `${day.availableCount} ${
                day.availableCount === 1 ? "bloque" : "bloques"
              }`
            : "Completo"}
        </span>
      ) : null}
      {day.busyCount > 0 && !day.isPast ? (
        <span className="absolute bottom-1.5 right-1.5 size-2 rounded-full bg-[#b167b6]" />
      ) : null}
    </button>
  );
}

interface DayScheduleProps {
  day: AppointmentCalendarDayDto | null;
  onSelect: (startsAt: string | null) => void;
  selectedStartsAt: string;
  timeZone: string;
}

function DaySchedule({
  day,
  onSelect,
  selectedStartsAt,
  timeZone,
}: DayScheduleProps): JSX.Element {
  if (!day) {
    return (
      <div className="grid min-h-72 place-items-center p-6 text-center">
        <div>
          <CalendarDays className="mx-auto size-9 text-[#8f6291]" />
          <p className="mt-4 font-display text-2xl text-[#744776]">
            Elige un día.
          </p>
          <p className="mt-2 text-sm leading-6 text-[#756e77]">
            Verás sus bloques disponibles y los horarios que ya tienen pedidos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <p className="eyebrow">{formatLongDate(day.date)}</p>

      {day.busyPeriods.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#756e77]">
            Horas ya pedidas
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {day.busyPeriods.map((period) => (
              <span
                key={`${period.startsAt}-${period.endsAt}`}
                className="rounded-full bg-[#f0e8f1] px-3 py-2 text-xs font-bold text-[#8f6291]"
              >
                {formatTimeRange(period.startsAt, period.endsAt, timeZone)} ·
                Pedido
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#756e77]">
            Inicios posibles
          </p>
          <span className="text-xs font-bold text-[#8f6291]">
            {day.availableCount} disponibles
          </span>
        </div>
        <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1">
          {day.slots.map((slot) => {
            const selected = selectedStartsAt === slot.startsAt;
            const available = slot.status === "available";

            return (
              <button
                key={slot.startsAt}
                type="button"
                disabled={!available}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  selected
                    ? "border-[#8f6291] bg-[#8f6291] text-white"
                    : available
                      ? "border-[#e8ddea] bg-[#f8f4f8] text-[#8f6291] hover:border-[#a985ad]"
                      : "border-[#eaddec] bg-[#faf6fa] text-[#8f6291]"
                }`}
                onClick={() => onSelect(slot.startsAt)}
              >
                <span className="block text-sm font-extrabold">
                  {formatTimeRange(slot.startsAt, slot.endsAt, timeZone)}
                </span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.08em] opacity-75">
                  {available ? "Disponible" : "Pedido"}
                </span>
              </button>
            );
          })}
        </div>
        {day.availableCount === 0 ? (
          <p className="mt-4 rounded-xl bg-[#faf6fa] px-4 py-3 text-sm font-semibold text-[#8f6291]">
            Este día ya no tiene bloques compatibles con el servicio elegido.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function moveMonth(month: string, offset: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return toMonthKey(new Date(year ?? 0, (monthNumber ?? 1) - 1 + offset, 1));
}

function getFirstDayOffset(month: string): number {
  const [year, monthNumber] = month.split("-").map(Number);
  const weekday = new Date(
    Date.UTC(year ?? 0, (monthNumber ?? 1) - 1, 1),
  ).getUTCDay();
  return (weekday + 6) % 7;
}

function formatMonth(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return MONTH_FORMATTER.format(new Date(year ?? 0, (monthNumber ?? 1) - 1, 1));
}

function formatLongDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return LONG_DATE_FORMATTER.format(
    new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)),
  );
}

function formatTimeRange(
  startsAt: string,
  endsAt: string,
  timeZone: string,
): string {
  const formatter = getTimeFormatter(timeZone);
  return `${formatter.format(new Date(startsAt))}–${formatter.format(new Date(endsAt))}`;
}

function formatSelectedDateTime(startsAt: string, timeZone: string): string {
  let formatter = selectedDateTimeFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("es-CL", {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    selectedDateTimeFormatters.set(timeZone, formatter);
  }

  return formatter.format(new Date(startsAt));
}

function getTimeFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = timeFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("es-CL", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    timeFormatters.set(timeZone, formatter);
  }

  return formatter;
}
