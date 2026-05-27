import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BookingData } from '../../models/booking-request.model';
import { DateUtil, PriceUtil } from '../../shared/utilities/common.util';

@Component({
  selector: 'app-booking-status',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './booking-status.component.html',
  styleUrls: ['./booking-status.component.css'],
})
export class BookingStatusComponent implements OnInit {
  bookingData: BookingData | null = null;
  isLoading = false;

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Get booking data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['bookingData']) {
      this.bookingData = navigation.extras.state['bookingData'];
    } else {
      // Try to get from history state
      const state = this.location.getState() as any;
      if (state?.['bookingData']) {
        this.bookingData = state['bookingData'];
      }
    }

    // If no booking data, redirect to search
    if (!this.bookingData) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: string): string {
    return DateUtil.formatToDisplayDate(date);
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return PriceUtil.formatPrice(price);
  }

  /**
   * Get status color
   */
  getStatusColor(): string {
    if (!this.bookingData) return 'warn';
    switch (this.bookingData.status.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warn';
      case 'failed':
        return 'warn';
      default:
        return 'primary';
    }
  }

  /**
   * Get status icon
   */
  getStatusIcon(): string {
    if (!this.bookingData) return 'error';
    switch (this.bookingData.status.toLowerCase()) {
      case 'confirmed':
        return 'check_circle';
      case 'pending':
        return 'hourglass_empty';
      case 'failed':
        return 'cancel';
      default:
        return 'info';
    }
  }

  /**
   * Get effective cancellation policy based on check-in time
   * If check-in is within 24 hours, show NonRefundable
   * Otherwise, show Flexible (up to 24h)
   */
  getEffectiveCancellationPolicy(): string {
    if (!this.bookingData) return 'Flexible';
    
    const isWithin24Hours = DateUtil.isWithin24Hours(this.bookingData.checkInDate);
    
    if (isWithin24Hours) {
      return 'NonRefundable';
    }
    
    return typeof this.bookingData.cancellationPolicy === 'string' 
      ? this.bookingData.cancellationPolicy 
      : String(this.bookingData.cancellationPolicy || '');
  }

  /**
   * Get cancellation policy display text
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
   * Navigate to new search
   */
  newSearch(): void {
    this.router.navigate(['/']);
  }

  /**
   * Copy reference to clipboard
   */
  copyReference(): void {
    if (this.bookingData?.referenceNumber) {
      navigator.clipboard.writeText(this.bookingData.referenceNumber);
    }
  }
}
