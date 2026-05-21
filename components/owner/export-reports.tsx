"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isWithinInterval, startOfDay } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface DateRange {
  from: Date | null
  to: Date | null
}

interface ExportReportsProps {
  data?: any
}

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]

const PRESETS = [
  { label: "Hari Ini", key: "today" },
  { label: "Kemarin", key: "yesterday" },
  { label: "7 hari terakhir", key: "7days" },
  { label: "14 hari terakhir", key: "14days" },
  { label: "30 hari terakhir", key: "30days" },
  { label: "Minggu ini", key: "thisWeek" },
  { label: "Minggu lalu", key: "lastWeek" },
  { label: "Bulan ini", key: "thisMonth" },
  { label: "Bulan lalu", key: "lastMonth" },
]

function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days: Date[] = []
  let cur = start
  while (cur <= end) {
    days.push(cur)
    cur = addDays(cur, 1)
  }
  return days
}

export function ExportReports({ data }: ExportReportsProps) {
  const today = startOfDay(new Date())
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [pending, setPending] = useState<DateRange>({ from: null, to: null })
  const [applied, setApplied] = useState<DateRange>({ from: null, to: null })
  const [hovered, setHovered] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const nextMonth = addMonths(viewMonth, 1)

  const handleDayClick = (day: Date) => {
    if (!pending.from || (pending.from && pending.to)) {
      setPending({ from: day, to: null })
    } else {
      if (day < pending.from) {
        setPending({ from: day, to: pending.from })
      } else {
        setPending({ from: pending.from, to: day })
      }
    }
  }

  const isInRange = (day: Date): boolean => {
    const from = pending.from
    const to = pending.to ?? hovered
    if (!from || !to) return false
    const [start, end] = from <= to ? [from, to] : [to, from]
    return isWithinInterval(day, { start, end })
  }

  const isStart = (day: Date): boolean =>
    !!(pending.from && isSameDay(day, pending.from))

  const isEnd = (day: Date): boolean => {
    const to = pending.to ?? hovered
    return !!(pending.from && to && isSameDay(day, to))
  }

  const handlePreset = (key: string) => {
    const t = today
    let from: Date, to: Date

    switch (key) {
      case "today":
        from = t; to = t; break
      case "yesterday":
        from = addDays(t, -1); to = addDays(t, -1); break
      case "7days":
        from = addDays(t, -6); to = t; break
      case "14days":
        from = addDays(t, -13); to = t; break
      case "30days":
        from = addDays(t, -29); to = t; break
      case "thisWeek":
        from = startOfWeek(t, { weekStartsOn: 1 }); to = t; break
      case "lastWeek": {
        const ls = startOfWeek(addDays(t, -7), { weekStartsOn: 1 })
        from = ls; to = addDays(ls, 6); break
      }
      case "thisMonth":
        from = startOfMonth(t); to = t; break
      case "lastMonth":
        from = startOfMonth(addMonths(t, -1)); to = endOfMonth(addMonths(t, -1)); break
      default:
        return
    }
    setPending({ from, to })
    setViewMonth(startOfMonth(from))
  }

  const handleApply = () => {
    if (!pending.from || !pending.to) return
    setApplied(pending)
  }

  const handleCancel = () => {
    setPending({ from: null, to: null })
    setApplied({ from: null, to: null })
  }

  const handleDownload = async () => {
    if (!applied.from || !applied.to) return
    setLoading(true)
    try {
      const csv = generateCSV(applied.from, applied.to)
      downloadCSV(csv, applied.from, applied.to)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("[v0] CSV export error:", err)
    } finally {
      setLoading(false)
    }
  }

  const generateCSV = (from: Date, to: Date): string => {
    const headers = ["No", "Tanggal", "Nomor Struk", "Item", "Jumlah", "Harga", "Total", "Metode Pembayaran"]
    const rows: string[] = []
    const saved = localStorage.getItem("cashierData")
    if (saved) {
      const transactions = JSON.parse(saved)
      let n = 1
      transactions.forEach((tx: any) => {
        const txDate = startOfDay(new Date(tx.date))
        if (txDate >= from && txDate <= to) {
          tx.items?.forEach((item: any, idx: number) => {
            rows.push([
              n,
              format(txDate, "dd/MM/yyyy HH:mm", { locale: idLocale }),
              tx.receiptNumber || "-",
              item.name,
              item.quantity,
              item.price,
              item.total,
              tx.paymentMethod === "cash" ? "Tunai" : "Transfer",
            ].join(","))
            if (idx === 0) n++
          })
        }
      })
    }
    return [headers.join(","), ...rows].join("\n")
  }

  const downloadCSV = (content: string, from: Date, to: Date) => {
    const name = `Laporan_${format(from, "ddMMyyyy")}_${format(to, "ddMMyyyy")}.csv`
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const renderMonth = (month: Date) => {
    const days = getCalendarDays(month)
    return (
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold mb-3 px-1">
          {format(month, "MMMM yyyy", { locale: idLocale })}
        </div>
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="h-9 flex items-center justify-center text-sm font-semibold text-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const outside = !isSameMonth(day, month)
            const start = isStart(day)
            const end = isEnd(day)
            const inRange = isInRange(day)
            const isToday = isSameDay(day, today)

            return (
              <div
                key={i}
                className={[
                  "h-9 flex items-center justify-center relative cursor-pointer select-none",
                  outside ? "pointer-events-none" : "",
                  inRange && !start && !end ? "bg-primary/10" : "",
                ].join(" ")}
                onClick={() => !outside && handleDayClick(day)}
                onMouseEnter={() => pending.from && !pending.to && setHovered(day)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className={[
                  "w-9 h-9 flex items-center justify-center text-sm rounded-full transition-colors z-10 relative",
                  outside ? "text-muted-foreground/30" : "hover:bg-accent",
                  start || end ? "!bg-primary !text-primary-foreground font-semibold" : "",
                  isToday && !start && !end ? "font-bold text-primary" : "",
                  !outside && !start && !end ? "text-foreground" : "",
                ].join(" ")}>
                  {format(day, "d")}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const rangeLabel = (() => {
    if (pending.from && pending.to) {
      return `${format(pending.from, "d MMM yyyy", { locale: idLocale })} – ${format(pending.to, "d MMM yyyy", { locale: idLocale })}`
    }
    if (pending.from) return format(pending.from, "d MMM yyyy", { locale: idLocale })
    return ""
  })()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ekspor Laporan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {success && (
          <Alert className="bg-green-500/5 border-green-500/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Laporan berhasil diunduh sebagai CSV
            </AlertDescription>
          </Alert>
        )}

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex divide-x divide-border">
            {/* Sidebar Presets */}
            <div className="w-48 shrink-0 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
                Pilih Rentang
              </p>
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePreset(p.key)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Calendar Section */}
            <div className="flex-1 flex flex-col">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <button
                  onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold">
                  {format(viewMonth, "MMMM yyyy", { locale: idLocale })}
                </span>
                <button
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Two Month Calendars */}
              <div className="flex gap-8 px-6 py-4 flex-1">
                {renderMonth(viewMonth)}
                {renderMonth(nextMonth)}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {rangeLabel}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!pending.from || !pending.to}
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Section */}
        {applied.from && applied.to && (
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
            <div>
              <p className="text-sm font-medium">Siap diunduh</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(applied.from, "d MMM yyyy", { locale: idLocale })} – {format(applied.to, "d MMM yyyy", { locale: idLocale })} &bull; Format CSV
              </p>
            </div>
            <Button onClick={handleDownload} disabled={loading} className="gap-2">
              <Download className="w-4 h-4" />
              {loading ? "Membuat..." : "Download CSV"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
