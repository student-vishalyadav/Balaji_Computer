// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Helper to get auth headers
    getHeaders(customHeaders = {}) {
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...customHeaders,
        };

        const token = sessionStorage.getItem("balaji_auth_token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return headers;
    }

    // Universal fetch handler with credentials support (for HTTP-only cookies)
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith("http")
            ? endpoint
            : `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

        const config = {
            ...options,
            headers: this.getHeaders(options.headers),
            credentials: "include", // Essential for HTTP-only cookies
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMessage =
                    data.msg || data.message || `Request failed with status ${response.status}`;
                const error = new Error(errorMessage);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error(`API Error on [${options.method || "GET"} ${endpoint}]:`, error.message);
            throw error;
        }
    }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "GET" });
    }

    post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(body),
        });
    }

    patch(endpoint, body = {}, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(body),
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: "DELETE" });
    }
}

export const api = new ApiService();

// Dedicated Auth API
export const authAPI = {
    login: (credentials) => api.post("/auth/login", credentials),
    signup: (userData) => api.post("/auth/signup", userData),
    logout: () => api.post("/auth/logout", {}),
    getMe: () => api.get("/auth/me"),
};

// Admin Dashboard & Settings API
export const adminAPI = {
    getDashboardStats: () => api.get("/admin/dashboard/stats"),
    getSettings: () => api.get("/admin/settings"),
    updateSettings: (data) => api.put("/admin/settings", data),
    changePassword: (data) => api.put("/admin/change-password", data),
    getAuditLogs: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/admin/audit-logs${query ? `?${query}` : ""}`);
    },
};

// Student Management API
export const studentAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/students${query ? `?${query}` : ""}`);
    },
    getById: (id) => api.get(`/students/${id}`),
    create: (data) => api.post("/students", data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    toggleStatus: (id) => api.patch(`/students/${id}/toggle-status`),
    resetPassword: (id, newPassword) => api.post(`/students/${id}/reset-password`, { newPassword }),
    bulkStatus: (studentIds, isActive) => api.post("/students/bulk-status", { studentIds, isActive }),
};

// Faculty Management API
export const facultyAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/faculty${query ? `?${query}` : ""}`);
    },
    create: (data) => api.post("/faculty", data),
    update: (id, data) => api.put(`/faculty/${id}`, data),
    delete: (id) => api.delete(`/faculty/${id}`),
};

// Course Management API
export const courseAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/courses${query ? `?${query}` : ""}`);
    },
    getById: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post("/courses", data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`),
};

// Batch Management API
export const batchAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/batches${query ? `?${query}` : ""}`);
    },
    create: (data) => api.post("/batches", data),
    update: (id, data) => api.put(`/batches/${id}`, data),
    delete: (id) => api.delete(`/batches/${id}`),
    getStudents: (id) => api.get(`/batches/${id}/students`),
    transfer: (data) => api.post("/batches/transfer", data),
};

// Attendance Management API
export const attendanceAPI = {
    getBatch: (batchId, date) => api.get(`/attendance/batch?batchId=${batchId}&date=${date}`),
    save: (data) => api.post("/attendance/save", data),
    getReport: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/attendance/report${query ? `?${query}` : ""}`);
    },
};

// Fee Management API
export const feeAPI = {
    getOverview: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/fees/overview${query ? `?${query}` : ""}`);
    },
    recordPayment: (data) => api.post("/fees/payment", data),
    getReceipt: (receiptNumber) => api.get(`/fees/receipt/${receiptNumber}`),
};

// Examination Management API
export const examAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/exams${query ? `?${query}` : ""}`);
    },
    create: (data) => api.post("/exams", data),
    update: (id, data) => api.put(`/exams/${id}`, data),
    publish: (id, results) => api.post(`/exams/${id}/publish`, { results }),
    delete: (id) => api.delete(`/exams/${id}`),
};

// Study Material Management API
export const materialAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/materials${query ? `?${query}` : ""}`);
    },
    create: (data) => api.post("/materials", data),
    togglePublish: (id) => api.patch(`/materials/${id}/toggle-publish`),
    delete: (id) => api.delete(`/materials/${id}`),
};

// Notices & Announcements API
export const noticeAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/notices${query ? `?${query}` : ""}`);
    },
    create: (data) => api.post("/notices", data),
    update: (id, data) => api.put(`/notices/${id}`, data),
    togglePublish: (id) => api.patch(`/notices/${id}/toggle-publish`),
    delete: (id) => api.delete(`/notices/${id}`),
};

// Public Institute Info API
export const instituteAPI = {
    getStats: () => api.get("/stats"),
    getTestimonials: () => api.get("/testimonials"),
    getFaculty: () => api.get("/faculty"),
};
