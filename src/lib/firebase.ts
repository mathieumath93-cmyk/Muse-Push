import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { ModelProfile, WinningExample } from '../types';
import { INITIAL_MODELS, DEFAULT_WINNING_EXAMPLES } from '../data';

// Firebase configuration provided by AI Studio Provisioning
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0629460348",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:906686108779:web:241a3c262975dc42e74d2e",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBp3hK-6JqWStVIlJfyn_aga8qpgPZV2Bo",
  authDomain: "gen-lang-client-0629460348.firebaseapp.com",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-8f8ea797-b318-427d-a871-c5c5b42d68e8",
  storageBucket: "gen-lang-client-0629460348.firebasestorage.app",
  messagingSenderId: "906686108779"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const MODELS_COLLECTION = 'models';
const TRAINING_COLLECTION = 'training_examples';
const AGENCY_COLLECTION = 'agency_settings';
const PLAYBOOK_DOC_ID = 'global_playbook';

/**
 * Synchronise en temps réel les profils modèles avec Firestore.
 * Si la base est encore vide, initialise avec les modèles par défaut.
 */
export function subscribeModels(
  onUpdate: (models: ModelProfile[]) => void,
  onError?: (err: any) => void
): () => void {
  const modelsRef = collection(db, MODELS_COLLECTION);
  let seeded = false;

  return onSnapshot(
    modelsRef,
    async (snapshot) => {
      if (snapshot.empty && !seeded) {
        seeded = true;
        console.log('[Firebase] Seeding models to Firestore (preserving existing local models if present)...');
        try {
          const localSaved = typeof window !== 'undefined' ? localStorage.getItem('musepush_models') : null;
          let toSeed: ModelProfile[] = INITIAL_MODELS;
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                toSeed = parsed;
              }
            } catch {}
          }

          for (let i = 0; i < toSeed.length; i++) {
            const m = toSeed[i];
            await setDoc(doc(db, MODELS_COLLECTION, m.id), {
              ...m,
              orderIndex: i,
              createdAt: Date.now()
            });
          }
        } catch (e) {
          console.warn('[Firebase] Auto-seed models error:', e);
        }
        return;
      }

      const items: ModelProfile[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || '',
          age: data.age || 22,
          avatar: data.avatar || '',
          personality: data.personality || '',
          realLifeOccupation: data.realLifeOccupation || '',
          homeHabits: data.homeHabits || '',
          favoriteEmojis: data.favoriteEmojis || ['✨', '🫦'],
          defaultLanguage: data.defaultLanguage || 'fr',
          preferredPlatforms: data.preferredPlatforms || ['mym', 'onlyfans'],
          customToneNotes: data.customToneNotes || ''
        });
      });

      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (err) => {
      console.error('[Firebase] models subscribe error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Enregistre ou met à jour un profil modèle dans Firestore
 */
export async function saveModelToCloud(model: ModelProfile): Promise<void> {
  const ref = doc(db, MODELS_COLLECTION, model.id);
  await setDoc(
    ref,
    {
      ...model,
      updatedAt: Date.now()
    },
    { merge: true }
  );
}

/**
 * Supprime un profil modèle de Firestore
 */
export async function deleteModelFromCloud(modelId: string): Promise<void> {
  const ref = doc(db, MODELS_COLLECTION, modelId);
  await deleteDoc(ref);
}

/**
 * Synchronise en temps réel les exemples d'entraînement gagnants
 */
export function subscribeTrainingExamples(
  onUpdate: (examples: WinningExample[]) => void,
  onError?: (err: any) => void
): () => void {
  const trainRef = collection(db, TRAINING_COLLECTION);
  let seeded = false;

  return onSnapshot(
    trainRef,
    async (snapshot) => {
      if (snapshot.empty && !seeded) {
        seeded = true;
        console.log('[Firebase] Seeding winning examples to Firestore...');
        try {
          const localSaved = typeof window !== 'undefined' ? localStorage.getItem('musepush_training_examples') : null;
          let toSeed: WinningExample[] = DEFAULT_WINNING_EXAMPLES;
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                toSeed = parsed;
              }
            } catch {}
          }

          for (let i = 0; i < toSeed.length; i++) {
            const item = toSeed[i];
            await setDoc(doc(db, TRAINING_COLLECTION, item.id), {
              ...item,
              orderIndex: i,
              createdAt: Date.now()
            });
          }
        } catch (e) {
          console.warn('[Firebase] Auto-seed training error:', e);
        }
        return;
      }

      const items: WinningExample[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || '',
          platform: data.platform || 'onlyfans',
          language: data.language || 'fr',
          mood: data.mood || 'daily_life',
          text: data.text || '',
          revenueGenerated: data.revenueGenerated,
          openRate: data.openRate,
          notes: data.notes
        });
      });

      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (err) => {
      console.error('[Firebase] training subscribe error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Sauvegarde un exemple d'entraînement gagnant
 */
export async function saveTrainingExampleToCloud(example: WinningExample): Promise<void> {
  const ref = doc(db, TRAINING_COLLECTION, example.id);
  await setDoc(ref, { ...example, updatedAt: Date.now() }, { merge: true });
}

/**
 * Supprime un exemple d'entraînement de Firestore
 */
export async function deleteTrainingExampleFromCloud(id: string): Promise<void> {
  const ref = doc(db, TRAINING_COLLECTION, id);
  await deleteDoc(ref);
}

/**
 * Synchronise les règles du playbook d'agence
 */
export function subscribePlaybookRules(
  onUpdate: (rules: string) => void,
  onError?: (err: any) => void
): () => void {
  const docRef = doc(db, AGENCY_COLLECTION, PLAYBOOK_DOC_ID);
  let seeded = false;

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists() && !seeded) {
        seeded = true;
        const localRules = typeof window !== 'undefined' ? localStorage.getItem('musepush_playbook_rules') : null;
        if (localRules) {
          await setDoc(docRef, { rules: localRules, updatedAt: Date.now() }, { merge: true });
        }
        return;
      }

      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data.rules === 'string') {
          onUpdate(data.rules);
        }
      }
    },
    (err) => {
      console.error('[Firebase] playbook subscribe error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Sauvegarde les règles du playbook d'agence
 */
export async function savePlaybookRulesToCloud(rules: string): Promise<void> {
  const docRef = doc(db, AGENCY_COLLECTION, PLAYBOOK_DOC_ID);
  await setDoc(docRef, { rules, updatedAt: Date.now() }, { merge: true });
}
