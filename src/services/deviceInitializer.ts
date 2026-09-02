import { initializeCareSignData } from './careSignService';

export function initializeDevices(): void {
  if (typeof window === 'undefined') return;

  // Seed CareSign data (types, events, devices)
  initializeCareSignData();

  const storedDevices = localStorage.getItem('careinn_devices');
  let devicesInitialized = false;

  if (storedDevices) {
    try {
      const parsedDevices = JSON.parse(storedDevices);
      if (Array.isArray(parsedDevices)) {
        if (parsedDevices.length !== 30) {
          // Reinitialize with correct count
          const sampleDevices = Array.from({ length: 30 }, (_, i) => ({
            id: `${i + 1}`,
            deviceId: `mt15gwjh${896684016 + i}`,
            mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
            roomNo: `${300 + Math.floor(i / 5)}${String.fromCharCode(65 + (i % 5))}`,
            bedNo: `${(i % 4) + 1}`.padStart(2, '0'),
            building: `${(i % 3) + 1}`.padStart(2, '0'),
            floor: `${(i % 5) + 1}`.padStart(2, '0'),
            poc: ['1A', '2B', '3C', '4A', '5B', '6C'][i % 6],
            group: ['Kids', 'Adults', 'VIP'][i % 3],
            server: `192.156.${68 + (i % 10)}/api`,
            isConnected: i >= 2, // Only first 2 devices are disconnected
            isActive: (i + 7) % 10 > 2, // Stable active flag (approx 70%)
            tag: '',
            selected: false
          }));
          localStorage.setItem('careinn_devices', JSON.stringify(sampleDevices));
        } else {
          // Migrate old data to include isConnected and tag fields if missing
          const migratedDevices = parsedDevices.map((device: any, index: number) => ({
            ...device,
            isConnected: device.isConnected !== undefined ? device.isConnected : index >= 2,
            tag: device.tag !== undefined ? device.tag : ''
          }));
          localStorage.setItem('careinn_devices', JSON.stringify(migratedDevices));
        }
        devicesInitialized = true;
      }
    } catch (e) {
      console.error('Failed to parse careinn_devices during initialization', e);
    }
  }

  if (!devicesInitialized) {
    // Initialize with sample data (30 devices total, 2 disconnected, 28 connected)
    const sampleDevices = Array.from({ length: 30 }, (_, i) => ({
      id: `${i + 1}`,
      deviceId: `mt15gwjh${896684016 + i}`,
      mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
      roomNo: `${300 + Math.floor(i / 5)}${String.fromCharCode(65 + (i % 5))}`,
      bedNo: `${(i % 4) + 1}`.padStart(2, '0'),
      building: `${(i % 3) + 1}`.padStart(2, '0'),
      floor: `${(i % 5) + 1}`.padStart(2, '0'),
      poc: ['1A', '2B', '3C', '4A', '5B', '6C'][i % 6],
      group: ['Kids', 'Adults', 'VIP'][i % 3],
      server: `192.156.${68 + (i % 10)}/api`,
      isConnected: i >= 2, // Only first 2 devices are disconnected
      isActive: (i + 7) % 10 > 2, // Stable active flag (approx 70%)
      tag: '',
      selected: false
    }));
    localStorage.setItem('careinn_devices', JSON.stringify(sampleDevices));
  }

  // Load device info
  const storedInfo = localStorage.getItem('careinn_device_info');
  if (!storedInfo) {
    const sampleDeviceInfos = Array.from({ length: 150 }, (_, i) => ({
      id: `${i + 1}`,
      deviceId: `mt15pwjn${896694016 + i}`,
      mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
      appVersion: `1.5.${10 + (i % 20)}`,
      ipAddress: `192.186.${211 + (i % 10)}.${1 + (i % 255)}`,
      patientId: `${1845014 + i}`,
      deviceExtension: `${30140 + i}`,
      connected: (i + 4) % 10 > 1, // Stable connected flag (approx 80%)
      logs: (i + 3) % 10 > 2 ? 'Successful' : 'Export log',
      selected: false
    }));
    localStorage.setItem('careinn_device_info', JSON.stringify(sampleDeviceInfos));
  }

  // Load device actions
  const storedActions = localStorage.getItem('careinn_device_actions');
  if (!storedActions) {
    const sampleDeviceActions = Array.from({ length: 100 }, (_, i) => ({
      id: `${i + 1}`,
      deviceId: `mt15pwjn${896694016 + i}`,
      mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
      patientId: `${1845014 + i}`,
      pendingNotification: (['No', 'Pending', 'Yes'] as const)[i % 3],
      isActive: i % 2 === 0, // Stable active flag (50%)
      selected: false
    }));
    localStorage.setItem('careinn_device_actions', JSON.stringify(sampleDeviceActions));
  }

  // Load device services
  const storedServices = localStorage.getItem('careinn_device_services');
  if (!storedServices) {
    const sampleDeviceServices = Array.from({ length: 100 }, (_, i) => ({
      id: `${i + 1}`,
      deviceId: `mt15pwjn${896694016 + i}`,
      mrn: `MRN${(1000000 + i).toString().padStart(7, '0')}`,
      selected: false
    }));
    localStorage.setItem('careinn_device_services', JSON.stringify(sampleDeviceServices));
  }
}
