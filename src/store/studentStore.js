import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const useStudentStore = create(
    persist(
        (set, get) => ({
            students: [],
            loading: false,

            // Sync with Firestore in real-time
            subscribeToStudents: (trainerId) => {
                if (!trainerId) return;
                const q = query(collection(db, 'students'), where('trainerId', '==', trainerId));
                return onSnapshot(q, (snapshot) => {
                    const students = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    set({ students });
                });
            },

            addStudent: async (student, trainerId) => {
                const newStudent = { ...student, trainerId, createdAt: serverTimestamp() };
                await addDoc(collection(db, 'students'), newStudent);
                // The onSnapshot will update the local state
            },

            updateStudent: async (id, updatedData) => {
                const studentRef = doc(db, 'students', id);
                await updateDoc(studentRef, updatedData);
            },

            removeStudent: async (id) => {
                const studentRef = doc(db, 'students', id);
                await deleteDoc(studentRef);
            },
        }),
        {
            name: 'personal-trainer-students',
        }
    )
);

