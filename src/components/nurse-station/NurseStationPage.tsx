import React, { useState } from "react";
import NurseScreen from "./NurseScreen";
import PatientDetailScreen from "./PatientDetailScreen";

/* =========================================================================
   App router
   --------------------------------------------------------------------------
   Holds the currently selected room. When a card is clicked on the
   dashboard, we switch to the detail view. The back button on the detail
   view clears the selection and returns to the dashboard.
   ========================================================================= */
export default function NurseStationPage() {
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const handleRoomClick = (room: any) => {
    // Only navigate when the room is actually occupied — empty states
    // (Available / Closed / Preparation) shouldn't open a profile.
    if (room.state === "occupied") {
      setSelectedRoom(room);
    }
  };

  if (selectedRoom) {
    return (
      <PatientDetailScreen
        roomNo={selectedRoom.no}
        onBack={() => setSelectedRoom(null)}
      />
    );
  }

  return <NurseScreen onRoomClick={handleRoomClick} />;
}
