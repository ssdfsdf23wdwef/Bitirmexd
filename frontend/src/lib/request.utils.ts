import ErrorService from "@/services/error.service";

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  message = "İşlem sırasında bir hata oluştu",
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (message) {
      ErrorService.showToast(message, "error", "İstek");
    }
    throw error;
  }
}
