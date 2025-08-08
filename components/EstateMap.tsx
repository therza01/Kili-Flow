"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Navigation } from 'lucide-react'
import { User } from "@/lib/supabase"
import { KILIMANI_ESTATES, calculateDistance } from "@/lib/geocoding"
import { LeafletMap } from "./LeafletMap"

interface EstateMapProps {
  currentUser: User | null
  nearbyUsers: User[]
  onUserSelect?: (user: User) => void
}

export function EstateMap({ currentUser, nearbyUsers, onUserSelect }: EstateMapProps) {
  return (
    <LeafletMap
      currentUser={currentUser}
      nearbyUsers={nearbyUsers}
      onUserSelect={onUserSelect}
      height="300px"
    />
  )
}
