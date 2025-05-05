"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Trip } from "@/types/trip"
import TripTimeline from "@/components/trip-timeline"
import TripDetail from "@/components/trip-detail"
import { useToast } from "@/components/ui/use-toast"

// Import Leaflet map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-gray-200">Loading map...</div>,
})

export default function PublicUserPage({ params }: { params: { username: string } }) {
  const { toast } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPublicTrips = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/sharepublic/${params.username}/`)
        if (!response.ok) throw new Error("Failed to fetch public trips")
  
        const data = await response.json()
        const { username, trips } = data
  
        setUserEmail(username || "")
  
        const sortedTrips = trips.sort(
          (a: Trip, b: Trip) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
  
        setTrips(sortedTrips)
      } catch (error) {
        console.error("Error fetching public trips:", error)
        toast({
          title: "Error",
          description: "Failed to load public trips. The user may not exist or their profile is private.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchPublicTrips()
  }, [params.username])
  

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
          />
        ) : (
          <TripTimeline trips={trips} onTripSelect={setSelectedTrip} onAddClick={() => {}} readonly={true} />
        )}
      </div>
    </div>
  )
}
