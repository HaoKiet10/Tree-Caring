"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PlantMonitorProps {
  currentData: {
    temperature: number;
    humidity: number;
    soilMoisture: number;
    lightIntensity: number;
  };
  historyData: any[];
}

export default function PlantMonitor({
  currentData,
  historyData,
}: PlantMonitorProps) {
  // Trạng thái mở rộng biểu đồ
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const toggleChart = (chartName: string) => {
    if (expandedChart === chartName) {
      setExpandedChart(null);
    } else {
      setExpandedChart(chartName);
    }
  };

  const createChartData = (dataKey: string, label: string, color: string) => ({
    labels: historyData.map((d) => d.time),
    datasets: [
      {
        label,
        data: historyData.map((d) => d[dataKey]),
        borderColor: color,
        backgroundColor: color.replace(")", ", 0.1)").replace("rgb", "rgba"),
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Helper hiển thị trạng thái text
  const getStatusText = (val: number, min: number, max: number) => {
    if (val < min) return <span className='text-yellow-600'>Thấp</span>;
    if (val > max) return <span className='text-red-600'>Cao</span>;
    return <span className='text-emerald-600'>Ổn định</span>;
  };

  return (
    <Card className='shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-emerald-900'>
          <svg
            className='h-5 w-5'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          </svg>
          Chỉ số môi trường
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* === NHIỆT ĐỘ === */}
        <div>
          <div className='mb-2 flex justify-between'>
            <span className='text-sm font-medium text-gray-600'>Nhiệt độ</span>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-gray-900'>
                {currentData.temperature}°C
              </span>
              {getStatusText(currentData.temperature, 20, 30)}
            </div>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-gray-200'>
            <div
              className='h-full bg-orange-500 transition-all duration-500'
              style={{ width: `${(currentData.temperature / 50) * 100}%` }}
            />
          </div>
          <Button
            onClick={() => toggleChart("temp")}
            variant='ghost'
            size='sm'
            className='mt-1 w-full justify-between text-xs text-gray-500'
          >
            Xem biểu đồ {expandedChart === "temp" ? "▲" : "▼"}
          </Button>
          {expandedChart === "temp" && (
            <div className='mt-2 h-[200px]'>
              <Line
                data={createChartData(
                  "temperature",
                  "Nhiệt độ (°C)",
                  "rgb(249, 115, 22)"
                )}
                options={chartOptions}
              />
            </div>
          )}
        </div>

        {/* === ĐỘ ẨM KHÔNG KHÍ === */}
        <div>
          <div className='mb-2 flex justify-between'>
            <span className='text-sm font-medium text-gray-600'>
              Độ ẩm không khí
            </span>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-gray-900'>
                {currentData.humidity}%
              </span>
              {getStatusText(currentData.humidity, 50, 80)}
            </div>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-gray-200'>
            <div
              className='h-full bg-blue-500 transition-all duration-500'
              style={{ width: `${currentData.humidity}%` }}
            />
          </div>
          <Button
            onClick={() => toggleChart("hum")}
            variant='ghost'
            size='sm'
            className='mt-1 w-full justify-between text-xs text-gray-500'
          >
            Xem biểu đồ {expandedChart === "hum" ? "▲" : "▼"}
          </Button>
          {expandedChart === "hum" && (
            <div className='mt-2 h-[200px]'>
              <Line
                data={createChartData(
                  "humidity",
                  "Độ ẩm (%)",
                  "rgb(59, 130, 246)"
                )}
                options={chartOptions}
              />
            </div>
          )}
        </div>

        {/* === ÁNH SÁNG === */}
        <div>
          <div className='mb-2 flex justify-between'>
            <span className='text-sm font-medium text-gray-600'>Ánh sáng</span>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-gray-900'>
                {currentData.lightIntensity} Lux
              </span>
            </div>
          </div>
          <div className='h-2 overflow-hidden rounded-full bg-gray-200'>
            {/* Giả sử max ánh sáng là 1000 để tính % bar */}
            <div
              className='h-full bg-yellow-500 transition-all duration-500'
              style={{
                width: `${Math.min(
                  (currentData.lightIntensity / 1000) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <Button
            onClick={() => toggleChart("light")}
            variant='ghost'
            size='sm'
            className='mt-1 w-full justify-between text-xs text-gray-500'
          >
            Xem biểu đồ {expandedChart === "light" ? "▲" : "▼"}
          </Button>
          {expandedChart === "light" && (
            <div className='mt-2 h-[200px]'>
              <Line
                data={createChartData(
                  "lightIntensity",
                  "Ánh sáng (Lux)",
                  "rgb(234, 179, 8)"
                )}
                options={chartOptions}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
