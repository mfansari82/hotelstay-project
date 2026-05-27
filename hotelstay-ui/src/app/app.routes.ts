import { Routes } from '@angular/router';
import { SearchComponent } from './features/hotel-search/search.component';
import { ResultsComponent } from './features/booking/results.component';
import { BookingComponent } from './features/booking/booking.component';
import { BookingStatusComponent } from './features/booking-status/booking-status.component';

export const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
  },
  {
    path: 'results',
    component: ResultsComponent,
  },
  {
    path: 'booking',
    component: BookingComponent,
  },
  {
    path: 'confirmation',
    component: BookingStatusComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
