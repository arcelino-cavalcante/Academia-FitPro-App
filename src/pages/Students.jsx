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
                    <header className="detail-header glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="btn-icon" onClick={() => setSelectedStudent(null)} style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <X size={20} />
                            </button>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedStudent.name}</h2>
                                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', margin: 0 }}>{selectedStudent.email}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span className="badge">{selectedStudent.objective || 'Sem Objetivo'}</span>
                        </div>
                    </header>

                    {/* Tabs Navigation */}
                    <div className="tabs-nav glass-panel" style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setActiveTab('ativos')}
                            style={{
                                flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                                background: activeTab === 'ativos' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'ativos' ? '#000' : 'var(--text-secondary)',
                                fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Treinos Ativos
                        </button>
                        <button
                            onClick={() => setActiveTab('prescrever')}
                            style={{
                                flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                                background: activeTab === 'prescrever' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'prescrever' ? '#000' : 'var(--text-secondary)',
                                fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Prescrever
                        </button>
                        <button
                            onClick={() => setActiveTab('evolucao')}
                            style={{
                                flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                                background: activeTab === 'evolucao' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'evolucao' ? '#000' : 'var(--text-secondary)',
                                fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Evolução
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'ativos' && (
                            <div className="animate-fade-in">
                                {workouts.find(w => w.studentId === selectedStudent.id) ? (
                                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Rotina Atual</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <button
                                                    onClick={() => handleDeleteWorkout(selectedStudent.id)}
                                                    className="btn-secondary"
                                                    style={{ border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                >
                                                    <Trash2 size={14} style={{ marginRight: '4px' }} /> Apagar Treino
                                                </button>
                                                <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
                                                    Atualizado em: {new Date(workouts.find(w => w.studentId === selectedStudent.id).updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                            {workouts.find(w => w.studentId === selectedStudent.id).routine.map(day => (
                                                <div key={day.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                        <div style={{ background: 'var(--primary)', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                                                            {day.id}
                                                        </div>
                                                        <span style={{ fontWeight: 700 }}>{day.dayName}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
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
                                <div className="glass-panel hover-card" onClick={() => setIsAssignModalOpen(true)} style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
                                    <Award size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                    <h3>Usar da Biblioteca</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Escolha um dos seus modelos prontos e defina a agenda semanal.</p>
                                </div>
                                <div className="glass-panel hover-card" onClick={() => handleOpenIndividual(selectedStudent)} style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
                                    <UserPlus size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                                    <h3>Montar Sob Medida</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Crie um treino do zero, exclusivo para este aluno, sem salvar na biblioteca.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'evolucao' && (
                            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* Summary Stats Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'var(--primary-glow)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>Treinos</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{sessions?.length || 0}</div>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>Tempo Médio</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                                            {sessions?.length > 0
                                                ? Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length)
                                                : 0} min
                                        </div>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase' }}>Frequência</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                                            {sessions?.length > 0
                                                ? Math.min(100, Math.round((sessions.length / 12) * 100))
                                                : 0}%
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
                    <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1>Alunos</h1>
                            <p>Gerencie seus alunos e prescreva treinos</p>
                        </div>
                        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                            <Plus size={20} /> Novo Aluno
                        </button>
                    </header>

                    <div className="search-bar" style={{ marginBottom: '2rem' }}>
                        <div className="search-input-wrapper">
                            <Search size={20} color={searchTerm ? "var(--primary)" : "var(--text-secondary)"} />
                            <input
                                type="text"
                                placeholder="Buscar aluno por nome ou e-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="search-clear-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                    <X size={18} />
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
                                    className="student-card glass-panel hover-card"
                                    onClick={() => { setSelectedStudent(student); setActiveTab('ativos'); }}
                                    style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0' }}>{student.name}</h3>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', margin: 0 }}>{student.email}</p>
                                        </div>
                                        <button className="btn-icon text-error" onClick={(e) => { e.stopPropagation(); removeStudent(student.id); }} style={{ padding: '0.5rem' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <span className="badge">{student.phone || 'Sem fone'}</span>
                                        <span className="badge" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>{student.objective || 'Objetivo N/A'}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <Calendar size={14} />
                                        <span>Ver detalhes e treinos</span>
                                        <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
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
