import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../firebase';
import { CollectionReference, collection, query, where, setDoc, doc, onSnapshot, addDoc, orderBy, limit, serverTimestamp, deleteDoc } from 'firebase/firestore';

export const useWorkoutStore = create(
    persist(
        (set, get) => ({
            workouts: [], // Array of { studentId, routine, ...metadata, schedule }
            templates: [], // Array of { id, name, routine, ...metadata }
            sessions: [], // Training logs for evolution

            subscribeToTemplates: (trainerId) => {
                if (!trainerId) return;
                const q = query(collection(db, 'templates'), where('trainerId', '==', trainerId));
                return onSnapshot(q, (snapshot) => {
                    const templates = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
                    set({ templates });
                });
            },

            subscribeToWorkouts: (trainerId) => {
                if (!trainerId) return;
                const q = query(collection(db, 'workouts'), where('trainerId', '==', trainerId));
                return onSnapshot(q, (snapshot) => {
                    const workouts = snapshot.docs.map(docSnap => ({ ...docSnap.data(), studentId: docSnap.id }));
                    set({ workouts });
                });
            },

            subscribeToMyWorkout: (studentId) => {
                if (!studentId) return;
                const docRef = doc(db, 'workouts', studentId);
                return onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        set((state) => ({
                            workouts: [{ ...docSnap.data(), studentId: docSnap.id }]
                        }));
                    }
                });
            },

            saveStudentRoutine: async (studentId, trainerId, routine, metadata = {}, schedule = {}) => {
                const workoutRef = doc(db, 'workouts', studentId);
                await setDoc(workoutRef, {
                    trainerId,
                    routine,
                    ...metadata,
                    schedule,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            },

            saveTemplate: async (trainerId, template) => {
                const templateRef = template.id ? doc(db, 'templates', template.id) : doc(collection(db, 'templates'));
                const { id, ...data } = template;
                await setDoc(templateRef, { ...data, trainerId, updatedAt: serverTimestamp() });
            },

            deleteTemplate: async (templateId) => {
                const templateRef = doc(db, 'templates', templateId);
                await deleteDoc(templateRef);
            },

            deleteStudentWorkout: async (studentId) => {
                const workoutRef = doc(db, 'workouts', studentId);
                await deleteDoc(workoutRef);
            },

            getStudentRoutine: (state, studentId) => {
                return state.workouts.find(w => w.studentId === studentId) || { studentId, routine: [] };
            },

            saveWorkoutSession: async (studentId, trainerId, sessionData) => {
                const sessionRef = collection(db, 'workout_sessions');
                await addDoc(sessionRef, {
                    ...sessionData,
                    studentId,
                    trainerId,
                    createdAt: serverTimestamp()
                });
            },

            subscribeToStudentSessions: (studentId) => {
                if (!studentId) return;
                const q = query(
                    collection(db, 'workout_sessions'),
                    where('studentId', '==', studentId),
                    orderBy('createdAt', 'desc'),
                    limit(50)
                );
                return onSnapshot(q, (snapshot) => {
                    const sessions = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
                    set({ sessions });
                });
            },
        }),
        {
            name: 'personal-trainer-workouts',
        }
    )
);

