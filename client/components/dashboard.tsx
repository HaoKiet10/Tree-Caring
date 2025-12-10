"use client";

import { useState, useEffect } from "react";
import AuthForm from "@/components/auth-form";
import PlantMonitor from "@/components/plant-monitor";
import MusicPlayer from "@/components/music-player";
import WaterControl from "@/components/water-control";
import { Button } from "@/components/ui/button";

const API_URL = "http://localhost:4000";

export default function Dashboard() {
  const [user, setUser] = useState<{
    id: number;
    email: string;
    name?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State dữ liệu cảm biến
  const [currentData, setCurrentData] = useState({
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
    lightIntensity: 0,
  });

  // State lịch sử để vẽ biểu đồ
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Kiểm tra đăng nhập từ localStorage
    const savedUser = localStorage.getItem("smartplant_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // 2. Polling dữ liệu (Gọi API mỗi 5 giây)
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sensors?userId=${user.id}`);
        const data = await res.json();

        if (data.current) {
          setCurrentData({
            soilMoisture: Number(data.current.soilMoisture),
            temperature: Number(data.current.temperature),
            humidity: Number(data.current.humidity),
            lightIntensity: Number(data.current.lightIntensity),
          });
        }

        if (data.history) {
          // Format lại dữ liệu cho biểu đồ (Date -> Time string)
          const formattedHistory = data.history.map((log: any) => ({
            time: new Date(log.recordedAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            temperature: Number(log.temperature),
            humidity: Number(log.humidity),
            soilMoisture: Number(log.soilMoisture),
            lightIntensity: Number(log.lightIntensity),
          }));
          setHistoryData(formattedHistory);
        }
      } catch (error) {
        console.error("Lỗi kết nối server:", error);
      }
    };

    fetchData(); // Gọi ngay lập tức
    const interval = setInterval(fetchData, 5000); // Lặp lại mỗi 5s

    return () => clearInterval(interval);
  }, [user]);

  const handleAuth = (userData: any) => {
    setUser(userData);
    localStorage.setItem("smartplant_user", JSON.stringify(userData));
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
    <div className='min-h-screen bg-gray-50 pb-20'>
      <header className='sticky top-0 z-10 border-b bg-white/80 px-4 py-4 backdrop-blur-md'>
        <div className='container mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600'>
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
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
                Smart Planting
              </h1>
              <p className='text-sm text-emerald-600'>IoT Garden Monitor</p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <span className='hidden text-sm text-gray-600 sm:inline'>
              Xin chào, {user.name || user.email}
            </span>
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
            {/* Truyền dữ liệu độ ẩm đất thực tế xuống bộ điều khiển tưới */}
            <WaterControl soilMoisture={currentData.soilMoisture} />
          </div>

          <div className='grid gap-6 md:grid-cols-2'>
            {/* Truyền dữ liệu lịch sử và hiện tại xuống biểu đồ */}
            <PlantMonitor currentData={currentData} historyData={historyData} />
            <MusicPlayer />
          </div>
        </div>
      </main>
    </div>
  );
}
