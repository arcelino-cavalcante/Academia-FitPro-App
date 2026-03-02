import React, { useState, useEffect } from 'react';
import { useStudentStore } from '../store/studentStore';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import { Plus, Search, Trash2, Dumbbell, Calendar, ChevronRight, X, Award, CheckCircle, UserPlus, Activity, MessageSquare, Clock } from 'lucide-react';
import WorkoutBuilder from '../components/workouts/WorkoutBuilder';
import { useToast } from '../components/ui/ToastProvider';

const Students = () => {
    const { students, addStudent, removeStudent } = useStudentStore();
    const { user } = useAuthStore();
    const { templates, subscribeToTemplates, saveStudentRoutine, deleteStudentWorkout } = useWorkoutStore();
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '', objective: '' });
    const [activeTab, setActiveTab] = useState('ativos'); // 'ativos', 'prescrever', 'evolucao'
    const { workouts, subscribeToWorkouts, sessions, subscribeToStudentSessions } = useWorkoutStore();

    useEffect(() => {
        if (selectedStudent && activeTab === 'evolucao') {
            const unsub = subscribeToStudentSessions(selectedStudent.id);
            return () => unsub?.();
        }
    }, [selectedStudent, activeTab]);

    // Assignment States
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [scheduleType, setScheduleType] = useState('weekly');
    const [schedule, setSchedule] = useState({
        segunda: '', terça: '', quarta: '', quinta: '', sexta: '', sabado: '', domingo: ''
    });
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Individual Builder States
    const [isIndividualBuilderOpen, setIsIndividualBuilderOpen] = useState(false);
    const [individualRoutine, setIndividualRoutine] = useState([]);
    const [individualMetadata, setIndividualMetadata] = useState({ name: '', level: 'Iniciante', goal: 'Hipertrofia' });

    useEffect(() => {
        if (user?.uid) {
            const unsubTemplates = subscribeToTemplates(user.uid);
            const unsubWorkouts = subscribeToWorkouts(user.uid);
            return () => {
                unsubTemplates?.();
                unsubWorkouts?.();
            };
        }
    }, [user]);

    const handleAddStudent = (e) => {
        e.preventDefault();
        if (newStudent.name && newStudent.email && user?.uid) {
            addStudent(newStudent, user.uid);
            setNewStudent({ name: '', email: '', phone: '', objective: '' });
            setIsAddModalOpen(false);
        }
    };

    const handleOpenAssign = (student) => {
        setSelectedStudent(student);
        setIsAssignModalOpen(true);
    };

    const handleApplyTemplate = async () => {
        if (!selectedTemplate || !selectedStudent) return;

        const metadata = {
            level: selectedTemplate.level,
            goal: selectedTemplate.goal
        };
        const finalSchedule = {
            type: scheduleType,
            weekly: schedule,
            ...(scheduleType === 'period' ? dateRange : {})
        };

        await saveStudentRoutine(
            selectedStudent.id,
            user.uid,
            selectedTemplate.routine,
            metadata,
            finalSchedule
        );

        showToast(`Treino "${selectedTemplate.name}" aplicado com sucesso a ${selectedStudent.name}!`);
        setIsAssignModalOpen(false);
        setSelectedTemplate(null);
    };

    const handleOpenIndividual = (student) => {
        setSelectedStudent(student);
        setIndividualMetadata({
            name: `Treino de ${student.name.split(' ')[0]}`,
            level: 'Iniciante',
            goal: student.objective || 'Hipertrofia'
        });
        setIndividualRoutine([{ id: 'A', dayName: 'Treino A', exercises: [] }]);
        setIsIndividualBuilderOpen(true);
    };

    const handleSaveIndividual = async () => {
        if (!selectedStudent || !individualMetadata.name) return;

        const emptySchedule = {
            type: 'weekly',
            weekly: { segunda: '', terça: '', quarta: '', quinta: '', sexta: '', sabado: '', domingo: '' }
        };

        await saveStudentRoutine(
            selectedStudent.id,
            user.uid,
            individualRoutine,
            { level: individualMetadata.level, goal: individualMetadata.goal },
            emptySchedule
        );

        showToast(`Treino individual para ${selectedStudent.name} salvo com sucesso!`);
        setIsIndividualBuilderOpen(false);
    };

    const handleDeleteWorkout = async (studentId) => {
        if (window.confirm('Tem certeza que deseja apagar o treino atual deste aluno?')) {
            await deleteStudentWorkout(studentId);
            showToast('Treino removido com sucesso!', 'info');
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const weekDays = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

    return (
        <div className="animate-fade-in students-page">
            {isIndividualBuilderOpen ? (
                <div className="individual-builder-view">
                    <WorkoutBuilder
                        routine={individualRoutine}
                        setRoutine={setIndividualRoutine}
                        metadata={individualMetadata}
                        setMetadata={setIndividualMetadata}
                        onSave={handleSaveIndividual}
                        onCancel={() => setIsIndividualBuilderOpen(false)}
                        title={`Montar Treino Individual: ${selectedStudent?.name}`}
                    />
                </div>
            ) : selectedStudent && !isAssignModalOpen ? (
                <div className="student-detail-view animate-slide-up">
                    {/* Detail Header */}
                    <header className="detail-header" style={{
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="btn-icon" onClick={() => setSelectedStudent(null)} style={{ background: 'rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '50%' }}>
                                <X size={20} />
                            </button>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#fff' }}>{selectedStudent.name}</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, margin: 0 }}>{selectedStudent.email}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 700 }}>
                                {selectedStudent.objective || 'Sem Objetivo'}
                            </span>
                        </div>
                    </header>

                    {/* Tabs Navigation */}
                    <div style={{ padding: '0 2px', marginBottom: '1.5rem' }}>
                        <div className="tabs-nav" style={{
                            display: 'flex',
                            padding: '0.35rem',
                            gap: '0.25rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '14px'
                        }}>
                            <button
                                onClick={() => setActiveTab('ativos')}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none',
                                    background: activeTab === 'ativos' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'ativos' ? '#000' : 'rgba(255,255,255,0.5)',
                                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease',
                                    boxShadow: activeTab === 'ativos' ? '0 4px 15px rgba(74, 222, 128, 0.3)' : 'none'
                                }}
                            >
                                Treinos Ativos
                            </button>
                            <button
                                onClick={() => setActiveTab('prescrever')}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none',
                                    background: activeTab === 'prescrever' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'prescrever' ? '#000' : 'rgba(255,255,255,0.5)',
                                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease',
                                    boxShadow: activeTab === 'prescrever' ? '0 4px 15px rgba(74, 222, 128, 0.3)' : 'none'
                                }}
                            >
                                Prescrever
                            </button>
                            <button
                                onClick={() => setActiveTab('evolucao')}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none',
                                    background: activeTab === 'evolucao' ? 'var(--primary)' : 'transparent',
                                    color: activeTab === 'evolucao' ? '#000' : 'rgba(255,255,255,0.5)',
                                    fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease',
                                    boxShadow: activeTab === 'evolucao' ? '0 4px 15px rgba(74, 222, 128, 0.3)' : 'none'
                                }}
                            >
                                Evolução
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'ativos' && (
                            <div className="animate-fade-in">
                                {workouts.find(w => w.studentId === selectedStudent.id) ? (
                                    <div style={{
                                        padding: '1.5rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                                        transition: 'var(--transition-normal)'
                                    }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 123, 255, 0.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                            e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.3)';
                                        }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>Rotina Atual</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <button
                                                    onClick={() => handleDeleteWorkout(selectedStudent.id)}
                                                    className="btn-secondary"
                                                    style={{
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: 'var(--error)',
                                                        padding: '0.4rem 0.8rem',
                                                        fontSize: '0.8rem',
                                                        background: 'transparent',
                                                        transition: 'all 0.2s ease',
                                                        borderRadius: '8px'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <Trash2 size={14} style={{ marginRight: '4px' }} /> Apagar Treino
                                                </button>
                                                <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                                    Atualizado em: {new Date(workouts.find(w => w.studentId === selectedStudent.id).updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                            {workouts.find(w => w.studentId === selectedStudent.id).routine.map(day => (
                                                <div
                                                    key={day.id}
                                                    style={{
                                                        padding: '1.25rem',
                                                        background: 'rgba(255,255,255,0.02)',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        borderRadius: '12px',
                                                        cursor: 'pointer',
                                                        transition: 'var(--transition-normal)'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 123, 255, 0.1)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'none';
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                        <div style={{
                                                            background: 'var(--primary)',
                                                            color: '#000',
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 900,
                                                            boxShadow: '0 2px 10px rgba(74, 222, 128, 0.3)'
                                                        }}>
                                                            {day.id}
                                                        </div>
                                                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{day.dayName}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                                                        {day.exercises.length} exercícios
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                                        <Dumbbell size={48} style={{ marginBottom: '1rem' }} />
                                        <p>Nenhum treino ativo para este aluno.</p>
                                        <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('prescrever')}>Ir para Prescrição</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'prescrever' && (
                            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div
                                    onClick={() => setIsAssignModalOpen(true)}
                                    style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 123, 255, 0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <Award size={48} color="var(--primary)" style={{ marginBottom: '1.25rem' }} />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff' }}>Usar da Biblioteca</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Escolha um dos seus modelos prontos e defina a agenda semanal.</p>
                                </div>
                                <div
                                    onClick={() => handleOpenIndividual(selectedStudent)}
                                    style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 123, 255, 0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <UserPlus size={48} color="var(--accent)" style={{ marginBottom: '1.25rem' }} />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff' }}>Montar Sob Medida</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Crie um treino do zero, exclusivo para este aluno, sem salvar na biblioteca.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'evolucao' && (
                            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Summary Stats Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div style={{
                                        padding: '1.25rem',
                                        textAlign: 'center',
                                        background: 'var(--primary-glow)',
                                        border: '1px solid rgba(74, 222, 128, 0.2)',
                                        borderRadius: '16px',
                                        boxShadow: '0 4px 15px rgba(74, 222, 128, 0.1)',
                                        transition: 'var(--transition-normal)'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Treinos</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{sessions?.length || 0}</div>
                                    </div>
                                    <div style={{
                                        padding: '1.25rem',
                                        textAlign: 'center',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                                        transition: 'var(--transition-normal)'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duração Média</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
                                            {sessions?.length > 0
                                                ? Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length)
                                                : 0}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>m</span>
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '1.25rem',
                                        textAlign: 'center',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                                        transition: 'var(--transition-normal)'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Frequência</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
                                            {sessions?.length > 0
                                                ? Math.min(100, Math.round((sessions.length / 12) * 100))
                                                : 0}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Activity size={20} color="var(--primary)" /> Jornada de Treinamento
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                                        {/* Timeline Line */}
                                        <div style={{ position: 'absolute', left: '11px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.05)' }}></div>

                                        {sessions && sessions.length > 0 ? (
                                            sessions.map((session, sIdx) => (
                                                <div key={session.id || sIdx} style={{ position: 'relative', paddingLeft: '2.5rem' }}>
                                                    {/* Timeline Dot */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        left: '0',
                                                        top: '6px',
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: 'var(--bg-card)',
                                                        border: `2px solid ${session.feedback?.intensity === 'Extremo' ? 'var(--error)' :
                                                            session.feedback?.intensity === 'Difícil' ? 'var(--primary)' : 'var(--success)'
                                                            }`,
                                                        zIndex: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                                    </div>

                                                    <div className="glass-panel hover-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                            <div>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.25rem' }}>
                                                                    {new Date(session.createdAt).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })} • {new Date(session.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#fff' }}>{session.dayName}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{session.workoutName}</div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                <span className={`intensity-badge ${session.feedback?.intensity === 'Extremo' ? 'intensity-max' :
                                                                    session.feedback?.intensity === 'Difícil' ? 'intensity-high' :
                                                                        session.feedback?.intensity === 'Normal' ? 'intensity-moderate' : 'intensity-warmup'
                                                                    }`} style={{ fontSize: '0.6rem', padding: '0.2rem 0.6rem' }}>
                                                                    {session.feedback?.intensity?.toUpperCase()}
                                                                </span>
                                                                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end', color: 'var(--text-secondary)' }}>
                                                                    <Clock size={14} /> {session.duration} min
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {session.feedback?.comment && (
                                                            <div style={{
                                                                background: 'rgba(255,255,255,0.03)',
                                                                padding: '1rem',
                                                                borderRadius: '12px',
                                                                marginTop: '0.75rem',
                                                                display: 'flex',
                                                                gap: '0.75rem',
                                                                borderLeft: '3px solid var(--primary)'
                                                            }}>
                                                                <MessageSquare size={16} style={{ flexShrink: 0, marginTop: '0.1rem', color: 'var(--primary)' }} />
                                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                                                                    "{session.feedback.comment}"
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                                <Activity size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                                <p style={{ color: 'var(--text-secondary)' }}>Nenhum treino registrado ainda para este aluno.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <header className="page-header" style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        marginBottom: '2rem',
                    }}>
                        <button
                            className="btn-primary"
                            onClick={() => setIsAddModalOpen(true)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
                                letterSpacing: '0.5px',
                                flexShrink: 0
                            }}
                        >
                            <Plus size={18} /> NOVO
                        </button>
                    </header>

                    <div className="search-bar" style={{ marginBottom: '2rem' }}>
                        <div
                            className="glass-panel"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                gap: '0.75rem',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => { e.currentTarget.style.border = '1px solid var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 222, 128, 0.15)'; }}
                            onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <Search size={20} color={searchTerm ? "var(--primary)" : "var(--text-secondary)"} style={{ flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Buscar aluno por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    width: '100%',
                                    outline: 'none',
                                    minWidth: 0
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="btn-icon"
                                    style={{
                                        padding: '4px',
                                        width: '24px',
                                        height: '24px',
                                        background: 'rgba(255,255,255,0.1)',
                                        flexShrink: 0
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="students-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {filteredStudents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', gridColumn: '1 / -1' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>Nenhum aluno encontrado.</p>
                            </div>
                        ) : (
                            filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    className="student-card hover-card"
                                    onClick={() => { setSelectedStudent(student); setActiveTab('ativos'); }}
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1.25rem',
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ paddingRight: '1rem' }}>
                                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#fff', letterSpacing: '-0.3px' }}>{student.name}</h3>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', margin: 0, fontWeight: 600 }}>{student.email}</p>
                                        </div>
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => { e.stopPropagation(); removeStudent(student.id); }}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: 'var(--error)',
                                                borderRadius: '10px'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                                            {student.phone || 'Sem fone'}
                                        </span>
                                        <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 700 }}>
                                            {student.objective || 'Objetivo N/A'}
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginTop: 'auto',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 600
                                    }}>
                                        <Calendar size={14} color="var(--primary)" />
                                        <span>Ver detalhes e treinos</span>
                                        <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)' }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* Modal: Add Student */}
            {isAddModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>Novo Aluno</h2>
                            <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Nome Completo</label>
                                <input type="text" className="glass-panel" required value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>E-mail de Login</label>
                                <input type="email" className="glass-panel" required value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Objetivo Principal</label>
                                <input type="text" className="glass-panel" value={newStudent.objective} onChange={e => setNewStudent({ ...newStudent, objective: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ padding: '1rem', justifyContent: 'center' }}>Cadastrar Aluno</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Assign Workout Template */}
            {isAssignModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="modal-content glass-panel animate-slide-up" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Award size={24} color="var(--primary)" />
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Prescrever da Biblioteca para {selectedStudent?.name}</h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Selecione um modelo da sua biblioteca e defina a agenda</p>
                                </div>
                            </div>
                            <button className="btn-icon" onClick={() => setIsAssignModalOpen(false)}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Template Selector */}
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--primary)' }}>1. Selecionar Modelo</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {templates.map(temp => (
                                        <div
                                            key={temp.id}
                                            onClick={() => setSelectedTemplate(temp)}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                border: selectedTemplate?.id === temp.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                                background: selectedTemplate?.id === temp.id ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{temp.name}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{temp.level} • {temp.goal}</div>
                                        </div>
                                    ))}
                                    {templates.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nenhum modelo criado. Vá ao menu Treinos primeiro.</p>}
                                </div>
                            </div>

                            {/* Schedule Config */}
                            {selectedTemplate && (
                                <div className="animate-fade-in">
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--accent)' }}>2. Configurar Grade Horária</h3>

                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <button
                                            onClick={() => setScheduleType('weekly')}
                                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: scheduleType === 'weekly' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 600 }}
                                        >
                                            Semanal Fixo
                                        </button>
                                        <button
                                            onClick={() => setScheduleType('period')}
                                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: scheduleType === 'period' ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 600 }}
                                        >
                                            Por Período
                                        </button>
                                    </div>

                                    {scheduleType === 'period' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Inicia em</label>
                                                <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '0.5rem', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Expira em</label>
                                                <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '0.5rem', color: '#fff' }} />
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                                        {weekDays.map(day => (
                                            <div key={day}>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.25rem' }}>{day.slice(0, 3)}</div>
                                                <select
                                                    value={schedule[day]}
                                                    onChange={e => setSchedule({ ...schedule, [day]: e.target.value })}
                                                    style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', background: schedule[day] ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', fontSize: '0.8rem' }}
                                                >
                                                    <option value="">Off</option>
                                                    {selectedTemplate.routine.map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedTemplate && (
                                <button className="btn-primary" onClick={handleApplyTemplate} style={{ padding: '1rem', justifyContent: 'center', fontSize: '1.1rem' }}>
                                    <CheckCircle size={20} /> Confirmar Prescrição
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;
