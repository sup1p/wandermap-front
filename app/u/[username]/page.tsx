"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Trip } from "@/types/trip"
import TripTimeline from "@/components/trip-timeline"
import TripDetail from "@/components/trip-detail"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster" // Correct provider for useToast

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-gray-200">Loading map...</div>,
})

type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function PublicUserPage({ params }: PageProps) {
  const resolvedParams = await params
  const { username } = resolvedParams

  return (
    <>
      <Toaster /> {/* Correct provider for toast notifications */}
      <PublicUserPageContent username={username} />
    </>
  )
}

function PublicUserPageContent({ username }: { username: string }) {
  const { toast } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)


  useEffect(() => {
    const fetchPublicTrips = async () => {
      setIsLoading(true)
      try {
        const response: Response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/sharepublic/${username}/`)
        if (response.status === 403) {
          setIsPrivate(true)
          return
        }
        if (!response.ok) throw new Error("Failed to fetch public trips")

        const data: { username: string; trips: Trip[] } = await response.json()
        const { username: fetchedUsername, trips } = data

        setUserEmail(fetchedUsername || "")

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
  }, [username])

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>
  }
  if (isPrivate) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white bg-[#2a2a2a] text-xl">
        This profile is <span className="font-bold px-1">private</span> and cannot be viewed.
      </div>
    )
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
          <TripTimeline trips={trips} onTripSelect={setSelectedTrip} onAddClick={() => {}} readonly={true} />
        )}
      </div>
    </div>
  )
}
