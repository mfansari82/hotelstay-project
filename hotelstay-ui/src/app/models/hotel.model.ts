/**
 * Hotel Room Type Enum
 * Unified across all providers: Standard, Deluxe, Suite
 */
export enum RoomType {
  STANDARD = 'Standard',
  DELUXE = 'Deluxe',
  SUITE = 'Suite'
}

/**
 * Cancellation Policy Options
 */
export enum CancellationPolicy {
  FREE_CANCELLATION = 'FreeCancellation',
  FLEXIBLE = 'Flexible',
  NON_REFUNDABLE = 'NonRefundable'
}

/**
 * Hotel Provider Badge
 */
export enum HotelProvider {
  PREMIER_STAYS = 'PremierStays',
  BUDGET_NESTS = 'BudgetNests',
  BOUTIQUE_COLLECTION = 'BoutiqueCollection'
}

/**
 * Individual room/rate result from a provider
 */
export interface RoomRate {
  roomType: RoomType;
  nightlyRate: number;
  cancellationPolicy: CancellationPolicy;
  amenities?: string[]; // Only for PremierStays
  starRating?: number; // Only for PremierStays
}

/**
 * Hotel search result - aggregated from all providers
 */
export interface HotelSearchResult {
  providerId: string;
  providerName: HotelProvider;
  hotelName: string;
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  rooms: RoomRate[];
}

/**
 * Combined hotel search results
 */
export interface HotelSearchResults {
  results: HotelSearchResult[];
  totalProviders: number;
  unavailableProviders: string[];
}

/**
 * Details for a specific selected room for booking
 */
export interface SelectedRoom {
  providerId: string;
  providerName: HotelProvider;
  roomType: RoomType;
  nightlyRate: number;
  numberOfNights: number;
  totalPrice: number;
  cancellationPolicy: CancellationPolicy;
  hotelName: string;
  destination: string;
  checkInDate: string;
  checkOutDate: string;
}
