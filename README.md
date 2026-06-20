# AssetHub

> **Enterprise-Grade Asset Management Dashboard with Real-Time Visualization, Maintenance Tracking, and Resource Allocation Insights**

A modern, feature-rich web application for managing organizational assets, employee assignments, and maintenance operations. Built with React, TypeScript, Firebase, and Gemini AI for intelligent maintenance predictions.

## 🌟 Features

- **Asset Management**: Track hardware, software, and physical assets with detailed specifications
- **Employee Management**: Manage employee profiles, roles, and asset assignments
- **Maintenance Tracking**: Log repairs, inspections, and maintenance history with costs
- **AI-Powered Insights**: Gemini AI predictions for maintenance recommendations and fleet health analysis
- **Real-Time Dashboard**: Live visualization of asset status, maintenance metrics, and KPIs
- **Reports & Analytics**: Comprehensive reporting on asset utilization, costs, and maintenance trends
- **Role-Based Access**: Admin and user roles with different permission levels
- **Mobile-Responsive**: Works seamlessly on desktop and mobile devices
- **QR Code Support**: Generate and scan QR codes for quick asset identification
- **Bulk Operations**: Bulk edit, assign, and manage multiple assets at once

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account (for Firestore database)
- Gemini API key (optional, for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zar-Chi-Win/Assuthub.git
   cd assethub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Set your `GEMINI_API_KEY` for AI-powered features
   - Configure Firebase credentials if needed

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 📦 Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Lucide React (icons), Motion (animations)
- **Styling**: Tailwind CSS 4 with custom utilities
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Integration**: Google Gemini API
- **Charts**: Recharts for data visualization
- **Mobile**: Capacitor for cross-platform mobile support
- **PWA**: Vite PWA Plugin for progressive web app capabilities

## 📁 Project Structure

```
src/
├── components/          # React components organized by feature
│   ├── auth/           # Authentication & login
│   ├── dashboard/      # Dashboard & overview pages
│   ├── employees/      # Employee management
│   ├── inventory/      # Asset management
│   ├── layout/         # Shell & layout components
│   └── ui/             # Reusable UI components
├── context/            # React context for state management
├── lib/                # Utility functions & services
│   ├── apiService.ts   # Firestore API wrapper
│   ├── firebase.ts     # Firebase configuration
│   ├── geminiService.ts # Gemini AI integration
│   └── utils.ts        # Helper utilities
├── services/           # External service integrations
└── types.ts            # TypeScript type definitions
```

## 🔑 Key Components

### Dashboard
- **Overview**: Asset status summary, KPIs, and health metrics
- **Maintenance**: Maintenance log, AI predictions, and priority actions
- **Reports**: Analytics and insights on asset utilization
- **Settings**: Application configuration and user preferences

### Inventory
- Asset list with filtering and search
- Detailed asset information modal
- Bulk edit capabilities
- Maintenance history tracking
- Quick assignment to employees

### Employees
- Employee directory and profiles
- Role and department information
- Asset assignment tracking
- Employee-specific asset visibility

## 🔐 Authentication

The app uses Firebase Authentication with support for:
- Email/Password login
- Google OAuth (if configured)
- Role-based access control (Admin/User)

## 🤖 AI Features

With Gemini API integration, the app provides:
- **Maintenance Predictions**: AI analyzes asset age and history to predict maintenance needs
- **Health Summaries**: System-wide asset health analysis and recommendations
- **Intelligent Descriptions**: Auto-generate asset descriptions based on specifications

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Check TypeScript types
- `npm run android:sync` - Sync with Android project (Capacitor)
- `npm run android:open` - Open Android Studio

## 📝 Environment Variables

Create a `.env.local` file:

```env
# Gemini API Key for AI features (optional)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase configuration (if using custom setup)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ for better asset management**
