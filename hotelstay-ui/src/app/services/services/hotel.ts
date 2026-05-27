import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HotelSearchRequest } from '../../models/hotel-search-request.model';
import { HotelSearchResponse } from '../../models/hotel-search-response.model';
import { BookingRequest, BookingResponse, BookingStatusResponse } from '../../models/booking-request.model';
import { HotelSearchResults, SelectedRoom, RoomType } from '../../models/hotel.model';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private readonly API_BASE_URL = `${environment.apiUrl}/hotels`;
  
  // Observable streams for state management
  private searchResultsSubject = new BehaviorSubject<HotelSearchResults | null>(null);
  public searchResults$ = this.searchResultsSubject.asObservable();
  
  private selectedRoomSubject = new BehaviorSubject<SelectedRoom | null>(null);
  public selectedRoom$ = this.selectedRoomSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Map backend cancellation policy number/string to frontend enum
   */
  private mapCancellationPolicy(policyValue: any): string {
    if (typeof policyValue === 'string') {
      return policyValue; // Already a string, return as is
    }
    
    // Map numbers to policy names (assume C# enum order)
    const policyMap: { [key: number]: string } = {
      0: 'FreeCancellation',
      1: 'Flexible',
      2: 'NonRefundable'
    };
    
    return policyMap[policyValue] || 'Flexible'; // Default to Flexible if unknown
  }

  /**
   * Safely get a property value from object, checking both camelCase and PascalCase
   */
  private getProperty(obj: any, camelCaseName: string, pascalCaseName: string): any {
    return obj[camelCaseName] !== undefined ? obj[camelCaseName] : obj[pascalCaseName];
  }

  /**
   * Transform flat backend response to nested hotel structure
   */
  private transformBackendResponse(flatResponse: any[], searchRequest: HotelSearchRequest): any {
    if (!Array.isArray(flatResponse) || flatResponse.length === 0) {
      console.log('Transform - No array or empty');
      return { results: [] };
    }

    console.log('Transform - Processing', flatResponse.length, 'items');
    console.log('Transform - Sample item:', flatResponse[0]);
    
    // Group by hotel name
    const groupedByHotel = new Map<string, any>();
    let roomsAdded = 0;
    
    flatResponse.forEach((item: any, index: number) => {
      // Handle both camelCase and PascalCase field names
      const provider = this.getProperty(item, 'provider', 'Provider') || 'Unknown';
      const hotelName = this.getProperty(item, 'hotelName', 'HotelName') || 'Unknown';
      const roomType = this.getProperty(item, 'roomType', 'RoomType');
      const pricePerNight = this.getProperty(item, 'pricePerNight', 'PricePerNight');
      const totalPrice = this.getProperty(item, 'totalPrice', 'TotalPrice');
      const cancellationPolicy = this.getProperty(item, 'cancellationPolicy', 'CancellationPolicy');
      const amenities = this.getProperty(item, 'amenities', 'Amenities');
      const starRating = this.getProperty(item, 'starRating', 'StarRating');
      const isAvailable = this.getProperty(item, 'isAvailable', 'IsAvailable');
      
      console.log(`Transform - Item ${index}:`, { 
        Hotel: hotelName, 
        Provider: provider, 
        IsAvailable: isAvailable,
        PricePerNight: pricePerNight,
        RoomType: roomType 
      });
      
      const hotelKey = `${provider}-${hotelName}`;
      
      if (!groupedByHotel.has(hotelKey)) {
        groupedByHotel.set(hotelKey, {
          providerId: provider,
          providerName: provider,
          hotelName: hotelName,
          destination: searchRequest.destination,
          checkInDate: searchRequest.checkIn,
          checkOutDate: searchRequest.checkOut,
          numberOfNights: this.calculateNights(searchRequest.checkIn, searchRequest.checkOut),
          rooms: []
        });
      }
      
      const hotel = groupedByHotel.get(hotelKey);
      
      // Map room type number to enum
      const mappedRoomType = this.mapRoomType(roomType);
      
      // Map cancellation policy to string
      const mappedPolicy = this.mapCancellationPolicy(cancellationPolicy);
      
      // Add room if available (treat undefined/null as true)
      if (isAvailable !== false) {
        console.log(`Transform - Adding room for ${hotelName}, RoomType: ${mappedRoomType}, Policy: ${mappedPolicy}, IsAvailable: ${isAvailable}`);
        hotel.rooms.push({
          roomType: mappedRoomType,
          nightlyRate: pricePerNight,
          cancellationPolicy: mappedPolicy,
          amenities: amenities || [],
          starRating: starRating
        });
        roomsAdded++;
      } else {
        console.log(`Transform - Skipping room, IsAvailable is false`);
      }
    });
    
    console.log('Transform - Total rooms added:', roomsAdded);
    
    // Convert map to array and filter hotels with available rooms
    const results = Array.from(groupedByHotel.values()).filter(
      (hotel: any) => hotel.rooms.length > 0
    );
    
    console.log('Transform - Final result hotels:', results.length);
    
    return { results };
  }

  /**
   * Map backend room type number to frontend RoomType enum
   */
  private mapRoomType(roomTypeValue: any): RoomType {
    if (typeof roomTypeValue === 'string') {
      // Already a string, return as is
      return roomTypeValue as RoomType;
    }
    
    // Map numbers to enum
    const roomTypeMap: { [key: number]: RoomType } = {
      0: RoomType.STANDARD,
      1: RoomType.DELUXE,
      2: RoomType.SUITE
    };
    
    return roomTypeMap[roomTypeValue] || RoomType.STANDARD;
  }

  /**
   * Calculate number of nights between two dates
   */
  private calculateNights(checkIn: string, checkOut: string): number {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = Math.abs(outDate.getTime() - inDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Search for hotels based on criteria
   */
  searchHotels(request: HotelSearchRequest): Observable<HotelSearchResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams()
      .set('destination', request.destination)
      .set('checkIn', request.checkIn)
      .set('checkOut', request.checkOut);

    if (request.roomType) {
      params = params.set('roomType', request.roomType);
    }

    return this.http.get<any>(`${this.API_BASE_URL}/search`, { params })
      .pipe(
        tap((response) => {
          console.log('Service tap - Full response:', response);
          console.log('Service tap - Is Array:', Array.isArray(response));
          
          this.loadingSubject.next(false);
          
          // Handle both response formats:
          // Format 1: { success: true, data: { results: [...] } }
          // Format 2: [...] (direct array of flat room objects)
          let results: any = null;
          
          if (Array.isArray(response)) {
            // Backend returns array directly - transform it
            console.log('Response is array format, transforming to hotel structure');
            results = this.transformBackendResponse(response, request);
            console.log('Transform result:', results);
          } else if (response && response.success && response.data) {
            // Backend returns envelope format
            console.log('Response is envelope format');
            results = response.data;
          }
          
          if (results && results.results) {
            console.log('Results object found with:', results.results.length, 'hotels');
            if (results.results.length > 0) {
              console.log('Setting search results subject with:', results);
              this.searchResultsSubject.next(results);
            } else {
              console.log('No results or empty results');
              this.errorSubject.next('No hotels found');
            }
          } else {
            console.log('Results is null or does not have results property:', results);
            this.errorSubject.next('No hotels found');
          }
        }),
        catchError((error) => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'An error occurred while searching hotels';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }

  /**
   * Set the currently selected room for booking
   */
  selectRoom(room: SelectedRoom): void {
    this.selectedRoomSubject.next(room);
  }

  /**
   * Get the currently selected room
   */
  getSelectedRoom(): SelectedRoom | null {
    return this.selectedRoomSubject.value;
  }

  /**
   * Clear the selected room
   */
  clearSelectedRoom(): void {
    this.selectedRoomSubject.next(null);
  }

  /**
   * Book a hotel room
   */
  bookRoom(bookingRequest: BookingRequest): Observable<BookingResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Transform frontend booking request to backend format
    const backendRequest = this.transformBookingRequest(bookingRequest);
    
    console.log('Sending booking request:', backendRequest);
    
    return this.http.post<any>(`${this.API_BASE_URL}/book`, backendRequest)
      .pipe(
        tap((response) => {
          console.log('Booking response received:', response);
          this.loadingSubject.next(false);
          
          // New response format: { referenceNumber, status, provider }
          // Old response format: { success, data, message }
          if (response.referenceNumber) {
            console.log('Booking successful - referenceNumber:', response.referenceNumber);
          } else if (response.success === false) {
            this.errorSubject.next(response.message || 'Booking failed');
          }
        }),
        catchError((error) => {
          console.error('Booking error caught:', error);
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || error.message || 'An error occurred while booking';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }

  /**
   * Transform frontend booking request to backend format
   * Frontend format uses checkInDate/checkOutDate as YYYY-MM-DD strings
   * Backend expects checkIn/checkOut as ISO timestamps with timezone
   */
  private transformBookingRequest(bookingRequest: BookingRequest): any {
    const selectedRoom = this.selectedRoomSubject.value;
    
    // Map DocumentType string to numeric value
    const documentTypeMap: { [key: string]: number } = {
      'Passport': 0,
      'NationalID': 1
    };

    // Convert dates from YYYY-MM-DD to ISO timestamp
    const checkInDate = new Date(bookingRequest.checkInDate);
    const checkOutDate = new Date(bookingRequest.checkOutDate);

    return {
      provider: bookingRequest.providerId,
      hotelName: selectedRoom?.hotelName || '',
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      numberOfGuests: 1, // Backend will calculate from hotel, but sending 1 as placeholder
      passengerName: `${bookingRequest.firstName} ${bookingRequest.lastName}`,
      documentNumber: bookingRequest.documentNumber,
      documentType: documentTypeMap[bookingRequest.documentType] || 0,
      destination: bookingRequest.destination
    };
  }

  /**
   * Get booking status by reference number
   */
  getBookingStatus(referenceNumber: string): Observable<BookingStatusResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<BookingStatusResponse>(`${this.API_BASE_URL}/booking/${referenceNumber}`)
      .pipe(
        tap((response) => {
          this.loadingSubject.next(false);
          if (!response.success) {
            this.errorSubject.next(response.message || 'Failed to fetch booking status');
          }
        }),
        catchError((error) => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'An error occurred while fetching booking status';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }

  /**
   * Clear all state
   */
  clearState(): void {
    this.searchResultsSubject.next(null);
    this.selectedRoomSubject.next(null);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }

  /**
   * Get current search results
   */
  getSearchResults(): HotelSearchResults | null {
    return this.searchResultsSubject.value;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }
}
