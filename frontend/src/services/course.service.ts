import apiService from "@/services/api.service";
import { Course, CourseStats, CourseDashboard } from "@/types/course.type";


class CourseService {

  async createCourse(courseData: { name: string }): Promise<Course> {
    try {
      // Önce mevcut kursları kontrol et
      const existingCourses = await this.getCourses();
      
      // Aynı isimde bir kurs var mı kontrol et (büyük-küçük harf duyarsız)
      const isDuplicate = existingCourses.some(
        course => course.name.toLowerCase() === courseData.name.toLowerCase()
      );
      
      if (isDuplicate) {
        const errorMessage = `"${courseData.name}" adlı bir ders zaten mevcut. Lütfen farklı bir isim seçin.`;
        
        // Özel bir hata fırlat
        const error = new Error(errorMessage);
        throw error;
      }

      const newCourse = await apiService.post<Course>('/courses', courseData);
      return newCourse;
    } catch (error) {
      // Hata zaten oluşturulmuşsa tekrar işleme
      if ((error as Error).message?.includes('zaten mevcut')) {
        throw error;
      }
      
      // Diğer hatalar
      throw error;
    }
  }


  async deleteCourse(id: string): Promise<boolean> {
    try {
      await apiService.delete(`/courses/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async getCourses(): Promise<Course[]> {
    try {
      const courses = await apiService.get<Course[]>("/courses");
      return courses;
    } catch (error) {
      throw error;
    }
  }

  async getCourseById(id: string): Promise<Course> {
    try {
      const course = await apiService.get<Course>(`/courses/${id}`);
      return course;
    } catch (error) {
      throw error;
    }
  }

 
  async getCourseStats(id: string): Promise<CourseStats> {
    try {
      const stats = await apiService.get<CourseStats>(`/courses/${id}/stats`);
      return stats;
    } catch (error) {
      throw error;
    }
  }

  async getCourseDashboard(id: string): Promise<CourseDashboard> {
    try {
      const dashboardData = await apiService.get<CourseDashboard>(`/courses/${id}/dashboard`);
      return dashboardData;
    } catch (error) {
      throw error;
    }
  }

  async getRelatedItemsCount(id: string): Promise<RelatedItemsCountResponse> {
    try {
      const counts = await apiService.get<RelatedItemsCountResponse>(`/courses/${id}/related-items`);
      return counts;
    } catch (error) {
      throw error;
    }
  }

 
  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    try {
      const course = await apiService.put<Course>(`/courses/${id}`, courseData);
      return course;
    } catch (error) {
      throw error;
    }
  }
}

interface RelatedItemsCountResponse {
  courseId: string;
  learningTargets: number;
  quizzes: number;
  failedQuestions: number; 
  documents: number;
  total: number;
}

const courseService = new CourseService();

export default courseService;
