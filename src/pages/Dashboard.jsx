import { Users, Dumbbell, ArrowRight, UserCheck } from 'lucide-react';
import { useStudentStore } from '../store/studentStore';
import { useWorkoutStore } from '../store/workoutStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const user = useAuthStore((state) => state.user);
    const profile = useAuthStore((state) => state.profile);
    const students = useStudentStore((state) => state.students);
    const workouts = useWorkoutStore((state) => state.workouts);

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Olá, {profile?.name || user?.displayName || 'Treinador'}</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Resumo do seu FitPro hoje</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {/* Stats Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total de Alunos</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{students.length}</h2>
                    </div>
                    <div style={{ background: 'var(--primary-glow)', padding: '1rem', borderRadius: 'var(--radius-full)' }}>
                        <Users size={32} color="var(--primary)" />
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Treinos Montados</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{workouts.length}</h2>
                    </div>
                    <div style={{ background: 'var(--accent-glow)', padding: '1rem', borderRadius: 'var(--radius-full)' }}>
                        <Dumbbell size={32} color="var(--accent)" />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Ações Rápidas</h3>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link to="/students" className="glass-panel hover-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '200px', cursor: 'pointer' }}>
                        <Users size={20} color="var(--primary)" />
                        <span style={{ fontWeight: 500 }}>Gerenciar Alunos</span>
                        <ArrowRight size={16} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
                    </Link>
                    <Link to="/workouts" className="glass-panel hover-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '200px', cursor: 'pointer' }}>
                        <Dumbbell size={20} color="var(--accent)" />
                        <span style={{ fontWeight: 500 }}>Montar Treinos</span>
                        <ArrowRight size={16} color="var(--text-secondary)" style={{ marginLeft: 'auto' }} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
