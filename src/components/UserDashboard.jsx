
import React from "react"
import { Scissors } from "lucide-react"

function UserDashboard({ setCurrentView, notifications }) {
  return (
    <button
      onClick={() => setCurrentView('free-barbers')}
      className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors relative"
    >
      <Scissors className="h-5 w-5" />
      {notifications && notifications.freeBarbers && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full px-2 min-w-[20px] text-center">
          {notifications.freeBarbers}
        </span>
      )}
    </button>
  )
}

export default UserDashboard
