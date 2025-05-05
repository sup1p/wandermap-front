"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Trip } from '@/types/trip';
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Edit, Trash, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createPortal } from "react-dom";

interface TripDetailProps {
  trip: Trip
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onUploadPhoto: (file: File) => void
  onDeletePhoto: (photoId: string) => void
  readonly?: boolean
}

export default function TripDetail({ trip, onClose, onEdit, onDelete, onUploadPhoto, onDeletePhoto, readonly }: TripDetailProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      await onUploadPhoto(file)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const extractPhotoId = (url: string) => {
    const parts = url.split("/")
    return parts[parts.length - 1].split(".")[0]
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-[#4a5a4a]">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onClose} className="mr-2 text-white hover:bg-[#4a5a4a]">
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">{trip.place}</h2>
        </div>
        {!readonly && (
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={onEdit} className="text-white hover:bg-[#4a5a4a]">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-white hover:bg-[#4a5a4a]">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <div className="text-gray-300 mb-1">Date</div>
          <div>{formatDate(trip.date)}</div>
        </div>

        <div className="mb-6">
          <div className="text-gray-300 mb-1">Notes</div>
          <div className="whitespace-pre-wrap">{trip.note || "No notes added"}</div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-gray-300">Photos</div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {!readonly && (
                <div className="flex items-center text-sm text-gray-300 hover:text-white">
                  <Upload className="h-4 w-4 mr-1" />
                  {isUploading ? "Uploading..." : "Upload"}
                </div>
              )}
            </label>
          </div>

          {trip.photo_urls && trip.photo_urls.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {trip.photo_urls.map((photo, index) => {
                const validUrl = photo?.url && typeof photo.url === "string" && photo.url.trim() !== "" ? photo.url : "/placeholder.svg";
                if (validUrl === "/placeholder.svg") {
                  console.warn(`Invalid or missing image URL at index ${index}, using placeholder.`);
                }
                return (
                  <div key={photo.id || index} className="relative group">
                    <Image
                      src={validUrl}
                      alt={`Photo of ${trip.place}`}
                      width={150}
                      height={150}
                      className="w-full h-auto rounded-md object-cover aspect-square cursor-pointer"
                      onClick={() => setSelectedImage(validUrl)}
                    />
                    {!readonly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        onClick={() => onDeletePhoto(photo.id.toString())}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No photos added yet</div>
          )}
        </div>
      </div>
      {selectedImage && createPortal(
        <div className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center">
          <div className="relative bg-black p-4 rounded-lg shadow-xl max-w-[90%] max-h-[90%]">
            <button
              className="absolute top-2 right-2 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <Image
              src={selectedImage}
              alt="Enlarged photo"
              width={800}
              height={600}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
