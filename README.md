# FoodDash - Food Delivery System

A comprehensive food delivery web application with multi-role authentication and payment gateway integration.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jibanplus/fooddash.git
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. **Create admin account**
```bash
npm run create-admin
```

This will create an admin account with:
- **Email:** `admin@fooddash.com`
- **Password:** `Admin@123`

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔗 Important URLs

### Local Development
- **Main Website:** http://localhost:3000
- **Login Portal:** http://localhost:3000/login
- **Admin Login:** http://localhost:3000/admin/login
- **Restaurant Login:** http://localhost:3000/restaurant/login
- **Delivery Login:** http://localhost:3000/delivery/login

### Admin Panel Routes
- **Dashboard:** http://localhost:3000/admin
- **Restaurants:** http://localhost:3000/admin/restaurants
- **Orders:** http://localhost:3000/admin/orders
- **Delivery:** http://localhost:3000/admin/delivery
- **Create Account:** http://localhost:3000/admin/create-account
- **Settings:** http://localhost:3000/admin/settings

### Restaurant Panel Routes
- **Dashboard:** http://localhost:3000/restaurant
- **Menu:** http://localhost:3000/restaurant/menu
- **Analytics:** http://localhost:3000/restaurant/analytics

### Delivery Panel Routes
- **Dashboard:** http://localhost:3000/delivery
- **Orders:** http://localhost:3000/delivery/orders
- **Wallet:** http://localhost:3000/delivery/wallet
- **Profile:** http://localhost:3000/delivery/profile

## 👤 Admin Credentials

**Default Admin Account:**
- **Email:** `admin@fooddash.com`
- **Password:** `Admin@123`

⚠️ **Important:** Change the default admin password after first login!

## 🔐 Authentication System

### User Registration
- Users can self-register with 4 fields: Name, Email, Mobile Number, Password
- No OTP verification required (simplified for development)
- Email must be unique

### Role-Based Access
- **Admin:** Full platform management
- **Restaurant:** Manage restaurant menu and orders
- **Delivery:** Accept and deliver orders
- **User:** Browse restaurants and place orders

### Account Creation Rules
- **Admin, Restaurant, Delivery accounts** can only be created by the Admin
- **User accounts** can be self-registered
- Use Admin Panel → Create Account to create Restaurant/Delivery accounts

## 💳 Payment Gateway Integration

### Paytm Configuration
Navigate to Admin Panel → Settings to configure:
- Merchant ID (MID)
- Merchant Key
- Website Name
- Industry Type
- Channel ID
- API Endpoints (Staging/Production)
- Callback URL
- Test Mode toggle

### UPI QR Code
- Upload custom QR code for manual UPI payments
- Supported formats: PNG, JPG, JPEG
- Maximum file size: 5MB

## 🏗️ Build & Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
project/
├── app/
│   ├── admin/              # Admin panel routes
│   ├── delivery/           # Delivery partner routes
│   ├── restaurant/         # Restaurant partner routes
│   ├── login/              # Authentication pages
│   ├── profile/            # User profile
│   └── page.tsx            # Main landing page
├── components/
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── auth.ts             # Authentication functions
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # Utility functions
├── middleware.ts           # Route protection
└── public/                 # Static assets
```

## 🛠️ Technology Stack

- **Frontend:** Next.js 13, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State Management:** React Context
- **Forms:** React Hook Form, Zod validation

## 📝 Features Implemented

✅ Multi-role authentication system
✅ Separate login portals for each role
✅ Admin panel with comprehensive management
✅ Restaurant management system
✅ Delivery partner system
✅ Payment gateway integration (Paytm)
✅ UPI QR code upload functionality
✅ Route protection middleware
✅ User profile management
✅ Order tracking system
✅ Real-time order updates

## 🔧 Troubleshooting

### OTP Not Working
- OTP verification has been disabled for simplicity
- Users can login immediately after registration
- Check Supabase email settings if you want to enable OTP

### Authentication Issues
- Ensure Supabase credentials are correct in `.env.local`
- Check that email confirmation is disabled in Supabase settings
- Verify user role assignments in Supabase dashboard

### Build Errors
- Run `npm run typecheck` to identify TypeScript errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version (requires 18+)

## 📞 Support

For issues and questions, please check the project documentation or create an issue in the GitHub repository.

## 📄 License

This project is proprietary software. All rights reserved.

---

**Generated with Devin (https://devin.ai)**