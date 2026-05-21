"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Printer, Check } from "lucide-react"

interface ReceiptItem {
  id: number
  name: string
  quantity: number
  price: number
  total: number
}

interface ReceiptProps {
  receiptNumber: string
  items: ReceiptItem[]
  totalAmount: number
  paymentMethod: "cash" | "cashless"
  cashReceived?: number
  changeAmount?: number
  cashierName: string
  timestamp: Date
  onPrint: () => void
  onNewTransaction: () => void
}

interface ReceiptSettingsData {
  storeName: string
  storeAddress: string
  storePhone: string
  footerText: string
  receiptWidth: string
}

export function Receipt({
  receiptNumber,
  items,
  totalAmount,
  paymentMethod,
  cashReceived,
  changeAmount,
  cashierName,
  timestamp,
  onPrint,
  onNewTransaction,
}: ReceiptProps) {
  const [settings, setSettings] = useState<ReceiptSettingsData>({
    storeName: "RATU SAMBAL GEMOY",
    storeAddress: "Jl. Raya, Yogyakarta",
    storePhone: "",
    footerText: "Terima kasih atas kunjungan Anda!",
    receiptWidth: "80",
  })

  useEffect(() => {
    const saved = localStorage.getItem("receiptSettings")
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (err) {
        console.error("[v0] Failed to load receipt settings:", err)
      }
    }
  }, [])
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-green-500/20 bg-green-500/5 print:hidden">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-500">Pembayaran Berhasil!</h2>
              <p className="text-muted-foreground">Transaksi telah selesai diproses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt - Thermal Printer Format */}
      <div className="max-w-xs mx-auto bg-white dark:bg-slate-950 p-4 font-mono text-xs leading-tight">
        {/* Header with Logo */}
        <div className="text-center pb-2 space-y-3">
          <div className="flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-28 h-28 object-contain"
            />
          </div>
          <div className="font-bold tracking-wider">{settings.storeName}</div>
          <div className="text-xs">Rumah Makan & Warung Tradisional</div>
          <div className="text-xs">{settings.storeAddress}</div>
          {settings.storePhone && <div className="text-xs">{settings.storePhone}</div>}
        </div>

        {/* Separator */}
        <div className="text-center py-1 text-foreground/50">
          ================================
        </div>

        {/* Receipt Title */}
        <div className="text-center py-1">
          <span className="font-bold">STRUK TRANSAKSI</span>
        </div>

        {/* Transaction Details */}
        <div className="space-y-0 py-1 text-left">
          <div className="flex justify-between">
            <span>No. Struk</span>
            <span>{receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal</span>
            <span>{formatDateTime(timestamp)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir</span>
            <span>{cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span>Pembayaran</span>
            <span className="font-semibold">{paymentMethod === "cash" ? "Tunai" : "TRANSFER"}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span>SELESAI</span>
          </div>
        </div>

        {/* Separator */}
        <div className="text-center py-1 text-foreground/50">
          --------------------------------
        </div>

        {/* Items Header */}
        <div className="flex justify-between pb-1 font-bold">
          <span className="flex-1">Item</span>
          <span className="w-8 text-right">Qty</span>
          <span className="w-20 text-right">Total</span>
        </div>

        {/* Items */}
        <div className="space-y-1 py-1">
          {items.map((item) => (
            <div key={item.id} className="space-y-0">
              <div className="flex justify-between">
                <span className="flex-1 break-words pr-1">{item.name}</span>
                <span className="w-8 text-right shrink-0">{item.quantity}</span>
                <span className="w-20 text-right shrink-0">{formatPrice(item.total).replace("Rp ", "")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div className="text-center py-1 text-foreground/50">
          ================================
        </div>

        {/* Subtotal & Change */}
        <div className="space-y-0 py-1 text-left">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(totalAmount).replace("Rp ", "")}</span>
          </div>
          {paymentMethod === "cash" && cashReceived && (
            <>
              <div className="flex justify-between">
                <span>Uang Tunai</span>
                <span>{formatPrice(cashReceived).replace("Rp ", "")}</span>
              </div>
              {changeAmount && changeAmount > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Kembalian</span>
                  <span>{formatPrice(changeAmount).replace("Rp ", "")}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Separator */}
        <div className="text-center py-1 text-foreground/50">
          ================================
        </div>

        {/* Grand Total */}
        <div className="text-center py-2 font-bold">
          <div className="text-xs mb-1">TOTAL</div>
          <div className="text-lg tracking-wide">{formatPrice(totalAmount).replace("Rp ", "")}</div>
        </div>

        {/* Separator */}
        <div className="text-center py-1 text-foreground/50">
          ================================
        </div>

        {/* Payment Method */}
        <div className="text-center py-1">
          <div className="text-xs">Metode</div>
          <div className="font-bold">{paymentMethod === "cash" ? "TUNAI" : "TRANSFER"}</div>
          <div>Pembayaran</div>
        </div>

        {/* Separator */}
        <div className="text-center py-1 text-foreground/50">
          --------------------------------
        </div>

        {/* Thank You */}
        <div className="text-center py-2 font-bold">
          TERIMA KASIH
        </div>

        {/* Footer */}
        <div className="text-center space-y-0 text-xs text-foreground/60">
          <div className="text-foreground/50 text-xs">
            {settings.footerText}
          </div>
          <div className="text-foreground/50 text-xs pt-1">
            Barang yang sudah dibeli<br/>tidak dapat dikembalikan
          </div>
        </div>
      </div>

      {/* Action Buttons - Hidden during print */}
      <div className="grid grid-cols-2 gap-3 print:hidden">
        <Button onClick={onPrint} variant="outline" className="touch-target">
          <Printer className="w-4 h-4 mr-2" />
          Cetak Struk
        </Button>

        <Button onClick={onNewTransaction} className="touch-target">
          Transaksi Baru
        </Button>
      </div>
    </div>
  )
}
