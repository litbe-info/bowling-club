'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, Camera } from 'lucide-react'

interface QRScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<unknown>(null)
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  const [isScanning, setIsScanning] = useState(false)
  const [Html5Qrcode, setHtml5Qrcode] = useState<typeof import('html5-qrcode').Html5Qrcode | null>(null)

  // Keep refs up to date without triggering effect re-runs
  onScanRef.current = onScan
  onErrorRef.current = onError

  useEffect(() => {
    // Dynamic import for client-side only
    import('html5-qrcode').then((module) => {
      setHtml5Qrcode(() => module.Html5Qrcode)
    })
  }, [])

  useEffect(() => {
    if (!Html5Qrcode) return

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText: string) => {
            onScanRef.current(decodedText)
            scanner.stop().catch(() => {})
            setIsScanning(false)
          },
          () => {
            // No QR found - normal behavior
          }
        )

        setIsScanning(true)
      } catch {
        onErrorRef.current?.('לא ניתן לגשת למצלמה')
      }
    }

    startScanner()

    return () => {
      const scanner = scannerRef.current as { isScanning?: boolean; stop: () => Promise<void> } | null
      if (scanner?.isScanning) {
        scanner.stop().catch(() => {})
      }
    }
  }, [Html5Qrcode])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !Html5Qrcode) return

    try {
      const scanner = new Html5Qrcode('qr-file-reader')
      const result = await scanner.scanFile(file, false)
      onScanRef.current(result)
    } catch {
      onErrorRef.current?.('לא נמצא ברקוד בתמונה')
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          id="qr-reader"
          className="w-full rounded-2xl overflow-hidden shadow-lg bg-gray-900 aspect-square max-h-[55dvh]"
        />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
            <div className="text-center text-white space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <Camera size={32} className="opacity-70" />
              </div>
              <p className="text-sm opacity-75">ממתין למצלמה...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <label className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm font-medium text-gray-700">
          <Upload size={18} />
          <span>העלה תמונה מהגלריה</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <div id="qr-file-reader" className="hidden" />
    </div>
  )
}
