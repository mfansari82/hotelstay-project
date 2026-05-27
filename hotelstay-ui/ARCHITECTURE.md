# HotelStay Architecture & Implementation Guide

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [API Integration](#api-integration)
4. [State Management](#state-management)
5. [Form Validation](#form-validation)
6. [Component Structure](#component-structure)
7. [Deployment](#deployment)
8. [Performance Optimization](#performance-optimization)

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend Framework**: Angular 20
- **Language**: TypeScript 5.4+
- **UI Components**: Angular Material 20
- **State Management**: RxJS with BehaviorSubjects
- **Form Management**: Reactive Forms
- **HTTP Client**: Angular HttpClient with Interceptors
- **Styling**: CSS3 with Material Design
- **Build Tool**: Angular CLI 20

### Application Flow

```
User → Search Page → API Call → Results Page → Select Room → Booking Page → Confirmation
   ↓        ↓           ↓          ↓            ↓             ↓            ↓
Search   Validate    HotelService  Display    Save Room    Collect     Display
Form    & Submit     searchHotels() Results   Info         Guest Info  Confirmation
```

## 🔄 Data Flow

### 1. Hotel Search Flow

```
SearchComponent
    ↓
    └─→ FormBuilder creates search form
    └─→ User fills form (destination, dates, room type)
    └─→ Form validates (destination exists, checkout > checkin)
    └─→ User clicks "Search Hotels"
    └─→ HotelService.searchHotels() called
        ├─→ Loading state set to true
        ├─→ HTTP GET /api/hotels/search?...
        ├─→ Response received
        ├─→ Results stored in searchResultsSubject
        ├─→ Loading state set to false
        └─→ Navigate to ResultsComponent

ResultsComponent
    ├─→ Subscribe to searchResults$
    ├─→ Display aggregated results from all providers
    ├─→ User can sort by price
    └─→ User selects a room
        └─→ HotelService.selectRoom() called
        └─→ Selected room stored in selectedRoomSubject
        └─→ Navigate to BookingComponent
```

### 2. Booking Flow

```
BookingComponent
    ├─→ Get selected room from HotelService
    ├─→ Pre-fill destination field
    ├─→ Display booking summary
    ├─→ Form with: firstName, lastName, documentType, documentNumber
    ├─→ Validators:
    │   ├─→ Document type must match destination
    │   ├─→ Document number must be alphanumeric (5+ chars)
    │   └─→ Names required (2+ chars)
    ├─→ User fills form and submits
    └─→ HotelService.bookRoom() called
        ├─→ Loading state set to true
        ├─→ HTTP POST /api/hotels/book
        ├─→ Response received with BookingData
        ├─→ Navigate to BookingStatusComponent with booking data
        └─→ Display confirmation

BookingStatusComponent
    ├─→ Display booking reference (copyable)
    ├─→ Show complete booking details
    ├─→ Display status (Confirmed/Pending/Failed)
    ├─→ Show cancellation policy
    └─→ "New Search" button to restart flow
```

## 🔌 API Integration

### Service Layer

The `HotelService` serves as the bridge between Angular components and backend API:

```typescript
// Key methods:
- searchHotels(request: HotelSearchRequest): Observable<HotelSearchResponse>
- bookRoom(booking: BookingRequest): Observable<BookingResponse>
- getBookingStatus(reference: string): Observable<BookingStatusResponse>
- selectRoom(room: SelectedRoom): void
- getSelectedRoom(): SelectedRoom | null
- clearState(): void
```

### HTTP Interceptors

**RequestInterceptor**
- Adds `Content-Type: application/json`
- Adds `Accept: application/json`
- Adds `Authorization: Bearer {token}` if available
- Used for authentication in future implementation

**ErrorInterceptor**
- Catches HTTP errors
- Transforms error responses to user-friendly messages
- Handles specific HTTP status codes:
  - 400: Invalid request
  - 404: Resource not found
  - 422: Validation error
  - 500: Server error

### API Endpoints

**1. Search Hotels**
```
GET /api/hotels/search?destination={city}&checkIn={YYYY-MM-DD}&checkOut={YYYY-MM-DD}&roomType={type}

Success Response (200):
{
  "success": true,
  "data": {
    "results": [
      {
        "providerId": "string",
        "providerName": "PremierStays|BudgetNests|BoutiqueCollection",
        "hotelName": "string",
        "destination": "string",
        "checkInDate": "YYYY-MM-DD",
        "checkOutDate": "YYYY-MM-DD",
        "numberOfNights": number,
        "rooms": [
          {
            "roomType": "Standard|Deluxe|Suite",
            "nightlyRate": number,
            "cancellationPolicy": "FreeCancellation|Flexible|NonRefundable",
            "amenities": ["string"],
            "starRating": number
          }
        ]
      }
    ],
    "totalProviders": number,
    "unavailableProviders": ["string"]
  }
}

Error Response (400/422):
{
  "success": false,
  "message": "Validation error message"
}
```

**2. Book Hotel**
```
POST /api/hotels/book

Request Body (Frontend transforms to backend format):
{
  "provider": "PremierStays",
  "hotelName": "Grand Hotel London",
  "checkIn": "2026-05-26T00:00:00.000Z",
  "checkOut": "2026-05-28T00:00:00.000Z",
  "numberOfGuests": 1,
  "passengerName": "John Doe",
  "documentNumber": "AB123456",
  "documentType": 0,
  "destination": "Mumbai"
}

Frontend Transformation Details:
- Frontend uses: destination, checkInDate, checkOutDate, roomType, providerId, providerName, firstName, lastName, documentType, documentNumber, totalPrice
- Backend expects: provider, hotelName, checkIn, checkOut, numberOfGuests, passengerName, documentNumber, documentType, destination
- Transformations applied:
  * provider = providerId
  * hotelName = selected room's hotelName
  * checkIn = new Date(checkInDate).toISOString()
  * checkOut = new Date(checkOutDate).toISOString()
  * numberOfGuests = 1 (hardcoded, backend calculates from hotel)
  * passengerName = firstName + " " + lastName
  * documentType = string enum to number (Passport → 0, NationalID → 1)

Success Response (200):
{
  "referenceNumber": "3c92c1ef-f894-44ba-a9b6-6667445914a5",
  "status": "Confirmed",
  "provider": "BudgetNests"
}

Frontend Processing:
- Receives response with referenceNumber, status, provider
- Constructs BookingData object combining response data + selected room details
- Navigates to confirmation page with booking data

Error Response (422/500):
{
  "message": "Validation error or server error message"
}
```

**3. Get Booking Status**
```
GET /api/hotels/booking/{referenceNumber}

Response: Same as booking response
```

## 🎯 State Management

### RxJS BehaviorSubjects

The `HotelService` uses BehaviorSubjects for reactive state:

```typescript
// Search results from all providers
private searchResultsSubject = new BehaviorSubject<HotelSearchResults | null>(null);
public searchResults$ = this.searchResultsSubject.asObservable();

// Currently selected room for booking
private selectedRoomSubject = new BehaviorSubject<SelectedRoom | null>(null);
public selectedRoom$ = this.selectedRoomSubject.asObservable();

// Loading state for API calls
private loadingSubject = new BehaviorSubject<boolean>(false);
public loading$ = this.loadingSubject.asObservable();

// Error messages from API
private errorSubject = new BehaviorSubject<string | null>(null);
public error$ = this.errorSubject.asObservable();
```

### Component Subscriptions

Components subscribe to these observables and unsubscribe using `takeUntil`:

```typescript
// In component
private destroy$ = new Subject<void>();

ngOnInit() {
  this.hotelService.loading$
    .pipe(takeUntil(this.destroy$))
    .subscribe(loading => this.isLoading = loading);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## ✅ Form Validation

### Supported Destinations

**Domestic Destinations** (Accept: Passport or National ID)
- Mumbai
- Delhi

**International Destinations** (Accept: Passport only)
- New York
- London
- Paris

### Custom Validators

**DocumentTypeMatchesDestination**
```typescript
// Validates that selected document type is valid for destination
// Domestic: Passport or NationalID allowed
// International: Passport only
```

**CheckoutAfterCheckin**
```typescript
// Ensures checkout date is after check-in date
// Runs on form group level for cross-field validation
```

**ValidDestination**
```typescript
// Validates destination exists in VALID_DESTINATIONS list
// Current destinations: Mumbai, Delhi, New York, London, Paris
```

**ValidDocumentNumber**
```typescript
// Validates document number is alphanumeric, min 5 characters
// Pattern: /^[A-Z0-9]{5,}$/i
```

### Validation Strategy

1. **Reactive Form Setup**
   ```typescript
   this.searchForm = this.fb.group({
     destination: ['', [Validators.required, CustomValidators.validDestination()]],
     checkInDate: ['', [Validators.required]],
     checkOutDate: ['', [Validators.required, CustomValidators.checkoutAfterCheckin()]],
     roomType: ['', []]
   });
   ```

2. **Dynamic Validators**
   - Document type validators update when destination changes
   - Checkout date minimum updates when check-in date changes

3. **Error Messages**
   - Each field has specific error messages
   - Shown only when field is invalid AND (dirty OR touched)
   - Messages guide users to fix validation errors

## 📱 Component Structure

### SearchComponent
- **Purpose**: Initial search form
- **Route**: `/`
- **Inputs**: Form fields for search criteria
- **Outputs**: Navigates to results on successful search
- **State**: Uses HotelService for search

### ResultsComponent
- **Purpose**: Display aggregated results
- **Route**: `/results`
- **Features**: 
  - Sortable by price
  - Per-provider badging
  - Room selection
- **Outputs**: Navigates to booking on room selection

### BookingComponent
- **Purpose**: Collect guest and document information
- **Route**: `/booking`
- **Features**:
  - Booking summary display
  - Guest information form
  - Document validation
- **Outputs**: Navigates to confirmation on successful booking

### BookingStatusComponent
- **Purpose**: Display booking confirmation
- **Route**: `/confirmation`
- **Features**:
  - Reference number display (copyable)
  - Complete booking details
  - Status indication

### LayoutComponent
- **Purpose**: Main application layout
- **Features**:
  - Navigation header
  - Footer
  - Router outlet

## � Cancellation Policy Logic

### 24-Hour Check-in Rule

The frontend implements intelligent cancellation policy display based on check-in timing:

**Display Rules:**
- **If check-in is within 24 hours from now**: Display "Non-Refundable"
- **If check-in is 24+ hours away**: Display "Flexible (up to 24h)"

**Implementation:**
- Method: `DateUtil.isWithin24Hours(checkInDate: string): boolean`
- Calculates: `Math.abs(checkInDate - now) < 24 hours`
- Applied on: Results component and Booking Status component

**Components Affected:**
1. **ResultsComponent** - `getEffectiveCancellationPolicy()`
   - Used in results table display
   - Shown next to each room

2. **BookingStatusComponent** - `getEffectiveCancellationPolicy()`
   - Used in booking confirmation display
   - Shown in booking details section

**Example:**
```typescript
// If today is May 27, 2026 at 10:00 AM
// and check-in is May 27, 2026 at 5:00 PM (7 hours away)
// → Display: "Non-Refundable"

// If check-in is May 28, 2026 at 3:00 PM (29 hours away)
// → Display: "Flexible (up to 24h)"
```

## �🚀 Deployment

### Development Build
```bash
npm start
# Runs ng serve on http://localhost:4200
# Hot reload enabled
```

### Production Build
```bash
npm run build
# Generates optimized build in dist/
# Tree-shaking enabled
# AoT compilation enabled
# Code splitting for lazy-loaded routes
```

### Environment Configuration

**Development** (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7282'  // .NET Core 8 backend
};
```

**Production** (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.hotelstay.com'  // Production backend URL
};
```

### Docker Deployment

```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/hotelstay-ui/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## ⚡ Performance Optimization

### 1. Change Detection
- OnPush strategy used where possible
- Zoneless change detection enabled
- Manual change detection for optimized routes

### 2. Bundle Optimization
- Tree-shaking removes unused code
- Lazy loading for feature modules
- Code splitting per route

### 3. Subscription Management
- takeUntil pattern for unsubscribing
- No memory leaks from abandoned subscriptions

### 4. Caching
- HTTP responses cached in service
- BehaviorSubjects provide replay behavior

### 5. Lazy Loading
```typescript
// Could be implemented for features:
const routes: Routes = [
  {
    path: 'search',
    loadComponent: () => import('./features/hotel-search/search.component')
  }
];
```

## 🔒 Security

### CSRF Protection
- Requestor interceptor can add CSRF tokens
- Backend validates CSRF tokens

### XSS Protection
- Angular sanitization by default
- Safe binding with property binding
- Template expressions escaped

### CORS
- Backend should configure CORS
- Frontend sends credentials with requests if needed

### Input Validation
- Client-side validation for UX
- Server-side validation mandatory
- No sensitive data in localStorage

## 📊 Scalability

### Future Enhancements
1. **Authentication**
   - JWT token handling
   - Auth interceptor updates
   - Role-based access control

2. **Advanced Caching**
   - HTTP response caching
   - Time-based cache invalidation
   - LocalStorage for favorites

3. **State Management**
   - NgRx for complex state
   - Redux pattern implementation
   - DevTools debugging

4. **Internationalization**
   - i18n implementation
   - Multi-language support
   - Locale-specific formatting

5. **Accessibility**
   - WCAG 2.1 compliance
   - Screen reader support
   - Keyboard navigation

## 🧪 Testing Strategy

### Unit Tests
- Component logic testing
- Service methods mocking
- Form validation testing

### Integration Tests
- Component-Service integration
- HTTP mocking with HttpClientTestingModule

### E2E Tests
- User flow testing
- Complete booking workflow
- Error scenarios

## 📚 Code Organization Guidelines

### Naming Conventions
- Components: `*.component.ts`
- Services: `*.service.ts`
- Models: `*.model.ts`
- Validators: `*.validator.ts`
- Utilities: `*.util.ts`

### File Structure
```
feature/
  ├── feature.component.ts
  ├── feature.component.html
  ├── feature.component.css
  └── feature.component.spec.ts
```

### Import Organization
1. Angular imports
2. Material imports
3. RxJS imports
4. Local service imports
5. Model imports
6. Utility imports

## 🔧 Troubleshooting

### Common Issues

**API Connection Issues**
- Check backend URL in environment.ts
- Verify backend is running
- Check CORS configuration

**Form Validation Not Working**
- Verify validators imported
- Check form control names
- Verify ReactiveForms module imported

**State Not Updating**
- Check BehaviorSubject subscription
- Verify next() called on subject
- Check unsubscribe logic

**Styling Issues**
- Verify Material theme imported in styles.css
- Check CSS specificity
- Clear browser cache
