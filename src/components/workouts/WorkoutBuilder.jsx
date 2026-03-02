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
        <div className="workout-builder animate-slide-up" style={{ paddingBottom: '120px' }}>
            {/* Top Bar - Clean & Refined */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'nowrap',
                gap: '1rem',
                position: 'sticky',
                top: 0,
                background: 'var(--bg-color)',
                zIndex: 10,
                padding: '0.5rem 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <button
                        className="btn-icon"
                        style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}
                        onClick={onCancel}
                    >
                        <X size={18} />
                    </button>
                    <input
                        type="text"
                        value={metadata.name}
                        placeholder="Nome do Modelo..."
                        onChange={e => setMetadata({ ...metadata, name: e.target.value })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            outline: 'none',
                            borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
                            width: '100%',
                            maxWidth: '220px'
                        }}
                    />
                </div>
                <button
                    className="btn-primary"
                    onClick={onSave}
                    style={{
                        padding: '0.6rem 1.25rem',
                        fontSize: '0.8rem',
                        borderRadius: '14px',
                        flexShrink: 0
                    }}
                >
                    <Save size={16} /> {title.includes('Individual') ? 'Salvar' : 'Salvar Biblioteca'}
                </button>
            </div>

            {/* Metadata Row - Cleaner Selects */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>Público Alvo</label>
                        <select
                            value={metadata.level}
                            onChange={e => setMetadata({ ...metadata, level: e.target.value })}
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                        >
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                            <option value="Elite/Atleta">Elite / Atleta</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>Estratégia</label>
                        <select
                            value={metadata.goal}
                            onChange={e => setMetadata({ ...metadata, goal: e.target.value })}
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                        >
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
                        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    background: 'var(--primary)',
                                    color: '#000',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 900,
                                    fontSize: '0.9rem'
                                }}>
                                    {day.id}
                                </div>
                                <input
                                    type="text"
                                    value={day.dayName}
                                    onChange={e => handleUpdateDayName(dIdx, e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', fontWeight: 700, outline: 'none' }}
                                />
                            </div>
                            <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '10px', background: 'rgba(74, 222, 128, 0.1)', color: 'var(--primary)', border: 'none' }} onClick={() => handleOpenExerciseModal(dIdx)}>
                                <Plus size={14} /> EXERCÍCIO
                            </button>
                        </div>

                        <div style={{ padding: '0.75rem' }}>
                            {day.exercises.map((ex, eIdx) => (
                                <div key={ex.exId} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.015)', marginBottom: '1rem', border: ex.isAdvanced ? '1px solid var(--primary-glow)' : '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'nowrap' }}>
                                        <div style={{ flexShrink: 0 }}>
                                            <AnimatedExercise images={ex.images} name={ex.name} size={90} />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</h4>
                                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, margin: '0.15rem 0 0 0' }}>{ex.muscleGroup}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                    <button onClick={() => handleRemoveExercise(dIdx, eIdx)} style={{ color: 'rgba(239, 68, 68, 0.3)', padding: '0.2rem' }}><Trash2 size={16} /></button>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                                <button
                                                    onClick={() => handleToggleAdvanced(dIdx, eIdx)}
                                                    style={{
                                                        padding: '0.35rem 0.7rem',
                                                        fontSize: '0.6rem',
                                                        borderRadius: '8px',
                                                        background: ex.isAdvanced ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                        color: ex.isAdvanced ? '#000' : 'var(--text-secondary)',
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.3rem'
                                                    }}
                                                >
                                                    <Clock size={12} /> {ex.isAdvanced ? 'MODO AVANÇADO' : 'AJUSTE FINO'}
                                                </button>
                                            </div>

                                            {!ex.isAdvanced ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Séries</label>
                                                        <div className="no-scrollbar" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', overflowX: 'auto', marginTop: '0.35rem', paddingBottom: '0.2rem' }}>
                                                            {setsPresets.map(s => <button key={s} onClick={() => handleUpdateExerciseField(dIdx, eIdx, 'sets', s)} style={{ padding: '0.35rem 0.8rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, background: ex.sets === s ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: ex.sets === s ? '#000' : '#888', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}>{s}</button>)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Repetições</label>
                                                        <div className="no-scrollbar" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', overflowX: 'auto', marginTop: '0.35rem', paddingBottom: '0.2rem' }}>
                                                            {repsPresets.map(r => <button key={r} onClick={() => handleUpdateExerciseField(dIdx, eIdx, 'reps', r)} style={{ padding: '0.35rem 0.8rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, background: ex.reps === r ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: ex.reps === r ? '#000' : '#888', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>{r}</button>)}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                        <select value={ex.method} onChange={e => handleUpdateExerciseField(dIdx, eIdx, 'method', e.target.value)} className="glass-panel" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            {methods.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                        <input
                                                            type="text"
                                                            value={ex.rest}
                                                            onChange={e => handleUpdateExerciseField(dIdx, eIdx, 'rest', e.target.value)}
                                                            placeholder="Descanso"
                                                            style={{ width: '80px', padding: '0.5rem', fontSize: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}
                                                        />
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
                <button className="btn-secondary" onClick={handleAddDay} style={{
                    padding: '1rem',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                }}>
                    <Plus size={18} /> Novo Treino (Letra {String.fromCharCode(65 + routine.length)})
                </button>
            </div>

            {/* Exercise Library Modal - Refined & Premium */}
            {isExerciseModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 3000 }}>
                    <div className="modal-content glass-panel animate-scale-in" style={{
                        maxHeight: '85vh',
                        width: '92%',
                        maxWidth: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1.5rem',
                        borderRadius: '24px',
                        background: 'rgba(21, 24, 30, 0.95)',
                        backdropFilter: 'blur(32px)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Escolha o Exercício</h2>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.1rem 0 0 0' }}>Biblioteca Elite FitPro</p>
                            </div>
                            <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', width: '32px', height: '32px' }} onClick={() => setIsExerciseModalOpen(false)}><X size={18} /></button>
                        </div>

                        <div className="search-input-wrapper" style={{ marginBottom: '1rem', flexShrink: 0, padding: '0.6rem 1rem', borderRadius: '12px' }}>
                            <Search size={16} color={exerciseSearch ? "var(--primary)" : "rgba(255,255,255,0.2)"} />
                            <input
                                type="text"
                                placeholder="Buscar na biblioteca..."
                                value={exerciseSearch}
                                onChange={e => setExerciseSearch(e.target.value)}
                                style={{ fontSize: '0.9rem' }}
                            />
                            {exerciseSearch && (
                                <button onClick={() => setExerciseSearch('')} className="search-clear-btn">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <div className="no-scrollbar" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '0.75rem', flexShrink: 0 }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        padding: '0.4rem 0.9rem',
                                        borderRadius: '10px',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.3px',
                                        backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                                        color: selectedCategory === cat ? '#000' : 'rgba(255,255,255,0.4)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }} onScroll={handleScroll}>
                            {filteredExercises.slice(0, visibleCount).map(ex => (
                                <div
                                    key={ex.id}
                                    className="glass-panel hover-card"
                                    onClick={() => handleAddExercise(ex)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.6rem',
                                        marginBottom: '0.6rem',
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        borderRadius: '14px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <AnimatedExercise images={ex.images} name={ex.name} size={50} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem' }}>{ex.name}</p>
                                            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{ex.muscleGroup}</span>
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Plus size={16} color="var(--primary)" />
                                    </div>
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
