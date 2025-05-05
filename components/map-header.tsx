"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MapHeaderProps {
  onSettingsClick: () => void
}

export default function MapHeader({ onSettingsClick }: MapHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#4a5a4a]">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-white">WANDERMAP</h1>
      </div>
      <Button variant="ghost" size="icon" onClick={onSettingsClick} className="text-white hover:bg-[#4a5a4a]">
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  )
}
