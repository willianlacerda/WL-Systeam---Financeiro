import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { FinancialData } from '../types';
import { INITIAL_DATA } from './api';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: The app will break without passing firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline fallback ativo.');
    }
  }
}
testConnection();

const FINANCIAL_DATA_DOC = 'main';
const FINANCIAL_DATA_COLLECTION = 'system_data';

/**
 * Carrega os dados financeiros consolidados do Firestore na nuvem
 */
export async function getFirebaseFinancialData(): Promise<FinancialData | null> {
  try {
    const docRef = doc(db, FINANCIAL_DATA_COLLECTION, FINANCIAL_DATA_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as FinancialData;
      return {
        expenses: Array.isArray(data.expenses) ? data.expenses : [],
        sales: Array.isArray(data.sales) ? data.sales : [],
        subCategories: Array.isArray(data.subCategories) ? data.subCategories : INITIAL_DATA.subCategories,
        cities: Array.isArray(data.cities) ? data.cities : INITIAL_DATA.cities,
        appUsers: Array.isArray(data.appUsers) ? data.appUsers : INITIAL_DATA.appUsers,
        settings: data.settings || INITIAL_DATA.settings,
      };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do Firestore:', error);
    return null;
  }
}

/**
 * Salva os dados financeiros consolidados no Firestore
 */
export async function saveFirebaseFinancialData(data: FinancialData): Promise<boolean> {
  try {
    const docRef = doc(db, FINANCIAL_DATA_COLLECTION, FINANCIAL_DATA_DOC);
    // Remove qualquer campo undefined que possa impedir o salvamento no Firestore
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(docRef, {
      ...cleanData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    
    // Atualiza também o cache local imediatamente
    try {
      localStorage.setItem('wl_system_data', JSON.stringify(cleanData));
    } catch (e) {}

    console.log('✅ Dados sincronizados no Firestore com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar no Firestore:', error);
    return false;
  }
}

/**
 * Assina atualizações em tempo real do Firestore.
 * Qualquer alteração feita no celular ou no computador sincroniza instantaneamente!
 */
export function subscribeToFirebaseFinancialData(
  onUpdate: (data: FinancialData) => void,
  onError?: (err: any) => void
): () => void {
  const docRef = doc(db, FINANCIAL_DATA_COLLECTION, FINANCIAL_DATA_DOC);
  
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const raw = snap.data() as FinancialData;
        const normalized: FinancialData = {
          expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
          sales: Array.isArray(raw.sales) ? raw.sales : [],
          subCategories: Array.isArray(raw.subCategories) ? raw.subCategories : INITIAL_DATA.subCategories,
          cities: Array.isArray(raw.cities) ? raw.cities : INITIAL_DATA.cities,
          appUsers: Array.isArray(raw.appUsers) ? raw.appUsers : INITIAL_DATA.appUsers,
          settings: raw.settings || INITIAL_DATA.settings,
        };
        // Mantém o cache local atualizado com a nuvem
        try {
          localStorage.setItem('wl_system_data', JSON.stringify(normalized));
        } catch (e) {}
        
        onUpdate(normalized);
      }
    },
    (error) => {
      console.warn('Erro na sincronização em tempo real do Firestore:', error);
      if (onError) onError(error);
    }
  );
}
