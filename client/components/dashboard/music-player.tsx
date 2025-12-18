"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, Music2, Loader2, Volume2 } from "lucide-react"; // Dùng Lucide cho đồng bộ
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

  // --- 1. KẾT NỐI SOCKET.IO (LẮNG NGHE ARDUINO) ---
  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("song_finished", (data: { songId: number }) => {
      console.log("📨 Arduino báo: Đã phát xong bài", data.songId);
      // Nếu bài kết thúc đúng là bài đang hiện trên Web, reset trạng thái
      setIsPlaying(false);
      setCurrentSong(null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // --- 2. FETCH DATA (GIỮ NGUYÊN LOGIC NHƯNG CLEAN UI) ---
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
    <Card className='w-full max-w-md mx-auto overflow-hidden border-none shadow-2xl bg-white/80 backdrop-blur-md'>
      {/* Header với Gradient mượt hơn */}
      <CardHeader className='bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white'>
        <div className='flex justify-between items-center'>
          <CardTitle className='flex items-center gap-3 text-xl font-bold'>
            <Music2 className='h-6 w-6' />
            Vườn Âm Nhạc
          </CardTitle>
          {isPlaying && <Volume2 className='h-5 w-5 animate-bounce' />}
        </div>
        <p className='text-indigo-100 text-xs mt-1 opacity-80'>
          Điều khiển nhạc cho cây xanh qua MQTT
        </p>
      </CardHeader>

      <CardContent className='p-0'>
        <div className='max-h-[380px] overflow-y-auto p-4 space-y-3 custom-scrollbar'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
              <Loader2 className='h-8 w-8 animate-spin mb-2' />
              <p className='text-sm'>Đang kết nối thư viện...</p>
            </div>
          ) : (
            songs.map((song) => (
              <div
                key={song.id}
                onClick={() => handleSongClick(song)}
                className={`group relative flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                  currentSong?.id === song.id
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                {/* Đĩa nhạc xoay khi đang phát */}
                <div
                  className={`relative h-12 w-12 flex-shrink-0 rounded-full overflow-hidden border-2 ${
                    currentSong?.id === song.id && isPlaying
                      ? "border-indigo-500 animate-[spin_3s_linear_infinite]"
                      : "border-gray-200"
                  }`}
                >
                  <div className='absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-400 flex items-center justify-center'>
                    <Music2
                      className={`h-5 w-5 ${
                        currentSong?.id === song.id
                          ? "text-indigo-600"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                </div>

                <div className='ml-4 flex-1 min-w-0'>
                  <h4
                    className={`text-sm font-semibold truncate ${
                      currentSong?.id === song.id
                        ? "text-indigo-900"
                        : "text-gray-800"
                    }`}
                  >
                    {song.title}
                  </h4>
                  <p className='text-xs text-gray-500 truncate'>
                    {song.artist}
                  </p>
                </div>

                {/* Nút Play/Pause nhỏ bên phải */}
                <div className='ml-2'>
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className='flex gap-1 h-3 items-end'>
                      <div className='w-1 bg-indigo-500 animate-[music-bar_0.8s_ease-in-out_infinite]'></div>
                      <div className='w-1 bg-indigo-500 animate-[music-bar_1.2s_ease-in-out_infinite]'></div>
                      <div className='w-1 bg-indigo-500 animate-[music-bar_1s_ease-in-out_infinite]'></div>
                    </div>
                  ) : (
                    <Play className='h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors' />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Player Mini ở dưới cùng khi có bài đang chọn */}
        {currentSong && (
          <div className='p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between animate-in slide-in-from-bottom-5 duration-500'>
            <div className='flex items-center gap-3'>
              <div className='flex flex-col'>
                <span className='text-[10px] uppercase font-bold text-gray-400 tracking-widest'>
                  Đang phát
                </span>
                <span className='text-sm font-bold text-indigo-700 truncate max-w-[150px]'>
                  {currentSong.title}
                </span>
              </div>
            </div>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => {
                setIsPlaying(false);
                setCurrentSong(null);
                sendSongCommand("STOP");
              }}
              className='rounded-full px-4 h-9 shadow-lg shadow-red-200 flex gap-2'
            >
              <Square className='h-3 w-3 fill-current' /> Dừng
            </Button>
          </div>
        )}
      </CardContent>

      <style jsx global>{`
        @keyframes music-bar {
          0%,
          100% {
            height: 4px;
          }
          50% {
            height: 12px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </Card>
  );
}
