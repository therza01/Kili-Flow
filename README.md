# GridPulse - Smart Utility Monitoring Platform

A comprehensive utility reporting and community platform for Kilimani, Nairobi, built with Next.js frontend and PHP backend.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and Radix UI
- **Backend**: PHP with MySQL database
- **Database**: MySQL with comprehensive schema for users, issues, community posts, and businesses

## 🚀 Features

- **Issue Reporting**: Report utility problems (power, water, internet, gas)
- **Interactive Map**: View reported issues on a map interface
- **Community Hub**: Estate-based community discussions
- **User Profiles**: Manage personal information and preferences
- **Business Directory**: Local business listings
- **AI Predictions**: Predictive analytics for utility outages
- **Weather Integration**: Real-time weather information

## 📁 Project Structure

```
gridpulse/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── report/            # Issue reporting
│   ├── map/               # Issues map view
│   ├── community/         # Community hub
│   ├── profile/           # User profile
│   ├── businesses/        # Business directory
│   └── predictions/       # AI predictions
├── api/                   # PHP backend
│   ├── db.php            # Database connection
│   ├── report_issue.php  # Issue reporting endpoint
│   ├── get_issues.php    # Fetch issues
│   ├── create_user.php   # User management
│   ├── community_posts.php # Community posts
│   └── get_businesses.php # Business listings
├── database/
│   └── schema.sql        # MySQL database schema
├── lib/
│   └── api.ts           # API client functions
└── components/          # Reusable UI components
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- PHP 7.4+ with MySQL support
- MySQL 5.7+ or MariaDB
- Web server (Apache/Nginx) or XAMPP/MAMP for local development

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Update API URL in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost/gridpulse/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Create MySQL database:
   ```sql
   CREATE DATABASE gridpulse;
   ```

2. Import database schema:
   ```bash
   mysql -u root -p gridpulse < database/schema.sql
   ```

3. Configure database connection in `api/db.php`:
   ```php
   $host = 'localhost';
   $dbname = 'gridpulse';
   $username = 'root';
   $password = 'your_password';
   ```

4. Deploy PHP files to your web server:
   - Copy `api/` folder to your web root
   - Ensure PHP has MySQL extension enabled
   - Configure CORS headers if needed

### Local Development with XAMPP
1. Install XAMPP and start Apache + MySQL
2. Copy `api/` folder to `htdocs/gridpulse/`
3. Import database schema via phpMyAdmin
4. Update API URL to `http://localhost/gridpulse/api`

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/report_issue.php` | POST | Submit new utility issue |
| `/api/get_issues.php` | GET | Fetch issues for map view |
| `/api/create_user.php` | POST | Create/update user profile |
| `/api/community_posts.php` | GET/POST | Community posts management |
| `/api/get_businesses.php` | GET | Fetch business listings |
| `/api/get_estates.php` | GET | Get available estates |

## 🗄️ Database Schema

The system uses 4 main tables:
- **users**: User profiles and contact information
- **issues**: Utility issue reports with geolocation
- **community_posts**: Estate-based community discussions
- **businesses**: Local business directory

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy to your preferred platform
3. Update API URL environment variable

### Backend (Shared Hosting/VPS)
1. Upload PHP files to web server
2. Create MySQL database and import schema
3. Update database credentials
4. Configure CORS headers for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.