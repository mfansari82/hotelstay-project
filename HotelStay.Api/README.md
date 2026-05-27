# 🏨 HotelStay API - Backend Project

> A production-ready ASP.NET Core 8.0 API for aggregating hotel search and booking across multiple providers with Clean Architecture and CQRS patterns.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Framework](https://img.shields.io/badge/.NET-8.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📚 Table of Contents

- [🏗️ Architecture Overview](#-architecture-overview)
- [📁 Project Structure](#-project-structure)
- [🎯 Key Design Patterns](#-key-design-patterns)
- [✨ Features](#-features)
- [🚀 Development Server](#-development-server)
- [⚙️ Setup Instructions](#️-setup-instructions)
- [🧪 Running Tests](#-running-tests)
- [📡 API Documentation](#-api-documentation)
- [🔧 Configuration](#-configuration)
- [📊 Database](#-database)
- [🛠️ Building & Deployment](#️-building--deployment)
- [📖 Documentation](#-documentation)

---

## 🏗️ Architecture Overview

HotelStay is built using **Clean Architecture** principles with the following layers:

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│         Presentation Layer (HotelStay.Api)              │
│  (ASP.NET Core Minimal APIs, CORS, Swagger)             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│      Application Layer (HotelStay.Application)          │
│  (MediatR, CQRS, Validation, Orchestrators)             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Domain Layer (HotelStay.Domain)                 │
│    (Entities, Enums, Business Rules)                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│     Infrastructure Layer (HotelStay.Infrastructure)     │
│  (EF Core, Database, Providers, Repositories)           │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
HotelStay.Api/                          # Presentation Layer
├── Program.cs                          # Entry point & configuration
├── Middleware/
│   └── GlobalExceptionHandler.cs      # Centralized error handling
├── appsettings.json                   # Configuration file
├── Properties/
│   └── launchSettings.json            # Launch profiles
└── logs/                              # Serilog output directory

HotelStay.Application/                  # Application Layer (CQRS)
├── Features/Hotels/
│   ├── SearchHotels/                  # Search feature
│   │   ├── SearchHotelsQuery.cs
│   │   ├── SearchHotelsQueryHandler.cs
│   │   ├── SearchHotelsQueryValidator.cs
│   │   └── SearchHotelsResponse.cs
│   ├── BookHotel/                     # Booking feature
│   │   ├── BookHotelCommand.cs
│   │   ├── BookHotelHandler.cs
│   │   ├── BookHotelCommandValidator.cs
│   │   └── BookHotelResponse.cs
│   └── GetBooking/                    # Status feature
│       ├── GetBookingQuery.cs
│       ├── GetBookingHandler.cs
│       └── GetBookingResponse.cs
├── Interfaces/                         # Service contracts
│   ├── IHotelProvider.cs
│   ├── IHotelSearchOrchestrator.cs
│   ├── IHotelBookingOrchestrator.cs
│   └── IHotelBookingStatusOrchestrator.cs
├── Services/                           # Orchestrators
│   ├── HotelSearchOrchestrator.cs
│   ├── HotelBookingOrchestrator.cs
│   └── HotelBookingStatusOrchestrator.cs
├── DTOs/                               # Data transfer objects
│   ├── HotelSearchRequestDto.cs
│   ├── HotelSearchResponseDto.cs
│   ├── BookingRequestDto.cs
│   ├── BookingResponseDto.cs
│   └── BookingStatusDto.cs
└── Behaviors/                          # Pipeline behaviors
    └── ValidationBehavior.cs           # Validation middleware

HotelStay.Domain/                       # Domain Layer
├── Entities/
│   ├── Hotel.cs                       # Hotel entity
│   ├── Booking.cs                     # Booking entity
│   └── Destination.cs                 # Destination entity
└── Enums/
    ├── BookingStatus.cs               # Status enumeration
    ├── RoomType.cs                    # Room types
    ├── CancellationPolicy.cs          # Cancellation policies
    └── DocumentType.cs                # Document types

HotelStay.Infrastructure/               # Infrastructure Layer
├── Persistence/
│   └── ApplicationDbContext.cs        # EF Core DbContext
├── Providers/                          # Hotel provider implementations
│   ├── PremierStaysProvider.cs        # Premium provider
│   └── BudgetNestsProvider.cs         # Budget provider
├── Seed/
│   └── DatabaseSeeder.cs              # Data initialization
└── Migrations/                         # EF Core migrations

HotelStay.Tests/                        # Test Layer
├── Features/                           # Feature tests
├── Orchestrators/                      # Orchestrator tests
└── InfrastuctureProvider/             # Provider tests
```

---

## 🎯 Key Design Patterns

### 1. **Clean Architecture**
Separation of concerns across 4 independent layers with strict dependency rules.

### 2. **CQRS (Command Query Responsibility Segregation)**
- **Queries**: `SearchHotelsQuery`, `GetBookingQuery` (read operations)
- **Commands**: `BookHotelCommand` (write operations)

### 3. **Strategy Pattern**
Multiple hotel provider implementations (`PremierStays`, `BudgetNests`) interchangeable at runtime.

### 4. **Mediator Pattern**
MediatR for decoupled request/response handling with pipeline behaviors.

### 5. **Repository Pattern**
Entity Framework Core abstracts database access.

### 6. **Dependency Injection**
Built-in ASP.NET Core DI container for service management.

### 7. **Pipeline Behavior Pattern**
Cross-cutting concerns (validation, logging) handled separately.

---

## ✨ Features

### 🔍 Hotel Search
- Search across multiple providers simultaneously
- Filter by destination, check-in/out dates, and room type
- Real-time availability checking
- Unified pricing information
- Detailed amenities and ratings
- Flexible cancellation policies

**Endpoint**: `GET /hotels/search`

### 🛏️ Hotel Booking
- Complete booking workflow
- Guest information capture
- Document validation (Passport, NationalID, etc.)
- Reference number generation
- Real-time booking confirmation
- Automatic booking status tracking

**Endpoint**: `POST /hotels/book`

### 📊 Booking Status
- Track booking status anytime
- Retrieve complete booking details
- View cancellation policies
- Check pricing information
- Provider-specific tracking

**Endpoint**: `GET /hotels/booking/{reference}/{provider}`

### 🔒 Comprehensive Validation
- Input validation for all requests
- Business rule validation
- Document type validation
- Date range validation
- Detailed error messages

### 📝 Professional API
- Swagger/OpenAPI documentation
- Structured error responses
- Proper HTTP status codes
- JSON request/response format
- CORS enabled

### 📊 Logging & Monitoring
- Structured logging with Serilog
- Console and file output
- Daily rotating logs
- Exception tracking
- Request/response logging

### 🛡️ Error Handling
- Global exception handler
- Validation error handling
- Graceful error responses
- Security-conscious (no stack traces)
- Detailed logging for debugging

---

## 🚀 Development Server

### Prerequisites
- .NET SDK 8.0 or higher
- SQL Server (LocalDB or instance)
- Visual Studio 2022 or VS Code with C# extension

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HotelStay
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Update database connection**
   Edit `HotelStay.Api/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=.\\SQLEXPRESS;Database=HotelStayDb;Trusted_Connection=true;"
     }
   }
   ```

4. **Create database**
   ```bash
   cd HotelStay.Api
   dotnet ef database update
   ```

5. **Run the API**
   ```bash
   dotnet run
   ```

   The API will start at: `https://localhost:7001`

6. **Access Swagger Documentation**
   Navigate to: `https://localhost:7001/swagger`

---

## ⚙️ Setup Instructions

### Complete Setup Guide

#### Step 1: Prerequisites Installation
```bash
# Verify .NET 8.0 installation
dotnet --version

# Should output: 8.x.x
```

#### Step 2: Clone Repository
```bash
git clone <repository-url>
cd HotelStay
```

#### Step 3: Install Dependencies
```bash
# Restore all project dependencies
dotnet restore

# Or use package manager
# NuGet Package Manager > Restore
```

#### Step 4: Database Setup

**Option A: Using LocalDB (Windows)**
```bash
# Create database using migrations
cd HotelStay.Api
dotnet ef database update
```

**Option B: Using SQL Server Instance**
```bash
# Update connection string in appsettings.json
# Then run migrations
cd HotelStay.Api
dotnet ef database update
```

**Option C: Manual Database Creation**
```sql
-- In SQL Server Management Studio
CREATE DATABASE HotelStayDb;
GO

-- Use migrations to create tables
dotnet ef database update
```

#### Step 5: Seed Initial Data
The database is automatically seeded with sample data when the application starts. The seeding includes:
- 10+ sample hotels from PremierStays
- 10+ sample hotels from BudgetNests
- Multiple destinations
- Sample bookings for reference

#### Step 6: Configure Application Settings
Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=HotelStayDb;Trusted_Connection=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

#### Step 7: Build the Solution
```bash
# Build all projects
dotnet build

# Or specific project
dotnet build HotelStay.Api
```

#### Step 8: Run the API
```bash
cd HotelStay.Api
dotnet run

# Or with watch mode (auto-restart on changes)
dotnet watch run
```

#### Step 9: Verify Installation
1. Open browser: `https://localhost:7001`
2. Should see: "HotelStay API Running"
3. Open Swagger: `https://localhost:7001/swagger`
4. Should see all API endpoints documented

#### Step 10: Configure Frontend Connection (Angular)
In Angular project, update API endpoint:
```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'https://localhost:7001'
};

// src/environments/environment.prod.ts
export const environment = {
  apiUrl: 'https://api.hotelstay.com'  // Production API
};
```

---

## 🧪 Running Tests

### Unit Tests
```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test HotelStay.Tests

# Run with verbose output
dotnet test --verbosity detailed

# Run specific test class
dotnet test --filter "HotelStay.Tests.Features.SearchHotel"

# Run with code coverage
dotnet test /p:CollectCoverage=true
```

### Test Categories

#### Feature Tests
```bash
dotnet test HotelStay.Tests --filter "Category=Feature"
```

#### Orchestrator Tests
```bash
dotnet test HotelStay.Tests --filter "Category=Orchestrator"
```

#### Provider Tests
```bash
dotnet test HotelStay.Tests --filter "Category=Provider"
```

### Running Tests in Visual Studio
1. Open Test Explorer: `Test` → `Test Explorer`
2. Click "Run All Tests"
3. View results in Test Explorer window
4. Click on test to view details

---

## 📡 API Documentation

### Health Check
**Endpoint**: `GET /`
**Response**: `"HotelStay API Running"`

### Search Hotels
```http
GET /hotels/search?destination=New York&checkIn=2026-06-01&checkOut=2026-06-05&roomType=Deluxe
```

**Query Parameters**:
- `destination` (string, required): City name
- `checkIn` (datetime, required): Check-in date
- `checkOut` (datetime, required): Check-out date
- `roomType` (string, optional): Standard | Deluxe | Suite

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
  }
]
```

### Book Hotel
```http
POST /hotels/book
Content-Type: application/json

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

### Get Booking Status
```http
GET /hotels/booking/HS-20260527-001/PremierStays
```

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

### Error Response
**Status**: 422 Unprocessable Entity
```json
{
  "statusCode": 422,
  "errors": [
    "Passenger name must be between 2 and 100 characters",
    "Document number must be at least 5 characters"
  ]
}
```

---

## 🔧 Configuration

### appsettings.json Structure
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=HotelStayDb;..."
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "System": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Environment-Specific Settings
- `appsettings.Development.json` - Development configuration
- `appsettings.Production.json` - Production configuration

### Supported Enumerations

**RoomType**:
- Standard (0)
- Deluxe (1)
- Suite (2)

**BookingStatus**:
- Confirmed (0)
- Pending (1)
- Cancelled (2)

**CancellationPolicy**:
- Free (0)
- Paid (1)
- NonRefundable (2)

**DocumentType**:
- Passport (0)
- NationalID (1)
- DriverLicense (2)
- Visa (3)

---

## 📊 Database

### Database Schema

#### Hotels Table
```sql
CREATE TABLE Hotels (
    Id INT PRIMARY KEY IDENTITY,
    Name NVARCHAR(MAX) NOT NULL,
    ProviderName NVARCHAR(MAX) NOT NULL,
    RoomType INT NOT NULL,
    PricePerNight DECIMAL(18,2) NOT NULL,
    CancellationPolicy INT NOT NULL,
    Amenities NVARCHAR(MAX),
    StarRating INT,
    City NVARCHAR(MAX) NOT NULL,
    IsAvailable BIT NOT NULL
)
```

#### Bookings Table
```sql
CREATE TABLE Bookings (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ReferenceNumber NVARCHAR(MAX) NOT NULL,
    PassengerName NVARCHAR(MAX) NOT NULL,
    DocumentNumber NVARCHAR(MAX) NOT NULL,
    DocumentType INT NOT NULL,
    CheckIn DATETIME NOT NULL,
    CheckOut DATETIME NOT NULL,
    TotalPrice DECIMAL(18,2) NOT NULL,
    Status INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    HotelId INT NOT NULL,
    FOREIGN KEY (HotelId) REFERENCES Hotels(Id)
)
```

### Database Seeding
Automatic seeding occurs on application startup with:
- 10+ premium hotels (PremierStays)
- 10+ budget hotels (BudgetNests)
- Multiple cities
- Sample bookings

---

## 🛠️ Building & Deployment

### Build Commands
```bash
# Debug build
dotnet build

# Release build
dotnet build --configuration Release

# Build specific project
dotnet build HotelStay.Api
```

### Publish for Deployment
```bash
# Publish as self-contained
dotnet publish -c Release -o ./publish

# Publish framework-dependent
dotnet publish -c Release --no-self-contained
```

### Running Published Build
```bash
# Windows
./HotelStay.Api.exe

# Linux/Mac
./HotelStay.Api
```

### Docker Deployment (Optional)
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY published /app
EXPOSE 80
ENTRYPOINT ["dotnet", "HotelStay.Api.dll"]
```

---

## 📖 Documentation

### Available Documentation Files

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Complete architecture overview, design patterns, data flow |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Detailed implementation of all features and components |
| [CHECKLIST.md](CHECKLIST.md) | Project requirements checklist and completion status |
| [README.md](README.md) | This file - quick start and setup guide |

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | ASP.NET Core | 8.0 |
| Language | C# | 12.0 |
| Database | SQL Server | Latest |
| ORM | Entity Framework Core | 8.0.8 |
| CQRS/Mediator | MediatR | Latest |
| Validation | FluentValidation | 11.3.1 |
| Logging | Serilog | 10.0.0 |
| Resilience | Polly | Latest |
| API Docs | Swagger/OpenAPI | 10.1.7 |

---

## 🔐 Security Considerations

### Implemented
✅ Input validation (FluentValidation)  
✅ Global exception handling  
✅ CORS configuration  
✅ No sensitive data in responses  
✅ SQL injection prevention (EF Core)  

### Recommended for Production
🔒 HTTPS/SSL certificates  
🔒 JWT authentication  
🔒 Role-based authorization  
🔒 Rate limiting  
🔒 API versioning  
🔒 Secrets management  

---

## 🚨 Troubleshooting

### Common Issues

**Issue**: Database connection failed
```bash
# Check connection string in appsettings.json
# Verify SQL Server is running
# Try creating database manually

dotnet ef database create
```

**Issue**: Migration conflicts
```bash
# Remove pending migrations
dotnet ef migrations remove

# Create new migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

**Issue**: Port already in use
```bash
# Change port in launchSettings.json
"profiles": {
  "https": {
    "commandName": "Project",
    "applicationUrl": "https://localhost:7002;http://localhost:5001"
  }
}
```

**Issue**: Swagger not loading
```bash
# Ensure development environment
# Check if UseSwagger/UseSwaggerUI in Program.cs
# Clear browser cache
```

---

## 📞 Support & Contact

For issues, questions, or contributions:
1. Check the documentation files
2. Review API logs in `logs/` directory
3. Check Swagger UI for endpoint details
4. Refer to IMPLEMENTATION_SUMMARY.md for technical details

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🎉 Quick Links

- 🏗️ [Architecture Details](ARCHITECTURE.md)
- 📋 [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- ✅ [Project Checklist](CHECKLIST.md)
- 📡 [Swagger API Docs](https://localhost:7001/swagger)

---

## 🚀 Next Steps

1. ✅ **Run the API**: `dotnet run` in HotelStay.Api folder
2. ✅ **Check Swagger**: Visit `https://localhost:7001/swagger`
3. ✅ **Test Endpoints**: Use Swagger UI or Postman
4. ✅ **Connect Angular Frontend**: Update API endpoint in environment files
5. ✅ **Deploy to Production**: Follow deployment guide

---

**Happy Booking! 🎉**

The HotelStay API is ready for production. Integrate with your frontend and start aggregating hotel bookings today!

