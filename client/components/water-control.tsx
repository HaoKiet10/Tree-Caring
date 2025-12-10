'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WaterControlProps {
  soilMoisture: number
}

export default function WaterControl({ soilMoisture }: WaterControlProps) {
  const [isWatering, setIsWatering] = useState(false)
  const duration = 30 // Fixed duration to 30 seconds
  const [lastWatered, setLastWatered] = useState<Date>(new Date())
  
  // Determine if watering is needed based on soil moisture threshold
  const needsWatering = soilMoisture < 40 // Water when moisture is below 40%
  
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // Check every second if watering is needed and not currently watering
      if (needsWatering && !isWatering) {
        // Start watering
        setIsWatering(true)
        setLastWatered(new Date())
        
        // Stop watering after duration
        setTimeout(() => {
          setIsWatering(false)
        }, duration * 1000)
      }
    }, 1000)
    
    return () => clearInterval(checkInterval)
  }, [needsWatering, isWatering, duration])

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          Hệ thống tưới tự động
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className={`rounded-lg border-2 p-6 ${
            needsWatering 
              ? 'border-orange-200 bg-orange-50' 
              : 'border-emerald-200 bg-emerald-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">Tình trạng:</div>
                <div className={`text-2xl font-bold ${
                  needsWatering ? 'text-orange-700' : 'text-emerald-700'
                }`}>
                  {needsWatering ? 'Cần tưới nước' : 'Đủ độ ẩm'}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Độ ẩm đất: {soilMoisture}%
                </div>
              </div>
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                needsWatering ? 'bg-orange-600' : 'bg-emerald-600'
              }`}>
                {needsWatering ? (
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>

        {isWatering && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                <svg
                  className="h-6 w-6 animate-bounce text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-blue-900">Đang tưới tự động</div>
                <div className="text-sm text-blue-700">Máy bơm đang hoạt động...</div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
          <div className="flex items-center justify-between">
            <span className="font-medium">Lần tưới cuối:</span>
            <span>{lastWatered.toLocaleTimeString('vi-VN')}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium">Ngưỡng tưới:</span>
            <span className="text-orange-700">Dưới 40% độ ẩm</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-medium">Thời gian tưới:</span>
            <span className="text-emerald-700">30 giây</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
