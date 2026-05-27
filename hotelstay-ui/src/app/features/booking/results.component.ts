import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { HotelService } from '../../services/services/hotel';
import { HotelSearchResult, RoomRate, SelectedRoom } from '../../models/hotel.model';
import { DateUtil, PriceUtil } from '../../shared/utilities/common.util';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatBadgeModule,
    MatIconModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit, OnDestroy {
  hotelResults: HotelSearchResult[] = [];
  sortedResults: HotelSearchResult[] = [];
  isLoading = false;
  selectedRoom: SelectedRoom | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private hotelService: HotelService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Subscribe to search results
    this.hotelService.searchResults$
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        console.log('Results received from service:', results);
        
        if (results && results.results && results.results.length > 0) {
          this.hotelResults = results.results;
          this.sortedResults = [...this.hotelResults];
          console.log('Hotel results loaded:', this.hotelResults);
        } else {
          // No results found
          this.hotelResults = [];
          this.sortedResults = [];
          console.log('No results or empty results');
          // Redirect to search after brief delay to allow user to see no results message
          setTimeout(() => {
            if (this.hotelResults.length === 0) {
              this.router.navigate(['/']);
            }
          }, 3000);
        }
      });

    // Subscribe to loading state
    this.hotelService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.isLoading = loading;
      });

    // Subscribe to selected room
    this.hotelService.selectedRoom$
      .pipe(takeUntil(this.destroy$))
      .subscribe((room) => {
        this.selectedRoom = room;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle sorting
   */
  onSort(sort: Sort): void {
    const data = [...this.hotelResults];

    if (!sort.active || sort.direction === '') {
      this.sortedResults = data;
      return;
    }

    this.sortedResults = data.sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      if (sort.active === 'price') {
        // Calculate minimum price for each hotel
        const getMinPrice = (hotel: HotelSearchResult) => {
          const rates = hotel.rooms.map((r) =>
            PriceUtil.calculateTotal(r.nightlyRate, hotel.numberOfNights)
          );
          return Math.min(...rates);
        };

        aValue = getMinPrice(a);
        bValue = getMinPrice(b);
      }

      return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }

  /**
   * Calculate minimum price for a hotel
   */
  getMinPrice(hotel: HotelSearchResult): number {
    const rates = hotel.rooms.map((r) =>
      PriceUtil.calculateTotal(r.nightlyRate, hotel.numberOfNights)
    );
    return Math.min(...rates);
  }

  /**
   * Get total price for a room
   */
  getTotalPrice(nightlyRate: number, numberOfNights: number): number {
    return PriceUtil.calculateTotal(nightlyRate, numberOfNights);
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return PriceUtil.formatPrice(price);
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return DateUtil.formatToDisplayDate(date);
  }

  /**
   * Get provider badge color
   */
  getProviderColor(provider: string): string {
    switch (provider.toLowerCase()) {
      case 'premierstays':
        return 'primary';
      case 'budgetnests':
        return 'accent';
      case 'boutiquecollection':
        return 'warn';
      default:
        return 'primary';
    }
  }

  /**
   * Select a room for booking
   */
  selectRoom(hotel: HotelSearchResult, room: RoomRate): void {
    const selectedRoom: SelectedRoom = {
      providerId: hotel.providerId,
      providerName: hotel.providerName,
      roomType: room.roomType,
      nightlyRate: room.nightlyRate,
      numberOfNights: hotel.numberOfNights,
      totalPrice: PriceUtil.calculateTotal(room.nightlyRate, hotel.numberOfNights),
      cancellationPolicy: room.cancellationPolicy,
      hotelName: hotel.hotelName,
      destination: hotel.destination,
      checkInDate: hotel.checkInDate,
      checkOutDate: hotel.checkOutDate,
    };

    this.hotelService.selectRoom(selectedRoom);
    this.selectedRoom = selectedRoom;

    // Navigate to booking page
    this.router.navigate(['/booking']);
  }

  /**
   * Navigate back to search
   */
  backToSearch(): void {
    this.hotelService.clearState();
    this.router.navigate(['/']);
  }

  /**
   * Get effective cancellation policy based on check-in time
   * If check-in is within 24 hours, show NonRefundable
   * Otherwise, show the actual cancellation policy
   */
  getEffectiveCancellationPolicy(hotel: HotelSearchResult, policy: any): string {
    const isWithin24Hours = DateUtil.isWithin24Hours(hotel.checkInDate);
    
    if (isWithin24Hours) {
      return 'NonRefundable';
    }
    
    return typeof policy === 'string' ? policy : String(policy || '');
  }

  /**
   * Get cancellation policy display text with icon
   */
  getCancellationPolicyText(policy: any): string {
    const policyStr = typeof policy === 'string' ? policy : String(policy || '');
    switch (policyStr.toLowerCase()) {
      case 'nonrefundable':
        return 'Non-Refundable';
      case 'flexible':
      case 'freecancellation':
      default:
        return 'Flexible (up to 24h)';
    }
  }

  /**
   * Get cancellation policy icon
   */
  getCancellationPolicyIcon(policy: any): string {
    const policyStr = typeof policy === 'string' ? policy : String(policy || '');
    switch (policyStr.toLowerCase()) {
      case 'nonrefundable':
        return 'block';
      case 'flexible':
      case 'freecancellation':
      default:
        return 'schedule';
    }
  }
}
