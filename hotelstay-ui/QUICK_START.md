# Quick Start Guide - HotelStay Frontend

## 5-Minute Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- .NET Core 8 backend running

### Installation

```bash
# Navigate to project
cd hotelstay-ui

# Install dependencies
npm install

# Start development server
npm start
```

Navigate to `http://localhost:4200`

## Configuration

### API URL Setup

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001'  // ← Update this URL
};
```

**For Production:**

Edit `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.hotelstay.com'
};
```

## Common Commands

```bash
# Development server
npm start

# Build production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --code-coverage

# Build with SSR
npm run build:ssr

# Serve SSR
npm run serve:ssr:hotelstay-ui

# Code quality check
ng lint
```

## Project Structure Quick Reference

```
src/app/
├── core/                    # Interceptors, guards
├── features/               # Feature modules
│   ├── hotel-search/       # Search page
│   ├── booking/            # Results & Booking pages
│   └── booking-status/     # Confirmation page
├── layout/                 # Main layout shell
├── models/                 # TypeScript interfaces
├── services/               # API services
├── shared/                 # Validators, utilities
├── app.routes.ts          # Route configuration
├── app.config.ts          # App configuration
└── app.ts                 # Root component
```

## Development Workflow

### 1. Create New Component

```bash
ng generate component features/my-feature/my-feature
```

### 2. Add New Service

```bash
ng generate service services/my-service
```

### 3. Add New Model

Create file in `src/app/models/my-model.ts`

### 4. Add Validation

Add to `src/app/shared/validators/custom-validators.ts`

## Testing Locally

### Test Search Flow
1. Go to home page
2. Enter London, future dates, pick room type
3. Click "Search Hotels"
4. Should see results from multiple providers

### Test Booking Flow
1. From results, click "Select" on a room
2. Enter guest name and valid document
3. Click "Confirm Booking"
4. Should see confirmation page with reference

### Test Validation
- Try checkout before checkin → Error
- Try invalid destination → Error
- Try international destination without Passport → Error
- Try short document number → Error

## Debugging Tips

### Check API Connection
```typescript
// In browser console
localStorage.setItem('debug', 'true');
// Reload page to see API calls
```

### Inspect Component State
```typescript
// In component
console.log(this.hotelService.searchResults$ | async);
console.log(this.hotelService.selectedRoom$ | async);
```

### Form Debugging
```typescript
// In component template
{{ searchForm.valid }}
{{ searchForm.errors | json }}
{{ searchForm.get('destination')?.errors | json }}
```

## Common Issues & Solutions

### API Connection Timeout
```
❌ Problem: Cannot reach backend
✅ Solution: 
   - Check backend is running on correct port
   - Verify API URL in environment.ts
   - Check CORS configuration on backend
```

### Form Validation Not Working
```
❌ Problem: Validators not firing
✅ Solution:
   - Verify ReactiveFormsModule imported
   - Check validator is added to form control
   - Verify validator function signature
```

### Styling Not Applied
```
❌ Problem: Material theme not showing
✅ Solution:
   - Check Material theme in styles.css
   - Clear browser cache
   - Restart dev server
```

### State Not Updating
```
❌ Problem: Results not displaying
✅ Solution:
   - Verify BehaviorSubject.next() called
   - Check subscription is not unsubscribed
   - Verify async pipe in template
```

## Best Practices

### ✅ DO

- Use typed reactive forms
- Subscribe with takeUntil(destroy$)
- Unsubscribe in ngOnDestroy
- Handle loading states
- Show error messages to users
- Validate on both client and server
- Use async pipe in templates
- Keep components focused

### ❌ DON'T

- Don't use template-driven forms
- Don't subscribe without unsubscribing
- Don't put business logic in components
- Don't ignore error responses
- Don't skip server-side validation
- Don't use string literals for routes
- Don't ignore loading states
- Don't make components do too much

## Performance Checklist

- [ ] Minimize bundle size
- [ ] Use lazy loading for routes
- [ ] Implement OnPush change detection
- [ ] Unsubscribe from observables
- [ ] Cache API responses where appropriate
- [ ] Minimize HTTP requests
- [ ] Optimize images
- [ ] Use Angular DevTools for profiling

## Security Checklist

- [ ] Never commit API keys
- [ ] Validate input on client and server
- [ ] Use HTTPS in production
- [ ] Sanitize user input
- [ ] Implement CSRF protection
- [ ] Use secure headers
- [ ] Validate JWT tokens
- [ ] Log security events

## Build & Deploy

### Build for Development
```bash
npm start
```

### Build for Production
```bash
npm run build
```

Output: `dist/hotelstay-ui/browser/`

### Docker Build
```bash
docker build -t hotelstay-ui .
docker run -p 80:80 hotelstay-ui
```

### Deploy to Server
```bash
npm run build
# Copy dist/ to server
# Configure web server (nginx/apache)
# Point to index.html for SPA routing
```

## Useful Angular Resources

- [Angular Docs](https://angular.io)
- [Angular Material](https://material.angular.io)
- [RxJS Docs](https://rxjs.dev)
- [TypeScript Docs](https://www.typescriptlang.org)

## Getting Help

1. Check `ARCHITECTURE.md` for design questions
2. Check `API_CONTRACT.md` for API questions
3. Check component comments for implementation details
4. Review error messages in browser console
5. Check backend logs for API errors

## Version Information

- Angular: 20.0.0
- Material: 20.2.14
- TypeScript: 5.4+
- Node: 18+
- npm: 10+

## Next Steps

1. Update API URL in environment.ts
2. Ensure backend API is running
3. Run `npm start` to start dev server
4. Test the complete booking flow
5. Review ARCHITECTURE.md for design details
6. Check API_CONTRACT.md for backend requirements

---

**Happy Coding! 🚀**
