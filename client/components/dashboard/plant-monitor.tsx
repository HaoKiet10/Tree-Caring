"use client";

import { useState, useEffect } from "react";
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

// Register Chart.js components
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

// 1. Định nghĩa Interface khớp với dữ liệu API trả về
interface SensorLog {
  recordedAt: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  lightIntensity: number;
}

interface ApiResponse {
  current: SensorLog;
  history: SensorLog[];
}

// Interface cho dữ liệu dùng trong biểu đồ (đã convert sang number)
interface HourlyData {
  time: string;
  humidity: number;
  temperature: number;
  soilMoisture: number;
  lightIntensity: number;
}

interface PlantMonitorProps {
  latest: SensorLog | null;
  history: SensorLog[];
}

export default function PlantMonitor({ latest, history }: PlantMonitorProps) {
  // State hiển thị chỉ số hiện tại
  const [sensor, setSensor] = useState({
    temperature: 0,
    humidity: 0,
    soil: 0,
    light: 0,
  });
  // State quản lý UI
  const [isHumidityExpanded, setIsHumidityExpanded] = useState(false);
  const [isTemperatureExpanded, setIsTemperatureExpanded] = useState(false);
  const [isSoilMoistureExpanded, setIsSoilMoistureExpanded] = useState(false);
  const [isLightExpanded, setIsLightExpanded] = useState(false);

  // State dữ liệu biểu đồ
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (latest) {
      setSensor({
        temperature: Number(latest.temperature),
        humidity: Number(latest.humidity),
        soil: Number(latest.soilMoisture),
        light: Number(latest.lightIntensity),
      });
    }

    if (history && history.length > 0) {
      // Chuyển đổi dữ liệu lịch sử sang định dạng HourlyData với thời gian giả định
      const formattedData: HourlyData[] = history.map((log) => ({
        time: new Date(log.recordedAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: Number(log.temperature),
        humidity: Number(log.humidity),
        soilMoisture: Number(log.soilMoisture),
        lightIntensity: Number(log.lightIntensity),
      }));

      setHourlyData(formattedData);
    }
    if (latest && history) setIsLoading(false);
  }, [latest, history]);

  const getStatusColor = (value: number, min: number, max: number) => {
    if (value < min) return "text-red-600";
    if (value > max) return "text-orange-600";
    return "text-emerald-600";
  };

  const getStatusText = (value: number, min: number, max: number) => {
    if (value < min) return "Thấp";
    if (value > max) return "Cao";
    return "Tốt";
  };

  const createChartData = (
    dataKey: keyof HourlyData,
    label: string,
    color: string // mã HEX (VD: #EF4444)
  ) => ({
    labels: hourlyData.map((d) => d.time),
    datasets: [
      {
        label,
        data: hourlyData.map((d) => d[dataKey]),
        borderColor: color, // Màu đường kẻ chính
        backgroundColor: color + "33", // Màu nền với độ trong suốt
        borderWidth: 3, // Tăng độ dày đường kẻ
        tension: 0.4, // Độ cong mềm mại của đường
        fill: true, // Tô màu nền bên dưới
        pointRadius: 4, // Kích thước điểm tròn
        pointHoverRadius: 6,
        pointBackgroundColor: "#fff", // Màu nền của điểm tròn
        pointBorderColor: color, // Viền điểm tròn cùng màu với đường
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#e5e7eb", // Màu lưới nhạt
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (isLoading) {
    return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Cảm biến môi trường
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Humidity */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              <span className="font-medium text-gray-700">Độ ẩm không khí</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {sensor.humidity.toFixed(2)}%
              </div>
              <div
                className={`text-sm ${getStatusColor(
                  sensor.humidity,
                  40,
                  70
                )}`}>
                {getStatusText(sensor.humidity, 40, 70)}
              </div>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${Math.min(sensor.humidity, 100)}%` }}
            />
          </div>

          <Button
            onClick={() => setIsHumidityExpanded(!isHumidityExpanded)}
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-between text-sm">
            <span>Xem lịch sử</span>
            <svg
              className={`h-4 w-4 transition-transform ${
                isHumidityExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {isHumidityExpanded && (
            <div className="mt-4 h-[250px]">
              <Line
                data={createChartData("humidity", "Độ ẩm KK (%)", "#2563eb")}
                options={chartOptions}
              />
            </div>
          )}
        </div>

        {/* Temperature */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="font-medium text-gray-700">Nhiệt độ</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {sensor.temperature.toFixed(1)}°C
              </div>
              <div
                className={`text-sm ${getStatusColor(
                  sensor.temperature,
                  20,
                  30
                )}`}>
                {getStatusText(sensor.temperature, 20, 30)}
              </div>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-orange-600 transition-all duration-500"
              style={{
                width: `${Math.min((sensor.temperature / 50) * 100, 100)}%`,
              }}
            />
          </div>

          <Button
            onClick={() => setIsTemperatureExpanded(!isTemperatureExpanded)}
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-between text-sm">
            <span>Xem lịch sử</span>
            <svg
              className={`h-4 w-4 transition-transform ${
                isTemperatureExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {isTemperatureExpanded && (
            <div className="mt-4 h-[250px]">
              <Line
                data={createChartData(
                  "temperature",
                  "Nhiệt độ (°C)",
                  "#f97316"
                )}
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      max: 50, // Điều chỉnh max scale nếu cần
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Soil Moisture */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              <span className="font-medium text-gray-700">Độ ẩm đất</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">
                {sensor.soil.toFixed(1)}
              </div>
              <div className={`text-sm ${getStatusColor(sensor.soil, 30, 60)}`}>
                {getStatusText(sensor.soil, 30, 60)}
              </div>
            </div>
          </div>
          {/* Lưu ý: Dữ liệu mẫu là 350, nên cần chuẩn hóa nếu muốn hiển thị thanh bar % chính xác */}
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              // Giả sử max là 1024 cho cảm biến analog, nếu là % thì để 100
              style={{
                width: `${Math.min((sensor.soil / 100) * 100, 100)}%`,
              }}
            />
          </div>

          <Button
            onClick={() => setIsSoilMoistureExpanded(!isSoilMoistureExpanded)}
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-between text-sm">
            <span>Xem lịch sử</span>
            <svg
              className={`h-4 w-4 transition-transform ${
                isSoilMoistureExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {isSoilMoistureExpanded && (
            <div className="mt-4 h-[250px]">
              <Line
                data={createChartData("soilMoisture", "Độ ẩm đất", "#10b981")}
                options={chartOptions}
              />
            </div>
          )}
        </div>

        {/* Light Intensity */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="font-medium text-gray-700">Độ ánh sáng</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">
                {sensor.light.toFixed(1)}
              </div>
              <div
                className={`text-sm ${getStatusColor(sensor.light, 40, 80)}`}>
                {getStatusText(sensor.light, 40, 80)}
              </div>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-yellow-600 transition-all duration-500"
              // Giả sử max là 1024 cho cảm biến analog, nếu là % thì để 100
              style={{
                width: `${Math.min((sensor.light / 100) * 100, 100)}%`,
              }}
            />
          </div>

          <Button
            onClick={() => setIsLightExpanded(!isLightExpanded)}
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-between text-sm">
            <span>Xem lịch sử</span>
            <svg
              className={`h-4 w-4 transition-transform ${
                isLightExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {isLightExpanded && (
            <div className="mt-4 h-[250px]">
              <Line
                data={createChartData(
                  "lightIntensity",
                  "Độ ánh sáng",
                  "#ca8a04"
                )}
                options={chartOptions}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
          Đang cập nhật trực tiếp...
        </div>
      </CardContent>
    </Card>
  );
}
