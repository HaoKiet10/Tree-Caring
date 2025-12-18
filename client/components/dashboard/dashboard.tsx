"use client";

import { useState, useEffect } from "react";
import AuthForm from "@/components/auth/auth-form";
import PlantMonitor from "./plant-monitor";
import MusicPlayer from "./music-player";
import WaterControl from "./water-control";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  interface SensorLog {
    recordedAt: string;
    temperature: number;
    humidity: number;
    soilMoisture: number;
    lightIntensity: number;
  }

  const [user, setUser] = useState<{ userId: number; email: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [latest, setLatest] = useState<SensorLog | null>(null);
  const [history, setHistory] = useState<SensorLog[]>([]);

  useEffect(() => {
    // Check if user is logged in from localStorage
    console.log("Checking for saved user in localStorage");
    const savedUser = localStorage.getItem("smartplant_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      console.log("Found saved user:", JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user?.userId) return;
    const fetchData = async () => {
      const res = await fetch(
        `http://localhost:4000/api/sensors?userId=${user.userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        console.error("Fetch failed", res.status);
        return;
      }
      const data = await res.json();
      console.log("Fetched sensor data:", data);
      setLatest(data.latest);
      setHistory(data.history);
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60 * 60 * 1000); // 1 giờ

    return () => clearInterval(intervalId); // cleanup
  }, [user]);

  const handleAuth = (user: { userId: number; email: string }) => {
    setUser(user);
    localStorage.setItem("smartplant_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("smartplant_user");
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuth={handleAuth} />;
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50'>
      <header className='border-b bg-white/80 backdrop-blur-sm'>
        <div className='container mx-auto flex items-center justify-between px-4 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600'>
              <svg
                className='h-6 w-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                />
              </svg>
            </div>
            <div>
              <h1 className='text-xl font-bold text-emerald-900'>
                Tree Caring
              </h1>
              <p className='text-sm text-emerald-600'>
                Điều khiển vườn thông minh
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-600'>{user.email}</span>
            <Button onClick={handleLogout} variant='outline' size='sm'>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 py-8'>
        <div className='mb-6'>
          <h2 className='text-3xl font-bold text-emerald-900'>Dashboard</h2>
          <p className='text-emerald-600'>
            Giám sát và điều khiển vườn thông minh của bạn
          </p>
        </div>

        <div className='space-y-6'>
          <div className='w-full'>
            <WaterControl
              soilMoisture={latest?.soilMoisture || 0}
              user={user}
            />
          </div>

          <div className='grid gap-6 lg:grid-cols-2'>
            <PlantMonitor latest={latest} history={history} />
            <MusicPlayer />
          </div>
        </div>
      </main>
    </div>
  );
}
