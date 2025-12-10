'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

interface Song {
  id: number
  title: string
  artist: string
  duration: number
  url: string
}

const songs: Song[] = [
  {
    id: 1,
    title: 'Ambient Garden',
    artist: 'Nature Sounds',
    duration: 180,
    url: '/placeholder.mp3',
  },
  {
    id: 2,
    title: 'Classical Piano',
    artist: 'Relaxing Music',
    duration: 240,
    url: '/placeholder.mp3',
  },
  {
    id: 3,
    title: 'Forest Rain',
    artist: 'Nature Collection',
    duration: 200,
    url: '/placeholder.mp3',
  },
  {
    id: 4,
    title: 'Morning Melody',
    artist: 'Peaceful Tunes',
    duration: 195,
    url: '/placeholder.mp3',
  },
]

export default function MusicPlayer() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([70])
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (currentSong) {
      // Simulate audio playback
      if (isPlaying) {
        const interval = setInterval(() => {
          setCurrentTime((prev) => {
            if (prev >= currentSong.duration) {
              setIsPlaying(false)
              return 0
            }
            return prev + 1
          })
        }, 1000)
        return () => clearInterval(interval)
      }
    }
  }, [isPlaying, currentSong])

  const handlePlayPause = () => {
    if (!currentSong) {
      setCurrentSong(songs[0])
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const handleNext = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id)
      const nextIndex = (currentIndex + 1) % songs.length
      setCurrentSong(songs[nextIndex])
      setCurrentTime(0)
      setIsPlaying(true)
    }
  }

  const handlePrevious = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id)
      const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1
      setCurrentSong(songs[prevIndex])
      setCurrentTime(0)
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          Âm nhạc cho cây
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Now Playing */}
        {currentSong && (
          <div className="rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-6">
            <div className="mb-4 text-center">
              <div className="mb-2 text-sm font-medium text-purple-600">Đang phát</div>
              <div className="text-xl font-bold text-purple-900">{currentSong.title}</div>
              <div className="text-sm text-purple-700">{currentSong.artist}</div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 space-y-2">
              <Slider
                value={[currentTime]}
                max={currentSong.duration}
                step={1}
                onValueChange={(value) => setCurrentTime(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-purple-700">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentSong.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handlePrevious}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Button>

              <Button
                onClick={handlePlayPause}
                size="icon"
                className="h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700"
              >
                {isPlaying ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </Button>

              <Button
                onClick={handleNext}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>

            {/* Volume */}
            <div className="mt-4 flex items-center gap-3">
              <svg
                className="h-5 w-5 text-purple-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-purple-700">{volume[0]}%</span>
            </div>
          </div>
        )}

        {/* Song List */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Danh sách phát</div>
          <div className="space-y-2">
            {songs.map((song) => (
              <button
                key={song.id}
                onClick={() => handleSongSelect(song)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  currentSong?.id === song.id
                    ? 'bg-purple-100 ring-2 ring-purple-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{song.title}</div>
                    <div className="text-sm text-gray-600">{song.artist}</div>
                  </div>
                  <div className="text-sm text-gray-500">{formatTime(song.duration)}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
