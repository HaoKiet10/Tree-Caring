'use client'

import { useState, useEffect } from 'react'
import AuthForm from '@/components/auth-form'
import PlantMonitor from '@/components/plant-monitor'
import MusicPlayer from '@/components/music-player'
import WaterControl from '@/components/water-control'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [soilMoisture, setSoilMoisture] = useState(45)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('smartplant_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const handleAuth = (email: string) => {
    const userData = { email }
    setUser(userData)
    localStorage.setItem('smartplant_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('smartplant_user')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900">Smart Planting</h1>
              <p className="text-sm text-emerald-600">IoT Garden Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-emerald-900">Dashboard</h2>
          <p className="text-emerald-600">Giám sát và điều khiển vườn thông minh của bạn</p>
        </div>

        <div className="space-y-6">
          <div className="w-full">
            <WaterControl soilMoisture={soilMoisture} />
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
            <PlantMonitor soilMoisture={soilMoisture} setSoilMoisture={setSoilMoisture} />
            <MusicPlayer />
          </div>
        </div>
      </main>
    </div>
  )
}
