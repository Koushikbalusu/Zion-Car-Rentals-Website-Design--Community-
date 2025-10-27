"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Play, 
  Square,
  Calendar,
  User,
  Car,
  DollarSign,
  Clock,
  FileText
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchAdminBookings, reviewBooking, startBooking, completeBooking } from "@/lib/admin";
import { apiFetch } from "@/lib/api-client";
import { getApiBaseUrl } from "@/lib/env";
import { toast } from "sonner";

interface BookingDetail {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
  };
  carId: {
    _id: string;
    name: string;
    model: string;
    type: string;
  };
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  fullName: string;
  guardianName: string;
  guardianRelation: string;
  residentialAddress: string;
  email: string;
  mobile: string;
  occupation: string;
  reference1Name: string;
  reference1Mobile: string;
  reference2Name: string;
  reference2Mobile: string;
  drivingLicenseNumber: string;
  licenseExpiryDate: string;
  drivingLicenseImage: string;
  aadharCardImage: string;
  livePhoto: string;
  depositType: string;
  bikeDetails?: string;
  homeDelivery: boolean;
  deliveryAddress?: string;
  deliveryDistance?: number;
  vehicleName?: string;
  vehicleNumber?: string;
  startOdometer?: number;
  endOdometer?: number;
  actualReturnTime?: string;
  lateReturnFee?: number;
  lateHours?: number;
  adminNotes?: string;
  createdAt: string;
}

