"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import MapHeader from "@/components/map-header"
import TripTimeline from "@/components/trip-timeline"
import TripDetail from "@/components/trip-detail"
import AddTripModal from "@/components/add-trip-modal"
import EditTripModal from "@/components/edit-trip-modal"
import SettingsPanel from "@/components/settings-panel"
import { useToast } from "@/components/ui/use-toast"
import { Trip } from '@/types/trip';
import { refreshToken } from "@/lib/auth"
import axios from "axios"
import type { FC } from "react"

// Import Leaflet map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-gray-200">Loading map...</div>,
})

export default function MapPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        await fetchTrips()
      } catch (error) {
        console.error("Error fetching trips:", error)
        const refreshed = await refreshToken()
        if (!refreshed) {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
          router.push("/login")
        } else {
          await fetchTrips()
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Исправляем функцию fetchTrips для правильной обработки ответа API
  const fetchTrips = async () => {
    const token = localStorage.getItem("accessToken")
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch trips")
      }

      const data = await response.json()
      console.log("API response data:", data) // Для отладки

      // Извлекаем массив trips из объекта ответа
      const tripsArray = data.trips || []

      if (!Array.isArray(tripsArray)) {
        console.error("API did not return a valid trips array:", data)
        setTrips([])
        return
      }

      // Sort trips by date
      const sortedTrips = [...tripsArray].sort(
        (a: Trip, b: Trip) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
      setTrips(sortedTrips)
    } catch (error) {
      console.error("Error in fetchTrips:", error)
      setTrips([])
      throw error
    }
  }

  // Используем useCallback для стабильности ссылки на функцию
  const handleOpenAddModal = useCallback(() => {
    console.log("handleOpenAddModal called")
    setIsAddModalOpen(true)
  }, [])

  // Добавим отладочные логи для модальных окон
  const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
    console.log("Map click handler called with:", latlng)
    setSelectedLocation(latlng) // Automatically set the clicked location
    setIsAddModalOpen(true)
  }, [])

  const handleAddTrip = async (tripData: Omit<Trip, "id" | "photo_urls">) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      })

      if (!response.ok) {
        throw new Error("Failed to add trip")
      }

      await fetchTrips()
      setIsAddModalOpen(false)
      toast({
        title: "Success",
        description: "Trip added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add trip",
        variant: "destructive",
      })
    }
  }

  const handleEditTrip = async (tripData: Trip) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripData.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tripData),
      })

      if (!response.ok) {
        throw new Error("Failed to update trip")
      }

      await fetchTrips()
      setIsEditModalOpen(false)

      // Update selected trip if it's the one being edited
      if (selectedTrip && selectedTrip.id === tripData.id) {
        setSelectedTrip({ ...tripData, photo_urls: selectedTrip.photo_urls })
      }

      toast({
        title: "Success",
        description: "Trip updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTrip = async (tripId: number) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete trip")
      }

      await fetchTrips()
      if (selectedTrip && selectedTrip.id === tripId) {
        setSelectedTrip(null)
      }

      toast({
        title: "Success",
        description: "Trip deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      })
    }
  }

  const handleUploadPhoto = async (tripId: number, photoFile: File) => {
    try {
      const token = localStorage.getItem("accessToken")
      const formData = new FormData()
      formData.append("photos", photoFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/upload_photo/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload photo")
      }

      // Refresh trip data to get updated photo URLs
      if (selectedTrip && selectedTrip.id === tripId) {
        const tripResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (tripResponse.ok) {
          const updatedTrip = await tripResponse.json()
          setSelectedTrip(updatedTrip)
        }
      }

      await fetchTrips()

      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      })
    }
  }

  const handleDeletePhoto = async (tripId: number, photoId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${photoId}/delete_photo/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete photo")
      }

      // Refresh trip data to get updated photo URLs
      if (selectedTrip && selectedTrip.id === tripId) {
        const tripResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trips/${tripId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (tripResponse.ok) {
          const updatedTrip = await tripResponse.json()
          setSelectedTrip(updatedTrip)
        }
      }

      await fetchTrips()

      toast({
        title: "Success",
        description: "Photo deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleChangePublicity = async (isPublic: boolean) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/changepublicity/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_public: isPublic }),
      })

      if (!response.ok) {
        throw new Error("Failed to change publicity")
      }

      const data = await response.json()
      console.log("Publicity updated:", data)
      toast({
        title: "Success",
        description: `Profile is now ${isPublic ? "public" : "private"}`,
      })
    } catch (error) {
      console.error("Error changing publicity:", error)
      toast({
        title: "Error",
        description: "Failed to change publicity",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>
  }

  // Также добавим отладочные логи для кнопки настроек
  return (
    <div className="flex h-screen">
      <div className="flex-1 relative" style={{ zIndex: 1 }}>
        <MapComponent
          trips={trips}
          onMapClick={handleMapClick}
          selectedTrip={selectedTrip}
          onTripSelect={setSelectedTrip}
        />
      </div>

      <div className="w-96 bg-[#3a4a3a] text-white flex flex-col h-screen">
        <MapHeader
          onSettingsClick={() => {
            console.log("Settings button clicked")
            setIsSettingsOpen(true)
            console.log("isSettingsOpen set to:", true)
          }}
        />

        {selectedTrip ? (
          <TripDetail
            trip={selectedTrip}
            onClose={() => setSelectedTrip(null)}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={() => handleDeleteTrip(selectedTrip.id)}
            onUploadPhoto={(file) => handleUploadPhoto(selectedTrip.id, file)}
            onDeletePhoto={(photoId) => handleDeletePhoto(selectedTrip.id, photoId)}
          />
        ) : (
          <TripTimeline trips={trips} onTripSelect={setSelectedTrip} onAddClick={handleOpenAddModal} />
        )}
      </div>

      {isAddModalOpen && (
        <AddTripModal
          isOpen={isAddModalOpen}
          onClose={() => {
            console.log("Closing add modal")
            setIsAddModalOpen(false)
            setSelectedLocation(null) // Reset selected location when closing
          }}
          onAdd={handleAddTrip}
          initialLocation={selectedLocation}
          openedFrom={selectedLocation ? 'map' : 'sidebar'}
        />
      )}

      {isEditModalOpen && selectedTrip && (
        <EditTripModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditTrip}
          trip={selectedTrip}
        />
      )}

      {isSettingsOpen && (
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => {
            console.log("Closing settings panel")
            setIsSettingsOpen(false)
          }}
          onLogout={handleLogout}
          onChangePublicity={handleChangePublicity} // Pass the handler to SettingsPanel
        />
      )}
    </div>
  )
}
