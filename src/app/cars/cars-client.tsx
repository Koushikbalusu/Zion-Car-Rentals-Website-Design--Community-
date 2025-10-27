"use client";

import { useRouter } from "next/navigation";

import { Cars } from "@/components/Cars";
import type { CarCardData } from "@/types/cars";

interface CarsClientProps {
  cars: CarCardData[];
}

export function CarsClient({ cars }: CarsClientProps) {
  const router = useRouter();

  return (
    <Cars
      cars={cars}
      onPrimaryAction={(car) => router.push(`/booking/${car.id}`)}
      onSecondaryAction={(car) => router.push(`/booking/${car.id}`)}
    />
  );
}

