// API service for making requests to the backend
import {API_BASE_URL} from '../utils/constants.js';

class ApiService {
    // Auth endpoints
    static async login(username, password) {
        return this.post('/auth/login', {username, password});
    }

    // Student endpoints
    static async getStudents() {
        return this.get('/students');
    }

    static async getStudent(id) {
        return this.get(`/students/${id}`);
    }

    static async createStudent(studentData) {
        return this.post('/students', studentData);
    }

    static async updateStudent(id, studentData) {
        return this.put(`/students/${id}`, studentData);
    }

    static async deleteStudent(id) {
        return this.delete(`/students/${id}`);
    }

    // Class endpoints
    static async getClasses() {
        return this.get('/classes');
    }

    static async getClass(id) {
        return this.get(`/classes/${id}`);
    }

    static async createClass(classData) {
        return this.post('/classes', classData);
    }

    // Attendance endpoints
    static async getAttendance(classId) {
        return this.get(`/attendance/class/${classId}`);
    }

    static async markAttendance(attendanceData) {
        return this.post('/attendance', attendanceData);
    }

    // Private helper methods for HTTP requests
    static async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }

    static async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }

    static async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }

    static async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }

    static getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    static async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            const error = data.message || response.statusText;
            throw new Error(error);
        }

        return data;
    }

    static handleError(error) {
        console.error('API Error:', error);
        throw error;
    }
}

export default ApiService;
