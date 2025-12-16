"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Hoặc dùng thẻ input thường nếu chưa có component này
import { Label } from "@/components/ui/label";

// Định nghĩa kiểu dữ liệu
interface WateringControlData {
  controlId?: string;
  userId: number;
  pumpStatus: boolean;
  mode: "AUTO" | "MANUAL";
  soilThreshold: number;
  maxPumpDuration: number;
  lastWateredAt: string | null;
}

interface WaterControlProps {
  soilMoisture: number;
}

export default function WaterControl({ soilMoisture }: WaterControlProps) {
  const [data, setData] = useState<WateringControlData | null>(null);
  const [localThreshold, setLocalThreshold] = useState<string | number>(40); // State nội bộ cho input
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Trạng thái đang lưu

  const userId = 1;

  const createDefaultData = useCallback(async () => {
    const payload = {
      pump_status: false,
      mode: "AUTO",
      soil_threshold: 40,
      max_pump_duration: 30,
      last_watered_at: null,
    };
    try {
      const res = await fetch(`http://localhost:4000/api/watering/${userId}`, {
        method: "POST", // Hoặc PUT vì server dùng upsert
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newData = await res.json();
        setData(newData);
        setLocalThreshold(newData.soilThreshold);
      }
    } catch (err) {
      console.error("Lỗi tạo dữ liệu mặc định:", err);
    }
  }, [userId]);

  // --- 1. Fetch Data ---
  const fetchWateringStatus = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/watering/${userId}`);
      if (res.ok) {
        const result = await res.json();

        if (result === null) {
          // Nếu chưa có dữ liệu -> Tạo mặc định
          await createDefaultData();
        } else {
          setData(result);
          // Chỉ cập nhật localThreshold khi mới load (loading = true)
          if (loading) {
            setLocalThreshold(result.soilThreshold);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, loading, createDefaultData]);

  // --- 2. Update Data ---
  const updateStatus = async (newThreshold: number) => {
    if (!data) return;
    setIsSaving(true);

    // Validate: Giới hạn 0 - 100
    let validatedThreshold = newThreshold;
    if (validatedThreshold < 0) validatedThreshold = 0;
    if (validatedThreshold > 100) validatedThreshold = 100;

    // Cập nhật lại số chuẩn vào ô input (nếu user nhập sai)
    setLocalThreshold(validatedThreshold);

    // Optimistic Update
    setData({ ...data, soilThreshold: validatedThreshold, mode: "AUTO" });

    try {
      await fetch(`http://localhost:4000/api/watering/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pump_status: data.pumpStatus,
          mode: "AUTO",
          soil_threshold: validatedThreshold,
          max_pump_duration: data.maxPumpDuration,
          last_watered_at: data.lastWateredAt,
        }),
      });
    } catch (error) {
      console.error("Lỗi update:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. Polling ---
  useEffect(() => {
    fetchWateringStatus();
    const interval = setInterval(fetchWateringStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchWateringStatus]);

  // Xử lý khi gõ phím
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalThreshold(e.target.value);
  };

  // Xử lý khi nhấn Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateStatus(Number(localThreshold));
      (e.target as HTMLInputElement).blur(); // Bỏ focus sau khi enter
    }
  };

  // Xử lý khi click ra ngoài (Blur)
  const handleBlur = () => {
    updateStatus(Number(localThreshold));
  };

  if (loading)
    return (
      <div className="p-4 text-center text-sm text-gray-400">Đang tải...</div>
    );

  const isPumpRunning = data?.pumpStatus;
  const currentThreshold = Number(localThreshold);
  const isDry = soilMoisture < currentThreshold;

  return (
    <Card className="shadow-lg border-emerald-100 overflow-hidden">
      <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-100">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-emerald-800 text-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Cấu hình Tự động
          </CardTitle>

          {/* Đèn báo trạng thái bơm */}
          {isPumpRunning ? (
            <Badge className="bg-blue-500 hover:bg-blue-600 animate-pulse flex gap-1 shadow-md shadow-blue-200">
              <svg
                className="w-3 h-3 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Đang bơm
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500 border-gray-300">
              Máy nghỉ
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          {/* Cột Trái: Hiển thị độ ẩm hiện tại */}
          <div className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Độ ẩm đất
            </span>
            <span className="text-4xl font-bold text-gray-700 mt-1">
              {soilMoisture}%
            </span>
          </div>

          {/* Icon so sánh */}
          <div className="text-gray-300">
            {isDry ? (
              <svg
                className="w-8 h-8 text-orange-400 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg> // Dấu nhỏ hơn
            ) : (
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg> // Dấu lớn hơn
            )}
          </div>

          {/* Cột Phải: Ô Input Ngưỡng */}
          <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center relative">
            <Label
              htmlFor="threshold"
              className="text-xs font-semibold text-emerald-600 uppercase mb-1">
              Ngưỡng tưới
            </Label>

            <div className="relative w-full max-w-20">
              <input
                id="threshold"
                type="number"
                value={localThreshold}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="w-full text-center text-3xl font-bold text-emerald-700 bg-transparent border-b-2 border-emerald-300 focus:border-emerald-600 focus:outline-none p-1 transition-colors"
                min="0"
                max="100"
              />
              <span className="absolute top-2 -right-3 text-lg text-emerald-500">
                %
              </span>
            </div>
            {isSaving && (
              <span className="absolute bottom-1 text-[10px] text-emerald-500 animate-pulse">
                Đang lưu...
              </span>
            )}
          </div>
        </div>

        {/* Thông báo Logic */}
        <div
          className={`p-4 rounded-lg border text-sm flex gap-3 items-start transition-colors ${
            isDry
              ? "bg-orange-50 border-orange-100 text-orange-800"
              : "bg-emerald-50 border-emerald-100 text-emerald-800"
          }`}>
          {isDry ? (
            <>
              <svg
                className="w-5 h-5 shrink-0 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-bold">Đất đang khô</p>
                <p>
                  Độ ẩm ({soilMoisture}%) thấp hơn ngưỡng ({currentThreshold}%).
                  Hệ thống đang kích hoạt bơm.
                </p>
              </div>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 shrink-0 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-bold">Độ ẩm ổn định</p>
                <p>
                  Độ ẩm ({soilMoisture}%) cao hơn ngưỡng ({currentThreshold}%).
                  Máy bơm đang tắt.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="text-center text-xs text-gray-400">
          <i>Nhấn Enter hoặc click ra ngoài để lưu cấu hình.</i>
        </div>
      </CardContent>
    </Card>
  );
}
