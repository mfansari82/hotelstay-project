# HotelStay Backend API Contract

This document specifies the exact API contract that the Angular frontend expects from the .NET Core 8 backend.

## Base URL

```
Development: https://localhost:5001
Staging: https://api-staging.hotelstay.com
Production: https://api.hotelstay.com
```

Configure in `src/environments/environment.ts`

## API Endpoints

### 1. Hotel Search Endpoint

#### Request

```http
GET /api/hotels/search?destination={destination}&checkIn={date}&checkOut={date}&roomType={type}
Host: localhost:5001
Content-Type: application/json
Accept: application/json
```

**Query Parameters:**
- `destination` (required): string - Destination city name
- `checkIn` (required): string - Check-in date in YYYY-MM-DD format
- `checkOut` (required): string - Check-out date in YYYY-MM-DD format
- `roomType` (optional): string - Room type filter (Standard|Deluxe|Suite)

**Validation Requirements:**
- destination must not be empty
- checkIn must be valid ISO date format
- checkOut must be after checkIn
- If validation fails, return 400 with error message

#### Response - Success (200 OK)

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "providerId": "provider-unique-id",
        "providerName": "PremierStays",
        "hotelName": "Grand Hotel London",
        "destination": "London",
        "checkInDate": "2024-06-01",
        "checkOutDate": "2024-06-05",
        "numberOfNights": 4,
        "rooms": [
          {
            "roomType": "Standard",
            "nightlyRate": 120.50,
            "cancellationPolicy": "FreeCancellation",
            "amenities": ["WiFi", "Breakfast", "Gym"],
            "starRating": 4
          },
          {
            "roomType": "Deluxe",
            "nightlyRate": 150.00,
            "cancellationPolicy": "FreeCancellation",
            "amenities": ["WiFi", "Breakfast", "Gym", "Spa"],
            "starRating": 4
          }
        ]
      },
      {
        "providerId": "budget-provider-id",
        "providerName": "BudgetNests",
        "hotelName": "Budget Inn London",
        "destination": "London",
        "checkInDate": "2024-06-01",
        "checkOutDate": "2024-06-05",
        "numberOfNights": 4,
        "rooms": [
          {
            "roomType": "Standard",
            "nightlyRate": 80.00,
            "cancellationPolicy": "Flexible",
            "amenities": null,
            "starRating": null
          },
          {
            "roomType": "Deluxe",
            "nightlyRate": 110.00,
            "cancellationPolicy": "NonRefundable",
            "amenities": null,
            "starRating": null
          }
        ]
      }
    ],
    "totalProviders": 2,
    "unavailableProviders": []
  },
  "message": null
}
```

#### Response - Bad Request (400)

```json
{
  "success": false,
  "data": null,
  "message": "destination is required"
}
```

#### Response - Validation Error (422)

```json
{
  "success": false,
  "data": null,
  "message": "checkOut date must be after checkIn date"
}
```

**Data Type Specifications:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| providerId | string | yes | Unique identifier for provider |
| providerName | enum | yes | "PremierStays", "BudgetNests", "BoutiqueCollection" |
| hotelName | string | yes | Display name of hotel |
| destination | string | yes | Must match request destination |
| checkInDate | string(date) | yes | ISO 8601 format YYYY-MM-DD |
| checkOutDate | string(date) | yes | ISO 8601 format YYYY-MM-DD |
| numberOfNights | integer | yes | Calculated from check-in/check-out |
| roomType | enum | yes | "Standard", "Deluxe", "Suite" |
| nightlyRate | decimal | yes | Per-night rate in GBP (2 decimal places) |
| cancellationPolicy | enum | yes | "FreeCancellation", "Flexible", "NonRefundable" |
| amenities | string[] | no | Optional array of amenity names |
| starRating | number | no | Optional rating 1-5 |

---

### 2. Book Hotel Endpoint

#### Request

```http
POST /api/hotels/book
Host: localhost:5001
Content-Type: application/json
Accept: application/json
```

**Request Body:**

```json
{
  "destination": "London",
  "checkInDate": "2024-06-01",
  "checkOutDate": "2024-06-05",
  "roomType": "Deluxe",
  "providerId": "provider-unique-id",
  "providerName": "PremierStays",
  "firstName": "John",
  "lastName": "Doe",
  "documentType": "Passport",
  "documentNumber": "AB123456",
  "totalPrice": 600.00
}
```

**Validation Requirements:**
- All fields required
- firstName and lastName minimum 2 characters
- documentNumber: alphanumeric, minimum 5 characters
- Document type validation:
  - Domestic destinations (e.g., London, Manchester): Accept "Passport" or "NationalID"
  - International destinations (e.g., Paris, New York): Accept only "Passport"
- Return 422 with descriptive error message if validation fails

#### Response - Success (200 OK)

```json
{
  "success": true,
  "data": {
    "referenceNumber": "REF-2024-1234567890",
    "providerName": "PremierStays",
    "hotelName": "Grand Hotel London",
    "destination": "London",
    "checkInDate": "2024-06-01",
    "checkOutDate": "2024-06-05",
    "roomType": "Deluxe",
    "numberOfNights": 4,
    "nightlyRate": 150.00,
    "totalPrice": 600.00,
    "cancellationPolicy": "FreeCancellation",
    "firstName": "John",
    "lastName": "Doe",
    "status": "Confirmed",
    "bookingDateTime": "2024-05-27T10:30:00Z"
  },
  "message": null
}
```

**Booking Status Values:**
- "Confirmed" - Booking successfully created
- "Pending" - Booking awaiting confirmation
- "Failed" - Booking failed

#### Response - Validation Error (422)

```json
{
  "success": false,
  "data": null,
  "message": "Invalid document type for international destination. Passport required."
}
```

**Document Type Validation Messages:**
```
International destinations (non-home country):
"Invalid document type for international destination. Passport required."

