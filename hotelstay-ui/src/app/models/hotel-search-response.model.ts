import { HotelSearchResults } from './hotel.model';

/**
 * Hotel search API response
 */
export interface HotelSearchResponse {
  success: boolean;
  data: HotelSearchResults;
  message?: string;
}
