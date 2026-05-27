# 🏗️ Architecture Overview

## Project Description

**HotelStay** is a modern hotel booking aggregation platform built with **Clean Architecture** principles. It integrates multiple hotel providers (PremierStays and BudgetNests) and provides a unified API for searching and booking hotels.

---

## Architecture Layers

### 1. **Presentation Layer** (HotelStay.Api)
- **Framework**: ASP.NET Core 8.0
- **Entry Point**: Minimal APIs (MapGet, MapPost)
- **Responsibilities**:
  - Request handling and routing
  - Response serialization
  - Global exception handling
  - CORS configuration
  - Swagger/OpenAPI documentation

### 2. **Application Layer** (HotelStay.Application)
- **Framework**: MediatR (CQRS Pattern)
- **Responsibilities**:
  - Business logic orchestration
  - Request/Response DTOs
  - Command handlers and query handlers
  - Validation logic (FluentValidation)
  - Pipeline behaviors (cross-cutting concerns)

### 3. **Domain Layer** (HotelStay.Domain)
- **Responsibilities**:
  - Core business entities (Booking, Hotel, Destination)
  - Domain enums (BookingStatus, RoomType, CancellationPolicy, DocumentType)
  - Business rules and domain logic
  - **Zero dependency** on external frameworks

### 4. **Infrastructure Layer** (HotelStay.Infrastructure)
- **Framework**: Entity Framework Core 8.0 with SQL Server
- **Responsibilities**:
  - Database persistence (ApplicationDbContext)
  - Hotel provider implementations (Strategy Pattern)
  - Data seeding
  - Repository pattern (if applicable)

---

## 🔄 Application Flow

### Flow Diagram

```
Client Request → Minimal API Endpoint → MediatR Sender
                                            ↓
                                    Validation Behavior
                                            ↓
                                    Query/Command Handler
                                            ↓
                                    Orchestrator Service
                                            ↓
                                    Hotel Provider (Strategy)
                                            ↓
                                    Database/External API
                                            ↓
                                    Response DTO → Client
```

### Request Handling Steps

1. **Request Arrives**: Client sends HTTP request to Minimal API endpoint
2. **Routing**: ASP.NET Core routes to appropriate endpoint
3. **MediatR Processing**: 
   - Query/Command is sent to MediatR sender
   - Pipeline behaviors are executed (Validation)
   - Handler processes the request
4. **Orchestration**: 
   - Orchestrator delegates to appropriate hotel provider(s)
   - Handles multi-provider coordination
5. **Data Access**: 
   - Provider queries database via EF Core
   - Returns normalized DTOs
6. **Response**: 
   - Results returned to client as JSON

---

## 🔄 Data Flow

### Hotel Search Data Flow

```
SearchHotelsQuery (Request)
         ↓
Validation (FluentValidation)
         ↓
SearchHotelsQueryHandler
         ↓
HotelSearchOrchestrator
         ↓
[PremierStaysProvider] ──┐
[BudgetNestsProvider] ───┤
         ↓
ApplicationDbContext (EF Core)
         ↓
Hotels Table
         ↓
HotelSearchResponseDto[] (Aggregated & Normalized)
         ↓
Client Response
```

### Hotel Booking Data Flow

```
BookHotelCommand (Request)
         ↓
Validation (FluentValidation)
         ↓
BookHotelCommandHandler
         ↓
HotelBookingOrchestrator
         ↓
Selected Provider (Based on Provider Name)
         ↓
ApplicationDbContext (EF Core)
         ↓
Bookings & Hotels Tables
         ↓
BookingResponseDto (with Reference Number)
         ↓
Client Response
```

### Booking Status Data Flow

```
GetBookingQuery (Reference & Provider)
         ↓
GetBookingQueryHandler
         ↓
HotelBookingStatusOrchestrator
         ↓
ApplicationDbContext (EF Core)
         ↓
Bookings Table (Query by Reference & Provider)
         ↓
BookingStatusDto
         ↓
Client Response
```

---

## Service Layer / Orchestrator Layer

### Purpose
The orchestrator layer acts as a **facade** that:
- Coordinates multiple hotel providers
- Normalizes data from different providers
- Handles provider-specific logic
- Implements the **Strategy Pattern** for provider selection

### Orchestrators Implemented

#### 1. **HotelSearchOrchestrator** (`IHotelSearchOrchestrator`)
**Responsibility**: Aggregate hotel search results from multiple providers

**Key Features**:
- Iterates through all registered providers (PremierStays, BudgetNests)
- Executes search queries in parallel-ready structure
- Filters unavailable hotels
- Normalizes DTOs to unified format
- Aggregates results for client response

**Method**:
```csharp
Task<List<HotelSearchResponseDto>> SearchAsync(
    HotelSearchRequestDto request, 
    CancellationToken cancellationToken = default)
```

---

