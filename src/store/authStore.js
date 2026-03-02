import { create } from 'zustand';
import { auth, db } from '../firebase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export const useAuthStore = create((set) => ({
    user: null,
    profile: null,
    loading: true,
    error: null,

    // Initialize the auth listener
    init: () => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const profileRef = doc(db, 'users', user.uid);
                let profileSnap = await getDoc(profileRef);

                if (!profileSnap.exists()) {
                    // Check if email belongs to a student record
                    const studentQuery = query(collection(db, 'students'), where('email', '==', user.email));
                    const studentSnap = await getDocs(studentQuery);

                    let role = 'TRAINER';
                    let studentId = null;

                    if (!studentSnap.empty) {
                        role = 'STUDENT';
                        studentId = studentSnap.docs[0].id;
                        await updateDoc(doc(db, 'students', studentId), { authUID: user.uid });
                    }

                    const defaultProfile = {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName || 'Usuário',
                        role: role,
                        studentId: studentId,
                        createdAt: new Date().toISOString()
                    };
                    await setDoc(profileRef, defaultProfile);
                    profileSnap = await getDoc(profileRef);
                }

                set({ user, profile: profileSnap.data(), loading: false });
            } else {
                set({ user: null, profile: null, loading: false });
            }
        });
    },

    login: async (email, password) => {
        try {
            set({ error: null });
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            let message = "Erro ao fazer login. Verifique suas credenciais.";
            if (err.code === 'auth/user-not-found') message = "Usuário não encontrado.";
            if (err.code === 'auth/wrong-password') message = "Senha incorreta.";
            set({ error: message });
            throw err;
        }
    },

    register: async (email, password, name, role = 'TRAINER') => {
        try {
            set({ error: null });
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            // Detect role based on email during registration too
            const studentQuery = query(collection(db, 'students'), where('email', '==', email));
            const studentSnap = await getDocs(studentQuery);
            let finalRole = role;
            let studentId = null;

            if (!studentSnap.empty) {
                finalRole = 'STUDENT';
                studentId = studentSnap.docs[0].id;
                await updateDoc(doc(db, 'students', studentId), { authUID: user.uid });
            }

            const profileData = {
                uid: user.uid,
                email: email,
                name: name,
                role: finalRole,
                studentId: studentId,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), profileData);
            set({ profile: profileData });
        } catch (err) {
            set({ error: err.message });
            throw err;
        }
    },

    logout: async () => {
        await signOut(auth);
    }
}));
