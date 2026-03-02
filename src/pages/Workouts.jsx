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
        <div className="animate-fade-in workouts-page">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Biblioteca de Treinos</h1>
                    <p>Crie modelos mestres para aplicar aos seus alunos</p>
                </div>
                <button className="btn-primary" onClick={handleCreateNew}>
                    <Plus size={20} /> Criar Novo Modelo
                </button>
            </header>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {templates.map(temp => (
                        <div key={temp.id} className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary)' }}>{temp.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-icon" onClick={() => handleEditTemplate(temp)}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button className="btn-icon text-error" onClick={() => deleteTemplate(temp.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span className="badge">{temp.level}</span>
                                <span className="badge">{temp.goal}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Contém {temp.routine.length} treinos ({temp.routine.map(r => r.id).join(', ')})
                            </p>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                            <Dumbbell size={48} style={{ marginBottom: '1rem' }} />
                            <p>Sua biblioteca está vazia. Crie seu primeiro modelo!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Workouts;
