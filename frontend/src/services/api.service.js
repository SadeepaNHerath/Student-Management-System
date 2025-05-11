import {API_BASE_URL} from '../utils/constants.js';

class ApiService {
    static async login(username, password) {
        return this.post('/users/login', {username, password});
    }

    static async getStudents() {
        return this.get('/student/students');
    }

    static async getStudent(id) {
        return this.get(`/student/students/${id}`);
    }

    static async createStudent(studentData) {
        return this.post('/student/students', studentData);
    }

    static async updateStudent(id, studentData) {
        return this.put(`/student/students/${id}`, studentData);
    }

    static async deleteStudent(id) {
        return this.delete(`/student/students/${id}`);
    }

    static async getClasses() {
        return this.get('/classes');
    }

    static async getClass(id) {
        return this.get(`/classes/${id}`);
    }    static async createClass(classData) {
        return this.post('/classes', classData);
    }
    
    static async getRequests() {
        return this.get('/requests');
    }
    
    static async approveRequest(requestId) {
        return this.put(`/requests/${requestId}/approve`, {});
    }
    
    static async rejectRequest(requestId) {
        return this.put(`/requests/${requestId}/reject`, {});
    }

    static async getAttendance(classId) {
        return this.get(`/attendance/class/${classId}`);
    }

    static async markAttendance(attendanceData) {
        return this.post('/attendance', attendanceData);
    }

    static async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    static async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    static async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            return null;
        }
    }

    static async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            return await this.handleResponse(response);
        } catch (error) {
            this.handleError(error);
            return null;
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
        if (!response.ok) {
            // For 401 Unauthorized responses, redirect to login
            if (response.status === 401) {
                window.location.replace('login.html');
                return null;
            }
            
            // Try to parse error message from response
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `API Error: ${response.status}`);
            } catch (e) {
                throw new Error(`API Error: ${response.statusText || response.status}`);
            }
        }

        // Check if response has content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            return await response.json();
        } else {
            return {};
        }
    }

    static handleError(error) {
        console.error('API Error:', error);
        throw error;
    }
}

export default ApiService;
