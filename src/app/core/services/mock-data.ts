import { User } from '../models/user.model';
import { Delivery } from '../models/delivery.model';

export const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', password: 'admin123', role: 'ADMIN', name: 'Admin LogisFlow' },
  { id: 'u2', username: 'driver1', password: 'driver123', role: 'DRIVER', name: 'Carlos Gómez' },
  { id: 'u3', username: 'driver2', password: 'driver456', role: 'DRIVER', name: 'Laura Díaz' },
];

const destinations = [
  'Calle 10 #5-23', 'Av. Principal 45', 'Cra 8 #22-11', 'Calle 45 #12-30',
  'Av. Libertadores 88', 'Carrera 15 #60-10', 'Calle 72 #3-15', 'Av. Chile 100',
  'Calle 85 #10-30', 'Cra 7 #40-50', 'Av. Caracas 65', 'Calle 26 #12-45',
  'Av. El Dorado 90', 'Calle 100 #15-20', 'Cra 11 #95-30', 'Av. Jiménez 45',
  'Calle 13 #8-60', 'Av. Suba 120', 'Calle 80 #11-25', 'Cra 50 #4-35',
  'Av. Boyacá 80', 'Calle 47 #13-50', 'Av. 80 #15-40', 'Cra 68 #10-15',
  'Calle 6 #25-30', 'Av. Esperanza 70', 'Calle 92 #7-15', 'Cra 24 #45-60',
  'Av. Niza 55', 'Calle 38 #5-10', 'Av. Laureles 100', 'Cra 43 #20-25',
  'Calle 64 #11-50', 'Av. Hash 85', 'Calle 17 #30-40', 'Cra 9 #75-80',
];

const statuses: Delivery['status'][] = ['PENDING', 'IN_TRANSIT', 'DELIVERED'];
const driverIds = ['u2', 'u3'];

function generateMockDeliveries(count: number): Delivery[] {
  const deliveries: Delivery[] = [];
  for (let i = 1; i <= count; i++) {
    const date = new Date(2025, 3, 1);
    date.setDate(date.getDate() + Math.floor(Math.random() * 60));

    deliveries.push({
      id: `d${i}`,
      packageCode: `PKG-${String(i).padStart(4, '0')}`,
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      driverId: driverIds[Math.floor(Math.random() * driverIds.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignedAt: date.toISOString().split('T')[0]
    });
  }
  return deliveries;
}

export const MOCK_DELIVERIES: Delivery[] = generateMockDeliveries(150);