import { Header } from "@/components/header"
import { ProfileContent } from "@/components/profile-content"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <ProfileContent />
      </main>
    </div>
  )
}
