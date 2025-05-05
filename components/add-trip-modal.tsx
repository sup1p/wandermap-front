"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface AddTripModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (tripData: {
    place: string
    date: string
    note: string
    latitude: number
    longitude: number
  }) => void
  initialLocation: { lat: number; lng: number } | null
  openedFrom: 'sidebar' | 'map'
}

interface LocationSuggestion {
  label: string;
  lat?: number;
  long?: number;
}

export default function AddTripModal({ isOpen, onClose, onAdd, initialLocation, openedFrom }: AddTripModalProps) {
  console.log("AddTripModal rendered, isOpen:", isOpen)

  const [formData, setFormData] = useState({
    place: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
    latitude: initialLocation?.lat || 0,
    longitude: initialLocation?.lng || 0,
  })
  const [placeQuery, setPlaceQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(placeQuery, 300)

  // Update coordinates when initialLocation changes
  useEffect(() => {
    console.log("AddTripModal initialLocation effect:", initialLocation)
    if (initialLocation) {
      setFormData((prev) => ({
        ...prev,
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
      }))
    }
  }, [initialLocation])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, resetting form")
      setFormData({
        place: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
        latitude: initialLocation?.lat || 0,
        longitude: initialLocation?.lng || 0,
      })
      setPlaceQuery("")
      setSuggestions([])
    }
  }, [isOpen, initialLocation])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const token = localStorage.getItem("accessToken")
        const baseUrl = process.env.NEXT_PUBLIC_API_URL
        if (!baseUrl) {
          console.error("NEXT_PUBLIC_API_URL is not defined in the environment variables.")
          setIsLoading(false)
          return
        }

        const endpoint = openedFrom === 'sidebar' 
          ? '/api/autocomplete/lat_long/'
          : '/api/autocomplete/'

        const response = await fetch(
          `${baseUrl}${endpoint}?q=${encodeURIComponent(debouncedQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          if (openedFrom === 'sidebar') {
            setSuggestions(data.map((item: { label: string; lat: string; long: string }) => ({
              label: item.label,
              lat: parseFloat(item.lat),
              long: parseFloat(item.long)
            })))
          } else {
            setSuggestions(data.map((item: { label: string }) => ({
              label: item.label
            })))
          }
        } else {
          console.error("Failed to fetch suggestions:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery, openedFrom])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "place") {
      setPlaceQuery(value)
    }
  }

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      place: suggestion.label,
      ...(suggestion.lat && suggestion.long ? {
        latitude: suggestion.lat,
        longitude: suggestion.long
      } : {})
    }))
    setPlaceQuery(suggestion.label)
    setSuggestions([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted with data:", formData)
    onAdd(formData)
  }

  if (!isOpen) {
    console.log("Modal is not open, not rendering")
    return null
  }

  console.log("Rendering modal content")
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-[#3a4a3a] p-8 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add</h2>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-[#4a5a4a]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="place" className="block text-sm text-gray-300 mb-1">
              Place
            </label>
            <Input
              id="place"
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="bg-[#4a5a4a] border-[#5a6a5a] text-white"
              placeholder="Enter a location"
              required
            />

            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-[#4a5a4a] border border-[#5a6a5a] rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-[#5a6a5a] cursor-pointer text-white"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {suggestion.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm text-gray-300 mb-1">
                Lat
              </label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                className="bg-[#4a5a4a] border-[#5a6a5a] text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm text-gray-300 mb-1">
                Long
              </label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                className="bg-[#4a5a4a] border-[#5a6a5a] text-white"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm text-gray-300 mb-1">
              Date
            </label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="bg-[#4a5a4a] border-[#5a6a5a] text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm text-gray-300 mb-1">
              Note
            </label>
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="bg-[#4a5a4a] border-[#5a6a5a] text-white min-h-[100px]"
              placeholder="Add your travel notes here..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-[#4a5a4a] hover:bg-[#5a6a5a] text-white">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}