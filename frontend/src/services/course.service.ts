import apiService from "@/services/api.service";
import { Course, CourseStats, CourseDashboard } from "@/types/course.type";

/**
 * Kurs servisi
 * Kurslarla ilgili API isteklerini yönetir
 */
class CourseService {
  /**
   * Yeni bir kurs oluşturur
   * @param courseData Kurs verileri
   * @returns Oluşturulan kurs
   * @throws Aynı isimde bir kurs zaten varsa hata fırlatır
   */
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

  /**
   * Belirli bir kursu siler
   * @param id Silinecek kursun ID'si
   * @returns Silme işlemi başarılı olursa true, değilse false
   */
  async deleteCourse(id: string): Promise<boolean> {
    try {
      await apiService.delete(`/courses/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tüm kursları getirir
   * @returns Kurs listesi
   */
  async getCourses(): Promise<Course[]> {
    try {
      const courses = await apiService.get<Course[]>("/courses");
      return courses;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Belirli bir kursun detaylarını getirir
   * @param id Kurs ID
   * @returns Kurs detayları
   */
  async getCourseById(id: string): Promise<Course> {
    try {
      const course = await apiService.get<Course>(`/courses/${id}`);
      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ders istatistiklerini getir
   * @param id Kurs ID
   * @returns Kurs istatistikleri
   */
  async getCourseStats(id: string): Promise<CourseStats> {
    try {
      const stats = await apiService.get<CourseStats>(`/courses/${id}/stats`);
      return stats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ders dashboard bilgilerini getir
   * @param id Kurs ID
   * @returns Kurs dashboard bilgisi
   */
  async getCourseDashboard(id: string): Promise<CourseDashboard> {
    try {
      const dashboardData = await apiService.get<CourseDashboard>(`/courses/${id}/dashboard`);
      return dashboardData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Derse ait ilişkili öğelerin sayılarını getir (Backend'in döndürdüğü format)
   * @param id Kurs ID
   * @returns İlişkili öğe sayıları
   */
  async getRelatedItemsCount(id: string): Promise<RelatedItemsCountResponse> {
    try {
      const counts = await apiService.get<RelatedItemsCountResponse>(`/courses/${id}/related-items`);
      return counts;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Kurs günceller
   * @param id Kurs ID
   * @param courseData Güncellenecek veriler
   * @returns Güncellenmiş kurs
   */
  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    try {
      const course = await apiService.put<Course>(`/courses/${id}`, courseData);
      return course;
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Backend'in döndürdüğü ilişkili öğe sayısı yanıtı
 * Bu arayüz backend yanıtına göre tanımlanmıştır ve frontend türlerinden farklı olabilir.
 */
interface RelatedItemsCountResponse {
  courseId: string;
  learningTargets: number;
  quizzes: number;
  failedQuestions: number; // Bu alan frontend CourseStats'da yok, backend'e özgü olabilir
  documents: number;
  total: number;
}

const courseService = new CourseService();

export default courseService;
