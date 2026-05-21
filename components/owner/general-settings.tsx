"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Printer, Settings } from "lucide-react"

export function GeneralSettings() {
  // Password States
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Receipt States
  const [storeName, setStoreName] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [footerText, setFooterText] = useState("Terima kasih atas kunjungan Anda!")
  const [receiptWidth, setReceiptWidth] = useState("80")

  // General States
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Load receipt settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("receiptSettings")
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setStoreName(settings.storeName || "RATU SAMBAL GEMOY")
        setStoreAddress(settings.storeAddress || "Jl. Raya, Yogyakarta")
        setStorePhone(settings.storePhone || "")
        setFooterText(settings.footerText || "Terima kasih atas kunjungan Anda!")
        setReceiptWidth(settings.receiptWidth || "80")
      } catch (err) {
        console.error("[v0] Failed to load receipt settings:", err)
      }
    } else {
      // Set default values
      setStoreName("RATU SAMBAL GEMOY")
      setStoreAddress("Jl. Raya, Yogyakarta")
    }
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Password baru tidak cocok")
      return
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/owner/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password berhasil diubah")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.message || "Gagal mengubah password")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("[v0] Change password error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!securityQuestion.trim() || !securityAnswer.trim()) {
      setError("Pertanyaan dan jawaban keamanan tidak boleh kosong")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/owner/update-security-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: securityQuestion,
          answer: securityAnswer,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Pertanyaan keamanan berhasil diperbarui")
        setSecurityQuestion("")
        setSecurityAnswer("")
        setDialogOpen(false)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.message || "Gagal memperbarui pertanyaan keamanan")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("[v0] Update security question error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReceiptSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!storeName.trim()) {
      setError("Nama toko tidak boleh kosong")
      return
    }

    setLoading(true)
    try {
      const settings = {
        storeName: storeName.trim(),
        storeAddress: storeAddress.trim(),
        storePhone: storePhone.trim(),
        footerText: footerText.trim(),
        receiptWidth: receiptWidth,
      }

      localStorage.setItem("receiptSettings", JSON.stringify(settings))
      setSuccess("Pengaturan struk berhasil disimpan")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Gagal menyimpan pengaturan struk")
      console.error("[v0] Save receipt settings error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Pengaturan Umum
          </CardTitle>
          <CardDescription>Kelola pengaturan keamanan dan struk transaksi Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="security" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Keamanan</span>
              </TabsTrigger>
              <TabsTrigger value="receipt" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                <span>Struk</span>
              </TabsTrigger>
            </TabsList>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6 mt-6">
              {/* Change Password Card */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Ubah Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-success bg-success/10">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <AlertDescription className="text-success">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        placeholder="Masukkan password saat ini"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={loading}
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      Password Baru
                    </label>
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Konfirmasi Password Baru
                    </label>
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword}>
                    {loading ? "Mengubah..." : "Ubah Password"}
                  </Button>
                </form>
              </div>

              {/* Security Question Card */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Pertanyaan Keamanan</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Atur Pertanyaan Keamanan</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Atur Pertanyaan Keamanan</DialogTitle>
                      <DialogDescription>
                        Pertanyaan ini akan digunakan untuk verifikasi jika Anda lupa password
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateSecurityQuestion} className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <label htmlFor="question" className="text-sm font-medium">
                          Pertanyaan Keamanan
                        </label>
                        <Input
                          id="question"
                          placeholder="Contoh: Nama hewan peliharaan pertama Anda?"
                          value={securityQuestion}
                          onChange={(e) => setSecurityQuestion(e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="answer" className="text-sm font-medium">
                          Jawaban
                        </label>
                        <Input
                          id="answer"
                          placeholder="Masukkan jawaban Anda"
                          value={securityAnswer}
                          onChange={(e) => setSecurityAnswer(e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                          Batal
                        </Button>
                        <Button type="submit" disabled={loading || !securityQuestion || !securityAnswer}>
                          {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>

            {/* Receipt Tab */}
            <TabsContent value="receipt" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings Form */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pengaturan Struk</h3>
                  <form onSubmit={handleSaveReceiptSettings} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="bg-green-500/5 text-green-700 border-green-500/20">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="storeName">Nama Toko</Label>
                        <Input
                          id="storeName"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          placeholder="RATU SAMBAL GEMOY"
                          disabled={loading}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="storeAddress">Alamat Toko</Label>
                        <Input
                          id="storeAddress"
                          value={storeAddress}
                          onChange={(e) => setStoreAddress(e.target.value)}
                          placeholder="Jl. Raya, Yogyakarta"
                          disabled={loading}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="storePhone">Nomor Telepon</Label>
                        <Input
                          id="storePhone"
                          value={storePhone}
                          onChange={(e) => setStorePhone(e.target.value)}
                          placeholder="(021) 1234-5678 (opsional)"
                          disabled={loading}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="footerText">Teks Footer Struk</Label>
                        <Input
                          id="footerText"
                          value={footerText}
                          onChange={(e) => setFooterText(e.target.value)}
                          placeholder="Terima kasih atas kunjungan Anda!"
                          disabled={loading}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="receiptWidth">Lebar Struk (mm)</Label>
                        <select
                          id="receiptWidth"
                          value={receiptWidth}
                          onChange={(e) => setReceiptWidth(e.target.value)}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground mt-1"
                        >
                          <option value="58">58mm (Thermal Printer Standar)</option>
                          <option value="80">80mm (Thermal Printer Lebar)</option>
                        </select>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Menyimpan..." : "Simpan Pengaturan Struk"}
                    </Button>
                  </form>

                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg mt-4">
                    <p className="text-sm text-blue-900 font-medium">Info:</p>
                    <ul className="text-xs text-blue-800 mt-2 space-y-1 ml-2">
                      <li>• Pengaturan disimpan di perangkat lokal</li>
                      <li>• Perubahan akan langsung terlihat di struk baru</li>
                      <li>• Thermal printer 80mm adalah standar industri POS</li>
                    </ul>
                  </div>
                </div>

                {/* Receipt Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pratinjau Struk</h3>
                  <div className="flex justify-center">
                    <div
                      className="bg-white dark:bg-slate-950 p-4 font-mono text-xs leading-tight border border-border rounded-lg shadow-sm"
                      style={{
                        width: receiptWidth === "58" ? "232px" : "320px",
                      }}
                    >
                      {/* Header */}
                      <div className="text-center pb-2 space-y-0">
                        <div className="font-bold tracking-wider">{storeName || "RATU SAMBAL GEMOY"}</div>
                        <div className="text-xs">Rumah Makan & Warung Tradisional</div>
                        <div className="text-xs">{storeAddress || "Jl. Raya, Yogyakarta"}</div>
                        {storePhone && <div className="text-xs">{storePhone}</div>}
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
                      <div className="space-y-0 py-1 text-left text-xs">
                        <div className="flex justify-between">
                          <span>No. Struk</span>
                          <span>#000001</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tanggal</span>
                          <span>{new Date().toLocaleDateString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kasir</span>
                          <span>Admin</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pembayaran</span>
                          <span className="font-semibold">Tunai</span>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="text-center py-1 text-foreground/50">
                        --------------------------------
                      </div>

                      {/* Items Header */}
                      <div className="flex justify-between pb-1 font-bold text-xs">
                        <span className="flex-1">Item</span>
                        <span className="w-8 text-right">Qty</span>
                        <span className="w-12 text-right">Total</span>
                      </div>

                      {/* Sample Items */}
                      <div className="space-y-1 py-1 text-xs">
                        <div className="flex justify-between">
                          <span className="flex-1 break-words pr-1">Sambal Goreng</span>
                          <span className="w-8 text-right">1</span>
                          <span className="w-12 text-right">25.000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex-1 break-words pr-1">Teh Manis</span>
                          <span className="w-8 text-right">2</span>
                          <span className="w-12 text-right">6.000</span>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="text-center py-1 text-foreground/50">
                        ================================
                      </div>

                      {/* Totals */}
                      <div className="space-y-0 py-1 text-left text-xs">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>31.000</span>
                        </div>
                      </div>

                      {/* Separator */}
                      <div className="text-center py-1 text-foreground/50">
                        ================================
                      </div>

                      {/* Grand Total */}
                      <div className="text-center py-2 font-bold">
                        <div className="text-xs mb-1">TOTAL</div>
                        <div className="text-sm tracking-wide">31.000</div>
                      </div>

                      {/* Separator */}
                      <div className="text-center py-1 text-foreground/50">
                        ================================
                      </div>

                      {/* Payment Method */}
                      <div className="text-center py-1 text-xs">
                        <div>Metode</div>
                        <div className="font-bold">TUNAI</div>
                        <div>Pembayaran</div>
                      </div>

                      {/* Separator */}
                      <div className="text-center py-1 text-foreground/50">
                        --------------------------------
                      </div>

                      {/* Thank You */}
                      <div className="text-center py-2 font-bold text-xs">
                        TERIMA KASIH
                      </div>

                      {/* Footer */}
                      <div className="text-center space-y-0 text-xs text-foreground/60">
                        <div className="text-foreground/50">
                          {footerText || "Terima kasih atas kunjungan Anda!"}
                        </div>
                        <div className="text-foreground/50 text-xs pt-1">
                          Barang yang sudah dibeli<br/>tidak dapat dikembalikan
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
