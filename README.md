# WanderMap Frontend
website: https://wandermap-front-phi.vercel.app/

## PROJECT OVERVIEW
WanderMap frontend is a responsive and interactive web interface that allows users to manage and visualize their trips on a map. Users can view trips chronologically, upload photos, manage profile visibility, and explore shared trips using a unique link system. The design follows a minimalistic, nature-inspired style to enhance the travel experience.
Also in the map users can see their trips, and see preview of the trip's photo directly in the map. 
---

## INSTRUCTIONS

### 🛠 Clone the Project
```bash
git clone https://github.com/your-username/wandermap-frontend.git
cd wandermap-frontend
```

### 🔐 Create `.env.local` File
```env
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

### 📦 Install Dependencies
```bash
npm install
```

### ▶️ Start Development Server
```bash
npm run dev
```

---

## DEVELOPMENT PROCESS
- **Design**: Created design in figma, to have a proper understanding of what i need to do.
- **Authentication Flow**: JWT-based token system with localStorage, including automatic refresh handling on API failure.
- **Routing**: Uses Next.js App Router with `use client` directive to ensure client-side interactivity.
- **Interactive Map**: Leaflet-based map is loaded dynamically using `next/dynamic` to prevent SSR issues, and when mouse is over of trip point, it shows preview image..
- **Timeline**: Trips are visualized from oldest to newest, with detailed modals for viewing, adding, and editing.
- **UI Framework**: Tailwind CSS is used for all styling, providing a clean and fast development experience.
- **State Management**: Lightweight use of React’s built-in `useState`, `useEffect`, and `useCallback`.
- **Media Uploads**: Supports upload from device photo uploads per trip, integrated with the backend's Supabase S3.
- **Error Handling**: Toaster-based feedback system using custom hook `useToast`.
- **Sharing Trips**: Created unique web interface for showing data of the someone's user without any additional buttons.
- **Hide and show**: Added button to show and hide sidebar, for showing map in a full screen.

---

## UNIQUE METHODOLOGY

- Used my planning scheme, planning every hour and day of what I need to do.
- The map is the central interaction point, tightly integrated with a collapsible sidebar for trip history and management.
- Client-side rendered modals are tailored to maintain UX continuity without page reloads.
- Leaflet map events directly trigger modal logic and coordinate capture, simulating a native app experience.

---

## COMPROMISES

- Used only native `fetch` instead of fully switching to Axios for consistency and fewer dependencies.
- Skipped server-side rendering for map components to avoid Leaflet hydration issues.
- Kept local-only state for modals and visibility toggle, without external global state.

---

## WHY THIS STACK?

- **Next.js**: Fast performance, SSR/CSR flexibility, file-based routing.
- **React**: Ideal for modular and dynamic UIs like timelines and modal workflows.
- **Leaflet**: Lightweight, open-source solution for travel-based mapping, easier to setup.
- **Tailwind CSS**: Utility-first CSS for rapid UI development with responsive design support.
