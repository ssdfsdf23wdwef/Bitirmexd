import apiService from "@/services/api.service";
import { withErrorHandling } from "@/lib/request.utils";
import { Course, CourseStats, CourseDashboard } from "@/types/course.type";

class CourseService {
  async createCourse(courseData: { name: string }): Promise<Course> {
    // Önce mevcut kursları kontrol et
    const existingCourses = await this.getCourses();

    // Aynı isimde bir kurs var mı kontrol et (büyük-küçük harf duyarsız)
    const isDuplicate = existingCourses.some(
      (course) => course.name.toLowerCase() === courseData.name.toLowerCase(),
    );

    if (isDuplicate) {
      const errorMessage = `"${courseData.name}" adlı bir ders zaten mevcut. Lütfen farklı bir isim seçin.`;
      throw new Error(errorMessage);
    }

    return withErrorHandling(
      () => apiService.post<Course>("/courses", courseData),
      "Kurs oluşturulamadı",
    );
  }

  async deleteCourse(id: string): Promise<boolean> {
    await withErrorHandling(
      () => apiService.delete(`/courses/${id}`),
      "Kurs silinemedi",
    );
    return true;
  }

  async getCourses(): Promise<Course[]> {
    return withErrorHandling(
      () => apiService.get<Course[]>("/courses"),
      "Kurslar alınamadı",
    );
  }

  async getCourseById(id: string): Promise<Course> {
    return withErrorHandling(
      () => apiService.get<Course>(`/courses/${id}`),
      "Kurs bulunamadı",
    );
  }

  async getCourseStats(id: string): Promise<CourseStats> {
    return withErrorHandling(
      () => apiService.get<CourseStats>(`/courses/${id}/stats`),
      "Kurs istatistikleri alınamadı",
    );
  }

  async getCourseDashboard(id: string): Promise<CourseDashboard> {
    return withErrorHandling(
      () =>
        apiService.get<CourseDashboard>(`/courses/${id}/dashboard`),
      "Kurs panosu alınamadı",
    );
  }

  async getRelatedItemsCount(id: string): Promise<RelatedItemsCountResponse> {
    return withErrorHandling(
      () =>
        apiService.get<RelatedItemsCountResponse>(
          `/courses/${id}/related-items`,
        ),
      "İlgili öğeler alınamadı",
    );
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    return withErrorHandling(
      () => apiService.put<Course>(`/courses/${id}`, courseData),
      "Kurs güncellenemedi",
    );
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
