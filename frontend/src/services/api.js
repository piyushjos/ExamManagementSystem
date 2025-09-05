import axiosInstance from '../utils/axiosConfig';

const handleApiError = (error) => {
  if (error.response) {
    // Server responded with an error status code
    throw new Error(error.response.data?.message || 'Server error occurred');
  } else if (error.request) {
    // Request made but no response was received
    throw new Error('No response from server');
  } else {
    // Something went wrong in setting up the request
    throw new Error('Error setting up request');
  }
};

const api = {
  auth: {
    login: async (credentials) => {
      try {
        const response = await axiosInstance.post('/api/auth/login', {
          email: credentials.email,
          password: credentials.password,
        });
        console.log('Login response:', response.data);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
    },
    register: async (userData) => {
      try {
        const response = await axiosInstance.post('/api/auth/register', userData);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    updateProfile: async (updatedData) => {
      try {
        const response = await axiosInstance.put('/api/auth/profile', updatedData);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
  },
  admin: {
    addInstructor: async (instructorData) => {
      try {
        console.log('Adding instructor with data:', instructorData);
        const response = await axiosInstance.post('/api/admin/instructors', {
          email: instructorData.email,
          password: "", // Admin does not set a password
          firstName: instructorData.firstName,
          lastName: instructorData.lastName,
          role: "INSTRUCTOR",
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add instructor');
      }
    },
    removeInstructor: async (id) => {
      try {
        const response = await axiosInstance.delete(`/api/admin/instructors/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    assignInstructorToCourse: async (instructorId, courseId) => {
      try {
        const response = await axiosInstance.put(
          `/api/admin/instructors/${instructorId}/assign-course/${courseId}`
        );
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    updateInstructor: async (instructorId, updatedData) => {
      try {
        const response = await axiosInstance.put(`/api/admin/instructors/${instructorId}`, updatedData);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getAllUsers: async () => {
      try {
        const response = await axiosInstance.get('/api/admin/users');
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getInstructors: async () => {
      try {
        const response = await axiosInstance.get('/api/admin/instructors');
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getAnalytics: async () => {
      try {
        const response = await axiosInstance.get('/api/admin/analytics');
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
  },
  instructor: {
    createCourse: async (courseData) => {
      try {
        const response = await axiosInstance.post('/api/instructor/courses', courseData);
        console.log("Create course response:", response.data);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    updateCourse: async (id, courseData) => {
      try {
        const response = await axiosInstance.put(`/api/instructor/courses/${id}`, courseData);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    deleteCourse: async (id) => {
      try {
        const response = await axiosInstance.delete(`/api/instructor/courses/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    createExam: async (examData) => {
      try {
        const response = await axiosInstance.post('/api/instructor/exams', examData);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    updateExam: async (examId, examData) => {
      try {
        const response = await axiosInstance.put(`/api/instructor/exams/${examId}`, examData);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    publishExam: async (examId) => {
      try {
        const response = await axiosInstance.put(`/api/instructor/exams/${examId}/publish`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getExamResults: async (examId) => {
      try {
        const response = await axiosInstance.get(`/api/instructor/exams/${examId}/results`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getCourses: async () => {
      try {
        const response = await axiosInstance.get('/api/instructor/courses');
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getEnrolledStudents: async (courseId) => {
      try {
        const response = await axiosInstance.get(`/api/instructor/courses/${courseId}/students`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getMyExams: async () => {
      try {
        const response = await axiosInstance.get('/api/instructor/exams');
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
  },
  student: {
    getEnrolledCourses: async () => {
      try {
        const response = await axiosInstance.get('/api/students/courses');
        console.log('Enrolled courses response:', response.data);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        return [];
      }
    },
    getAvailableCourses: async () => {
      try {
        const response = await axiosInstance.get('/api/students/courses/available');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        handleApiError(error);
      }
    },
    enrollInCourse: async (courseId) => {
      try {
        const response = await axiosInstance.post(`/api/students/courses/${courseId}/enroll`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getAvailableExams: async () => {
      try {
        const response = await axiosInstance.get('/api/students/exams');
        console.log('Available exams response:', response.data);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        return [];
      }
    },
    getExamDetails: async (examId) => {
      try {
        const response = await axiosInstance.get(`/api/students/exams/${examId}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    submitExam: async (payload) => {
      try {
        const response = await axiosInstance.post(`/api/students/exams/${payload.examId}/submit`, payload);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    
    getResults: async () => {
      try {
        const response = await axiosInstance.get('/api/students/results');
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
  },
  courses: {
    getCourseDetails: async (courseId) => {
      try {
        const response = await axiosInstance.get(`/api/courses/${courseId}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getAllCourses: async () => {
      try {
        const response = await axiosInstance.get('/api/courses');
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
  },
  questions: {
    createQuestion: async (questionData) => {
      try {
        const response = await axiosInstance.post('/api/questions', questionData);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    getQuestionsByExam: async (examId) => {
      try {
        const response = await axiosInstance.get(`/api/questions/exam/${examId}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
  },
};

export default api;
