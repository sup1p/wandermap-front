"use client"

import { useState, useEffect, FC } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  onChangePublicity: (isPublic: boolean) => void // Add this prop
}

const SettingsPanel: FC<SettingsPanelProps> = ({ isOpen, onClose, onLogout, onChangePublicity }) => {
  const { toast } = useToast()
  const [isPublic, setIsPublic] = useState(false)
  const [publicLink, setPublicLink] = useState("")
  const [privateLink, setPrivateLink] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("SettingsPanel isOpen:", isOpen)
    if (isOpen) {
      fetchShareSettings()
    }
  }, [isOpen])

  const fetchShareSettings = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/sharelink/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsPublic(data.public.enabled)
        setPublicLink(data.public.path ? `${process.env.NEXT_PUBLIC_SITE_URL}/u/${data.public.path}` : "")
        setPrivateLink(data.private.path ? `${process.env.NEXT_PUBLIC_SITE_URL}/share/${data.private.path}` : "")
      }
    } catch (error) {
      console.error("Error fetching share settings:", error)
      toast({
        title: "Error",
        description: "Failed to load sharing settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublicityChange = async (value: string) => {
    const newIsPublic = value === "public"

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/changepublicity/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_public: newIsPublic }),
      })

      if (response.ok) {
        setIsPublic(newIsPublic)
        toast({
          title: "Success",
          description: `Your profile is now ${newIsPublic ? "public" : "private"}`,
        })
        fetchShareSettings()
      } else {
        throw new Error("Failed to update publicity settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update publicity settings",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublicity = () => {
    const newPublicity = !isPublic
    setIsPublic(newPublicity)
    onChangePublicity(newPublicity)
    toast({
      title: "Success",
      description: `Your profile is now ${newPublicity ? "public" : "private"}`,
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    })
  }

  const createPrivateLink = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/sharelink/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchShareSettings()
        toast({
          title: "Success",
          description: "New private link created",
        })
      } else {
        throw new Error("Failed to create private link")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create private link",
        variant: "destructive",
      })
    }
  }
  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-[#3a4a3a] p-6 rounded-lg w-full max-w-md">
          <div className="p-4 border-b border-[#4a5a4a] flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                console.log("Settings close button clicked")
                onClose()
              }}
              className="text-white hover:bg-[#4a5a4a]"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Publicity</h3>
              {!isLoading &&(
              <RadioGroup
                value={isPublic ? "public" : "private"}
                onValueChange={handlePublicityChange}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private</Label>
                </div>
              </RadioGroup>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Links</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Public</h4>
                  <div className="flex">
                    <Input value={publicLink} readOnly className="bg-[#4a5a4a] border-[#5a6a5a] text-white" />
                    <Button
                      variant="outline"
                      className="ml-2 border-[#4a5a4a] hover:bg-[#4a5a4a]"
                      onClick={() => copyToClipboard(publicLink)}
                      disabled={!publicLink}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Private</h4>
                  <div className="flex">
                    <Input value={privateLink} readOnly className="bg-[#4a5a4a] border-[#5a6a5a] text-white" />
                    <Button
                      variant="outline"
                      className="ml-2 border-[#4a5a4a] hover:bg-[#4a5a4a]"
                      onClick={() => copyToClipboard(privateLink)}
                      disabled={!privateLink}
                    >
                      Copy
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-2 border-[#4a5a4a] hover:bg-[#4a5a4a] text-sm"
                    onClick={createPrivateLink}
                  >
                    create
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Account</h3>
              <Button variant="outline" className="w-full border-[#4a5a4a] hover:bg-[#4a5a4a]" onClick={onLogout}>
                Log out
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  )
}

export default SettingsPanel
