"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Trip } from '@/types/trip';

interface MapComponentProps {
  trips: Trip[]
  selectedTrip: Trip | null
  onMapClick: (latlng: { lat: number; lng: number }) => void
  onTripSelect: (trip: Trip) => void
}

export default function MapComponent({ trips, selectedTrip, onMapClick, onTripSelect }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: number]: L.Marker }>({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize map if it doesn't exist
      if (!mapRef.current) {
        mapRef.current = L.map("map").setView([51.505, -0.09], 3)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current)

        // Add click handler with console log for debugging
        mapRef.current.on("click", (e) => {
          console.log("Map clicked at:", e.latlng)
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
        })
      }

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker) => {
        marker.remove()
      })
      markersRef.current = {}

      // Add markers for trips
      trips.forEach((trip) => {
        const previewImage = trip.photo_urls && trip.photo_urls.length > 0
        ? trip.photo_urls[0].url
        : null
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${selectedTrip && selectedTrip.id === trip.id ? "#4CAF50" : "#3a4a3a"}; 
                            color: white; 
                            width: 30px; 
                            height: 30px; 
                            display: flex; 
                            align-items: center; 
                            justify-content: center; 
                            border-radius: 50%; 
                            border: 2px solid white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        })

        const marker = L.marker([trip.latitude, trip.longitude], { icon: customIcon })
          .addTo(mapRef.current!)
          .on("click", () => {
            onTripSelect(trip)
          })

        if (previewImage) {
          marker.bindPopup(`
            <div style="width: 150px;">
              <img src="${previewImage}" alt="Preview" style="width: 100%; height: auto; border-radius: 4px;" />
              <div style="margin-top: 4px; font-size: 12px;">${trip.place}</div>
            </div>
          `)
        
          marker.on("mouseover", () => marker.openPopup())
          marker.on("mouseout", () => marker.closePopup())
        }
        markersRef.current[trip.id] = marker
      })

      // Center map on selected trip
      if (selectedTrip && markersRef.current[selectedTrip.id]) {
        mapRef.current.setView([selectedTrip.latitude, selectedTrip.longitude], 10)
      }
    }

    return () => {
      // Cleanup function
    }
  }, [trips, selectedTrip])

  return <div id="map" className="h-full w-full" />
}
