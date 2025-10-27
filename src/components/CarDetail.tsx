"use client";

import Image from "next/image";

import { useMemo } from "react";

import { Calendar, IndianRupee, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

import type { CarDetailData } from "@/types/cars";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface CarDetailProps {
  car: CarDetailData;
  onReserve?: () => void;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1080&q=80";

export function CarDetail({ car, onReserve }: CarDetailProps) {
  const pricePerPeriod = useMemo(() => car.pricing.price12hr, [car.pricing.price12hr]);
  
  // Validate image URL - ensure it's a proper URL or use placeholder
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
  };
  
  const imageSrc = isValidImageUrl(car.imageUrl) && car.imageUrl ? car.imageUrl : PLACEHOLDER_IMAGE;

  return (
    <section className="space-y-12">
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src={imageSrc}
              alt={car.name}
              width={1280}
              height={720}
              className="h-[420px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute left-6 right-6 bottom-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">{car.name}</h1>
                <p className="text-sm text-white/80">{car.model ?? "Zion Signature Collection"}</p>
              </div>
              <Badge variant="outline" className="bg-white/10 text-white backdrop-blur">
                {car.type === "premium" ? "Premium" : "Standard"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="space-y-2 p-6">
                <p className="text-sm text-muted-foreground">Rental price (12 hrs)</p>
                <p className="text-3xl font-semibold text-primary">₹{pricePerPeriod.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">₹{car.pricing.price24hr.toLocaleString()} for 24 hours</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 p-6">
                <p className="text-sm text-muted-foreground">Security deposit</p>
                <p className="text-2xl font-semibold">₹{car.depositAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Refundable upon vehicle inspection on return</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureTile
              icon={<Sparkles className="size-5 text-primary" />}
              title="Chauffeur-ready"
              description="Professional handover, premium detailing, and curated experiences"
            />
            <FeatureTile
              icon={<ShieldCheck className="size-5 text-primary" />}
              title="Fully insured"
              description="Comprehensive coverage and 24/7 roadside assistance"
            />
            <FeatureTile
              icon={<Calendar className="size-5 text-primary" />}
              title="Flexible durations"
              description="Book in 12-hour increments with easy extensions"
            />
            <FeatureTile
              icon={<TrendingUp className="size-5 text-primary" />}
              title="Premium performance"
              description="Meticulously maintained machines delivering unmatched performance"
            />
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">About this vehicle</h2>
                <p className="text-sm text-muted-foreground">
                  {car.description ??
                    "A meticulously curated vehicle from the Zion fleet, featuring luxury finishes, dynamic performance, and concierge-level preparation for every journey."}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-card-foreground">Highlights</h3>
                <ul className="grid gap-2 text-sm text-muted-foreground">
                  {car.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 size-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {!car.features.length ? (
                    <li className="text-sm text-muted-foreground">Feature list available upon request.</li>
                  ) : null}
                </ul>
              </div>

              <div className="space-y-1 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                <p>• Complimentary delivery within 5 km (₹500 beyond)</p>
                <p>• Dedicated concierge and trip planning support</p>
                <p>• Flexible upgrades for long-term itineraries</p>
              </div>

              <Button className="w-full" size="lg" onClick={onReserve} disabled={!car.available || !onReserve}>
                {car.available ? "Proceed to booking" : "Currently unavailable"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Need bespoke arrangements? Contact our concierge at support@zionrentals.com.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureTile({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-border/80 bg-card/80">
      <CardContent className="flex items-start gap-3 p-5">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <div>
          <p className="font-semibold text-card-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}