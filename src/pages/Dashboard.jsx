import { Users, Dumbbell, ArrowRight } from 'lucide-react';
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
        <div className="animate-fade-in" style={{ position: 'relative', minHeight: '100%', padding: '1rem' }}>
            {/* Liquid Background Layer */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', background: 'var(--primary)', width: '400px', height: '400px', top: '-10%', left: '-5%', opacity: 0.15, animation: 'float 15s infinite alternate ease-in-out' }}></div>
                <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', background: 'var(--accent)', width: '300px', height: '300px', top: '40%', right: '-5%', opacity: 0.1, animation: 'float 20s infinite alternate ease-in-out', animationDelay: '-5s' }}></div>
            </div>

            <header style={{ marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', margin: 0 }}>Resumo do seu FitPro hoje, <strong style={{ color: '#fff' }}>{profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Treinador'}</strong></p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
                {/* Stats Card - Alunos */}
                <div className="glass-panel hover-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '1.5rem' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Total de Alunos</p>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: 700, marginTop: '0.5rem', lineHeight: 1 }}>{students.length}</h2>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(0,123,255,0.2), rgba(0,191,255,0.1))', padding: '1.25rem', borderRadius: '24px', border: '1px solid rgba(0,123,255,0.2)', boxShadow: 'inset 0 0 20px rgba(0,123,255,0.1)' }}>
                        <Users size={36} color="var(--primary)" />
                    </div>
                </div>

                {/* Stats Card - Treinos */}
                <div className="glass-panel hover-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '1.5rem' }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Treinos Montados</p>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', fontWeight: 700, marginTop: '0.5rem', lineHeight: 1 }}>{workouts.length}</h2>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(192,132,252,0.1))', padding: '1.25rem', borderRadius: '24px', border: '1px solid rgba(147,51,234,0.2)', boxShadow: 'inset 0 0 20px rgba(147,51,234,0.1)' }}>
                        <Dumbbell size={36} color="var(--accent)" />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '4rem', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Ações Rápidas</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <Link to="/students" className="glass-panel hover-card group" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '1.25rem', textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,123,255,0.1)', border: '1px solid rgba(0,123,255,0.2)' }}>
                            <Users size={24} color="var(--primary)" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Gerenciar Alunos</span>
                        <ArrowRight size={20} color="var(--text-secondary)" style={{ marginLeft: 'auto', transition: 'transform 0.3s ease' }} className="arrow-icon" />
                    </Link>

                    <Link to="/workouts" className="glass-panel hover-card group" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '1.25rem', textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.2)' }}>
                            <Dumbbell size={24} color="var(--accent)" />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Montar Treinos</span>
                        <ArrowRight size={20} color="var(--text-secondary)" style={{ marginLeft: 'auto', transition: 'transform 0.3s ease' }} className="arrow-icon" />
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .hover-card.group:hover .arrow-icon {
                    transform: translateX(5px);
                    color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
