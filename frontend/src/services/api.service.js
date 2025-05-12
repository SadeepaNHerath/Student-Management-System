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
        console.log('ApiService.updateStudent:', id, studentData);
        
        const formData = new FormData();
        
        const cleanedStudentData = {
            id: studentData.id,
            fName: studentData.fName || studentData.firstName || "",
            lName: studentData.lName || studentData.lastName || "",
            address: studentData.address || "",
            contact: studentData.contact || "",
            email: studentData.email || "",
            nic: studentData.nic || ""
        };
        
        console.log('Cleaned student data with correct field names:', cleanedStudentData);
        
        console.log('Student data prepared for update with cleaned field names:', cleanedStudentData);
          try {
            formData.append('student', JSON.stringify(cleanedStudentData));
            
            const emptyFile = new Blob([], {type: 'application/octet-stream'});
            formData.append('profilePicture', emptyFile);
            
            console.log('Sending student data in FormData:', 
                        JSON.stringify(cleanedStudentData, null, 2));
            
            const response = await fetch(`${API_BASE_URL}/student/students`, {
                method: 'PATCH',
                body: formData,
                credentials: 'include'
            });
            
            console.log('Raw update response:', response);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText, response.status);
                throw new Error(`Failed to update profile: API Error: ${response.status} ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            let updatedData = cleanedStudentData;
            
            if (contentType && contentType.indexOf('application/json') !== -1) {
                try {
                    updatedData = await response.json();
                    console.log('Received updated student data:', updatedData);
                } catch (jsonError) {
                    console.warn('Could not parse JSON response:', jsonError);
                }
            }
            
            return updatedData;
        } catch (error) {
            console.error('Error in updateStudent:', error);
            throw error;
        }
    }

    static async deleteStudent(id) {
        return this.delete(`/student/students/${id}`);
    }

    static async getClasses() {
        return this.get('/classes');
    }

    static async getClass(id) {
        return this.get(`/classes/${id}`);
    }
    
    static async createClass(classData) {
        return this.post('/classes', classData);
    }

    static async createClassRequest(requestData) {
        console.log('Creating class request with data:', requestData);
        try {
            return this.post('/requests', requestData);
        } catch (error) {
            console.error('Error in createClassRequest:', error);
            throw error;
        }
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
    
    static async patch(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PATCH',
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
            if (response.status === 401) {
                window.location.replace('login.html');
                return null;
            }
            
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `API Error: ${response.status}`);
                } else {
                    const errorText = await response.text();
                    console.error('API Error non-JSON response:', errorText);
                    throw new Error(`API Error: ${response.statusText || response.status} - ${errorText.substring(0, 100)}`);
                }
            } catch (e) {
                console.error('Error parsing API response:', e);
                throw new Error(`API Error: ${response.statusText || response.status}`);
            }
        }

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
