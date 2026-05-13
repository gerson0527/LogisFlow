export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED';

export interface Delivery {
  id: string;
  packageCode: string;
  destination: string;
  driverId: string;
  status: DeliveryStatus;
  assignedAt: string;
}