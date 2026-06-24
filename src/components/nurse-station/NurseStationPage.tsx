import React, { useState } from "react";
import NurseScreen from "./NurseScreen";
import { NurseInterface } from "./bedside/nurse/NurseInterface";
import { nurseActions } from "./bedside/NurseDataStore";

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
      const p = room.patient || {};
      nurseActions.updatePatient({
        mrn: p.mrn || "",
        room: room.no || "",
        age: p.age?.replace("y", "") || "43",
        admissionDate: p.doa || "25/5/2025",
        name: p.gender === "M" ? "Omar Saleh" : "Sara Saleh",
        nameAr: p.gender === "M" ? "عمر صالح" : "سارة صالح",
        bed: "1",
        roomType: room.type || "Single",
        stationId: "reference",
      });
      setSelectedRoom(room);
    }
  };

  if (selectedRoom) {
    return (
      <NurseInterface
        role="nurse"
        onClose={() => setSelectedRoom(null)}
      />
    );
  }

  return <NurseScreen onRoomClick={handleRoomClick} />;
}
