"use client";

import Image from "next/image";

import { BadgeCheck, Car as CarIcon, IndianRupee, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import type { CarCardData } from "@/types/cars";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter } from "./ui/card";

interface CarCardProps {
  car: CarCardData;
  onPrimaryAction?: (car: CarCardData) => void;
  onSecondaryAction?: (car: CarCardData) => void;
  primaryLabel?: string;
  secondaryLabel?: string;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1080&q=80";

export function CarCard({
  car,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel = "Reserve Now",
  secondaryLabel = "View Details",
}: CarCardProps) {
  const pricePerPeriod = car.pricing.price12hr;
  const featuresToShow = car.features.slice(0, 3);
  
  // Validate image URL - ensure it's a proper URL or use placeholder
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  };
  
  const getImageSrc = (): string => {
    if (car.imageUrl && isValidImageUrl(car.imageUrl)) {
      return car.imageUrl;
    }
    return PLACEHOLDER_IMAGE;
  };
  
  const imageSrc = getImageSrc();

  return (
    <motion.div whileHover={{ y: -6, transition: { duration: 0.2 } }}>
      <Card className="flex h-full flex-col border-border bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={imageSrc}
            alt={car.name}
            width={640}
            height={360}
            className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
            priority={false}
            unoptimized={!car.imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge
              variant={car.available ? "default" : "secondary"}
              className="bg-primary/90 text-primary-foreground"
            >
              {car.available ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              {car.type === "premium" ? "Premium" : "Standard"}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 space-y-5 p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-card-foreground">{car.name}</h3>
            <p className="text-sm text-muted-foreground">{car.model ?? "Model details coming soon"}</p>
            <div className="flex items-center justify-between pt-2">
              <span className="text-2xl font-bold text-primary">₹{pricePerPeriod.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">per 12 hours</span>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <CarIcon className="size-4 text-primary" />
              <span>₹{car.pricing.price24hr.toLocaleString()}/24hr</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="capitalize">{car.type} service</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="size-4 text-primary" />
              <span>Deposit ₹{car.depositAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" />
              <span>{car.available ? "Ready for booking" : "Not available"}</span>
            </div>
          </div>

          {featuresToShow.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-card-foreground">Highlights</h4>
              <div className="flex flex-wrap gap-2">
                {featuresToShow.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {car.features.length > featuresToShow.length ? (
                  <Badge variant="secondary" className="text-xs">
                    +{car.features.length - featuresToShow.length} more
                  </Badge>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-6 pt-0">
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            onClick={() => onPrimaryAction?.(car)}
            disabled={!car.available || !onPrimaryAction}
          >
            {car.available ? primaryLabel : "Currently unavailable"}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onSecondaryAction?.(car)}
            disabled={!onSecondaryAction}
          >
            {secondaryLabel}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}