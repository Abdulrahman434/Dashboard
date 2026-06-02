import { useState, useEffect } from 'react';
import { Smartphone, Search, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineInput from './InlineInput';
import PillTabs from './PillTabs';
import { SingleSelectDropdown } from './UnifiedDropdown';
import TablePagination from './TablePagination';

interface SIPDeviceCredential {
  id: string;
  deviceId: string;
  room: string;
  bed: string;
  building: string;
  floor: string;
  poc: string;
  extension: string;
  username: string;
  password: string;
}

export default function SIPDeviceCredentialsPage() {
  const [activeTab, setActiveTab] = useState('careinn15');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPOC, setFilterPOC] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Generate 30 devices matching CareInn15 data (2 disconnected, 28 connected)
  const [credentials, setCredentials] = useState<SIPDeviceCredential[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: `${i + 1}`,
      deviceId: `mt15gwjh${896684016 + i}`,
      room: `${300 + Math.floor(i / 5)}${String.fromCharCode(65 + (i % 5))}`,
      bed: `${(i % 4) + 1}`.padStart(2, '0'),
      building: `${(i % 3) + 1}`.padStart(2, '0'),
      floor: `${(i % 5) + 1}`.padStart(2, '0'),
      poc: ['1A', '2B', '3C', '4A', '5B', '6C'][i % 6],
      extension: `${1001 + i}`,
      username: `device_${300 + Math.floor(i / 5)}${String.fromCharCode(65 + (i % 5))}_${`${(i % 4) + 1}`.padStart(2, '0')}`,
      password: `pass${1001 + i}`
    }));
  });

  const handleUpdateField = (id: string, field: keyof SIPDeviceCredential, value: string) => {
    setCredentials(credentials.map(cred => 
      cred.id === id ? { ...cred, [field]: value } : cred
    ));
    
    const fieldLabels: Record<string, string> = {
      room: 'Room',
      bed: 'Bed',
      building: 'Building',
      floor: 'Floor',
      poc: 'POC',
      extension: 'Extension',
      username: 'Username',
      password: 'Password'
    };
    
    toast.success(`${fieldLabels[field]} Updated`, {
      description: `${fieldLabels[field]} has been updated successfully`,
      duration: 2000,
    });
  };

  // Filter credentials based on search and POC
  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = 
      cred.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.bed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.extension.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPOC = filterPOC === 'all' || cred.poc === filterPOC;
    
    return matchesSearch && matchesPOC;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCredentials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCredentials = filteredCredentials.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterPOC]);

  return (
    <div className="h-full overflow-auto p-8">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
          <Shield size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            SIP Device Credentials
          </h2>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Manage SIP authentication credentials for all device types
          </p>
        </div>
      </div>

      {/* Content Card with Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <PillTabs
          tabs={[
            { id: 'careinn15', label: 'CareInn15' },
            { id: 'caresign', label: 'CareSign' },
            { id: 'nurse-station', label: 'Nurse Station' },
            { id: 'c-core', label: 'C-Core' }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === 'careinn15' && (
          <>
            {/* Top Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredCredentials.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="credentials"
              showRowsPerPage={false}
            />

            {/* Search Bar and Filter */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-4">
              {/* Search - Left side */}
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Device ID, Room, Bed, Extension, Username..."
                  className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
                />
              </div>

              {/* POC Filter - Right side */}
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                  POC:
                </label>
                <div className="w-[140px]">
                  <SingleSelectDropdown
                    options={[
                      { value: 'all', label: 'All POCs' },
                      { value: '1A', label: '1A' },
                      { value: '2B', label: '2B' },
                      { value: '3C', label: '3C' },
                      { value: '4A', label: '4A' },
                      { value: '5B', label: '5B' },
                      { value: '6C', label: '6C' }
                    ]}
                    value={filterPOC}
                    onChange={(value) => setFilterPOC(value)}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Device ID
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Room
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Bed
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Building
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Floor
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      POC
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Extension
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                      Password
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCredentials.map((cred) => (
                    <tr key={cred.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                      {/* Device ID - Read Only */}
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#4EBEE3] font-['Poppins',sans-serif] font-medium">
                          {cred.deviceId}
                        </div>
                      </td>
                      
                      {/* Room - Read Only */}
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          {cred.room}
                        </div>
                      </td>
                      
                      {/* Bed - Read Only */}
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          {cred.bed}
                        </div>
                      </td>
                      
                      {/* Building - Read Only */}
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          {cred.building}
                        </div>
                      </td>
                      
                      {/* Floor - Read Only */}
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          {cred.floor}
                        </div>
                      </td>
                      
                      {/* POC - Read Only */}
                      <td className="px-6 py-4">
                        <div className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          {cred.poc}
                        </div>
                      </td>
                      
                      {/* Extension - Inline Edit */}
                      <td className="px-6 py-3">
                        <InlineInput
                          value={cred.extension}
                          onChange={(value) => handleUpdateField(cred.id, 'extension', value)}
                          placeholder="Extension"
                        />
                      </td>
                      
                      {/* Username - Inline Edit */}
                      <td className="px-6 py-3">
                        <InlineInput
                          value={cred.username}
                          onChange={(value) => handleUpdateField(cred.id, 'username', value)}
                          placeholder="Username"
                        />
                      </td>
                      
                      {/* Password - Inline Edit */}
                      <td className="px-6 py-3">
                        <InlineInput
                          value={cred.password}
                          onChange={(value) => handleUpdateField(cred.id, 'password', value)}
                          placeholder="Password"
                          type="text"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination */}
            <TablePagination
              currentPage={currentPage}
              totalItems={filteredCredentials.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              itemLabel="credentials"
              showRowsPerPage={false}
            />
          </>
        )}

        {/* CareSign Empty State */}
        {activeTab === 'caresign' && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              No CareSign devices found
            </p>
          </div>
        )}

        {/* Nurse Station Empty State */}
        {activeTab === 'nurse-station' && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              No Nurse Station devices found
            </p>
          </div>
        )}

        {/* C-Core Empty State */}
        {activeTab === 'c-core' && (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              No C-Core devices found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}