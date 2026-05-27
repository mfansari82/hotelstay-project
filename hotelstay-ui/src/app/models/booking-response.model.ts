import { BookingData } from './booking-request.model';

/**
 * Booking response wrapper
 */
export interface BookingConfirmationResponse {
  success: boolean;
  data: BookingData;
  message?: string;
}
