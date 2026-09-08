# Mobile Recharge Feature

## Overview
This mobile recharge feature allows users to easily recharge their mobile phones by selecting from available plans fetched from the service provider's API.

## Features

### 🔸 **Mobile Number Input**
- Input validation for 10-digit Indian mobile numbers
- Real-time validation with error messages
- Mobile number format checking (starts with 6-9)

### 🔸 **Plan Loading**
- Automatic plan fetching based on mobile number
- Operator detection with logo display
- Circle/region information display

### 🔸 **Plan Management**
- Categorized plans (Special Offer, Data, Topup, etc.)
- Search functionality across plan descriptions and amounts
- Filter by plan type
- Real-time plan count display

### 🔸 **Enhanced UI/UX**
- Modern gradient design with attractive cards
- Responsive layout for all screen sizes
- Interactive plan selection with visual feedback
- Smooth animations and transitions
- Professional styling with custom CSS

## API Integration

### Mobile Plan API
- **Endpoint**: `/api/v2/mobile-plan`
- **Method**: POST
- **Request Body**: 
  ```json
  {
    "number": "9835153380"
  }
  ```

### Operator Logo API
- **Endpoint**: `/api/v2/oprator-logo`
- **Method**: POST
- **Request Body**: 
  ```json
  {
    "operator": "AT"
  }
  ```

## Usage Flow

1. **Enter Mobile Number**: User enters a 10-digit mobile number
2. **Load Plans**: Click "View Available Plans" to fetch available recharge plans
3. **Browse Plans**: Use search and filter options to find desired plans
4. **Select Plan**: Click on any plan to select it
5. **Operator Details**: View operator name, circle, and logo
6. **Change Number**: Option to change mobile number and start over
7. **Proceed to Recharge**: Continue with selected plan (payment integration pending)

## Component Structure

### Main Component: `MobileRecharge.jsx`
- **Location**: `resources/js/banking/mobilerecharge.jsx`
- **Route**: `/banking/mobile-recharge`

### Key Features:
- State management for mobile number, plans, selected plan, and operator details
- Form validation and error handling
- API integration with proper error handling
- Responsive design with mobile-first approach
- Search and filter functionality
- Toast notifications for user feedback

### Styling
- **Custom CSS**: Added to `resources/css/app.css`
- **Bootstrap Integration**: Uses existing Bootstrap framework
- **Custom Classes**: 
  - `.mobile-recharge-card` - Gradient background for input section
  - `.plan-card` - Interactive plan selection cards
  - `.operator-logo` - Operator logo styling
  - `.amount-badge` - Highlighted amount display
  - `.service-card` - Banking dashboard service cards

## Navigation

### From Banking Dashboard
- Navigate to Banking module
- Click on "Mobile Recharge" service card
- Or directly access via URL: `/banking/mobile-recharge`

### Breadcrumb Navigation
- Banking > Mobile Recharge
- Banking > Mobile Recharge Plans (after loading plans)

## Technical Details

### Dependencies
- React 18+
- React Router DOM
- React Toastify
- Bootstrap 5
- Font Awesome icons

### API Service
- Uses existing `ApiService` for API calls
- Proper error handling and loading states
- Toast notifications for user feedback

### Responsive Design
- Mobile-first approach
- Breakpoints for different screen sizes
- Optimized for touch interactions

## Future Enhancements

1. **Payment Integration**: Complete recharge process with payment gateway
2. **Recent Recharges**: Display user's recharge history
3. **Favorite Plans**: Allow users to save frequently used plans
4. **Quick Recharge**: One-click recharge for saved plans
5. **Plan Comparison**: Side-by-side plan comparison feature
6. **Auto-renewal**: Set up automatic recharge for plans
7. **Multiple Numbers**: Manage multiple mobile numbers

## Error Handling

- Network error handling with user-friendly messages
- Form validation with real-time feedback
- API error responses properly displayed
- Loading states for better user experience

## Performance Optimizations

- Efficient state management
- Optimized re-renders
- Lazy loading for large plan lists
- Debounced search functionality
- Responsive image loading for operator logos

---

**Note**: This feature is part of the Banking module and requires proper authentication and authorization to access.
