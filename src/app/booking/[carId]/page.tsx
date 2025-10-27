import { notFound } from "next/navigation";

import { CarDetail } from "@/components/CarDetail";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { fetchCarById } from "@/lib/cars";
import type { CarDetailData } from "@/types/cars";

import { BookingForm } from "./booking-form";

interface BookingPageProps {
  params: {
    carId: string;
  };
}

export async function generateMetadata({ params }: BookingPageProps) {
  let title = "Reserve your ride | Zion Car Rentals";
  let description = "Complete your Zion Car Rentals booking with secure forms and payments.";

  try {
    const car = await fetchCarById(params.carId);
    title = `${car.name} | Zion Booking`;
    description = car.description ?? description;
  } catch (error) {
    // swallow
  }

  return {
    title,
    description,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { carId } = params;
  let car: CarDetailData | undefined;

  try {
    car = await fetchCarById(carId);
  } catch (error) {
    console.error("Failed to fetch car", error);
  }

  if (!car) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto space-y-12 px-4 py-12">
          <CarDetail car={car} />

          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <BookingForm car={car} />
            <aside className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
              <h3 className="text-lg font-semibold text-card-foreground">What happens next?</h3>
              <ol className="list-decimal space-y-2 pl-5">
                <li>Complete the reservation agreement and upload documents</li>
                <li>Await concierge review and approval notifications</li>
                <li>Confirm via secure Razorpay payment to finalise the booking</li>
              </ol>
              <p>
                Our concierge team will guide you end-to-end—from scheduling to handover—ensuring a seamless experience with
                your selected vehicle.
              </p>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

