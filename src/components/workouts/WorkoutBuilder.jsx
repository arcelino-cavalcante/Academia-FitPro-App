import React, { useState } from 'react';
import { Search, Plus, X, Trash2, Save, Clock } from 'lucide-react';
import AnimatedExercise from '../ui/AnimatedExercise';
import { useEffect } from 'react';

const setsPresets = [2, 3, 4, 5, 7, 10];
const repsPresets = ['6', '8', '10', '12', '15', '8-12', '12-15', '15-20', 'FALHA'];
const restPresets = ['45s', '60s', '90s', '120s'];
const methods = ['Normal', 'Drop Set', 'Rest-Pause', 'Bi-Set', 'Pico de Contração', 'GVT', 'Cluster Set'];

const API_URL = "https://raw.githubusercontent.com/arcelino-cavalcante/api-exercicios-gym/main/database.json";

const WorkoutBuilder = ({
    routine,
    setRoutine,
    metadata,
    setMetadata,
    onSave,
    onCancel,
    title = "Criar Modelo de Treino"
}) => {
    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [activeDayIndex, setActiveDayIndex] = useState(null);
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [visibleCount, setVisibleCount] = useState(20);

    useEffect(() => {
        const loadExercises = async () => {
            setIsLoading(true);
            try {
                // Tenta carregar do cache para ser "Ultra Leve" no consumo de dados
                const cached = localStorage.getItem('gym-exercises-cache');
                if (cached) {
                    setExercises(JSON.parse(cached));
                    setIsLoading(false);
                }

                const response = await fetch(API_URL);
                const data = await response.json();

                // Normaliza os dados para o formato esperado pelo resto do App
                const normalizedData = data.map(ex => {
                    const name = ex.nome || ex.name;
                    // Mapeia para a URL real do vídeo na API Estática (GitHub)
                    // Formato: https://raw.githubusercontent.com/arcelino-cavalcante/api-exercicios-gym/main/videos/Nome do Exercicio.mp4
                    const videoUrl = `https://raw.githubusercontent.com/arcelino-cavalcante/api-exercicios-gym/main/videos/${encodeURIComponent(name)}.mp4`;

                    return {
                        ...ex,
                        name,
                        muscleGroup: ex.musculo || ex.muscleGroup || 'Geral',
                        url: videoUrl,
                        tipo: 'video'
                    };
                });

                setExercises(normalizedData);
                localStorage.setItem('gym-exercises-cache', JSON.stringify(normalizedData));
            } catch (error) {
                console.error("Erro ao carregar exercícios:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isExerciseModalOpen && exercises.length === 0) {
            loadExercises();
        }
    }, [isExerciseModalOpen]);

    const categories = ['Todos', ...Array.from(new Set(exercises.map(ex => ex.muscleGroup))).filter(Boolean).sort()];

    const filteredExercises = exercises.filter(ex => {
        if (!ex.name || !ex.muscleGroup) return false;
        const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
            ex.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || ex.muscleGroup === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 50;
        if (bottom && visibleCount < filteredExercises.length) {
            setVisibleCount(prev => prev + 20);
        }
    };

    const handleUpdateDayName = (index, name) => {
        const newRoutine = [...routine];
        newRoutine[index].dayName = name;
        setRoutine(newRoutine);
    };

    const handleAddDay = () => {
        const nextId = String.fromCharCode(65 + routine.length);
        setRoutine([...routine, { id: nextId, dayName: `Treino ${nextId}`, exercises: [] }]);
    };

    const handleOpenExerciseModal = (dayIndex) => {
        setActiveDayIndex(dayIndex);
        setVisibleCount(20);
        setIsExerciseModalOpen(true);
    };

    const handleAddExercise = (exercise) => {
        const newRoutine = [...routine];
        newRoutine[activeDayIndex].exercises.push({
            ...exercise,
            exId: crypto.randomUUID(),
            sets: 3,
            reps: '12',
            rest: '60s',
            method: 'Normal'
        });
        setRoutine(newRoutine);
        setIsExerciseModalOpen(false);
    };

    const handleRemoveExercise = (dayIndex, exIndex) => {
        const newRoutine = [...routine];
        newRoutine[dayIndex].exercises.splice(exIndex, 1);
        setRoutine(newRoutine);
    };

    const handleUpdateExerciseField = (dIdx, eIdx, field, value) => {
        const newRoutine = [...routine];
        newRoutine[dIdx].exercises[eIdx][field] = value;

        if (field === 'sets' && newRoutine[dIdx].exercises[eIdx].detailedSets) {
            const currentSets = newRoutine[dIdx].exercises[eIdx].detailedSets;
            const newCount = parseInt(value);
            if (newCount > currentSets.length) {
                const additional = Array(newCount - currentSets.length).fill().map(() => ({
                    reps: newRoutine[dIdx].exercises[eIdx].reps || '12',
                    intensity: 'Moderada',
                    method: 'Normal'
                }));
                newRoutine[dIdx].exercises[eIdx].detailedSets = [...currentSets, ...additional];
            } else {
                newRoutine[dIdx].exercises[eIdx].detailedSets = currentSets.slice(0, newCount);
            }
        }
        setRoutine(newRoutine);
    };

    const handleToggleAdvanced = (dIdx, eIdx) => {
        const newRoutine = [...routine];
        const exercise = newRoutine[dIdx].exercises[eIdx];

        if (!exercise.isAdvanced) {
            const setCount = parseInt(exercise.sets) || 3;
            exercise.detailedSets = Array(setCount).fill().map(() => ({
                reps: exercise.reps,
                intensity: 'Moderada',
                method: exercise.method || 'Normal'
            }));
            exercise.isAdvanced = true;
        } else {
            exercise.isAdvanced = false;
        }
        setRoutine(newRoutine);
    };

    const handleUpdateDetailedSet = (dIdx, eIdx, sIdx, field, value) => {
        const newRoutine = [...routine];
        newRoutine[dIdx].exercises[eIdx].detailedSets[sIdx][field] = value;
        setRoutine(newRoutine);
    };

    return (
        <div className="workout-builder animate-slide-up">
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={onCancel}>
                        <X size={20} />
                    </button>
                    <input
                        type="text"
                        value={metadata.name}
                        onChange={e => setMetadata({ ...metadata, name: e.target.value })}
                        style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '1.75rem', fontWeight: 800, outline: 'none', borderBottom: '2px solid var(--border-color)', width: '300px' }}
                    />
                </div>
                <button className="btn-primary" onClick={onSave} style={{ padding: '0.75rem 2rem' }}>
                    <Save size={18} /> {title.includes('Individual') ? 'Salvar Treino Individual' : 'Salvar na Biblioteca'}
                </button>
            </div>

            {/* Metadata Row */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Nível Sugerido</label>
                        <select value={metadata.level} onChange={e => setMetadata({ ...metadata, level: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)' }}>
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                            <option value="Elite/Atleta">Elite / Atleta</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Objetivo</label>
                        <select value={metadata.goal} onChange={e => setMetadata({ ...metadata, goal: e.target.value })} className="glass-panel" style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)' }}>
                            <option value="Hipertrofia">Hipertrofia</option>
                            <option value="Queima de Gordura">Queima de Gordura</option>
                            <option value="Periodização">Periodização</option>
                            <option value="Preparação Atleta">Preparação Atleta</option>
                            <option value="Força Pura">Força Pura</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Routine Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {routine.map((day, dIdx) => (
                    <div key={dIdx} className="glass-panel" style={{ border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: 'var(--primary)', color: '#000', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                    {day.id}
                                </div>
                                <input
                                    type="text"
                                    value={day.dayName}
                                    onChange={e => handleUpdateDayName(dIdx, e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.25rem', fontWeight: 600, outline: 'none' }}
                                />
                            </div>
                            <button className="btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => handleOpenExerciseModal(dIdx)}>
                                <Plus size={16} /> Add Exercício
                            </button>
                        </div>

                        <div style={{ padding: '1rem' }}>
                            {day.exercises.map((ex, eIdx) => (
                                <div key={ex.exId} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', marginBottom: '1.5rem', border: ex.isAdvanced ? '1px solid var(--primary-glow)' : '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'nowrap' }}>
                                        <div style={{ flexShrink: 0 }}>
                                            <AnimatedExercise images={ex.images} name={ex.name} size={100} />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>{ex.name}</h4>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{ex.muscleGroup}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleToggleAdvanced(dIdx, eIdx)}
                                                        style={{
                                                            padding: '0.4rem 0.8rem',
                                                            fontSize: '0.7rem',
                                                            borderRadius: '6px',
                                                            background: ex.isAdvanced ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                            color: ex.isAdvanced ? '#000' : 'var(--text-secondary)',
                                                            border: 'none',
                                                            fontWeight: 700,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {ex.isAdvanced ? '⚙️ MODO AVANÇADO' : '⚙️ AJUSTE FINO'}
                                                    </button>
                                                    <button onClick={() => handleRemoveExercise(dIdx, eIdx)} style={{ color: 'var(--error)', padding: '0.4rem' }}><Trash2 size={18} /></button>
                                                </div>
                                            </div>

                                            {!ex.isAdvanced ? (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Séries</label>
                                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                                                            {setsPresets.map(s => <button key={s} onClick={() => handleUpdateExerciseField(dIdx, eIdx, 'sets', s)} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: ex.sets === s ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: ex.sets === s ? '#000' : '#fff', border: 'none', cursor: 'pointer' }}>{s}</button>)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Repetições</label>
                                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                                                            {repsPresets.map(r => <button key={r} onClick={() => handleUpdateExerciseField(dIdx, eIdx, 'reps', r)} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: ex.reps === r ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: ex.reps === r ? '#000' : '#fff', border: 'none', cursor: 'pointer' }}>{r}</button>)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Método Geral</label>
                                                        <select value={ex.method} onChange={e => handleUpdateExerciseField(dIdx, eIdx, 'method', e.target.value)} className="glass-panel" style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', marginTop: '0.4rem', borderRadius: '8px' }}>
                                                            {methods.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="animate-fade-in" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 40px', gap: '0.75rem', padding: '0 0.75rem 0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800 }}>#</span>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800 }}>REPS</span>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800 }}>INTENSIDADE</span>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 800 }}>MÉTODO</span>
                                                    </div>
                                                    {ex.detailedSets?.map((set, sIdx) => (
                                                        <div key={sIdx} className="detailed-set-row">
                                                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem' }}>{sIdx + 1}º</div>
                                                            <input
                                                                type="text"
                                                                value={set.reps}
                                                                onChange={e => handleUpdateDetailedSet(dIdx, eIdx, sIdx, 'reps', e.target.value)}
                                                                placeholder="ex: 12-15"
                                                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.4rem', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', width: '100%' }}
                                                            />
                                                            <select
                                                                value={set.intensity}
                                                                onChange={e => handleUpdateDetailedSet(dIdx, eIdx, sIdx, 'intensity', e.target.value)}
                                                                className={`intensity-badge ${set.intensity === 'Aquecimento' ? 'intensity-warmup' :
                                                                    set.intensity === 'Ajuste' ? 'intensity-adjust' :
                                                                        set.intensity === 'Moderada' ? 'intensity-moderate' :
                                                                            set.intensity === 'Alta' ? 'intensity-high' : 'intensity-max'
                                                                    }`}
                                                                style={{ border: 'none', outline: 'none', cursor: 'pointer' }}
                                                            >
                                                                <option value="Aquecimento">Aquecimento</option>
                                                                <option value="Ajuste">Ajuste/Feed</option>
                                                                <option value="Moderada">Moderada</option>
                                                                <option value="Alta">Carga Alta</option>
                                                                <option value="Máxima">Até a Falha</option>
                                                            </select>
                                                            <select
                                                                value={set.method}
                                                                onChange={e => handleUpdateDetailedSet(dIdx, eIdx, sIdx, 'method', e.target.value)}
                                                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.4rem', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', width: '100%' }}
                                                            >
                                                                {methods.map(m => <option key={m} value={m}>{m}</option>)}
                                                            </select>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Clock size={12} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button className="btn-secondary" onClick={handleAddDay} style={{ padding: '1.5rem', border: '2px dashed rgba(255,255,255,0.1)', justifyContent: 'center' }}>
                    <Plus size={20} /> Novo Treino (Letra {String.fromCharCode(65 + routine.length)})
                </button>
            </div>

            {/* Exercise Library Modal */}
            {isExerciseModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content glass-panel animate-slide-up" style={{ maxHeight: '90vh', width: '95%', maxWidth: '800px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>📚 Biblioteca de Elite</h2>
                            <button className="btn-icon" onClick={() => setIsExerciseModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className="search-input-wrapper" style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                            <Search size={20} color={exerciseSearch ? "var(--primary)" : "var(--text-secondary)"} />
                            <input
                                type="text"
                                placeholder="Buscar exercícios na biblioteca..."
                                value={exerciseSearch}
                                onChange={e => setExerciseSearch(e.target.value)}
                            />
                            {exerciseSearch && (
                                <button onClick={() => setExerciseSearch('')} className="search-clear-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <div className="no-scrollbar" style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1rem', flexShrink: 0, paddingLeft: '2px' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '12px',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                                        color: selectedCategory === cat ? '#000' : 'var(--text-secondary)',
                                        border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s ease',
                                        boxShadow: selectedCategory === cat ? '0 4px 12px var(--primary-glow)' : 'none'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }} onScroll={handleScroll}>
                            {filteredExercises.slice(0, visibleCount).map(ex => (
                                <div key={ex.id} className="glass-panel" onClick={() => handleAddExercise(ex)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <AnimatedExercise images={ex.images} name={ex.name} size={60} />
                                        <div>
                                            <p style={{ fontWeight: 600, margin: 0 }}>{ex.name}</p>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{ex.muscleGroup}</span>
                                        </div>
                                    </div>
                                    <Plus size={20} color="var(--primary)" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutBuilder;
