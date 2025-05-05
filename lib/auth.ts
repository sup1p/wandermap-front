export async function refreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken")

  if (!refreshToken) {
    console.log("No refresh token found")
    return false
  }

  try {
    console.log("Attempting to refresh token")
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      console.error("Token refresh failed with status:", response.status)
      return false
    }

    const data = await response.json()
    localStorage.setItem("accessToken", data.access)
    console.log("Token refreshed successfully")
    return true
  } catch (error) {
    console.error("Error refreshing token:", error)
    return false
  }
}
