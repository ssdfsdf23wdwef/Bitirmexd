import React, { useState, useRef, useCallback } from "react";
import { FiUpload, FiCheck, FiAlertCircle, FiFile } from "react-icons/fi";
import documentService from "@/services/document.service";

interface DocumentUploaderProps {
  onFileUpload: (file: File, fileUrl: string) => void;

  onError?: (message: string) => void;

  maxSize?: number; // Size in MB

  className?: string;

  allowedFileTypes?: string[];

  // Yeni prop: Dosya yüklendikten sonra devam butonu gösterilsin mi?
  showContinueButton?: boolean;

  // Yeni prop: Devam butonuna tıklandığında çağrılacak fonksiyon
  onContinue?: () => void;
}

const DEFAULT_ALLOWED_TYPES = [".pdf", ".docx", ".doc", ".txt"];

export default function DocumentUploader({
  onFileUpload,
  onError,
  maxSize = 10,
  className = "",
  allowedFileTypes = DEFAULT_ALLOWED_TYPES,
  showContinueButton = false,
  onContinue,
}: DocumentUploaderProps) {
  // ----- State Definitions -----
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "validating" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----- Environment Check -----
  // Using process.env requires appropriate build tool setup (like Vite, Create React App, Next.js)
  const isDevelopment = process.env.NODE_ENV === "development";

  // ----- Core Upload Logic -----
  const uploadFile = useCallback(
    async (file: File) => {
      setUploadStatus("uploading");
      setUploadProgress(0); // Reset progress before starting

      // --- Development/Test Mode Simulation ---
      if (isDevelopment) {
        console.log("Geliştirme modu: Dosya yüklemesi simüle ediliyor.");
        // Simulate progress with more realistic increments
        let progress = 0;
        const interval = setInterval(() => {
          // Random increment between 5-15 for more realistic progress simulation
          const increment = Math.floor(Math.random() * 10) + 5;
          progress += increment;
          setUploadProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(interval);
            setUploadStatus("success");
            const mockFileUrl = `mock://uploaded/${encodeURIComponent(file.name)}`;
            // Callback needs the actual file object and the mock URL
            onFileUpload(file, mockFileUrl);
          }
        }, 200); // Slightly slower for better visual effect
        return; // Skip real upload
      }

      // --- Production Mode: Real Upload ---
      try {
        // Düzgün tip kullanımı
        const response = await documentService.uploadDocument(file);

        setUploadStatus("success");
        if (onFileUpload) {
          // Dosya URL'sini yanıttan al - response direkt DocumentType tipinde
          const fileUrl = response.storageUrl || "";
          onFileUpload(file, fileUrl);
        }
      } catch (error) {
        const friendlyMessage = (error as Error)?.message || "Bir hata oluştu.";
        setErrorMessage(friendlyMessage);
        setUploadStatus("error");
        if (onError) {
          onError(friendlyMessage);
        }
        // Hata loglaması için console.error kullan
        console.error("Dosya yükleme hatası:", error);
      }
    },
    [onFileUpload, onError, isDevelopment],
  ); // Include isDevelopment dependency

  // ----- File Selection and Validation -----
  const handleFileSelection = useCallback(
    async (file: File | null) => {
      if (!file) {
        resetUpload(); // Reset if no file is selected (e.g., user cancels dialog)
        return;
      }

      setUploadStatus("validating"); // Indicate validation is happening
      setErrorMessage(""); // Clear previous errors
      setSelectedFile(file); // Set the file temporarily for display

      try {
        // 1. File Type Check
        const fileExtension = file.name
          .substring(file.name.lastIndexOf("."))
          .toLowerCase();
        if (!allowedFileTypes.includes(fileExtension)) {
          throw new Error(
            `Desteklenmeyen dosya türü (${fileExtension}). İzin verilenler: ${allowedFileTypes.join(", ")}`,
          );
        }

        // 2. File Size Check
        const maxSizeInBytes = maxSize * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
          throw new Error(
            `Dosya boyutu çok büyük (${(file.size / 1024 / 1024).toFixed(2)}MB). Maksimum ${maxSize}MB olabilir.`,
          );
        }

        // Validation successful, proceed to upload
        // Use a microtask/timeout to ensure 'validating' state renders briefly if needed
        // Although `await uploadFile` will likely handle the transition smoothly.
        await uploadFile(file);
      } catch (error) {
        const msg = (error as Error)?.message || "Bir hata oluştu.";
        setErrorMessage(msg);
        setUploadStatus("error");
        setSelectedFile(null); // Clear selected file on validation error
        if (onError) onError(msg);
        // No need to log validation errors usually, unless desired
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowedFileTypes, maxSize, uploadFile, onError],
  ); // resetUpload might be needed if validation fails immediately

  // ----- Drag and Drop Event Handlers -----
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (uploadStatus !== "uploading" && uploadStatus !== "success") {
        setIsDragging(true);
      }
    },
    [uploadStatus],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (uploadStatus === "uploading" || uploadStatus === "success") {
        return; // Don't allow drop while uploading or after success
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleFileSelection(file);
        e.dataTransfer.clearData(); // Recommended practice
      }
    },
    [handleFileSelection, uploadStatus],
  );

  // ----- Input Change Handler -----
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        handleFileSelection(file);
      } else {
        // Handle case where user cancels file selection dialog
        if (uploadStatus !== "success") {
          // Don't reset if a file was already successfully uploaded
          resetUpload();
        }
      }
    },
    [handleFileSelection, uploadStatus],
  ); // Add dependencies

  // ----- Click Handler to Trigger Input -----
  const handleClick = useCallback(() => {
    // Don't trigger file input if already uploading, successful, or has error (use reset button)
    if (uploadStatus === "idle" || uploadStatus === "validating") {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }, [uploadStatus]); // Depend on uploadStatus

  // ----- Reset Function -----
  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setErrorMessage("");
    setIsDragging(false); // Ensure dragging state is reset

    // Reset the file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []); // No dependencies needed here usually

  // ----- Dynamic Styling -----
  const getBorderColor = () => {
    if (isDragging) return "border-blue-500 dark:border-blue-400";
    if (uploadStatus === "error") return "border-red-500 dark:border-red-400";
    if (uploadStatus === "success")
      return "border-green-500 dark:border-green-400";
    return "border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-400";
  };

  const getBackgroundColor = () => {
    if (isDragging) return "bg-blue-50 dark:bg-blue-900/20";
    if (uploadStatus === "error") return "bg-red-50 dark:bg-red-900/20";
    if (uploadStatus === "success") return "bg-green-50 dark:bg-green-900/20";
    return "bg-white dark:bg-gray-800";
  };

  const getHoverEffect = () => {
    if (uploadStatus === "idle" || uploadStatus === "validating") {
      return "hover:shadow-md transition-shadow duration-200";
    }
    return "";
  };

  const getCursorStyle = () => {
    switch (uploadStatus) {
      case "uploading":
        return "cursor-default"; // No action while uploading
      case "success":
      case "error":
        return "cursor-default"; // Use buttons for actions
      case "idle":
      case "validating":
      default:
        return "cursor-pointer"; // Allow click/drag
    }
  };

  // ----- Render Logic -----
  const renderContent = () => {
    switch (uploadStatus) {
      case "success":
        return (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shadow-sm">
              <FiCheck
                className="text-2xl text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
            </div>
            <p
              className="text-gray-800 dark:text-gray-200 font-medium mb-1 text-base"
              aria-live="polite"
            >
              Belge Başarıyla Yüklendi
            </p>
            <div className="flex items-center mb-3 text-sm text-gray-600 dark:text-gray-300 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-lg max-w-[90%] shadow-sm border border-gray-200 dark:border-gray-600">
              <FiFile className="flex-shrink-0 mr-1.5 text-green-500 dark:text-green-400" />
              <span className="truncate">{selectedFile?.name}</span>
            </div>
            {showContinueButton && onContinue ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Devam Et
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload();
                }}
                className="px-3.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Farklı Belge Yükle
              </button>
            )}
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-sm">
              <FiAlertCircle
                className="text-2xl text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>
            <p
              className="text-red-700 dark:text-red-300 font-medium mb-1 text-base"
              aria-live="assertive"
            >
              Yükleme Hatası
            </p>
            {/* Display error message */}
            <p className="text-red-600 dark:text-red-400 mb-3 max-w-[90%] text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="px-3.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Tekrar Dene
            </button>
          </div>
        );
      case "validating":
      case "uploading":
        // Combine validating and uploading visually, as validation is usually quick
        return (
          <div className="flex flex-col items-center text-center">
            {/* Simplified Spinner */}
            <div className="w-12 h-12 mb-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shadow-sm">
              <div className="w-8 h-8 border-2 border-blue-200 dark:border-blue-800 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
            </div>
            <p
              className="text-gray-800 dark:text-gray-200 font-medium mb-1 text-base"
              aria-live="polite"
            >
              {uploadStatus === "validating"
                ? "Doğrulanıyor..."
                : `Yükleniyor... ${uploadProgress}%`}
            </p>
            <div className="flex items-center mb-3 text-sm text-gray-600 dark:text-gray-300 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-lg max-w-[90%] shadow-sm border border-gray-200 dark:border-gray-600">
              <FiFile className="flex-shrink-0 mr-1.5 text-blue-500 dark:text-blue-400" />
              <span className="truncate">{selectedFile?.name}</span>
            </div>
            {uploadStatus === "uploading" &&
              !isDevelopment && ( // Show progress bar only during actual upload
                <div className="w-[90%] bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1 overflow-hidden shadow-inner">
                  <div
                    className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
          </div>
        );
      case "idle":
      default:
        return (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shadow-sm">
              <FiUpload
                className="text-2xl text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
            </div>
            <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
              Belge Yükleyin
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-2 text-xs">
              Dosyayı buraya sürükleyin veya tıklayın
            </p>
            <div className="inline-flex items-center px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200 dark:border-blue-800">
              <span>
                {allowedFileTypes
                  .map((ext) => ext.substring(1).toUpperCase())
                  .join(", ")}{" "}
                (Maks. {maxSize}MB)
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`border border-dashed rounded-xl p-4 sm:p-5 text-center transition-all duration-200 ease-in-out relative overflow-hidden ${getBorderColor()} ${getBackgroundColor()} ${getHoverEffect()} ${getCursorStyle()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button" // Makes it behave like a button for assistive technologies
        tabIndex={0} // Makes it focusable
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }} // Allow activation with Enter/Space
        aria-label={
          uploadStatus === "idle"
            ? `Dosya yüklemek için tıklayın veya sürükleyin. İzin verilen türler: ${allowedFileTypes.join(", ")}, Maksimum boyut: ${maxSize}MB`
            : "Dosya yükleme alanı"
        }
      >
        <input
          type="file"
          className="hidden" // Visually hidden but accessible
          onChange={handleFileChange}
          ref={fileInputRef}
          accept={allowedFileTypes.join(",")}
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center min-h-[110px] relative">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
