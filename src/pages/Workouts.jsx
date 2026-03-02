import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import { Plus, Trash2, Edit2, Dumbbell } from 'lucide-react';
import WorkoutBuilder from '../components/workouts/WorkoutBuilder';
import { useToast } from '../components/ui/ToastProvider';

const Workouts = () => {
    const { user } = useAuthStore();
    const { templates, subscribeToTemplates, saveTemplate, deleteTemplate } = useWorkoutStore();
    const { showToast } = useToast();

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [routine, setRoutine] = useState([]);
    const [templateMetadata, setTemplateMetadata] = useState({ name: '', level: 'Iniciante', goal: 'Hipertrofia' });

    useEffect(() => {
        if (user?.uid) {
            const unsub = subscribeToTemplates(user.uid);
            return () => unsub?.();
        }
    }, [user]);

    const handleCreateNew = () => {
        setSelectedTemplate({ id: null });
        setTemplateMetadata({ name: 'Novo Modelo de Treino', level: 'Iniciante', goal: 'Hipertrofia' });
        setRoutine([{ id: 'A', dayName: 'Treino A', exercises: [] }]);
    };

    const handleEditTemplate = (temp) => {
        setSelectedTemplate(temp);
        setTemplateMetadata({ name: temp.name, level: temp.level || 'Iniciante', goal: temp.goal || 'Hipertrofia' });
        setRoutine(temp.routine || [{ id: 'A', dayName: 'Treino A', exercises: [] }]);
    };

    const handleSave = async () => {
        if (!user?.uid || !templateMetadata.name) return;
        const templateData = {
            id: selectedTemplate.id,
            name: templateMetadata.name,
            level: templateMetadata.level,
            goal: templateMetadata.goal,
            routine
        };
        await saveTemplate(user.uid, templateData);
        showToast('Modelo salvo na biblioteca!');
        setSelectedTemplate(null);
    };

    if (selectedTemplate) {
        return (
            <div className="workouts-page">
                <WorkoutBuilder
                    routine={routine}
                    setRoutine={setRoutine}
                    metadata={templateMetadata}
                    setMetadata={setTemplateMetadata}
                    onSave={handleSave}
                    onCancel={() => setSelectedTemplate(null)}
                />
            </div>
        );
    }

    return (
        <div className="animate-fade-in workouts-page" style={{ paddingBottom: '8rem' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginBottom: '1.5rem',
            }}>
                <button className="btn-primary" onClick={handleCreateNew} style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', borderRadius: '14px' }}>
                    <Plus size={18} /> Novo Modelo
                </button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {templates.map(temp => (
                    <div
                        key={temp.id}
                        className="glass-panel hover-card"
                        onClick={() => handleEditTemplate(temp)}
                        style={{
                            padding: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid rgba(255,255,255,0.05)',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', overflow: 'hidden' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(74, 222, 128, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Dumbbell size={24} color="var(--primary)" />
                            </div>

                            <div style={{ overflow: 'hidden' }}>
                                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{temp.name}</h3>
                                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>{temp.level}</span>
                                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{temp.routine.length} treinos • {temp.goal}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                            <button className="btn-icon" style={{ width: '32px', height: '32px', color: 'rgba(255,255,255,0.3)' }} onClick={(e) => { e.stopPropagation(); deleteTemplate(temp.id); }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', opacity: 0.3 }}>
                        <Dumbbell size={48} style={{ marginBottom: '1.5rem', margin: '0 auto' }} />
                        <p style={{ fontSize: '0.9rem' }}>Nenhum modelo criado ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workouts;
