"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Định nghĩa kiểu dữ liệu bài hát
interface Song {
  id: number;
  title: string;
  artist: string;
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. LẤY DANH SÁCH BÀI HÁT TỪ SERVER ---
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/songs");
        if (!res.ok) throw new Error("Không thể tải danh sách nhạc");

        const data = await res.json();

        // Map dữ liệu từ DB (songId) sang Frontend (id)
        const formattedSongs = data.map((item: any) => ({
          id: item.songId || item.id, // Ưu tiên songId nếu DB trả về
          title: item.title,
          artist: item.artist || "Unknown",
        }));

        setSongs(formattedSongs);
      } catch (error) {
        console.error("Lỗi tải nhạc:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // --- 2. GỬI LỆNH ĐIỀU KHIỂN (GỌI API -> MQTT) ---
  const sendSongCommand = async (
    action: "PLAY" | "STOP",
    songId?: number
  ) => {
    try {
      await fetch("http://localhost:4000/api/songs/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          songId,
        }),
      });
      console.log(`📡 Đã gửi lệnh: ${action} - SongID: ${songId}`);
    } catch (error) {
      console.error("❌ Lỗi gửi lệnh điều khiển:", error);
    }
  };

  // --- 3. XỬ LÝ SỰ KIỆN CLICK ---
  const handleSongClick = (song: Song) => {
    // Trường hợp 1: Đang phát đúng bài này -> Muốn Tạm dừng/Tắt
    if (currentSong?.id === song.id && isPlaying) {
      setIsPlaying(false);
      sendSongCommand("STOP");
    }
    // Trường hợp 2: Chọn bài mới hoặc đang tắt -> Muốn Phát
    else {
      setCurrentSong(song);
      setIsPlaying(true);
      sendSongCommand("PLAY", song.id);
    }
  };

  const handleStopGlobal = () => {
    setIsPlaying(false);
    setCurrentSong(null);
    sendSongCommand("STOP");
  };

  // Render Icon trạng thái
  const renderIcon = (songId: number) => {
    if (currentSong?.id === songId && isPlaying) {
      // Icon Đang phát (Pause)
      return (
        <svg
          className='h-5 w-5 text-purple-600 animate-pulse'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M10 9v6m4-6v6'
          />
        </svg>
      );
    }
    // Icon Mặc định (Play)
    return (
      <svg
        className='h-5 w-5 text-gray-400 group-hover:text-purple-600'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z'
        />
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>
    );
  };

  return (
    <Card className='shadow-lg border-purple-100 h-full flex flex-col'>
      <CardHeader className='pb-3 bg-purple-50/50 border-b border-purple-100'>
        <CardTitle className='flex items-center gap-2 text-lg text-purple-900'>
          <svg
            className='h-6 w-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
            />
          </svg>
          Âm nhạc cho cây
        </CardTitle>
      </CardHeader>

      <CardContent className='pt-4 flex-1 overflow-hidden flex flex-col'>
        {isLoading ? (
          <div className='flex-1 flex items-center justify-center text-sm text-gray-400 italic'>
            Đang tải danh sách...
          </div>
        ) : songs.length === 0 ? (
          <div className='flex-1 flex items-center justify-center text-sm text-gray-400'>
            Chưa có bài hát nào.
          </div>
        ) : (
          <div className='space-y-2 overflow-y-auto pr-1 flex-1 max-h-[300px]'>
            {songs.map((song) => (
              <button
                key={song.id}
                onClick={() => handleSongClick(song)}
                className={`group flex w-full items-center justify-between rounded-lg p-3 text-left transition-all duration-200 border ${
                  currentSong?.id === song.id
                    ? "bg-purple-50 border-purple-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div className='flex items-center gap-3 overflow-hidden'>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                      currentSong?.id === song.id && isPlaying
                        ? "bg-purple-100"
                        : "bg-gray-100 group-hover:bg-white"
                    }`}
                  >
                    {renderIcon(song.id)}
                  </div>

                  <div className='min-w-0'>
                    <div
                      className={`font-medium truncate ${
                        currentSong?.id === song.id
                          ? "text-purple-900"
                          : "text-gray-700"
                      }`}
                    >
                      {song.title}
                    </div>
                    <div className='text-xs text-gray-500 truncate'>
                      {song.artist}
                    </div>
                  </div>
                </div>

                {/* Trạng thái text nhỏ bên phải */}
                <div className='ml-2 shrink-0'>
                  {currentSong?.id === song.id && isPlaying && (
                    <span className='text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-1 rounded-full'>
                      Playing
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer điều khiển (Chỉ hiện khi đã chọn bài) */}
        {currentSong && (
          <div className='mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2'>
            <div className='text-xs text-gray-500'>
              Đang chọn:{" "}
              <span className='font-semibold text-purple-700'>
                {currentSong.title}
              </span>
            </div>

            <Button
              variant='destructive'
              size='sm'
              className='h-8 text-xs px-3 shadow-red-100 shadow-sm'
              onClick={handleStopGlobal}
            >
              Dừng phát nhạc
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
