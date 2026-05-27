import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';

import { finalize } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { HotelService } from '../../services/services/hotel';

import { HotelSearchRequest } from '../../models/hotel-search-request.model';
import { RoomType } from '../../models/hotel.model';

import { VALID_DESTINATIONS } from '../../models/document.model';

import { CustomValidators } from '../../shared/validators/custom-validators';
import { DateUtil } from '../../shared/utilities/common.util';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  searchForm: FormGroup;

  isLoading = false;

  destinations = VALID_DESTINATIONS.map((d: any) => d.name);

  roomTypes = [
    { label: 'Standard', value: RoomType.STANDARD },
    { label: 'Deluxe', value: RoomType.DELUXE },
    { label: 'Suite', value: RoomType.SUITE },
  ];

  minCheckoutDate = '';

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      destination: [
        '',
        [
          Validators.required,
          CustomValidators.validDestination(),
        ],
      ],

      checkInDate: ['', [Validators.required]],

      checkOutDate: [
        '',
        [
          Validators.required,
          CustomValidators.checkoutAfterCheckin(),
        ],
      ],

      roomType: [''],
    });

    this.handleCheckInDateChange();
  }

  /**
   * Handle check-in date changes
   */
  private handleCheckInDateChange(): void {
    this.searchForm
      .get('checkInDate')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.minCheckoutDate =
            DateUtil.getMinCheckoutDate(value);

          const checkoutControl =
            this.searchForm.get('checkOutDate');

          if (
            checkoutControl?.value &&
            checkoutControl.value < this.minCheckoutDate
          ) {
            checkoutControl.reset();
          }
        }
      });
  }

  /**
   * Search hotels
   */
  onSearch(): void {
    if (this.searchForm.invalid) {
      this.snackBar.open(
        'Please fill all required fields correctly',
        'Close',
        {
          duration: 4000,
        }
      );

      return;
    }

    const formValue = this.searchForm.value;

    const request: HotelSearchRequest = {
      destination: formValue.destination,

      checkIn: DateUtil.formatToISODate(
        formValue.checkInDate
      ),

      checkOut: DateUtil.formatToISODate(
        formValue.checkOutDate
      ),

      roomType:
        formValue.roomType !== ''
          ? (formValue.roomType as RoomType)
          : undefined,
    };

    this.isLoading = true;

    this.hotelService
      .searchHotels(request)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Full API Response:', response);
          console.log('Response received, service should have transformed data');

          // Service handles transformation and stores in BehaviorSubject
          // If we got here without error, navigate to results
          // Results page will check if data is available and redirect if empty
          if (Array.isArray(response) && response.length > 0) {
            console.log('Array response received, navigating to results');
            this.router.navigate(['/results']);
          } else if (response && response.success && response.data) {
            console.log('Envelope response received, navigating to results');
            this.router.navigate(['/results']);
          } else if (response && Array.isArray(response) && response.length === 0) {
            console.log('Empty array response');
            this.snackBar.open(
              'No hotels found matching your criteria',
              'Close',
              {
                duration: 4000,
              }
            );
          }
        },

        error: (error) => {
          console.error(error);

          this.snackBar.open(
            error?.message ||
              'Error occurred while searching hotels',
            'Close',
            {
              duration: 4000,
            }
          );
        },
      });
  }

  /**
   * Reset form
   */
  onReset(): void {
    this.searchForm.reset();

    localStorage.removeItem('hotelSearchResults');
  }

  /**
   * Field validation
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.searchForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }

  /**
   * Error messages
   */
  getErrorMessage(fieldName: string): string {
    const field = this.searchForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.hasError('required')) {
      return `${fieldName} is required`;
    }

    if (field.hasError('invalidDestination')) {
      return 'Please select valid destination';
    }

    if (field.hasError('checkoutBeforeCheckin')) {
      return 'Checkout date must be after checkin date';
    }

    return 'Invalid field';
  }
}