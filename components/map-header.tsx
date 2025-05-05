"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MapHeaderProps {
  onSettingsClick: () => void
  isSidebarVisible: boolean
  onToggleSidebar: () => void
}

export default function MapHeader({ onSettingsClick, isSidebarVisible, onToggleSidebar }: MapHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#4a5a4a]">
      <h1 className="text-lg font-bold">WANDERMAP</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="text-sm bg-green text-white px-2 py-1 rounded hover:bg-green-200"
        >
          {isSidebarVisible ? "Hide" : "Show"}
        </button>
        <button onClick={onSettingsClick} className="text-white">
          ⚙️
        </button>
      </div>
    </div>
  )
}
