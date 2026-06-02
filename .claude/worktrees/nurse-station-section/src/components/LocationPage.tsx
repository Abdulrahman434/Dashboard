import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Plus, X, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Location {
  id: string;
  name: string;
  isDefault: boolean;
  selected: boolean;
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#EF4444]/10 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} className="text-[#EF4444]" strokeWidth={2} />
          </div>
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {title}
          </h3>
        </div>

        <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6 ml-15">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 border-2 border-gray-200 hover:border-gray-300 text-[#16274D] rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock city data for predictions
const worldCities = [
  // Saudi Arabia
  'Riyadh, Saudi Arabia', 'Jeddah, Saudi Arabia', 'Mecca, Saudi Arabia', 'Medina, Saudi Arabia', 'Dammam, Saudi Arabia',
  'Khobar, Saudi Arabia', 'Dhahran, Saudi Arabia', 'Tabuk, Saudi Arabia', 'Abha, Saudi Arabia', 'Jubail, Saudi Arabia',
  // UAE
  'Dubai, UAE', 'Abu Dhabi, UAE', 'Sharjah, UAE', 'Ajman, UAE', 'Ras Al Khaimah, UAE', 'Fujairah, UAE', 'Al Ain, UAE',
  // USA
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Phoenix, USA', 'Philadelphia, USA', 'San Antonio, USA',
  'San Diego, USA', 'Dallas, USA', 'San Jose, USA', 'Austin, USA', 'Jacksonville, USA', 'Fort Worth, USA', 'Columbus, USA',
  'San Francisco, USA', 'Charlotte, USA', 'Indianapolis, USA', 'Seattle, USA', 'Denver, USA', 'Washington, USA', 'Boston, USA',
  // UK
  'London, UK', 'Manchester, UK', 'Birmingham, UK', 'Edinburgh, UK', 'Glasgow, UK', 'Liverpool, UK', 'Leeds, UK',
  'Sheffield, UK', 'Bristol, UK', 'Newcastle, UK', 'Belfast, UK', 'Cardiff, UK', 'Nottingham, UK', 'Leicester, UK',
  // France
  'Paris, France', 'Marseille, France', 'Lyon, France', 'Toulouse, France', 'Nice, France', 'Nantes, France', 'Strasbourg, France',
  'Montpellier, France', 'Bordeaux, France', 'Lille, France', 'Rennes, France', 'Reims, France', 'Le Havre, France',
  // Germany
  'Berlin, Germany', 'Munich, Germany', 'Hamburg, Germany', 'Frankfurt, Germany', 'Cologne, Germany', 'Stuttgart, Germany',
  'Düsseldorf, Germany', 'Dortmund, Germany', 'Essen, Germany', 'Leipzig, Germany', 'Bremen, Germany', 'Dresden, Germany',
  // Japan
  'Tokyo, Japan', 'Osaka, Japan', 'Yokohama, Japan', 'Nagoya, Japan', 'Sapporo, Japan', 'Kobe, Japan', 'Kyoto, Japan',
  'Fukuoka, Japan', 'Kawasaki, Japan', 'Saitama, Japan', 'Hiroshima, Japan', 'Sendai, Japan',
  // Australia
  'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Perth, Australia', 'Adelaide, Australia',
  'Gold Coast, Australia', 'Canberra, Australia', 'Newcastle, Australia', 'Wollongong, Australia', 'Logan City, Australia',
  // Canada
  'Toronto, Canada', 'Montreal, Canada', 'Vancouver, Canada', 'Calgary, Canada', 'Ottawa, Canada', 'Edmonton, Canada',
  'Mississauga, Canada', 'Winnipeg, Canada', 'Quebec City, Canada', 'Hamilton, Canada', 'Brampton, Canada',
  // Asia
  'Singapore', 'Hong Kong', 'Seoul, South Korea', 'Beijing, China', 'Shanghai, China', 'Guangzhou, China', 'Shenzhen, China',
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India', 'Chennai, India', 'Kolkata, India', 'Pune, India',
  'Bangkok, Thailand', 'Kuala Lumpur, Malaysia', 'Manila, Philippines', 'Jakarta, Indonesia', 'Ho Chi Minh City, Vietnam',
  'Hanoi, Vietnam', 'Taipei, Taiwan', 'Busan, South Korea', 'Karachi, Pakistan', 'Lahore, Pakistan', 'Islamabad, Pakistan',
  // Latin America
  'São Paulo, Brazil', 'Rio de Janeiro, Brazil', 'Brasília, Brazil', 'Salvador, Brazil', 'Fortaleza, Brazil', 'Belo Horizonte, Brazil',
  'Mexico City, Mexico', 'Guadalajara, Mexico', 'Monterrey, Mexico', 'Puebla, Mexico', 'Tijuana, Mexico', 'Cancún, Mexico',
  'Buenos Aires, Argentina', 'Córdoba, Argentina', 'Rosario, Argentina', 'Lima, Peru', 'Bogotá, Colombia', 'Santiago, Chile',
  // Middle East & Africa
  'Cairo, Egypt', 'Alexandria, Egypt', 'Giza, Egypt', 'Luxor, Egypt', 'Aswan, Egypt',
  'Istanbul, Turkey', 'Ankara, Turkey', 'Izmir, Turkey', 'Bursa, Turkey', 'Antalya, Turkey',
  'Tel Aviv, Israel', 'Jerusalem, Israel', 'Haifa, Israel', 'Amman, Jordan', 'Beirut, Lebanon',
  'Kuwait City, Kuwait', 'Doha, Qatar', 'Muscat, Oman', 'Manama, Bahrain',
  'Casablanca, Morocco', 'Marrakech, Morocco', 'Rabat, Morocco', 'Tunis, Tunisia', 'Algiers, Algeria',
  'Johannesburg, South Africa', 'Cape Town, South Africa', 'Durban, South Africa', 'Lagos, Nigeria', 'Nairobi, Kenya',
  // Europe
  'Madrid, Spain', 'Barcelona, Spain', 'Valencia, Spain', 'Seville, Spain', 'Málaga, Spain', 'Bilbao, Spain',
  'Rome, Italy', 'Milan, Italy', 'Naples, Italy', 'Turin, Italy', 'Florence, Italy', 'Venice, Italy', 'Bologna, Italy',
  'Amsterdam, Netherlands', 'Rotterdam, Netherlands', 'The Hague, Netherlands', 'Utrecht, Netherlands', 'Eindhoven, Netherlands',
  'Brussels, Belgium', 'Antwerp, Belgium', 'Ghent, Belgium', 'Bruges, Belgium', 'Leuven, Belgium',
  'Vienna, Austria', 'Salzburg, Austria', 'Innsbruck, Austria', 'Graz, Austria', 'Linz, Austria',
  'Zurich, Switzerland', 'Geneva, Switzerland', 'Basel, Switzerland', 'Bern, Switzerland', 'Lausanne, Switzerland',
  'Stockholm, Sweden', 'Gothenburg, Sweden', 'Malmö, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway', 'Bergen, Norway',
  'Helsinki, Finland', 'Dublin, Ireland', 'Cork, Ireland', 'Lisbon, Portugal', 'Porto, Portugal',
  'Prague, Czech Republic', 'Budapest, Hungary', 'Warsaw, Poland', 'Kraków, Poland', 'Athens, Greece', 'Moscow, Russia'
];

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cityName: string, isDefault: boolean) => void;
}

