import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Handle Firestore errors by throwing a structured error object.
 */
const handleFirestoreError = (error: any, operationType: string, path: string | null = null) => {
  console.error(`Firestore Error [${operationType}] at [${path}]:`, error);
  throw error;
};

export const api = {
  get: async (path: string) => {
    try {
      if (path === '/api/settings') {
        const querySnapshot = await getDocs(collection(db, 'settings'));
        const settings: any = {};
        querySnapshot.forEach((doc) => {
          settings[doc.id] = doc.data().value;
        });
        return settings;
      }

      if (path === '/api/assets') {
        const q = query(collection(db, 'assets'), orderBy('id', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
      }

      const collectionName = path.split('/').pop() || '';
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
    } catch (error) {
      handleFirestoreError(error, 'get', path);
    }
  },

  post: async (path: string, body: any) => {
    try {
      if (path === '/api/assets/bulk-update') {
        const { ids, updates } = body;
        const batch = writeBatch(db);
        ids.forEach((id: string) => {
          const docRef = doc(db, 'assets', id);
          batch.update(docRef, updates);
        });
        await batch.commit();
        return { success: true };
      }

      if (path === '/api/assets/bulk-delete') {
        const { ids } = body;
        const batch = writeBatch(db);
        ids.forEach((id: string) => {
          const docRef = doc(db, 'assets', id);
          batch.delete(docRef);
        });
        await batch.commit();
        return { success: true };
      }

      const collectionName = path.split('/').pop() || '';
      
      // If an ID is provided in the body, use it as the document ID
      if (body.id) {
        const docRef = doc(db, collectionName, body.id);
        await setDoc(docRef, body);
        return { ...body, firebaseId: body.id };
      }

      const docRef = await addDoc(collection(db, collectionName), body);
      return { ...body, firebaseId: docRef.id };
    } catch (error) {
      handleFirestoreError(error, 'post', path);
    }
  },

  put: async (path: string, body: any) => {
    try {
      if (path === '/api/settings') {
        const batch = writeBatch(db);
        for (const [key, value] of Object.entries(body)) {
          const docRef = doc(db, 'settings', key);
          batch.set(docRef, { key, value }, { merge: true });
        }
        await batch.commit();
        return { success: true };
      }

      const parts = path.split('/');
      const id = parts.pop() || '';
      const collectionName = parts.pop() || '';
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, body);
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, 'put', path);
    }
  },

  delete: async (path: string) => {
    try {
      const parts = path.split('/');
      const id = parts.pop() || '';
      const collectionName = parts.pop() || '';
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, 'delete', path);
    }
  }
};
