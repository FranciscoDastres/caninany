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
      <label className="text-sm font-extrabold text-[#344e41]">
        Día y hora preferidos
      </label>
      <button
        type="button"
        className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-xl border bg-white px-4 text-left transition ${
          error
            ? "border-red-400"
            : expanded
              ? "border-[#527762] ring-4 ring-[#527762]/10"
              : "border-[#d8d0c5]"
        }`}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="flex items-center gap-3">
          <CalendarDays className="size-5 text-[#b16d4b]" />
          <span>
            <span className="block text-sm font-bold text-[#29473a]">
              {selectedLabel}
            </span>
            <span className="mt-0.5 block text-xs text-[#849088]">
              Disponibilidad actualizada en tiempo real
            </span>
          </span>
        </span>
        <ChevronDown
          className={`size-5 text-[#607269] transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {error ? (
        <p className="text-xs font-semibold text-red-700">{error}</p>
      ) : null}

      {expanded ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-[#ded5c9] bg-white shadow-[0_20px_60px_rgba(35,67,52,0.12)]">
          {!validWeight ? (
            <div className="grid min-h-56 place-items-center px-6 text-center">
              <div>
                <Clock3 className="mx-auto size-8 text-[#b16d4b]" />
                <p className="mt-4 font-display text-2xl text-[#183c2d]">
                  Primero indica el peso.
                </p>
                <p className="mt-2 text-sm leading-6 text-[#75827b]">
                  La duración cambia según el servicio y tamaño de tu mascota.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-[#eee7de] px-4 py-4 sm:px-6">
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full border border-[#ddd5ca] text-[#315f49] disabled:opacity-30"
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
                  <p className="font-display text-2xl capitalize text-[#183c2d]">
                    {formatMonth(month)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#849088]">
                    Atención de {calendar.data?.durationMinutes ?? "–"} minutos
                  </p>
                </div>
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full border border-[#ddd5ca] text-[#315f49] disabled:opacity-30"
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
                <div className="grid min-h-80 place-items-center text-[#607269]">
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
                      className="mt-4 text-sm font-extrabold text-[#214e3b]"
                      onClick={() => void calendar.refetch()}
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-[1fr_0.9fr]">
                  <div className="border-b border-[#eee7de] p-4 sm:p-6 lg:border-b-0 lg:border-r">
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#849088]">
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
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#eee7de] pt-4 text-xs font-semibold text-[#66766e]">
                      <Legend color="bg-[#dce8db]" label="Con horas" />
                      <Legend color="bg-[#f4dfd1]" label="Con pedidos" />
                      <Legend color="bg-[#ece9e4]" label="Sin disponibilidad" />
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
          ? "border-[#214e3b] bg-[#e8efe8] ring-2 ring-[#214e3b]/15"
          : day.isPast
            ? "border-transparent bg-[#f6f3ef] text-[#b7b3ad]"
            : full
              ? "border-[#ead8cc] bg-[#fbf1eb]"
              : day.busyCount > 0
                ? "border-[#ead8cc] bg-[#fff8f3] hover:border-[#cf997c]"
                : "border-[#dce6dc] bg-[#f4f8f2] hover:border-[#7d9a88]"
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
        <span className="absolute bottom-1.5 right-1.5 size-2 rounded-full bg-[#d9865f]" />
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
          <CalendarDays className="mx-auto size-9 text-[#b16d4b]" />
          <p className="mt-4 font-display text-2xl text-[#183c2d]">
            Elige un día.
          </p>
          <p className="mt-2 text-sm leading-6 text-[#75827b]">
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
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#7c8781]">
            Horas ya pedidas
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {day.busyPeriods.map((period) => (
              <span
                key={`${period.startsAt}-${period.endsAt}`}
                className="rounded-full bg-[#f4dfd1] px-3 py-2 text-xs font-bold text-[#9a573a]"
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
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#7c8781]">
            Inicios posibles
          </p>
          <span className="text-xs font-bold text-[#315f49]">
            {day.availableCount} disponibles
          </span>
        </div>
        <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1">
          {day.slots
            .filter((slot) => slot.status !== "past")
            .map((slot) => {
              const selected = selectedStartsAt === slot.startsAt;
              const available = slot.status === "available";

              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  disabled={!available}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-[#214e3b] bg-[#214e3b] text-white"
                      : available
                        ? "border-[#d7e2d8] bg-[#f4f8f2] text-[#315f49] hover:border-[#73917d]"
                        : "border-[#ead8cc] bg-[#fbf1eb] text-[#a46b51]"
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
          <p className="mt-4 rounded-xl bg-[#fbf1eb] px-4 py-3 text-sm font-semibold text-[#965a3d]">
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
  return new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
  }).format(new Date(year ?? 0, (monthNumber ?? 1) - 1, 1));
}

function formatLongDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1)));
}

function formatTimeRange(
  startsAt: string,
  endsAt: string,
  timeZone: string,
): string {
  const formatter = new Intl.DateTimeFormat("es-CL", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${formatter.format(new Date(startsAt))}–${formatter.format(new Date(endsAt))}`;
}

function formatSelectedDateTime(startsAt: string, timeZone: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(startsAt));
}