function AddLocationModal({ isOpen, onClose, onSave }: AddLocationModalProps) {
  const [cityName, setCityName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleCityNameChange = (value: string) => {
    setCityName(value);
    
    if (value.trim().length > 0) {
      const filtered = worldCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8); // Show max 8 predictions
      setFilteredCities(filtered);
      setShowPredictions(true);
    } else {
      setShowPredictions(false);
      setFilteredCities([]);
    }
  };

  const handleSelectCity = (city: string) => {
    setCityName(city);
    setShowPredictions(false);
  };

  const handleSave = () => {
    if (cityName.trim()) {
      onSave(cityName, isDefault);
      setCityName('');
      setIsDefault(false);
      setShowPredictions(false);
      setFilteredCities([]);
    } else {
      toast.error('Please enter a city name');
    }
  };

  const handleCancel = () => {
    setCityName('');
    setIsDefault(false);
    setShowPredictions(false);
    setFilteredCities([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Add Location
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* City Name Field */}
        <div className="mb-4 relative">
          <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
            City Name
          </label>
          <input
            type="text"
            value={cityName}
            onChange={(e) => handleCityNameChange(e.target.value)}
            placeholder="Start typing to search..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-['Poppins',sans-serif] text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] transition-colors"
            autoComplete="off"
          />
          
          {/* City Predictions Dropdown */}
          {showPredictions && filteredCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-[240px] overflow-y-auto z-10">
              {filteredCities.map((city, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectCity(city)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[14px] text-[#16274D] border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#4EBEE3]" />
                    <span>{city}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Default Location Checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
            />
            <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
              Set as default location
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-5 py-3 rounded-lg border-2 border-gray-200 text-[#16274D] font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-3 rounded-lg bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationPage() {
  const [locations, setLocations] = useState<Location[]>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('careinn_locations');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Save to localStorage whenever locations change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('careinn_locations', JSON.stringify(locations));
    }
  }, [locations]);

  const handleAddLocation = (cityName: string, isDefault: boolean) => {
    const newLocation: Location = {
      id: Date.now().toString(),
      name: cityName,
      isDefault: locations.length === 0 ? true : isDefault,
      selected: false
    };

    // If setting as default, unset all other defaults
    if (isDefault) {
      setLocations(prev => [
        ...prev.map(loc => ({ ...loc, isDefault: false })),
        newLocation
      ]);
    } else {
      setLocations(prev => [...prev, newLocation]);
    }

    setIsModalOpen(false);
    toast.success('Location Added', {
      description: `${cityName} has been added successfully`,
      duration: 2000,
    });
  };

  const handleToggleDefault = (id: string) => {
    setLocations(prev => prev.map(loc => ({
      ...loc,
      isDefault: loc.id === id
    })));
    
    const location = locations.find(loc => loc.id === id);
    if (location) {
      toast.success('Default Location Updated', {
        description: `${location.name} is now the default location`,
        duration: 2000,
      });
    }
  };

  const handleToggleSelect = (id: string) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, selected: !loc.selected } : loc
    ));
  };

  const handleToggleSelectAll = () => {
    const allSelected = locations.every(loc => loc.selected);
    setLocations(prev => prev.map(loc => ({ ...loc, selected: !allSelected })));
  };

  const handleDeleteSelected = () => {
    const selectedCount = locations.filter(loc => loc.selected).length;
    setLocations(prev => prev.filter(loc => !loc.selected));
    toast.success('Locations Deleted', {
      description: `${selectedCount} location${selectedCount > 1 ? 's' : ''} deleted successfully`,
      duration: 2000,
    });
  };

  const handleOpenDeleteModal = (id: string) => {
    setSelectedLocationId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedLocationId) {
      setLocations(prev => prev.filter(loc => loc.id !== selectedLocationId));
      toast.success('Location Deleted', {
        description: 'The location has been deleted successfully',
        duration: 2000,
      });
    }
    setIsDeleteModalOpen(false);
  };

  const hasSelectedLocations = locations.some(loc => loc.selected);

  return (
    <div className="h-full overflow-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4EBEE3]/10 rounded-lg flex items-center justify-center">
              <MapPin size={20} className="text-[#4EBEE3]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
                Location
              </h2>
              <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                Configure hospital locations and room settings
              </p>
            </div>
          </div>
          {locations.length > 0 && (
            <div className="flex items-center gap-3">
              {hasSelectedLocations && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-5 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <Trash2 size={16} strokeWidth={2} />
                  Delete
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
              >
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <Plus size={14} strokeWidth={2.5} />
                </div>
                Set Location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {locations.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4EBEE3]/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin size={32} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
                  No Location Set
                </h3>
                <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
                  No location has been set yet. Add your first location to get started.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium shadow-sm"
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <Plus size={14} strokeWidth={2.5} />
                  </div>
                  Set Location
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Locations Table */
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={locations.length > 0 && locations.every(loc => loc.selected)}
                      onChange={handleToggleSelectAll}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide">
                    Set as Default
                  </th>
                  <th className="px-6 py-4 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] tracking-wide w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location, index) => (
                  <tr 
                    key={location.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === locations.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={location.selected}
                        onChange={() => handleToggleSelect(location.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#4EBEE3]" />
                        <span className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                          {location.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={location.isDefault}
                        onChange={() => handleToggleDefault(location.id)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {location.isDefault ? (
                        <button
                          disabled
                          className="text-gray-300 cursor-not-allowed"
                          title="Default location cannot be deleted"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenDeleteModal(location.id)}
                          className="text-[#EF4444] hover:text-[#DC2626] transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddLocation}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
      />
    </div>
  );
}