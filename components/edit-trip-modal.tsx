"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { Trip } from '@/types/trip';
import { useDebounce } from "@/hooks/use-debounce"

interface EditTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tripData: Trip) => void
  trip: Trip
}

export default function EditTripModal({ isOpen, onClose, onSave, trip }: EditTripModalProps) {
  const [formData, setFormData] = useState<Trip>({ ...trip })
  const [placeQuery, setPlaceQuery] = useState(trip.place)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(placeQuery, 300)

  useEffect(() => {
    setFormData({ ...trip })
    setPlaceQuery(trip.place)
  }, [trip])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const token = localStorage.getItem("accessToken")
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/autocomplete/?q=${encodeURIComponent(debouncedQuery)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.ok) {
          const data = await response.json()
          setSuggestions(data)
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === "place") {
      setPlaceQuery(value)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setFormData((prev) => ({ ...prev, place: suggestion }))
    setPlaceQuery(suggestion)
    setSuggestions([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#3a4a3a] p-6 rounded-lg w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-gray-300 hover:text-white hover:bg-[#4a5a4a]"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <h2 className="text-xl font-semibold mb-4 text-white">Editor</h2>

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
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
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