#### 2. **HotelBookingOrchestrator** (`IHotelBookingOrchestrator`)
**Responsibility**: Route booking requests to the correct provider

**Key Features**:
- Locates provider by name (case-insensitive)
- Delegates booking to selected provider
- Adds provider information to response
- Throws error if provider not found

**Method**:
```csharp
Task<BookingResponseDto> BookAsync(
    BookingRequestDto request, 
    CancellationToken cancellationToken = default)
```

---

#### 3. **HotelBookingStatusOrchestrator** (`IHotelBookingStatusOrchestrator`)
**Responsibility**: Retrieve booking status information

**Key Features**:
- Queries bookings by reference number
- Filters by provider
- Returns complete booking details including cancellation policy
- Lazy-loads related hotel information

**Method**:
```csharp
Task<BookingStatusDto> GetAsync(
    string reference, 
    string provider, 
    CancellationToken cancellationToken = default)
```

---

## Design Patterns Used

### 1. **Strategy Pattern** (Hotel Providers)
- **Multiple Implementations**: PremierStaysProvider, BudgetNestsProvider
- **Interface**: `IHotelProvider`
- **Registration**: Scoped dependency injection
- **Benefit**: Easy to add new providers without modifying existing code

### 2. **CQRS Pattern** (Command Query Responsibility Segregation)
- **Queries** (Read): SearchHotelsQuery, GetBookingQuery
- **Commands** (Write): BookHotelCommand
- **Benefit**: Clear separation of read and write operations

### 3. **Mediator Pattern** (MediatR)
- **Central Hub**: MediatR IMediator interface
- **Benefits**:
  - Decouples request from handler
  - Enables pipeline behaviors (validation, logging)
  - Simplifies testing

### 4. **Repository Pattern** (Entity Framework)
- **ORM**: Entity Framework Core 8.0
- **DbContext**: ApplicationDbContext
- **Entities**: Hotel, Booking, Destination
- **Database**: SQL Server

### 5. **Dependency Injection**
- **Container**: Built-in ASP.NET Core DI container
- **Lifetimes**: Scoped services for database context
- **Configuration**: Program.cs central configuration

---

## 📡 API Endpoints

### 1. **Health Check Endpoint**
```http
GET /
```
**Response**: `"HotelStay API Running"`

---

### 2. **Search Hotels Endpoint**
```http
GET /hotels/search?destination=New York&checkIn=2026-06-01&checkOut=2026-06-05&roomType=Deluxe
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `destination` | string | Yes | City or destination name |
| `checkIn` | DateTime | Yes | Check-in date (format: YYYY-MM-DD) |
| `checkOut` | DateTime | Yes | Check-out date (format: YYYY-MM-DD) |
| `roomType` | string | No | Room type (Standard, Deluxe, Suite) |

**Response** (200 OK):
```json
[
  {
    "provider": "PremierStays",
    "hotelName": "Grand Plaza Hotel",
    "roomType": "Deluxe",
    "pricePerNight": 150.00,
    "totalPrice": 600.00,
    "cancellationPolicy": "Free",
    "amenities": ["WiFi", "Gym", "Spa"],
    "starRating": 5,
    "isAvailable": true
  },
  {
    "provider": "BudgetNests",
    "hotelName": "Cozy Inn",
    "roomType": "Standard",
    "pricePerNight": 80.00,
    "totalPrice": 320.00,
    "cancellationPolicy": "Paid",
    "amenities": ["WiFi", "Breakfast"],
    "starRating": 3,
    "isAvailable": true
  }
]
```

---

### 3. **Book Hotel Endpoint**
```http
POST /hotels/book
```

**Request Body**:
```json
{
  "provider": "PremierStays",
  "hotelName": "Grand Plaza Hotel",
  "checkIn": "2026-06-01",
  "checkOut": "2026-06-05",
  "numberOfGuests": 2,
  "passengerName": "John Doe",
  "documentType": "Passport",
  "documentNumber": "AB123456",
  "destination": "New York"
}
```

**Request Parameters**:
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `provider` | string | Yes | Must match registered provider name |
| `hotelName` | string | Yes | Must exist in provider's catalog |
| `checkIn` | DateTime | Yes | Must be future date |
| `checkOut` | DateTime | Yes | Must be after checkIn |
| `numberOfGuests` | int | Yes | Must be > 0 |
| `passengerName` | string | Yes | Min 2 chars, Max 100 chars |
| `documentType` | DocumentType | Yes | Passport, NationalID, DriverLicense, Visa |
| `documentNumber` | string | Yes | Min 5 chars, Max 50 chars |
| `destination` | string | Yes | Must match search destination |

**Response** (200 OK):
```json
{
  "referenceNumber": "HS-20260527-001",
  "hotelName": "Grand Plaza Hotel",
  "checkInDate": "2026-06-01",
  "checkOutDate": "2026-06-05",
  "totalPrice": 600.00,
  "passengerName": "John Doe",
  "status": "Confirmed",
  "provider": "PremierStays"
}
```

**Error Response** (422 Unprocessable Entity - Validation Error):
```json
{
  "statusCode": 422,
  "errors": [
    "Passenger name is required",
    "Document number must be at least 5 characters"
  ]
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "statusCode": 500,
  "message": "An error occurred while processing your request"
}
```

---

### 4. **Get Booking Status Endpoint**
```http
GET /hotels/booking/{reference}/{provider}
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `reference` | string | Booking reference number (e.g., HS-20260527-001) |
| `provider` | string | Hotel provider name (PremierStays or BudgetNests) |

