"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Music2, Loader2, Volume2, Radio } from "lucide-react"; // Thêm icon Radio cho giống sensor
import { io } from "socket.io-client";

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

  // --- 1. KẾT NỐI SOCKET.IO ---
  useEffect(() => {
    // Kết nối tới Backend
    const socket = io("http://localhost:4000");

    // Lắng nghe sự kiện 'song_finished' từ Backend gửi xuống
    socket.on("song_finished", (data) => {
      console.log("📨 Nhận tín hiệu dừng từ Arduino!");

      // Cập nhật giao diện về trạng thái dừng
      setIsPlaying(false);
      setCurrentSong(null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/songs");
        const data = await res.json();
        const formattedSongs = data.map((item: any) => ({
          id: item.songId || item.id,
          title: item.title,
          artist: item.artist || "Unknown",
        }));
        setSongs(formattedSongs);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongs();
  }, []);

  const sendSongCommand = async (action: "PLAY" | "STOP", songId?: number) => {
    try {
      await fetch("http://localhost:4000/api/songs/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, songId }),
      });
    } catch (error) {
      console.error("❌ Lỗi gửi lệnh:", error);
    }
  };

  const handleSongClick = (song: Song) => {
    if (currentSong?.id === song.id && isPlaying) {
      setIsPlaying(false);
      sendSongCommand("STOP");
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      sendSongCommand("PLAY", song.id);
    }
  };

  return (
    <Card className='w-full h-full border border-emerald-100 shadow-sm bg-white'>
      {/* Header Clean giống Sensor Card */}
      <CardHeader className='pb-2 border-b border-emerald-50'>
        <div className='flex justify-between items-center'>
          <CardTitle className='flex items-center gap-2 text-lg font-bold text-emerald-900'>
            <Music2 className='h-5 w-5 text-emerald-600' />
            Trình Phát Nhạc
          </CardTitle>
          {/* Trạng thái hoạt động giống đèn báo sensor */}
          <div className='flex items-center gap-2'>
            <span
              className={`text-xs font-medium ${
                isPlaying ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              {isPlaying ? "Đang phát" : "Sẵn sàng"}
            </span>
            <div
              className={`h-2 w-2 rounded-full ${
                isPlaying ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
              }`}
            ></div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-0'>
        <div className='max-h-[320px] overflow-y-auto p-3 space-y-2 custom-scrollbar'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-8 text-emerald-600/50'>
              <Loader2 className='h-6 w-6 animate-spin mb-2' />
              <p className='text-xs'>Đang tải dữ liệu...</p>
            </div>
          ) : (
            songs.map((song) => (
              <div
                key={song.id}
                onClick={() => handleSongClick(song)}
                className={`group flex items-center p-2 rounded-lg cursor-pointer transition-all border ${
                  currentSong?.id === song.id
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-transparent hover:bg-emerald-50/50 hover:border-emerald-100"
                }`}
              >
                {/* Icon bên trái: Thay vì đĩa nhạc to, dùng icon nhỏ gọn tinh tế hơn */}
                <div
                  className={`h-8 w-8 flex items-center justify-center rounded-md mr-3 transition-colors ${
                    currentSong?.id === song.id && isPlaying
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"
                  }`}
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <Volume2 className='h-4 w-4 animate-pulse' />
                  ) : (
                    <Radio className='h-4 w-4' />
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <h4
                    className={`text-sm font-medium truncate ${
                      currentSong?.id === song.id
                        ? "text-emerald-900"
                        : "text-gray-700"
                    }`}
                  >
                    {song.title}
                  </h4>
                  <p className='text-xs text-gray-500 truncate'>
                    {song.artist}
                  </p>
                </div>

                {/* Animation sóng nhạc xanh lá */}
                <div className='ml-2 w-6 flex justify-center'>
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className='flex gap-[2px] h-3 items-end'>
                      <div className='w-[3px] bg-emerald-500 animate-[music-bar_0.6s_ease-in-out_infinite]'></div>
                      <div className='w-[3px] bg-emerald-500 animate-[music-bar_0.8s_ease-in-out_infinite]'></div>
                      <div className='w-[3px] bg-emerald-500 animate-[music-bar_1s_ease-in-out_infinite]'></div>
                    </div>
                  ) : (
                    <Play className='h-3 w-3 text-gray-300 group-hover:text-emerald-400' />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer điều khiển Minimalist */}
        {currentSong && (
          <div className='p-3 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between animate-in slide-in-from-bottom-2'>
            <div className='flex flex-col'>
              <span className='text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider'>
                Now Playing
              </span>
              <span className='text-sm font-bold text-emerald-900 truncate max-w-[140px]'>
                {currentSong.title}
              </span>
            </div>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                setIsPlaying(false);
                setCurrentSong(null);
                sendSongCommand("STOP");
              }}
              className='h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors'
            >
              <Square className='h-3 w-3 fill-current mr-1' /> Dừng
            </Button>
          </div>
        )}
      </CardContent>

      <style jsx global>{`
        @keyframes music-bar {
          0%,
          100% {
            height: 3px;
          }
          50% {
            height: 10px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1fae5; /* emerald-100 */
          border-radius: 10px;
        }
      `}</style>
    </Card>
  );
}
