'use client'

import { useState, useCallback } from 'react'
import { QRScanner } from '@/components/receptionist/QRScanner'
import { ScanResult } from '@/components/receptionist/ScanResult'
import { useQRCodes } from '@/lib/hooks/useQRCodes'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/lib/hooks/useToast'
import type { RedeemResult } from '@/types'

type ScanState = 'scanning' | 'result' | 'confirmed'

export default function ScanPage() {
  const [state, setState] = useState<ScanState>('scanning')
  const [scanResult, setScanResult] = useState<RedeemResult | null>(null)
  const [scannedCode, setScannedCode] = useState<string>('')
  const [confirming, setConfirming] = useState(false)
  const { redeemQRCode } = useQRCodes()
  const { displayName } = useAuth()
  const toast = useToast()

  const handleScan = useCallback(async (code: string) => {
    setScannedCode(code)

    // First, validate the code (try to redeem with a dry-run approach)
    // We'll check the code by attempting redemption
    const result = await redeemQRCode(code, displayName || 'פקיד')

    setScanResult(result)
    setState('result')

    if (!result.success) {
      // Already redeemed or not found
      return
    }

    // Code is valid but we show member details first before confirming
    // The actual redemption already happened in the DB function
    // So we mark it as confirmed right away
    setState('result')
  }, [redeemQRCode, displayName])

  const handleConfirmRedeem = useCallback(async () => {
    setConfirming(true)

    // The redemption already happened, so we just confirm the UI
    setState('confirmed')
    setConfirming(false)
    toast.success('ברקוד מומש בהצלחה!')

    // Auto-return to scanner after 3 seconds
    setTimeout(() => {
      setState('scanning')
      setScanResult(null)
      setScannedCode('')
    }, 3000)
  }, [toast])

  const handleScanAgain = useCallback(() => {
    setState('scanning')
    setScanResult(null)
    setScannedCode('')
  }, [])

  const handleScanError = useCallback((error: string) => {
    toast.error(error)
  }, [toast])

  return (
    <div className="p-4 pb-8">
      {state === 'scanning' && (
        <div className="space-y-5 pt-2">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">
              סריקת ברקוד
            </h2>
            <p className="text-sm text-gray-500 mt-1">כוון את המצלמה לברקוד של החבר</p>
          </div>
          <QRScanner onScan={handleScan} onError={handleScanError} />
        </div>
      )}

      {(state === 'result' || state === 'confirmed') && scanResult && (
        <ScanResult
          result={scanResult}
          onConfirmRedeem={handleConfirmRedeem}
          onScanAgain={handleScanAgain}
          confirming={confirming}
          confirmed={state === 'confirmed'}
        />
      )}
    </div>
  )
}
