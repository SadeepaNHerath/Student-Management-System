# Student Management System

A comprehensive student management system with both front-end and back-end components, built to streamline academic administration.

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

### Front-end Components
- `index.html` & `app.js` - Main entry point with authentication detection
- `login.html` & `login.js` - Authentication for students and administrators
- `admin_dashboard.html` & `admin_dashboard.js` - Admin control panel
- `student_dashboard.html` & `student_dashboard.js` - Student portal
- `class_management.html` & `class_management.js` - Class creation and management
- `attendance_management.html` & `attendance_management.js` - Attendance tracking
- `request_management.html` & `request_management.js` - Class enrollment requests

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
```

2. Configure database connection in `src/main/resources/application.yml`
```yaml
spring:
  dataSource:
    url: jdbc:mysql://localhost:3306/student?createDatabaseIfNotExist=true
    username: your_username
    password: your_password
```

3. Build the Spring Boot application
```bash
cd Student-Management-System
mvn clean install
```

4. Run the application
```bash
java -jar target/Student-Management-System-1.0-SNAPSHOT.jar
```

5. Access the application in your web browser
```
http://localhost:8080
```

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
