import type { CarCardData, CarDetailData } from "@/types/cars";
import type { ApiCar } from "@/types/api";

import { apiFetch } from "./api-client";

const PREMIUM_DEPOSIT = 35000;
const STANDARD_DEPOSIT = 25000;
const NORMAL_DEPOSIT = 20000;

function calculateDeposit(type: string) {
  if (type === "premium" || type === "luxury") return PREMIUM_DEPOSIT;
  if (type === "normal") return NORMAL_DEPOSIT;
  return STANDARD_DEPOSIT;
}

function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
}

export function mapApiCarToCard(car: ApiCar): CarCardData {
  return {
    id: car._id,
    name: car.carName || car.name,
    model: car.model,
    type: car.type,
    pricing: car.pricing || {
      price12hr: (car.pricePerHour || 0) * 12,
      price24hr: (car.pricePerHour || 0) * 24,
      price36hr: (car.pricePerHour || 0) * 36,
      price48hr: (car.pricePerHour || 0) * 48,
      price60hr: (car.pricePerHour || 0) * 60,
      price72hr: (car.pricePerHour || 0) * 72,
    },
    driverAvailable: car.driverAvailable || false,
    driverChargesPerDay: car.driverChargesPerDay || 0,
    imageUrl: car.imageUrl || undefined,
    features: car.features ?? [],
    available: car.available,
    depositAmount: car.securityDeposit || calculateDeposit(car.type),
    pricePerHour: car.pricePerHour || (car.pricing?.price12hr || 0) / 12,
  };
}

export function mapApiCarToDetail(car: ApiCar): CarDetailData {
  return {
    ...mapApiCarToCard(car),
    description: car.description,
    createdAt: car.createdAt,
    features: car.features ?? [],
    gearType: car.gearType,
    fuelType: car.fuelType,
    brand: car.brand,
    seatingCapacity: car.seatingCapacity,
  };
}

interface CarsResponse {
  cars: ApiCar[];
}

interface CarResponse {
  car: ApiCar;
}

export async function fetchCars(token?: string | null): Promise<CarCardData[]> {
  const data = await apiFetch<CarsResponse>('/api/cars', { token });
  return data.cars.map(mapApiCarToCard);
}

export async function fetchCarById(carId: string, token?: string | null): Promise<CarDetailData> {
  const data = await apiFetch<CarResponse>(`/api/cars/${carId}`, { token });
  return mapApiCarToDetail(data.car);
}

export { calculateDeposit };

