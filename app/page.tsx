import AuthBackground from "@/components/auth-background"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <AuthBackground>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-md mb-6">WANDERMAP</h1>
        </div>
        <div className="bg-[#3a4a3a]/80 p-10 rounded-md w-full max-w-md flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-center text-white mb-4">Welcome!</h2>
          <Link href="/signup" className="w-full">
            <Button className="w-full bg-[#4a5a4a] hover:bg-[#5a6a5a]">sign up</Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button className="w-full bg-[#4a5a4a] hover:bg-[#5a6a5a]">log in</Button>
          </Link>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-300">sup1p edition</p>
          </div>
        </div>
      </div>
    </AuthBackground>
  )
}
