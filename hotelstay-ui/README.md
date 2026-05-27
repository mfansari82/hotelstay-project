# HotelStay - Hotel Search & Booking Frontend

A production-grade Angular 20 frontend application for the HotelStay hotel search and booking platform. This application integrates with a .NET Core 8 backend API to provide a seamless hotel search and booking experience.

## 🏗️ Architecture Overview

### Project Structure

```
src/
├── app/
│   ├── core/
│   │   └── interceptors/          # HTTP interceptors for error handling
│   ├── features/
│   │   ├── hotel-search/          # Search component
│   │   ├── booking/               # Results and Booking components
│   │   └── booking-status/        # Booking confirmation component
│   ├── layout/                    # Main layout component
│   ├── models/                    # TypeScript interfaces and enums
│   │   ├── hotel.model.ts
│   │   ├── document.model.ts
│   │   ├── hotel-search-request.model.ts
│   │   ├── hotel-search-response.model.ts
│   │   └── booking-request.model.ts
│   ├── services/
│   │   └── services/
│   │       └── hotel.ts           # Hotel API service
│   └── shared/
│       ├── validators/            # Custom form validators
│       └── utilities/             # Helper functions
├── environments/
│   └── environment.ts             # API configuration
└── main.ts
```

### Key Design Patterns

#### 1. **Service-Based State Management**
The `HotelService` manages application state using RxJS BehaviorSubjects:
- `searchResults$` - Hotel search results
- `selectedRoom$` - Currently selected room
- `loading$` - Loading state
- `error$` - Error messages

#### 2. **Reactive Forms**
All forms use Angular Reactive Forms for:
- Stronger type safety
- Complex validation logic
- Better testability
- Dynamic form control

#### 3. **Custom Validators**
Custom validators ensure:
- Document type matches destination requirements
- Checkout date is after check-in date
- Valid destination selection
- Document number format validation

#### 4. **HTTP Interceptors**
Two interceptors handle:
- **RequestInterceptor** - Adds common headers and authentication
- **ErrorInterceptor** - Global error handling and transformation

## ✨ Features

### 1. Hotel Search
- Destination selection (domestic/international)
- Date range picker with validation
- Optional room type filtering
- Real-time validation

### 2. Results Display
- Multi-provider hotel results with badges
- Room type and pricing information
- Sortable by total price (ascending/descending)
- Amenities and star ratings display (when available)
- **Intelligent Cancellation Policy Display**:
  - If check-in is within 24 hours: Shows "Non-Refundable"
  - If check-in is 24+ hours away: Shows "Flexible (up to 24h)"

### 3. Booking
- Guest information collection (First Name, Last Name)
- Document type validation based on destination:
  - **Domestic** (Mumbai, Delhi): Accept Passport or National ID
  - **International** (New York, London, Paris): Accept Passport only
- Document number validation (alphanumeric, minimum 5 characters)
- Booking summary with pricing breakdown
- Cancellation policy display (same 24-hour logic)

### 4. Booking Confirmation
- Unique booking reference number (copyable to clipboard)
- Complete booking details display
- Status tracking (Confirmed/Pending/Failed)
- Cancellation policy display (applies same 24-hour check-in logic)
- Guest and hotel information summary
- Search again functionality

## 🚀 Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotelstay-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Edit `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7282'  // .NET Core 8 backend URL
   };
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## 🔨 Building

To build the project for production run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## 🧪 Running tests

To execute unit tests with Karma, use the following command:

```bash
npm test
```

Run tests with code coverage:

```bash
npm test -- --code-coverage
```

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
