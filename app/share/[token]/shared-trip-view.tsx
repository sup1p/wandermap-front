"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Trip } from "@/types/trip"
import TripTimeline from "@/components/trip-timeline"
import TripDetail from "@/components/trip-detail"
import { useToast } from "@/components/ui/use-toast"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-gray-200">Loading map...</div>,
})

type SharedTripViewProps = {
  token: string
}

export default function SharedTripView({ token }: SharedTripViewProps) {
  const { toast } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSharedTrips = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/shareprivate/${token}/`)
  
        if (!response.ok) throw new Error("Failed to fetch shared trips")
  
        const data = await response.json()
        const { trips, username } = data
  
        setUserEmail(username || "")
        const sortedTrips = trips.sort((a: Trip, b: Trip) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )
  
        setTrips(sortedTrips)
      } catch (error) {
        console.error("Error fetching shared trips:", error)
        toast({
          title: "Error",
          description: "Failed to load shared trips. The link may be invalid or expired.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchSharedTrips()
  }, [token])

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 relative">
        <MapComponent trips={trips} onMapClick={() => {}} selectedTrip={selectedTrip} onTripSelect={setSelectedTrip} />
      </div>

      <div className="w-96 bg-[#3a4a3a] text-white flex flex-col h-screen">
        <div className="flex items-center justify-between p-4 border-b border-[#4a5a4a]">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-white">WANDERMAP</h1>
          </div>
          {userEmail && <div className="text-sm text-gray-300">{userEmail}'s journey</div>}
        </div>

        {selectedTrip ? (
          <TripDetail
            trip={selectedTrip}
            onClose={() => setSelectedTrip(null)}
            onEdit={() => {}}
            onDelete={() => {}}
            onUploadPhoto={() => {}}
            onDeletePhoto={() => {}}
            readonly={true}
          />
        ) : (
          <TripTimeline trips={trips} onTripSelect={setSelectedTrip} onAddClick={() => {}} readonly={true}/>
        )}
      </div>
    </div>
  )
}
