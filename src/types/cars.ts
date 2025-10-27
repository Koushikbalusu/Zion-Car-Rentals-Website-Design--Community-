export interface CarCardData {
  id: string;
  name: string;
  model?: string;
  type: string;
  pricing: {
    price12hr: number;
    price24hr: number;
    price36hr: number;
    price48hr: number;
    price60hr: number;
    price72hr: number;
  };
  driverAvailable: boolean;
  driverChargesPerDay: number;
  imageUrl?: string;
  features: string[];
  available: boolean;
  depositAmount: number;
  // Legacy field for backward compatibility
  pricePerHour?: number;
}

export interface CarDetailData extends CarCardData {
  description?: string;
  createdAt?: string;
  gearType?: string;
  fuelType?: string;
  brand?: string;
  seatingCapacity?: number;
}

