import React, { useState } from 'react';
import { Search, Plus, X, Trash2, Save, Clock, Settings } from 'lucide-react';
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
                    // Prioriza a URL que vem do banco se existir, senão constrói a padrão
                    const finalUrl = ex.url || ex.videoUrl || `https://raw.githubusercontent.com/arcelino-cavalcante/api-exercicios-gym/main/videos/${encodeURIComponent(name)}.mp4`;
                    const finalTipo = ex.tipo || (finalUrl.toLowerCase().endsWith('.mp4') ? 'video' : 'gif');

                    return {
                        ...ex,
                        name,
                        muscleGroup: ex.musculo || ex.muscleGroup || 'Geral',
                        url: finalUrl,
                        tipo: finalTipo
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
                    method: 'Normal',
                    time: '60s'
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
                method: exercise.method || 'Normal',
                time: '60s'
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
            {/* Top Bar - Premium Sticky Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'nowrap',
                gap: '0.75rem',
                position: 'sticky',
                top: 0,
                background: 'rgba(5, 7, 12, 0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                zIndex: 50,
                padding: '1rem',
                margin: '-1rem -1rem 1.5rem -1rem', /* Pull to edges if parent has padding */
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, minWidth: 0 }}>
                    <button
                        className="btn-icon"
                        style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', flexShrink: 0 }}
                        onClick={onCancel}
                    >
                        <X size={18} />
                    </button>
                    <input
                        type="text"
                        value={metadata.name}
                        placeholder="Nome do Treino..."
                        onChange={e => setMetadata({ ...metadata, name: e.target.value })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            outline: 'none',
                            borderBottom: '1px dashed rgba(255,255,255,0.2)',
                            width: '100%',
                            minWidth: 0,
                            padding: '0.2rem 0'
                        }}
                    />
                </div>
                <button
                    className="btn-primary"
                    onClick={onSave}
                    style={{
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.75rem',
                        borderRadius: '12px',
                        flexShrink: 0,
                        textTransform: 'uppercase',
                        fontWeight: 900,
                        letterSpacing: '0.5px',
                        boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)'
                    }}
                >
                    <Save size={16} /> SALVAR
                </button>
            </div>

            {/* Metadata Row - Cleaner Selects */}
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Público Alvo</label>
                        <select
                            value={metadata.level}
                            onChange={e => setMetadata({ ...metadata, level: e.target.value })}
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
                        >
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                            <option value="Elite/Atleta">Elite / Atleta</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>Estratégia</label>
                        <select
                            value={metadata.goal}
                            onChange={e => setMetadata({ ...metadata, goal: e.target.value })}
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}
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
                                <div key={ex.exId} className="glass-panel" style={{
                                    padding: '1.25rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    marginBottom: '1rem',
                                    border: ex.isAdvanced ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '20px',
                                    position: 'relative',
                                    boxShadow: ex.isAdvanced ? '0 4px 20px rgba(74, 222, 128, 0.05)' : 'none',
                                    transition: 'var(--transition-normal)'
                                }}>
                                    {/* Header: Thumbnail + Info + Actions */}
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                        {/* Thumbnail Area */}
                                        <div style={{
                                            flexShrink: 0,
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.4)',
                                            width: '80px',
                                            height: '80px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.05)'
                                        }}>
                                            <AnimatedExercise images={ex.images} name={ex.name} url={ex.url} tipo={ex.tipo} size={80} />
                                        </div>

                                        {/* Info & Actions */}
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ minWidth: 0, paddingRight: '0.5rem' }}>
                                                    <h4 style={{
                                                        fontFamily: 'var(--font-heading)',
                                                        fontSize: '1.1rem',
                                                        margin: 0,
                                                        fontWeight: 700,
                                                        lineHeight: 1.2,
                                                        color: 'var(--text-primary)',
                                                        marginBottom: '0.25rem'
                                                    }}>{ex.name}</h4>
                                                    <p style={{
                                                        fontSize: '0.7rem',
                                                        color: 'var(--primary)',
                                                        textTransform: 'uppercase',
                                                        fontWeight: 800,
                                                        margin: 0,
                                                        letterSpacing: '0.5px'
                                                    }}>{ex.muscleGroup}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveExercise(dIdx, eIdx)}
                                                    style={{
                                                        color: 'rgba(239, 68, 68, 0.6)',
                                                        padding: '0.5rem',
                                                        marginTop: '-0.5rem',
                                                        marginRight: '-0.5rem',
                                                        borderRadius: '50%',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(239, 68, 68, 0.6)'; e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            {/* Config Toggle Button */}
                                            <div style={{ marginTop: '0.8rem' }}>
                                                <button
                                                    onClick={() => handleToggleAdvanced(dIdx, eIdx)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.6rem 0.75rem',
                                                        fontSize: '0.65rem',
                                                        borderRadius: '12px',
                                                        background: ex.isAdvanced ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                                        color: ex.isAdvanced ? '#000' : 'var(--text-secondary)',
                                                        border: ex.isAdvanced ? 'none' : '1px dashed rgba(255,255,255,0.15)',
                                                        fontWeight: 800,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        letterSpacing: '0.5px',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: ex.isAdvanced ? '0 0 10px rgba(0, 123, 255, 0.3)' : 'none'
                                                    }}
                                                >
                                                    <Settings size={14} /> {ex.isAdvanced ? 'CONFIGURAÇÃO AVANÇADA' : 'CONFIGURAÇÃO PADRÃO'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body: Configuration Area (Full Width) */}
                                    <div style={{
                                        background: 'rgba(0,0,0,0.15)',
                                        borderRadius: '16px',
                                        padding: '1rem',
                                        border: '1px solid rgba(255,255,255,0.03)'
                                    }}>
                                        {!ex.isAdvanced ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                {/* Sets & Reps Selection */}
                                                <div>
                                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>Séries</label>
                                                    <div className="no-scrollbar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                                                        {setsPresets.map(s => (
                                                            <button key={s} onClick={() => handleUpdateExerciseField(dIdx, eIdx, 'sets', s)}
                                                                style={{
                                                                    padding: '0.5rem 1rem',
                                                                    borderRadius: '10px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 800,
                                                                    background: ex.sets === s ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                                                    color: ex.sets === s ? '#000' : 'var(--text-secondary)',
                                                                    border: ex.sets === s ? '1px solid var(--primary-hover)' : '1px solid rgba(255,255,255,0.08)',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    boxShadow: ex.sets === s ? '0 2px 10px rgba(0, 123, 255, 0.2)' : 'none',
                                                                    flexShrink: 0
                                                                }}>
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>Repetições</label>
                                                    <div className="no-scrollbar" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                                                        {repsPresets.map(r => (
                                                            <button key={r} onClick={() => handleUpdateExerciseField(dIdx, eIdx, 'reps', r)}
                                                                style={{
                                                                    padding: '0.5rem 1rem',
                                                                    borderRadius: '10px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 800,
                                                                    background: ex.reps === r ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                                                    color: ex.reps === r ? '#000' : 'var(--text-secondary)',
                                                                    border: ex.reps === r ? '1px solid var(--primary-hover)' : '1px solid rgba(255,255,255,0.08)',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                    whiteSpace: 'nowrap',
                                                                    boxShadow: ex.reps === r ? '0 2px 10px rgba(0, 123, 255, 0.2)' : 'none',
                                                                    flexShrink: 0
                                                                }}>
                                                                {r}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Method and Rest Input */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '0.75rem' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>Técnica/Método</label>
                                                        <select value={ex.method} onChange={e => handleUpdateExerciseField(dIdx, eIdx, 'method', e.target.value)}
                                                            className="glass-panel"
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.65rem',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600,
                                                                borderRadius: '12px',
                                                                background: 'rgba(255,255,255,0.05)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                color: 'var(--text-primary)',
                                                                appearance: 'none',
                                                                outline: 'none'
                                                            }}>
                                                            {methods.map(m => <option key={m} value={m} style={{ background: 'var(--bg-color)' }}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.5rem', display: 'block' }}>Descanso</label>
                                                        <div style={{ position: 'relative' }}>
                                                            <input
                                                                type="text"
                                                                value={ex.rest}
                                                                onChange={e => handleUpdateExerciseField(dIdx, eIdx, 'rest', e.target.value)}
                                                                placeholder="ex: 60s"
                                                                className="glass-panel"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.65rem 0.65rem 0.65rem 2.2rem',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 600,
                                                                    borderRadius: '12px',
                                                                    background: 'rgba(255,255,255,0.05)',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    color: 'var(--text-primary)',
                                                                    outline: 'none'
                                                                }}
                                                            />
                                                            <Clock size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--text-primary)' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="animate-fade-in">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                                    {ex.detailedSets?.map((set, sIdx) => (
                                                        <div key={sIdx} className="detailed-set-row" style={{
                                                            background: 'rgba(0,0,0,0.2)',
                                                            border: '1px solid rgba(255,255,255,0.05)',
                                                            borderRadius: '16px',
                                                            padding: '1rem',
                                                            margin: 0,
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {/* Elegant Set Badge */}
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                background: 'var(--primary)',
                                                                color: '#000',
                                                                fontWeight: 900,
                                                                fontSize: '0.65rem',
                                                                padding: '0.3rem 0.8rem',
                                                                borderBottomRightRadius: '12px',
                                                                boxShadow: '2px 2px 10px rgba(74, 222, 128, 0.2)'
                                                            }}>
                                                                SÉRIE {sIdx + 1}
                                                            </div>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.2rem', width: '100%' }}>

                                                                {/* Row for Reps and Intensity */}
                                                                <div style={{ display: 'flex', gap: '0.85rem', width: '100%', alignItems: 'stretch' }}>
                                                                    {/* Reps */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 40%' }}>
                                                                        <label style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Reps</label>
                                                                        <input
                                                                            type="text"
                                                                            value={set.reps}
                                                                            onChange={e => handleUpdateDetailedSet(dIdx, eIdx, sIdx, 'reps', e.target.value)}
                                                                            placeholder="ex: 12-15"
                                                                            className="glass-panel"
                                                                            style={{
                                                                                background: 'rgba(255,255,255,0.03)',
                                                                                border: '1px solid rgba(255,255,255,0.08)',
                                                                                padding: '0.75rem',
                                                                                borderRadius: '10px',
                                                                                color: '#fff',
                                                                                fontSize: '0.85rem',
                                                                                width: '100%',
                                                                                outline: 'none',
                                                                                fontWeight: 700,
                                                                                textAlign: 'center',
                                                                                transition: 'all 0.2s ease',
                                                                                boxSizing: 'border-box'
                                                                            }}
                                                                            onFocus={(e) => { e.currentTarget.style.border = '1px solid var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(74, 222, 128, 0.1)'; }}
                                                                            onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                                        />
                                                                    </div>

                                                                    {/* Intensity */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 60%' }}>
                                                                        <label style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Intensidade</label>
                                                                        <select
                                                                            value={set.intensity}
                                                                            onChange={e => handleUpdateDetailedSet(dIdx, eIdx, sIdx, 'intensity', e.target.value)}
                                                                            className={`intensity-badge ${set.intensity === 'Aquecimento' ? 'intensity-warmup' :
                                                                                set.intensity === 'Ajuste' ? 'intensity-adjust' :
                                                                                    set.intensity === 'Moderada' ? 'intensity-moderate' :
                                                                                        set.intensity === 'Alta' ? 'intensity-high' : 'intensity-max'
                                                                                }`}
                                                                            style={{
                                                                                border: '1px solid rgba(255,255,255,0.05)',
                                                                                outline: 'none',
                                                                                cursor: 'pointer',
                                                                                borderRadius: '10px',
                                                                                padding: '0.75rem 0.5rem',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 800,
                                                                                textAlign: 'center',
                                                                                appearance: 'none',
                                                                                width: '100%',
                                                                                boxSizing: 'border-box',
                                                                                height: '100%'
                                                                            }}
                                                                        >
                                                                            <option value="Aquecimento">Aquecimento</option>
                                                                            <option value="Ajuste">Ajuste/Feed</option>
                                                                            <option value="Moderada">Moderada</option>
                                                                            <option value="Alta">Carga Alta</option>
                                                                            <option value="Máxima">Até a Falha</option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                {/* Full Width Row for Method and Time */}
                                                                <div style={{ display: 'flex', gap: '0.85rem', width: '100%', alignItems: 'stretch' }}>

                                                                    {/* Method */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 50%' }}>
                                                                        <label style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Método</label>
                                                                        <select
                                                                            value={set.method}
                                                                            onChange={e => handleUpdateDetailedSet(dIdx, eIdx, sIdx, 'method', e.target.value)}
                                                                            className="glass-panel"
                                                                            style={{
                                                                                background: 'rgba(255,255,255,0.03)',
                                                                                border: '1px solid rgba(255,255,255,0.08)',
                                                                                padding: '0.75rem',
                                                                                borderRadius: '10px',
                                                                                color: '#fff',
                                                                                fontSize: '0.8rem',
                                                                                width: '100%',
                                                                                outline: 'none',
                                                                                appearance: 'none',
                                                                                fontWeight: 700,
                                                                                transition: 'all 0.2s ease',
                                                                                boxSizing: 'border-box'
                                                                            }}
                                                                            onFocus={(e) => { e.currentTarget.style.border = '1px solid var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(74, 222, 128, 0.1)'; }}
                                                                            onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                                        >
                                                                            {methods.map(m => <option key={m} value={m} style={{ background: 'var(--bg-color)' }}>{m}</option>)}
                                                                        </select>
                                                                    </div>

                                                                    {/* Time / Rest */}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 50%' }}>
                                                                        <label style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Tempo</label>
                                                                        <div style={{ position: 'relative', width: '100%' }}>
                                                                            <input
                                                                                type="text"
                                                                                value={set.time || '60s'}
                                                                                onChange={e => handleUpdateDetailedSet(dIdx, eIdx, sIdx, 'time', e.target.value)}
                                                                                placeholder="ex: 60s"
                                                                                className="glass-panel"
                                                                                style={{
                                                                                    background: 'rgba(255,255,255,0.03)',
                                                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                                                    padding: '0.75rem 0.75rem 0.75rem 2rem',
                                                                                    borderRadius: '10px',
                                                                                    color: '#fff',
                                                                                    fontSize: '0.85rem',
                                                                                    width: '100%',
                                                                                    outline: 'none',
                                                                                    fontWeight: 700,
                                                                                    transition: 'all 0.2s ease',
                                                                                    boxSizing: 'border-box'
                                                                                }}
                                                                                onFocus={(e) => { e.currentTarget.style.border = '1px solid var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(74, 222, 128, 0.1)'; }}
                                                                                onBlur={(e) => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                                            />
                                                                            <Clock size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: '#fff' }} />
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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

            {/* Exercise Library Modal - Refined & Premium Full-Screen */}
            {isExerciseModalOpen && (
                <div className="modal-full-overlay">
                    <div className="modal-full-content">
                        {/* Sticky Top Section (Header, Search, Categories) */}
                        <div style={{
                            flexShrink: 0,
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            background: 'rgba(21, 24, 30, 0.95)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            {/* Header Area */}
                            <div style={{
                                padding: 'calc(1.5rem + env(safe-area-inset-top, 0px)) 1.25rem 1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Escolha o Exercício</h2>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, margin: '0.1rem 0 0 0', textTransform: 'uppercase' }}>Biblioteca Elite FitPro</p>
                                </div>
                                <button
                                    className="btn-icon"
                                    style={{ background: 'rgba(255,255,255,0.05)', width: '36px', height: '36px', borderRadius: '12px' }}
                                    onClick={() => setIsExerciseModalOpen(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '0 1.25rem' }}>
                                {/* Search Area */}
                                <div className="search-input-wrapper" style={{ marginBottom: '1.25rem' }}>
                                    <Search size={18} color={exerciseSearch ? "var(--primary)" : "rgba(255,255,255,0.2)"} />
                                    <input
                                        type="text"
                                        placeholder="Buscar na biblioteca..."
                                        value={exerciseSearch}
                                        onChange={e => setExerciseSearch(e.target.value)}
                                        style={{ fontSize: '1rem' }}
                                    />
                                    {exerciseSearch && (
                                        <button onClick={() => setExerciseSearch('')} className="search-clear-btn">
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Categories Filter */}
                                <div className="no-scrollbar" style={{
                                    display: 'flex',
                                    gap: '0.6rem',
                                    overflowX: 'auto',
                                    paddingBottom: '1.25rem'
                                }}>
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            style={{
                                                padding: '0.5rem 1.2rem',
                                                borderRadius: '12px',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                                                color: selectedCategory === cat ? '#000' : 'rgba(255,255,255,0.4)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Exercises List */}
                        <div className="no-scrollbar" style={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: 'auto',
                            padding: '1rem 1.25rem 3.5rem 1.25rem'
                        }} onScroll={handleScroll}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {filteredExercises.slice(0, visibleCount).map(ex => (
                                    <div
                                        key={ex.id}
                                        className="glass-panel hover-card"
                                        onClick={() => handleAddExercise(ex)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.85rem 1rem',
                                            cursor: 'pointer',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                            borderRadius: '16px',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                flexShrink: 0,
                                                background: 'rgba(0,0,0,0.2)'
                                            }}>
                                                <AnimatedExercise
                                                    images={ex.images}
                                                    name={ex.name}
                                                    url={ex.url}
                                                    tipo={ex.tipo}
                                                    size={50}
                                                />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{
                                                    fontWeight: 800,
                                                    margin: 0,
                                                    fontSize: '0.9rem',
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {ex.name}
                                                </p>
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    color: 'var(--primary)',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 900,
                                                    letterSpacing: '0.3px',
                                                    opacity: 0.8
                                                }}>
                                                    {ex.muscleGroup}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'rgba(74, 222, 128, 0.12)',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            marginLeft: '0.5rem',
                                            border: '1px solid rgba(74, 222, 128, 0.2)'
                                        }}>
                                            <Plus size={18} color="var(--primary)" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {isLoading && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}>Carregando biblioteca...</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutBuilder;
