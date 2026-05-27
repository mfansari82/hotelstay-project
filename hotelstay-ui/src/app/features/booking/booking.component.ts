import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { HotelService } from '../../services/services/hotel';
import { SelectedRoom } from '../../models/hotel.model';
import { BookingRequest, BookingResponse, BookingData } from '../../models/booking-request.model';
import { DocumentType, VALID_DESTINATIONS } from '../../models/document.model';
import { CancellationPolicy } from '../../models/hotel.model';
import {
  CustomValidators,
  DocumentValidator,
} from '../../shared/validators/custom-validators';
import { PriceUtil, DateUtil } from '../../shared/utilities/common.util';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDividerModule,
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit, OnDestroy {
  bookingForm!: FormGroup;
  selectedRoom: SelectedRoom | null = null;
  isLoading = false;
  documentTypes = Object.values(DocumentType);
  allowedDocumentTypes: DocumentType[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Get selected room from service
    this.selectedRoom = this.hotelService.getSelectedRoom();
    if (!this.selectedRoom) {
      this.router.navigate(['/']);
      return;
    }

    // Pre-fill destination and update allowed document types
    const destination = this.selectedRoom.destination;
    this.bookingForm.patchValue({
      destination: destination,
    });
    
    // Set allowed document types for this destination
    this.allowedDocumentTypes = DocumentValidator.getAllowedDocumentTypes(destination);
    console.log('Booking - Destination:', destination);
    console.log('Booking - Allowed document types:', this.allowedDocumentTypes);

    // Subscribe to loading state
    this.hotelService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.isLoading = loading;
      });

    // Update allowed document types when destination changes
    this.bookingForm
      .get('destination')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((destination) => {
        if (destination) {
          this.allowedDocumentTypes =
            DocumentValidator.getAllowedDocumentTypes(destination);
          this.bookingForm.get('documentType')?.reset();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the booking form with validators
   */
  private initializeForm(): void {
    this.bookingForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      destination: ['', [Validators.required]],
      documentType: [
        '',
        [
          Validators.required,
          CustomValidators.documentTypeMatchesDestination(),
        ],
      ],
      documentNumber: [
        '',
        [Validators.required, CustomValidators.validDocumentNumber()],
      ],
    });
  }

  /**
   * Submit booking
   */
  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.snackBar.open('Please fill in all fields correctly', 'Close', {
        duration: 5000,
      });
      return;
    }

    if (!this.selectedRoom) {
      this.snackBar.open('Please select a room first', 'Close', {
        duration: 5000,
      });
      return;
    }

    const formValue = this.bookingForm.value;
    const bookingRequest: BookingRequest = {
      destination: formValue.destination,
      checkInDate: this.selectedRoom.checkInDate,
      checkOutDate: this.selectedRoom.checkOutDate,
      roomType: this.selectedRoom.roomType,
      providerId: this.selectedRoom.providerId,
      providerName: this.selectedRoom.providerName,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      documentType: formValue.documentType,
      documentNumber: formValue.documentNumber,
      totalPrice: this.selectedRoom.totalPrice,
    };

    this.hotelService.bookRoom(bookingRequest).subscribe({
      next: (response) => {
        console.log('=== BOOKING COMPONENT RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));
        console.log('referenceNumber:', response?.referenceNumber);
        console.log('status:', response?.status);
        console.log('provider:', response?.provider);
        
        // Backend returns referenceNumber, status, and provider on successful booking
        const hasReferenceNumber = response && response.referenceNumber;
        const hasStatus = response && response.status;
        const statusConfirmed = hasStatus && response.status === 'Confirmed';
        
        console.log('=== VALIDATION CHECK ===');
        console.log('hasReferenceNumber:', hasReferenceNumber);
        console.log('hasStatus:', hasStatus);
        console.log('statusConfirmed:', statusConfirmed);
        
        if (hasReferenceNumber && statusConfirmed) {
          console.log('✓ Booking successful! Navigating to confirmation...');
          
          // Create booking data object for confirmation page
          const bookingData: BookingData = {
            referenceNumber: response.referenceNumber,
            providerName: this.selectedRoom?.providerName || bookingRequest.providerName,
            hotelName: this.selectedRoom?.hotelName || '',
            destination: bookingRequest.destination,
            checkInDate: bookingRequest.checkInDate,
            checkOutDate: bookingRequest.checkOutDate,
            roomType: bookingRequest.roomType,
            numberOfNights: this.selectedRoom?.numberOfNights || 0,
            nightlyRate: this.selectedRoom?.nightlyRate || 0,
            totalPrice: bookingRequest.totalPrice,
            cancellationPolicy: this.selectedRoom?.cancellationPolicy || CancellationPolicy.FLEXIBLE,
            firstName: bookingRequest.firstName,
            lastName: bookingRequest.lastName,
            status: response.status,
            bookingDateTime: new Date().toISOString(),
          };
          
          console.log('BookingData created:', bookingData);
          
          // Navigate to confirmation page
          this.router.navigate(['/confirmation'], {
            state: { bookingData: bookingData },
          });
        } else {
          console.error('✗ Booking validation failed');
          console.error('Missing required fields:', {
            hasReferenceNumber,
            hasStatus,
            statusConfirmed,
            fullResponse: response
          });
          this.snackBar.open(
            'Booking failed: ' + (response?.status || 'Unknown error'),
            'Close',
            { duration: 5000 }
          );
        }
      },
      error: (error) => {
        console.error('=== BOOKING ERROR ===');
        console.error('Error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        
        this.snackBar.open(
          error.error?.message || error.message || 'An error occurred during booking',
          'Close',
          { duration: 5000 }
        );
      },
    });
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field.hasError('minLength')) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (field.hasError('invalidDocumentNumber')) {
      return 'Document number must be alphanumeric (at least 5 characters)';
    }
    if (field.hasError('documentTypeNotAllowed')) {
      return DocumentValidator.getDocumentTypeErrorMessage(
        this.bookingForm.get('destination')?.value,
        field.value
      );
    }

    return 'Invalid input';
  }

  /**
   * Check if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get total price for display
   */
  getTotalPrice(): number {
    return this.selectedRoom?.totalPrice || 0;
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
   * Cancel booking and go back
   */
  onCancel(): void {
    this.router.navigate(['/results']);
  }

  /**
   * Get cancellation policy display text
   */
  getCancellationPolicyText(policy: any): string {
    const policyStr = typeof policy === 'string' ? policy : String(policy || '');
    switch (policyStr.toLowerCase()) {
      case 'freecancellation':
        return 'Free Cancellation (up to 48h)';
      case 'flexible':
        return 'Flexible (up to 24h)';
      case 'nonrefundable':
        return 'Non-Refundable';
      default:
        return policyStr;
    }
  }
}