Domestic destinations:
"Document type must be Passport or National ID for domestic destinations."
```

#### Response - Server Error (500)

```json
{
  "success": false,
  "data": null,
  "message": "An error occurred while processing the booking"
}
```

**Data Type Specifications:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| referenceNumber | string | yes | Unique booking reference, format: REF-YYYY-XXXXXXXXXX |
| providerName | string | yes | Hotel provider name |
| hotelName | string | yes | Hotel name |
| destination | string | yes | Booking destination |
| checkInDate | string(date) | yes | ISO 8601 format YYYY-MM-DD |
| checkOutDate | string(date) | yes | ISO 8601 format YYYY-MM-DD |
| roomType | string | yes | Room type booked |
| numberOfNights | integer | yes | Number of nights |
| nightlyRate | decimal | yes | Per-night rate (2 decimals) |
| totalPrice | decimal | yes | Total booking price (2 decimals) |
| cancellationPolicy | string | yes | Cancellation policy |
| firstName | string | yes | Guest first name |
| lastName | string | yes | Guest last name |
| status | enum | yes | "Confirmed", "Pending", "Failed" |
| bookingDateTime | string(datetime) | yes | ISO 8601 format with timezone |

---

### 3. Get Booking Status Endpoint

#### Request

```http
GET /api/hotels/booking/{referenceNumber}
Host: localhost:5001
Content-Type: application/json
Accept: application/json
```

**Path Parameters:**
- `referenceNumber` (required): string - Booking reference from booking response

#### Response - Success (200 OK)

```json
{
  "success": true,
  "data": {
    "referenceNumber": "REF-2024-1234567890",
    "providerName": "PremierStays",
    "hotelName": "Grand Hotel London",
    "destination": "London",
    "checkInDate": "2024-06-01",
    "checkOutDate": "2024-06-05",
    "roomType": "Deluxe",
    "numberOfNights": 4,
    "nightlyRate": 150.00,
    "totalPrice": 600.00,
    "cancellationPolicy": "FreeCancellation",
    "firstName": "John",
    "lastName": "Doe",
    "status": "Confirmed",
    "bookingDateTime": "2024-05-27T10:30:00Z"
  },
  "message": null
}
```

#### Response - Not Found (404)

```json
{
  "success": false,
  "data": null,
  "message": "Booking not found with reference: REF-2024-1234567890"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-----------|
| 200 | OK | Successful request |
| 400 | Bad Request | Missing required fields, invalid format |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error (document type, dates, etc.) |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "message": "Detailed error message for user"
}
```

### Validation Error Messages

Clear, user-friendly messages must be provided:

```
✓ "destination is required"
✓ "checkOut date must be after checkIn date"
✓ "Invalid document type for international destination. Passport required."
✓ "Document number must be alphanumeric and at least 5 characters"
✓ "First name must be at least 2 characters"

✗ "Invalid input"
✗ "Error"
✗ "Bad request"
```

---

## Provider Information

### Provider Definitions

**PremierStays**
- Response field naming: PascalCase JSON
- Returns: Full hotel details (amenities, star rating)
- Cancellation policies: "FreeCancellation" (up to 48h), "NonRefundable"
- Always returns all requested room types with "available": true

**BudgetNests**
- Response field naming: snake_case JSON (backend normalizes to PascalCase)
- Returns: Minimal detail (no amenities, no star rating)
- Cancellation policies: "Flexible" (up to 24h), "NonRefundable"
- May return some room types with "available": false (backend filters these out)

**BoutiqueCollection** (Live Tweak)
- Rate structure: base nightly rate + £15 boutique fee per night
- Supports: Deluxe and Suite only (Standard returns unavailable)
- Cancellation policy: "FreeCancellation" (up to 72h)
- Returns availability as boolean per room type

---

## Destinations

### Valid Destinations

**Domestic** (requires Passport or National ID):
- London
- Manchester

**International** (requires Passport only):
- Paris
- New York
- Tokyo
- Sydney
- Dubai

*Note: Backend should validate destination and document type accordingly*

---

## CORS Configuration

Backend must configure CORS to allow requests from frontend domain:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", 
        builder => builder
            .WithOrigins("http://localhost:4200", "https://app.hotelstay.com")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});
```

---

## Testing Checklist

- [ ] All endpoints return proper HTTP status codes
- [ ] Error responses include user-friendly messages
- [ ] Date format is consistent (YYYY-MM-DD)
- [ ] Decimal values have 2 decimal places
- [ ] DateTime includes timezone (ISO 8601)
- [ ] Provider data is properly normalized
- [ ] Document validation works for all destination types
- [ ] Reference numbers are unique and deterministic
- [ ] Status field reflects actual booking state
- [ ] CORS headers are configured

---

## Example cURL Requests

### Search Hotels
```bash
curl -X GET "https://localhost:5001/api/hotels/search?destination=London&checkIn=2024-06-01&checkOut=2024-06-05&roomType=Deluxe" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

### Book Hotel
```bash
curl -X POST "https://localhost:5001/api/hotels/book" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "London",
    "checkInDate": "2024-06-01",
    "checkOutDate": "2024-06-05",
    "roomType": "Deluxe",
    "providerId": "premier-1",
    "providerName": "PremierStays",
    "firstName": "John",
    "lastName": "Doe",
    "documentType": "Passport",
    "documentNumber": "AB123456",
    "totalPrice": 600.00
  }'
```

### Get Booking Status
```bash
curl -X GET "https://localhost:5001/api/hotels/booking/REF-2024-1234567890" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```
