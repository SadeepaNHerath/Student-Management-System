# Student Management System - Monorepo

A comprehensive student management system with both front-end and back-end components, built to streamline academic administration. This repository uses a monorepo structure to organize frontend and backend code in an efficient way.

## Project Structure

- `frontend/`: HTML, CSS, and JavaScript frontend
- `backend/`: Java Spring Boot backend
- `assets/`: Shared assets (images, etc.)

## Project Overview

The Student Management System provides an integrated platform for educational institutions to manage student information, classes, attendance, and administrative tasks. The system offers separate interfaces and functionality for administrators and students.

## Features

### For Administrators
- Student management (add, view, edit, delete)
- Class management (create, schedule, assign students)
- Attendance tracking and reporting
- Request management for class enrollment

### For Students
- Personal dashboard with profile information
- Class enrollment and attendance history
- Apply for available classes
- View academic progress

## Technical Stack

### Front-end
- HTML5, CSS3, JavaScript
- [Bulma CSS Framework](https://bulma.io/) for responsive design
- Font Awesome for icons
- AOS (Animate on Scroll) for animations

### Back-end
- Java with Spring Boot
- MySQL database
- RESTful API architecture
- Spring Data JPA for database operations

## Project Structure

```
student-management-system/
├── assets/              # Shared assets used by both frontend and backend
│   └── images/          # Shared images
├── frontend/            # Frontend code
│   ├── package.json     # Frontend dependencies and scripts
│   ├── src/             # Source files
│   │   ├── app.js       # Main application entry point
│   │   ├── style.css    # Global styles
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (HTML and corresponding JS)
│   │   ├── services/    # API services for backend communication
│   │   └── utils/       # Utility functions and constants
│   └── public/          # Static assets served by the frontend
├── backend/             # Spring Boot backend
│   ├── pom.xml          # Maven configuration
│   └── src/             # Source files
│       ├── main/        # Main source code
│       │   ├── java/    # Java source files
│       │   │   └── edu/icet/  # Main package
│       │   │       ├── controller/ # REST controllers
│       │   │       ├── service/    # Business logic services
│       │   │       ├── repository/ # Data access repositories
│       │   │       └── dto/        # Data transfer objects
│       │   └── resources/  # Configuration and static resources
│       └── test/       # Test code
└── package.json        # Root package.json for monorepo management
```

### Front-end Components
- `frontend/src/index.html` & `frontend/src/app.js` - Main entry point with authentication detection
- `frontend/src/login.html` & `frontend/src/login.js` - Authentication for students and administrators
- `frontend/src/admin_dashboard.html` & `frontend/src/admin_dashboard.js` - Admin control panel
- `frontend/src/student_dashboard.html` & `frontend/src/student_dashboard.js` - Student portal
- `frontend/src/class_management.html` & `frontend/src/class_management.js` - Class creation and management
- `frontend/src/attendance_management.html` & `frontend/src/attendance_management.js` - Attendance tracking
- `frontend/src/request_management.html` & `frontend/src/request_management.js` - Class enrollment requests

### Back-end Components
- Java Spring Boot application with MVC architecture
- RESTful endpoints for data operations
- Database models for students, classes, and attendance

## Getting Started

### Prerequisites
- Java 17 or later
- MySQL 8.0 or later
- Maven
- Web browser with JavaScript enabled

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/Student-Management-System.git
cd Student-Management-System
```

2. Install root and frontend dependencies:
```bash
npm run install:all
```

3. Configure database connection in `backend/src/main/resources/application.yml`
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/student?createDatabaseIfNotExist=true
    username: your_username
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

4. Build the project (both frontend and backend)
```bash
npm run build
```

5. Run both frontend and backend
```bash
npm start
```

6. Access the application in your web browser
   - Frontend: http://localhost:8081
   - Backend API: http://localhost:8080/api

## Default Login Credentials

### Administrator
- Username: admin
- Password: admin123

### Students
- ID: STU001, Password: student123
- ID: STU002, Password: student123
- ID: STU003, Password: student123

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Developed by Sadeepa N Herath
- Special thanks to ICET for project guidance
