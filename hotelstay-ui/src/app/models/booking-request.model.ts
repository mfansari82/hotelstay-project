import { RoomType, HotelProvider, CancellationPolicy } from './hotel.model';
import { DocumentType } from './document.model';

/**
 * Booking request sent to backend
 */
export interface BookingRequest {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: RoomType;
  providerId: string;
  providerName: HotelProvider;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  totalPrice: number;
}

/**
 * Booking response from backend
 * Backend returns the actual booking confirmation data directly
 */
export interface BookingResponse {
  referenceNumber: string;
  status: 'Confirmed' | 'Pending' | 'Failed';
  provider: string;
}

/**
 * Booking confirmation data
 */
export interface BookingData {
  referenceNumber: string;
  providerName: HotelProvider;
  hotelName: string;
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: RoomType;
  numberOfNights: number;
  nightlyRate: number;
  totalPrice: number;
  cancellationPolicy: CancellationPolicy;
  firstName: string;
  lastName: string;
  status: 'Confirmed' | 'Pending' | 'Failed';
  bookingDateTime: string;
}

/**
 * Booking status check response
 */
export interface BookingStatusResponse {
  success: boolean;
  data: BookingData;
  message?: string;
}
