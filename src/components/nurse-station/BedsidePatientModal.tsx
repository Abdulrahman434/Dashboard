import React, { useEffect } from 'react';
import { NurseInterface } from './bedside/nurse/NurseInterface';
import { nurseActions } from './bedside/NurseDataStore';

interface BedsidePatientModalProps {
  /** MRN sourced from the Device Manager device backing the room (if any). */
  mrn: string;
  room: string;
  bed: string;
  onClose: () => void;
}

/**
 * Full-screen overlay that opens the ported bedside "Nurse Interface" for a
 * specific room. The room's identity (MRN/room/bed) is seeded into the bedside
 * data store so the patient summary bar reflects the Device Manager record.
 */
export default function BedsidePatientModal({ mrn, room, bed, onClose }: BedsidePatientModalProps) {
  useEffect(() => {
    nurseActions.updatePatient({
      ...(mrn ? { mrn } : {}),
      ...(room ? { room } : {}),
      ...(bed ? { bed } : {}),
    });
  }, [mrn, room, bed]);

  return (
    <div className="fixed inset-0 z-[200]">
      <NurseInterface role="nurse" onClose={onClose} />
    </div>
  );
}