**Response** (200 OK):
```json
{
  "referenceNumber": "HS-20260527-001",
  "provider": "PremierStays",
  "hotelName": "Grand Plaza Hotel",
  "passengerName": "John Doe",
  "checkInDate": "2026-06-01",
  "checkOutDate": "2026-06-05",
  "totalPrice": 600.00,
  "bookingStatus": "Confirmed",
  "cancellationPolicy": "Free",
  "createdAt": "2026-05-27T10:30:00Z"
}
```

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | ASP.NET Core | 8.0 |
| **Database** | SQL Server | Latest |
| **ORM** | Entity Framework Core | 8.0.8 |
| **Business Logic** | MediatR | Latest |
| **Validation** | FluentValidation | 11.3.1 |
| **Logging** | Serilog | 10.0.0 |
| **Resilience** | Polly | Latest |
| **API Documentation** | Swagger/OpenAPI | 10.1.7 |
| **Language** | C# | 12.0 |

---

## Configuration & Setup

### Database Connection
Location: `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=HotelStayDb;Trusted_Connection=true;"
  }
}
```

### Logging Configuration
Location: `Program.cs` → Serilog setup
- **Output**: Console and rolling file logs (daily)
- **Log Path**: `logs/hotelstay-{date}.txt`
- **Enrichment**: Request context

### CORS Configuration
- **Policy Name**: AllowAngular
- **Origin**: Allow any origin
- **Methods**: Allow any method
- **Headers**: Allow any header

---

## Resilience & Error Handling

### Global Exception Handler
- **Location**: `HotelStay.Api/Middleware/GlobalExceptionHandler.cs`
- **Handles**:
  - Validation exceptions (422 Unprocessable Entity)
  - Generic exceptions (500 Internal Server Error)
  - Logs all exceptions

### Polly Retry Policy
- **HTTP Client**: Named client "HotelProviders"
- **Policy**: Exponential backoff retry
- **Max Retries**: 3
- **Handles**: Transient HTTP failures

---

## Extension Points

### Adding a New Hotel Provider

1. **Create Provider Class**: Implement `IHotelProvider`
   ```csharp
   public class MyHotelProvider : IHotelProvider
   {
       public string ProviderName => "MyHotel";
       
       public async Task<List<HotelSearchResponseDto>> SearchAsync(...)
       {
           // Implementation
       }
       
       public async Task<BookingResponseDto> BookAsync(...)
       {
           // Implementation
       }
   }
   ```

2. **Register in DI Container**: In `Program.cs`
   ```csharp
   builder.Services.AddScoped<IHotelProvider, MyHotelProvider>();
   ```

3. **Database Seeds**: Add hotel data for the new provider via `DatabaseSeeder`

### Adding a New Feature

1. **Create Feature Folder**: `HotelStay.Application/Features/{FeatureName}/`
2. **Create Query/Command**: Implement `IRequest<T>`
3. **Create Handler**: Implement `IRequestHandler<TRequest, TResponse>`
4. **Create Validator**: Implement `AbstractValidator<TRequest>`
5. **Create Endpoint**: Add in `Program.cs` using `app.MapGet` or `app.MapPost`

---

## Security Considerations

- ✅ Input validation via FluentValidation
- ✅ Global exception handling (no sensitive info exposure)
- ✅ Document validation (Passport, NationalID, etc.)
- ✅ CORS configuration for cross-origin requests
- ⚠️ **TODO**: Add Authentication (JWT tokens)
- ⚠️ **TODO**: Add Authorization (Role-based)
- ⚠️ **TODO**: Add HTTPS enforcement in production

---

## Performance Optimizations

- **Async/Await**: All I/O operations are asynchronous
- **Entity Framework Projections**: Using `.Select()` for minimal data transfer
- **Multi-provider Search**: Can be parallelized with `Task.WhenAll()`
- **Logging**: Structured logging with Serilog for easy debugging

---

## Future Enhancements

1. **Caching**: Add Redis for frequently searched hotels
2. **Rate Limiting**: Implement API rate limiting
3. **Authentication**: JWT-based user authentication
4. **Payment Gateway**: Integrate payment processing
5. **Reviews & Ratings**: Add guest review system
6. **Recommendations**: ML-based hotel recommendations
7. **Multi-language Support**: i18n for API responses

