"use client"

import type React from "react"

import { Trip } from '@/types/trip';
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Plus } from "lucide-react"

interface TripTimelineProps {
  trips: Trip[]
  onTripSelect: (trip: Trip) => void
  onAddClick: () => void
  readonly?: boolean
}

export default function TripTimeline({ trips, onTripSelect, onAddClick, readonly}: TripTimelineProps) {
  console.log("TripTimeline rendered with trips:", trips)

  // Создаем функцию-обертку для обработки клика
  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault() // Предотвращаем стандартное поведение
    e.stopPropagation() // Останавливаем всплытие события
    console.log("Add trip button clicked in TripTimeline (internal handler)")
    onAddClick()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#4a5a4a]">
        <h2 className="text-xl font-semibold text-center">Your Journey</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#4a5a4a] transform -translate-x-1/2"></div>

          {/* Timeline items */}
          <div className="space-y-4">
            {trips && trips.length > 0 ? (
              trips.map((trip) => (
                <div key={trip.id} className="relative" onClick={() => onTripSelect(trip)}>
                  <div className="flex items-center justify-center">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full z-10"></div>
                  </div>
                  <div className="ml-auto w-1/2 p-3 bg-[#4a5a4a] rounded-lg cursor-pointer hover:bg-[#5a6a5a] transition-colors">
                    <div className="font-medium">{trip.place}</div>
                    <div className="text-sm text-gray-300">{formatDate(trip.date)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 mt-4">No trips added yet</div>
            )}
          </div>
        </div>
      </div>

      {!readonly && (
        <div className="p-4 border-t border-[#4a5a4a]">
          <Button
            onClick={handleAddClick}
            variant="outline"
            className="w-full border-[#4a5a4a] hover:bg-[#4a5a4a]"
            type="button"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Trip
          </Button>
        </div>
      )}
    </div>
  )
}
