import { createContext, useContext, useState, ReactNode } from 'react';

export interface SIPContact {
  id: string;
  nameEN: string;
  nameAR: string;
  extension: string;
  isActive: boolean;
  isEmergency: boolean;
}

interface SIPContextType {
  contacts: SIPContact[];
  setContacts: (contacts: SIPContact[]) => void;
  addContact: (contact: Omit<SIPContact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<SIPContact>) => void;
  deleteContact: (id: string) => void;
}

const SIPContext = createContext<SIPContextType | undefined>(undefined);

export function SIPProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<SIPContact[]>([
    {
      id: '1',
      nameEN: 'Nurse Station 1',
      nameAR: 'محطة التمريض ١',
      extension: '3001',
      isActive: true,
      isEmergency: true
    },
    {
      id: '2',
      nameEN: 'Nurse Station 2',
      nameAR: 'محطة التمريض ٢',
      extension: '3002',
      isActive: true,
      isEmergency: true
    },
    {
      id: '3',
      nameEN: 'Nurse Station 3',
      nameAR: 'محطة التمريض ٣',
      extension: '3003',
      isActive: true,
      isEmergency: true
    },
    {
      id: '4',
      nameEN: 'Emergency Room',
      nameAR: 'غرفة الطوارئ',
      extension: '9001',
      isActive: true,
      isEmergency: true
    },
    {
      id: '5',
      nameEN: 'Reception',
      nameAR: 'الإستقبال',
      extension: '1000',
      isActive: true,
      isEmergency: false
    }
  ]);

  const addContact = (newContact: Omit<SIPContact, 'id'>) => {
    const contact: SIPContact = {
      id: Date.now().toString(),
      ...newContact
    };
    setContacts([...contacts, contact]);
  };

  const updateContact = (id: string, updates: Partial<SIPContact>) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, ...updates } : contact
    ));
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  return (
    <SIPContext.Provider value={{ contacts, setContacts, addContact, updateContact, deleteContact }}>
      {children}
    </SIPContext.Provider>
  );
}

export function useSIPContacts() {
  const context = useContext(SIPContext);
  if (context === undefined) {
    throw new Error('useSIPContacts must be used within a SIPProvider');
  }
  return context;
}