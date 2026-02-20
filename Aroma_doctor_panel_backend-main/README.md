# Aroma Diet Plan System

A comprehensive real-time diet plan and recipe management system designed for administrators and doctors. The system facilitates the management of doctors, patients, medical conditions, and recipe assignments with a robust approval workflow.

## 🚀 Features

### Admin Dashboard
- **Doctor Management**: Full CRUD operations for managing doctors, including status management (Active/Suspended/Pending).
- **Recipe Assignments**: Assign recipes to doctors for review based on condition tags.
- **Real-time Analytics**: View real-time statistics and system usage.
- **Live Updates**: Real-time polling (30-second intervals) for assignment status updates.

### Doctor Dashboard
- **Recipe Reviews**: Review assigned recipes, provide professional feedback, and approve or reject them.
- **Conditions Management**: Manage medical conditions and their associated dietary requirements.
- **Patient Management**: Track and manage patient profiles and diet plans.
- **Real-time Notifications**: Receive instant updates on assignments and administrative actions.

### Core Functionality
- **Role-Based Access Control**: Secure access for Admins and Doctors.
- **Real-time Synchronization**: Seamless updates across dashboards using polling and Socket.IO readiness.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS and Shadcn UI.
- **MongoDB Integration**: Robust data persistence for all system entities.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **State Management**: React Hooks
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) / React Toast

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)
- A running instance of the Aroma Backend (or use the provided API routes).

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Aroma
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following configuration:

    ```env
    # MongoDB Backend Configuration
    MONGODB_BACKEND_URL=https://aroma-db-six.vercel.app
    NEXT_PUBLIC_API_URL=https://aroma-db-six.vercel.app

    # Application Configuration
    NODE_ENV=development
    NEXT_PUBLIC_APP_NAME=Aroma Diet Plan System
    NEXT_PUBLIC_APP_VERSION=1.0.0

    # MongoDB Direct Connection
    MONGODB_URI=mongodb://localhost:27017/aroma_db
    MONGODB_DB_NAME=aroma_db

    # JWT Configuration
    JWT_SECRET=your-jwt-secret-key-here
    JWT_EXPIRES_IN=7d
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Access the Application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing & Verification

The project includes built-in tools to verify the setup and database connection.

1.  **Backend Health Check:**
    Visit `http://localhost:3000/test-db` or click "🧪 Test Database Connection" on the home page to verify connectivity with the backend and MongoDB.

2.  **Run Backend Tests:**
    You can run the included test script to verify backend connectivity from the command line:
    ```bash
    npx ts-node test-backend.ts
    ```

## 📂 Project Structure

```
Aroma/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard routes
│   ├── api/                # API routes (Admin, Doctor, etc.)
│   ├── doctor/             # Doctor dashboard routes
│   └── ...
├── components/             # Reusable UI components
│   ├── admin/              # Admin-specific components
│   ├── doctor/             # Doctor-specific components
│   └── ui/                 # Shadcn UI components
├── lib/                    # Utility functions and configurations
│   ├── api/                # API service layers
│   └── ...
├── public/                 # Static assets
├── scripts/                # Database setup and utility scripts
└── ...
```

## 🔌 API Documentation

The application interacts with the backend via the following key endpoints:

### Admin Operations
- `GET /api/admin/doctors`: List all doctors
- `POST /api/admin/doctors`: Create a new doctor
- `PUT /api/admin/doctors/:id`: Update doctor status
- `GET /api/admin/assignments`: List recipe assignments
- `POST /api/admin/assignments`: Create a new assignment

### Doctor Operations
- `GET /api/recipes/review`: Get assigned recipes
- `POST /api/recipes/review`: Submit a review (Approve/Reject)

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
# Aroma_doctor_panel_backend
