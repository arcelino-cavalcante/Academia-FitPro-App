import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Users, TrendingUp, DollarSign, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalTrainers: 0,
        totalStudents: 0,
        revenue: 0
    });
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                // Fetch All Trainers
                const trainersQuery = query(collection(db, 'users'), where('role', '==', 'TRAINER'));
                const trainerSnap = await getDocs(trainersQuery);
                const trainersList = trainerSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

                // Fetch All Students
                const studentsSnap = await getDocs(collection(db, 'students'));
                const studentsList = studentsSnap.docs.map(doc => doc.data());

                // Calculate Trainers' Student Counts
                const trainersWithCounts = trainersList.map(trainer => ({
                    ...trainer,
                    studentCount: studentsList.filter(s => s.trainerId === trainer.uid).length
                }));

                setTrainers(trainersWithCounts);
                setStats({
                    totalTrainers: trainersList.length,
                    totalStudents: studentsList.length,
                    revenue: trainersList.length * 49.90 // Example fixed price per trainer
                });
            } catch (err) {
                console.error("Erro ao carregar dados administrativos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div className="animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Master Admin</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Visão geral da plataforma FitPro SaaS</p>
            </header>

            {/* Admin Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total de Treinadores</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalTrainers}</h2>
                        </div>
                        <div style={{ background: 'var(--primary-glow)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                            <UserCheck size={24} color="var(--primary)" />
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total de Alunos</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalStudents}</h2>
                        </div>
                        <div style={{ background: 'var(--accent-glow)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                            <Users size={24} color="var(--accent)" />
                        </div>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Faturamento Estimado</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>R$ {stats.revenue.toFixed(2)}</h2>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                            <DollarSign size={24} color="#22c55e" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Trainers Table */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Treinadores Cadastrados</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Nome</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>E-mail</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center' }}>Alunos</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Desde</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trainers.map(trainer => (
                                <tr key={trainer.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{trainer.name}</td>
                                    <td style={{ padding: '1rem' }}>{trainer.email}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                                            {trainer.studentCount} alunos
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
