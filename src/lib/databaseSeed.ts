import { collection, query, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export const initialAssets = [
  { id: '1', name: 'MacBook Pro 14', category: 'Laptop', serialNumber: 'MBP14-001', model: 'A2442', vendor: 'Apple', status: 'available', condition: 'new', purchaseDate: '2024-01-15', warrantyUntil: '2026-01-15', location: 'HQ - Floor 2', department: 'Engineering', value: 2499, assignedTo: null },
  { id: '2', name: 'iPhone 15 Pro', category: 'Mobile', serialNumber: 'IPH15P-004', model: 'A3101', vendor: 'Apple', status: 'assigned', condition: 'good', purchaseDate: '2023-10-10', warrantyUntil: '2025-10-10', location: 'Remote', department: 'Engineering', value: 1099, assignedTo: 'e1' },
  { id: '3', name: 'Dell UltraSharp 27', category: 'Monitor', serialNumber: 'DU27-008', model: 'U2723QE', vendor: 'Dell', status: 'available', condition: 'good', purchaseDate: '2023-05-20', warrantyUntil: '2026-05-20', location: 'HQ - Floor 1', department: 'Sales', value: 599, assignedTo: null }
];

export const initialEmployees = [
  { id: 'e1', name: 'Jane Cooper', email: 'jane@company.com', role: 'Software Engineer', department: 'Engineering', systemRole: 'user' },
  { id: 'e2', name: 'Mark Lee', email: 'mark@company.com', role: 'Sales Manager', department: 'Sales', systemRole: 'user' }
];

export const initialMaintenance = [
  { id: 'm1', assetId: '1', type: 'repair', description: 'Screen replaced', cost: 450, date: '2024-03-01', performedBy: 'Genius Bar' }
];

export const initialSettings = [
  { key: 'instance_name', value: 'AssetHub (Firebase Edition)' },
  { key: 'primary_region', value: 'us-west1' }
];

export async function seedDatabase() {
  try {
    const q = query(collection(db, 'assets'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("Seeding Firebase with initial data...");
      
      for (const asset of initialAssets) {
        await setDoc(doc(db, 'assets', asset.id), asset);
      }
      for (const emp of initialEmployees) {
        await setDoc(doc(db, 'employees', emp.id), emp);
      }
      for (const m of initialMaintenance) {
        await setDoc(doc(db, 'maintenance', m.id), m);
      }
      for (const s of initialSettings) {
        await setDoc(doc(db, 'settings', s.key), s);
      }
      
      console.log("Firebase seeding complete.");
      return true;
    }
    return false;
  } catch (e) {
    console.error("Seeding logic error:", e);
    throw e;
  }
}
