import { RoomType } from './hotel.model';

/**
 * Hotel search request parameters
 */
export interface HotelSearchRequest {
  destination: string;
  checkIn: string; // ISO 8601 date format: YYYY-MM-DD
  checkOut: string; // ISO 8601 date format: YYYY-MM-DD
  roomType?: RoomType; // Optional - if omitted, return all room types
}