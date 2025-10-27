"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Car, 
  DollarSign, 
  Image as ImageIcon,
  Trash2
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { AddCarDialog } from "./add-car-dialog";
import { EditCarDialog } from "./edit-car-dialog";

interface Car {
  _id: string;
  carName?: string;
  name?: string; // Legacy field
  model: string;
  brand: string;
  year: number;
  type: "normal" | "premium" | "luxury";
  gearType: "auto" | "manual";
  fuelType: "petrol" | "diesel" | "cng" | "hybrid" | "ev";
  seatingCapacity: number;
  pricing?: {
    price12hr: number;
    price24hr: number;
    price36hr: number;
    price48hr: number;
    price60hr: number;
    price72hr: number;
  };
  // Legacy pricing fields for backward compatibility
  pricePerHour?: number;
  price12Hours?: number;
  price24Hours?: number;
  securityDeposit?: number;
  driverAvailable?: boolean;
  driverChargesPerDay?: number;
  description?: string;
  features: string[];
  imageUrl?: string;
  registrationNumber?: string;
  available: boolean;
  createdAt: string;
}

export function AdminCarsManagement() {
  const { token } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCars = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch<{ cars: Car[] }>("/api/cars", { token });
      setCars(response.cars);
    } catch (err) {
      console.error("Failed to load cars:", err);
      setError("Unable to load cars");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const handleCarAdded = () => {
    loadCars();
  };

  const handleCarUpdated = () => {
    loadCars();
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this car? This action cannot be undone.")) {
      return;
    }

    try {
      await apiFetch(`/api/cars/${carId}`, {
        method: "DELETE",
        token,
      });
      loadCars();
    } catch (err) {
      console.error("Failed to delete car:", err);
      setError("Failed to delete car");
    }
  };

  const getTypeColor = (type: string) => {
    return type === "premium" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
  };

  // Helper functions to handle both old and new pricing formats
  const getPrice24hr = (car: Car) => {
    return car.pricing?.price24hr || car.price24Hours || (car.pricePerHour ? car.pricePerHour * 24 : 0);
  };

  const getPrice12hr = (car: Car) => {
    return car.pricing?.price12hr || car.price12Hours || (car.pricePerHour ? car.pricePerHour * 12 : 0);
  };

  const getPrice48hr = (car: Car) => {
    return car.pricing?.price48hr || (car.pricePerHour ? car.pricePerHour * 48 : 0);
  };

  const getSecurityDeposit = (car: Car) => {
    return car.securityDeposit || 0;
  };

  const getDriverAvailable = (car: Car) => {
    return car.driverAvailable || false;
  };

  const getDriverChargesPerDay = (car: Car) => {
    return car.driverChargesPerDay || 0;
  };


  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cars Management</h1>
          <p className="text-muted-foreground">
            Manage your fleet of rental cars, add new vehicles, and update existing ones.
          </p>
        </div>
        <div className="flex space-x-2">
          <AddCarDialog onCarAdded={handleCarAdded} />
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Card key={car._id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{car.carName || car.name || "Unknown Car"}</h3>
                  <div className="flex space-x-2">
                    <Badge className={getTypeColor(car.type)}>
                      {car.type}
                    </Badge>
                    <Badge variant={car.available ? "default" : "secondary"}>
                      {car.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {car.brand || "Unknown Brand"} {car.model || "Unknown Model"} ({car.year || "Unknown Year"})
                </p>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">₹{getPrice24hr(car)}/day</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>12h: ₹{getPrice12hr(car)}</span>
                    <span>24h: ₹{getPrice24hr(car)}</span>
                    <span>48h: ₹{getPrice48hr(car)}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="capitalize">{car.gearType || "Manual"}</span>
                    <span className="capitalize">{car.fuelType || "Petrol"}</span>
                    <span>{car.seatingCapacity || 5} seats</span>
                  </div>
                  {getSecurityDeposit(car) > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Security Deposit: ₹{getSecurityDeposit(car)}
                    </div>
                  )}
                  {getDriverAvailable(car) && (
                    <div className="text-sm text-muted-foreground">
                      Driver Available: ₹{getDriverChargesPerDay(car)}/day
                    </div>
                  )}
                </div>
                
                {car.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {car.description}
                  </p>
                )}
                
                {car.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {car.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {car.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{car.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <EditCarDialog car={car} onCarUpdated={handleCarUpdated} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCar(car._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cars.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cars found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first rental car to the fleet.
            </p>
            <AddCarDialog onCarAdded={handleCarAdded} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
