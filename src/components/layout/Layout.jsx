import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Users, Dumbbell, CalendarRange, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useStudentStore } from '../../store/studentStore';
import { useWorkoutStore } from '../../store/workoutStore';
import SyncIndicator from '../ui/SyncIndicator';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const profile = useAuthStore((state) => state.profile);

    const subscribeToStudents = useStudentStore((state) => state.subscribeToStudents);
    const subscribeToWorkouts = useWorkoutStore((state) => state.subscribeToWorkouts);
    const subscribeToMyWorkout = useWorkoutStore((state) => state.subscribeToMyWorkout);

    useEffect(() => {
        if (!user?.uid || !profile) return;

        let unsubs = [];

        if (profile.role === 'TRAINER' || profile.role === 'ADMIN' || profile.role === 'MASTER') {
            unsubs.push(subscribeToStudents(user.uid));
            unsubs.push(subscribeToWorkouts(user.uid));
        } else if (profile.role === 'STUDENT') {
            unsubs.push(subscribeToMyWorkout(user.uid));
        }

        return () => unsubs.forEach(unsub => unsub?.());
    }, [user, profile, subscribeToStudents, subscribeToWorkouts, subscribeToMyWorkout]);

    const navItems = [
        { name: 'Home', path: '/', icon: <Home size={24} />, roles: ['TRAINER'] },
        { name: 'Alunos', path: '/students', icon: <Users size={24} />, roles: ['TRAINER'] },
        { name: 'Treinos', path: '/workouts', icon: <Dumbbell size={24} />, roles: ['TRAINER'] },
        { name: 'Meu Treino', path: '/my-workout', icon: <Dumbbell size={24} />, roles: ['STUDENT'] },
        { name: 'Painel Master', path: '/admin', icon: <CalendarRange size={24} />, roles: ['ADMIN', 'MASTER'] }
    ];

    const filteredNavItems = navItems.filter(item =>
        !item.roles || (profile && item.roles.includes(profile.role))
    );

    return (
        <div className="app-container">
            {/* Sidebar for Desktop */}
            <aside className="sidebar glass-panel">
                <div className="sidebar-header">
                    <CalendarRange size={32} color="var(--primary)" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.1rem' }}>FitPro</h2>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, whiteSpace: 'nowrap', opacity: 0.8 }}>
                            {(profile?.role === 'ADMIN' || profile?.role === 'MASTER') ? 'MASTER' : profile?.role === 'STUDENT' ? 'ALUNO' : 'TREINADOR'}
                        </span>
                        <div style={{ marginTop: '0.25rem' }}>
                            <SyncIndicator sm />
                        </div>
                    </div>
                </div>

                <nav className="desktop-nav" style={{ marginTop: '1rem' }}>
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}

                    <button onClick={logout} className="nav-item" style={{ marginTop: 'auto', background: 'none', border: 'none', width: '100%', cursor: 'pointer', color: '#ef4444' }}>
                        <LogOut size={24} />
                        <span>Sair</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <Header />
                {children || <Outlet />}
            </main>

            {/* Bottom Navigation for Mobile */}
            <nav className="bottom-nav">
                <div className="bottom-nav-inner">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                        >
                            <div className="nav-icon-wrapper">
                                {item.icon}
                            </div>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default Layout;
