import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  Timestamp,
  Query, // Query tipini içe aktarın
  FirestoreError,
} from "firebase/firestore";
// Removed unused auth imports
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   updateProfile,
//   sendPasswordResetEmail,
//   User,
//   onAuthStateChanged,
//   GoogleAuthProvider,
//   signInWithPopup,
//   Auth,
//   IdTokenResult,
//   AuthError,
// } from "firebase/auth";

import { db } from "../app/firebase/config";
// Removed unused auth import

// Firestore koşul tipi
interface FirestoreCondition {
  field: string;
  operator: "==" | ">" | "<" | ">=" | "<=";
  value: string | number | boolean | Date | null;
}

// Firestore veri servisi
export const firestoreService = {
  // Belge oluşturma
  createDocument: async <T>(
    collectionName: string,
    data: T,
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return docRef.id;
    } catch (error: unknown) {
      // Hata durumu
      const fbError = error as FirestoreError;

      throw fbError;
    }
  },

  // Belge silme
  deleteDocument: async (
    collectionName: string,
    docId: string,
  ): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);

      // Başarılı sonuç
    } catch (error: unknown) {
      // Hata durumu
      const fbError = error as FirestoreError;

      throw fbError;
    }
  },

  // Belge getirme
  getDocument: async <T>(
    collectionName: string,
    docId: string,
  ): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      // Başarılı sonuç

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        return null;
      }
    } catch (error: unknown) {
      // Hata durumu
      const fbError = error as FirestoreError;

      throw fbError;
    }
  },

  // Koleksiyon getirme
  getCollection: async <T>(
    collectionName: string,
    conditions?: FirestoreCondition[],
    sortField?: string,
    sortDirection?: "asc" | "desc",
    limitCount?: number,
  ): Promise<T[]> => {
    try {
      // Düzeltme: 'q' değişkeninin tipi Query<DocumentData, DocumentData> olarak belirtildi.
      let q: Query<DocumentData, DocumentData> = collection(db, collectionName);

      // Koşullar varsa ekle
      if (conditions && conditions.length > 0) {
        q = query(
          q,
          ...conditions.map((c) => where(c.field, c.operator, c.value)),
        );
      }

      // Sıralama varsa ekle
      if (sortField) {
        q = query(q, orderBy(sortField, sortDirection || "asc"));
      }

      // Limit varsa ekle
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as T,
      );

      return results;
    } catch (error: unknown) {
      // Hata durumu
      const fbError = error as FirestoreError;

      throw fbError;
    }
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
