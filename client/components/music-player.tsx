"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const API_URL = "http://localhost:4000";

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number;
  url: string;
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch danh sách bài hát khi component load
  useEffect(() => {
    fetch(`${API_URL}/api/songs`)
      .then((res) => res.json())
      .then((data) => {
        setSongs(data);
        if (data.length > 0) setCurrentSong(data[0]);
      })
      .catch((err) => console.error("Lỗi tải nhạc:", err));
  }, []);

  // Các hàm xử lý nhạc giữ nguyên (handlePlay, handleTimeUpdate...)
  // Chỉ cần đảm bảo thẻ <audio> dùng đúng URL từ server

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    // Tự động play khi chọn bài mới
    setTimeout(() => audioRef.current?.play(), 100);
  };

  return (
    <Card className='shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-purple-900'>
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
              d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
            />
          </svg>
          Nhạc cho cây (và bạn)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Audio Element ẩn */}
        <audio
          ref={audioRef}
          src={currentSong ? `${API_URL}${currentSong.url}` : undefined} // Lưu ý: nối URL với domain backend nếu cần
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Giao diện Controls (Giữ nguyên như cũ) */}
        {currentSong && (
          <div className='mb-6 space-y-4 rounded-xl bg-purple-50 p-4'>
            <div className='text-center'>
              <h3 className='font-bold text-purple-900'>{currentSong.title}</h3>
              <p className='text-sm text-purple-600'>{currentSong.artist}</p>
            </div>
            {/* ... Thanh trượt thời gian, nút Play/Pause ... */}
            <div className='flex justify-center gap-4'>
              <Button
                onClick={togglePlay}
                className='h-12 w-12 rounded-full bg-purple-600 p-0 hover:bg-purple-700'
              >
                {isPlaying ? "||" : "▶"}
              </Button>
            </div>
          </div>
        )}

        {/* Danh sách bài hát */}
        <div className='space-y-2 max-h-[200px] overflow-y-auto'>
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => handleSongSelect(song)}
              className={`w-full rounded-lg p-2 text-left text-sm transition-colors ${
                currentSong?.id === song.id
                  ? "bg-purple-100 font-bold"
                  : "hover:bg-gray-100"
              }`}
            >
              {song.title} - {song.artist}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