const STATUS_FILTERS = [
  { label: "All Bookings", value: "all" },
  { label: "Pending Review", value: "pending" },
  { label: "Payment Pending", value: "payment_pending" },
  { label: "Paid", value: "paid" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Declined", value: "declined" },
];

export function AdminBookingsManagement() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"review" | "start" | "complete" | "view">("view");

  useEffect(() => {
    if (!token) return;

    const loadBookings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiFetch<{ bookings: BookingDetail[] }>("/api/bookings", { token });
        setBookings(response.bookings);
        setFilteredBookings(response.bookings);
      } catch (err) {
        console.error("Failed to load bookings:", err);
        setError("Unable to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [token]);

  useEffect(() => {
    let filtered = bookings;

    // Filter by status
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.customerId.name.toLowerCase().includes(query) ||
        booking.carId.name.toLowerCase().includes(query) ||
        booking.fullName.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.mobile.includes(query)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "payment_pending": return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
      case "paid": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "active": return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
      case "declined": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const handleAction = (booking: BookingDetail, action: string) => {
    setSelectedBooking(booking);
    setModalType(action as any);
    setIsModalOpen(true);
  };

  const handleReview = async (action: "accept" | "decline", adminNotes?: string) => {
    if (!selectedBooking || !token) return;

    try {
      await reviewBooking(selectedBooking._id, action, token, adminNotes);
      toast.success(`Booking ${action === "accept" ? "accepted" : "declined"}`);
      setIsModalOpen(false);
      // Refresh bookings
      const response = await apiFetch<{ bookings: BookingDetail[] }>("/api/bookings", { token });
      setBookings(response.bookings);
    } catch (err) {
      console.error("Failed to review booking:", err);
      toast.error("Failed to update booking status");
    }
  };

  const handleStart = async (vehicleName: string, vehicleNumber: string, startOdometer: number) => {
    if (!selectedBooking || !token) return;

    try {
      await startBooking(selectedBooking._id, { vehicleName, vehicleNumber, startOdometer }, token);
      toast.success("Rental started successfully");
      setIsModalOpen(false);
      // Refresh bookings
      const response = await apiFetch<{ bookings: BookingDetail[] }>("/api/bookings", { token });
      setBookings(response.bookings);
    } catch (err) {
      console.error("Failed to start rental:", err);
      toast.error("Failed to start rental");
    }
  };

  const handleComplete = async (endOdometer: number, actualReturnTime?: string) => {
    if (!selectedBooking || !token) return;

    try {
      await completeBooking(selectedBooking._id, { endOdometer, actualReturnTime }, token);
      toast.success("Rental completed successfully");
      setIsModalOpen(false);
      // Refresh bookings
      const response = await apiFetch<{ bookings: BookingDetail[] }>("/api/bookings", { token });
      setBookings(response.bookings);
    } catch (err) {
      console.error("Failed to complete rental:", err);
      toast.error("Failed to complete rental");
    }
  };


  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bookings Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage all customer bookings, review applications, and track rental status.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            {filteredBookings.length} bookings
          </Badge>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by customer name, car, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border-slate-300 dark:border-slate-600">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="z-[10001]" style={{ zIndex: 10001 }}>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg">
          <CardTitle className="text-slate-800 dark:text-slate-200">All Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800">
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Customer</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Car</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Duration</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Start Time</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Total Price</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Status</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking._id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-xs font-bold text-white">
                          {booking.customerId.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{booking.customerId.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{booking.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{booking.carId.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{booking.carId.model}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                        {booking.duration} hours
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {new Date(booking.startTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ₹{booking.totalPrice.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(booking, "view")}
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {booking.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(booking, "review")}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === "paid" && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(booking, "start")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {booking.status === "active" && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(booking, "complete")}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No bookings found</h3>
              <p className="text-slate-500 dark:text-slate-500">
                {searchQuery || statusFilter !== "all" 
                  ? "No bookings match your current filters." 
                  : "No bookings have been created yet."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modals */}
      <BookingActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        type={modalType}
        onReview={handleReview}
        onStart={handleStart}
        onComplete={handleComplete}
      />
    </div>
  );
}

// Modal component for booking actions
function BookingActionModal({
  isOpen,
  onClose,
  booking,
  type,
  onReview,
  onStart,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetail | null;
  type: "review" | "start" | "complete" | "view";
  onReview: (action: "accept" | "decline", adminNotes?: string) => void;
  onStart: (vehicleName: string, vehicleNumber: string, startOdometer: number) => void;
  onComplete: (endOdometer: number, actualReturnTime?: string) => void;
}) {
  const [adminNotes, setAdminNotes] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [startOdometer, setStartOdometer] = useState(0);
  const [endOdometer, setEndOdometer] = useState(0);
  const [actualReturnTime, setActualReturnTime] = useState("");

  if (!booking) return null;

  const renderContent = () => {
    switch (type) {
      case "view":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {booking.fullName}</p>
                  <p><strong>Email:</strong> {booking.email}</p>
                  <p><strong>Mobile:</strong> {booking.mobile}</p>
                  <p><strong>Occupation:</strong> {booking.occupation}</p>
                  <p><strong>Address:</strong> {booking.residentialAddress}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Car:</strong> {booking.carId.name} {booking.carId.model}</p>
                  <p><strong>Duration:</strong> {booking.duration} hours</p>
                  <p><strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(booking.endTime).toLocaleString()}</p>
                  <p><strong>Total Price:</strong> ₹{booking.totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Reference Contacts</h3>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <p><strong>Reference 1:</strong> {booking.reference1Name}</p>
                  <p><strong>Mobile:</strong> {booking.reference1Mobile}</p>
                </div>
                <div>
                  <p><strong>Reference 2:</strong> {booking.reference2Name}</p>
                  <p><strong>Mobile:</strong> {booking.reference2Mobile}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Documents</h3>
              <div className="space-y-4">
                <div>
                  <p><strong>Driving License:</strong> {booking.drivingLicenseNumber}</p>
                  <p><strong>Expiry:</strong> {new Date(booking.licenseExpiryDate).toLocaleDateString()}</p>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <DocumentViewer 
                    title="Driving License"
                    fileUrl={booking.drivingLicenseImage}
                    fileName="driving-license"
                  />
                  <DocumentViewer 
                    title="Aadhar Card"
                    fileUrl={booking.aadharCardImage}
                    fileName="aadhar-card"
                  />
                  <DocumentViewer 
                    title="Live Photo"
                    fileUrl={booking.livePhoto}
                    fileName="live-photo"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {booking.status === "pending" && (
              <div className="pt-4 border-t space-y-4">
                <div>
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add notes about the booking review..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => onReview("accept", adminNotes)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Booking
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => onReview("decline", adminNotes)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline Booking
                  </Button>
                </div>
              </div>
            )}

            {booking.status === "paid" && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => onStart(vehicleName, vehicleNumber, startOdometer)}
                  disabled={!vehicleName || !vehicleNumber}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Rental
                </Button>
              </div>
            )}

            {booking.status === "active" && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => onComplete(endOdometer, actualReturnTime || undefined)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Complete Rental
                </Button>
              </div>
            )}
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add notes about the booking review..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => onReview("accept", adminNotes)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Booking
              </Button>
              <Button variant="destructive" onClick={() => onReview("decline", adminNotes)}>
                <XCircle className="h-4 w-4 mr-2" />
                Decline Booking
              </Button>
            </div>
          </div>
        );

      case "start":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicleName">Vehicle Name</Label>
              <Input
                id="vehicleName"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                placeholder="Enter vehicle name"
              />
            </div>
            <div>
              <Label htmlFor="vehicleNumber">Vehicle Number</Label>
              <Input
                id="vehicleNumber"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="Enter vehicle registration number"
              />
            </div>
            <div>
              <Label htmlFor="startOdometer">Start Odometer Reading</Label>
              <Input
                id="startOdometer"
                type="number"
                value={startOdometer}
                onChange={(e) => setStartOdometer(Number(e.target.value))}
                placeholder="Enter odometer reading"
              />
            </div>
            <Button 
              onClick={() => onStart(vehicleName, vehicleNumber, startOdometer)}
              disabled={!vehicleName || !vehicleNumber}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Rental
            </Button>
          </div>
        );

      case "complete":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="endOdometer">End Odometer Reading</Label>
              <Input
                id="endOdometer"
                type="number"
                value={endOdometer}
                onChange={(e) => setEndOdometer(Number(e.target.value))}
                placeholder="Enter final odometer reading"
              />
            </div>
            <div>
              <Label htmlFor="actualReturnTime">Actual Return Time</Label>
              <Input
                id="actualReturnTime"
                type="datetime-local"
                value={actualReturnTime}
                onChange={(e) => setActualReturnTime(e.target.value)}
              />
            </div>
            <Button onClick={() => onComplete(endOdometer, actualReturnTime || undefined)}>
              <Square className="h-4 w-4 mr-2" />
              Complete Rental
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (type === "view") return "Booking Details";
    if (type === "review") return "Review Booking";
    if (type === "start") return "Start Rental";
    if (type === "complete") return "Complete Rental";
    return "Booking Details";
  };

  return (
    <>
      {/* Standalone dialog implementation */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'auto',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.95)'
        }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0"
          onClick={onClose}
          style={{ pointerEvents: 'auto' }}
        />
        
        {/* Dialog Content */}
        <div 
          className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-4 flex flex-col overflow-hidden border border-slate-700/50"
          style={{ 
            zIndex: 10000,
            pointerEvents: 'auto',
            position: 'relative',
            maxHeight: '95vh',
            height: '95vh',
            width: '60%'
          }}
        >
          {/* Header - Fixed */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <h2 className="text-xl font-semibold dark:text-white">{getModalTitle()}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white text-xl font-bold"
            >
              ✕
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div 
            className="overflow-y-auto p-6 bg-black [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ flex: '1 1 auto', minHeight: 0 }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}

// Document Viewer Component
function DocumentViewer({ title, fileUrl, fileName }: { title: string; fileUrl?: string; fileName: string }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getFullFileUrl = (url?: string) => {
    if (!url) return null;
    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's a relative path, prepend the API base URL
    if (url.startsWith('/')) {
      return `${getApiBaseUrl()}${url}`;
    }
    return url;
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (['pdf'].includes(extension || '')) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return 'document';
    }
    return 'unknown';
  };

  const fullFileUrl = getFullFileUrl(fileUrl);
  const fileType = fullFileUrl ? getFileType(fullFileUrl) : 'unknown';

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-white">{title}</h4>
      <div className="border border-slate-700 rounded-lg p-2 bg-slate-800">
        {fullFileUrl ? (
          <div className="space-y-2">
            {fileType === 'image' && !imageError ? (
              <img 
                src={fullFileUrl} 
                alt={title} 
                className="w-full h-32 object-cover rounded"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setImageError(true);
                  setIsLoading(false);
                }}
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-slate-900 rounded">
                {isLoading ? (
                  <div className="text-sm text-gray-400">Loading...</div>
                ) : fileType === 'pdf' ? (
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">PDF Document</p>
                  </div>
                ) : fileType === 'document' ? (
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Document</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">File</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-slate-600 text-white hover:bg-slate-700"
                onClick={() => window.open(fullFileUrl!, '_blank')}
              >
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = fullFileUrl!;
                  link.download = `${fileName}.${fullFileUrl!.split('.').pop()}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No file uploaded</p>
        )}
      </div>
    </div>
  );
}
