"use client";

import { Header } from "@/components/header"
import { SettingsContent } from "@/components/settings-content"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground mb-6">Personaliza la aplicación según tus preferencias.</p>
        <SettingsContent />
      </main>
    </div>
  )
}
