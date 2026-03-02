import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore } from '../store/workoutStore';
import AnimatedExercise from '../components/ui/AnimatedExercise';
import { Dumbbell, Calendar, ChevronRight, Activity, Clock, Award, Target, Info, Play, CheckCircle, MessageSquare, X } from 'lucide-react';
import { useToast } from '../components/ui/ToastProvider';

const StudentWorkout = () => {
    const { user, profile } = useAuthStore();
    const { workouts, saveWorkoutSession } = useWorkoutStore();
    const { showToast } = useToast();
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [myWorkout, setMyWorkout] = useState(null);

    // Training state
    const [trainingState, setTrainingState] = useState('idle'); // 'idle', 'active', 'finished'
    const [startTime, setStartTime] = useState(null);
    const [now, setNow] = useState(new Date());
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState({ intensity: 'Moderada', comment: '' });

    useEffect(() => {
        let interval;
        if (trainingState === 'active') {
            interval = setInterval(() => {
                setNow(new Date());
            }, 10000); // Atualiza a cada 10 segundos para dar um feedback mais fluido
        }
        return () => clearInterval(interval);
    }, [trainingState]);

    useEffect(() => {
        if (profile?.studentId) {
            const workout = workouts.find(w => w.studentId === profile.studentId);
            if (workout) {
                setMyWorkout(workout);

                // Auto-select today's workout based on schedule
                if (workout.schedule?.weekly) {
                    const days = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sabado'];
                    const todayName = days[new Date().getDay()];
                    const scheduledDayId = workout.schedule.weekly[todayName];

                    if (scheduledDayId) {
                        const idx = workout.routine.findIndex(r => r.id === scheduledDayId);
                        if (idx !== -1) setSelectedDayIndex(idx);
                    }
                }
            }
        }
    }, [profile, workouts]);

    const handleStartTraining = () => {
        const start = new Date();
        setTrainingState('active');
        setStartTime(start);
        setNow(start);
    };

    const handleFinishTraining = () => {
        setShowFeedbackModal(true);
    };

    const handleSaveFeedback = async () => {
        const endTime = new Date();
        const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes

        await saveWorkoutSession(profile.studentId, myWorkout.trainerId, {
            dayId: currentDay.id,
            dayName: currentDay.dayName,
            duration,
            feedback,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            workoutName: myWorkout.name || 'Treino Individual'
        });

        setTrainingState('finished');
        setShowFeedbackModal(false);
        showToast('Treino concluído com sucesso! Bom trabalho!');
    };

    if (!myWorkout) return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Activity size={64} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Aguardando Prescrição</h2>
            <p className="text-secondary" style={{ maxWidth: '300px', margin: '0 auto' }}>Seu treinador ainda está preparando seu roteiro de treinamento digital.</p>
        </div>
    );

    const currentDay = myWorkout.routine[selectedDayIndex];

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '7rem', paddingTop: 0 }}>
            {/* Sticky Header */}
            <div style={{
                position: 'sticky',
                top: '-1rem',
                zIndex: 50,
                background: 'rgba(5, 10, 20, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                margin: '-1rem -1rem 1.5rem -1rem',
                padding: '1.25rem 1rem 1rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        margin: '0',
                        background: 'linear-gradient(to bottom, #ffffff, #aaaaaa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}>Meu Treino <span style={{ fontSize: '1.25rem' }}>🏋️</span></h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, margin: '0.2rem 0 0 0' }}>
                        Foco total, <strong style={{ color: '#fff' }}>{profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0]}</strong>!
                    </p>
                </div>
                {trainingState === 'active' && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--error)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '12px',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        animation: 'pulse 2s infinite',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--error)' }}></div>
                        EM TREINO
                    </div>
                )}
            </div>

            <header style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}>
                {/* Iniciar Treino Content removed from header display flex since it moved up */}

                {trainingState === 'idle' && (
                    <button
                        className="btn-primary"
                        onClick={handleStartTraining}
                        style={{
                            width: '100%',
                            padding: '1.25rem',
                            justifyContent: 'center',
                            fontSize: '1.15rem',
                            fontWeight: 900,
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px var(--primary-glow)',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <Play size={24} fill="currentColor" /> INICIAR TREINO DE HOJE
                    </button>
                )}
            </header>

            {/* Day Selector */}
            {trainingState !== 'active' && (
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    paddingBottom: '1rem',
                    marginBottom: '2rem',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}>
                    <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                    {myWorkout.routine.map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedDayIndex(idx)}
                            style={{
                                padding: '1.25rem 2rem',
                                whiteSpace: 'nowrap',
                                borderRadius: '16px',
                                border: selectedDayIndex === idx ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                background: selectedDayIndex === idx ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                color: selectedDayIndex === idx ? 'var(--primary)' : 'var(--text-secondary)',
                                boxShadow: selectedDayIndex === idx ? 'inset 0 0 20px rgba(0, 123, 255, 0.2), 0 8px 32px 0 rgba(0, 0, 0, 0.3)' : '0 4px 15px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                minWidth: '100px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: 900,
                                color: selectedDayIndex === idx ? '#fff' : 'inherit',
                                marginBottom: '0.2rem'
                            }}>{day.id}</span>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: selectedDayIndex === idx ? 800 : 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>{day.dayName}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Exercises List */}
            {currentDay && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 900,
                            borderLeft: '4px solid var(--primary)',
                            paddingLeft: '1rem',
                            background: 'linear-gradient(90deg, rgba(0, 123, 255, 0.1) 0%, transparent 100%)',
                            color: '#fff',
                            letterSpacing: '-0.02em',
                            margin: 0,
                            paddingTop: '0.25rem',
                            paddingBottom: '0.25rem'
                        }}>
                            {currentDay.dayName}
                        </h2>
                        {trainingState === 'active' && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Iniciado há {Math.round((now - startTime) / 1000 / 60)} min
                            </span>
                        )}
                    </div>

                    {currentDay.exercises.map((ex, exIdx) => (
                        <div key={ex.exId || exIdx} style={{
                            padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.05)',
                            background: 'rgba(255,255,255,0.02)',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                            transition: 'var(--transition-normal)'
                        }}>
                            {ex.isAdvanced && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>}

                            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'nowrap', marginBottom: '1.25rem' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <AnimatedExercise images={ex.images} name={ex.name} url={ex.url || ex.videoUrl} tipo={ex.tipo} size={90} />
                                </div>

                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>{ex.name}</h3>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem', fontWeight: 600 }}>{ex.muscleGroup} • {ex.equipment}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!ex.isAdvanced ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Séries</div>
                                        <div style={{ fontWeight: 900, color: '#fff', fontSize: '1.15rem' }}>{ex.sets}</div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Reps</div>
                                        <div style={{ fontWeight: 900, color: '#fff', fontSize: '1.15rem' }}>{ex.reps}</div>
                                    </div>
                                    <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '0.6rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.6rem', color: '#818cf8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Descanso</div>
                                        <div style={{ fontWeight: 900, color: '#818cf8', fontSize: '1.15rem' }}>{ex.rest}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {ex.detailedSets?.map((set, sIdx) => (
                                        <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', transition: 'var(--transition-fast)' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: 'rgba(0, 123, 255, 0.1)',
                                                border: '1px solid var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.8rem',
                                                fontWeight: 900,
                                                color: 'var(--primary)',
                                                boxShadow: '0 0 10px rgba(0, 123, 255, 0.2)'
                                            }}>
                                                {sIdx + 1}
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{set.reps} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>REPS</span></span>
                                                    <span style={{
                                                        fontSize: '0.65rem',
                                                        padding: '0.2rem 0.6rem',
                                                        borderRadius: '6px',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        border: '1px solid currentColor',
                                                        color: set.intensity === 'Aquecimento' ? '#38bdf8' :
                                                            set.intensity === 'Ajuste' ? '#a78bfa' :
                                                                set.intensity === 'Moderada' ? '#4ade80' :
                                                                    set.intensity === 'Alta' ? '#fb923c' : '#ef4444',
                                                        background: set.intensity === 'Aquecimento' ? 'rgba(56, 189, 248, 0.1)' :
                                                            set.intensity === 'Ajuste' ? 'rgba(167, 139, 250, 0.1)' :
                                                                set.intensity === 'Moderada' ? 'rgba(74, 222, 128, 0.1)' :
                                                                    set.intensity === 'Alta' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    }}>
                                                        {set.intensity}
                                                    </span>

                                                    {/* Method Badge (Only if not Normal) */}
                                                    {set.method && set.method !== 'Normal' && (
                                                        <span style={{
                                                            fontSize: '0.65rem',
                                                            padding: '0.2rem 0.6rem',
                                                            borderRadius: '6px',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            border: '1px solid rgba(168, 85, 247, 0.4)',
                                                            color: '#e879f9',
                                                            background: 'rgba(168, 85, 247, 0.1)',
                                                        }}>
                                                            {set.method}
                                                        </span>
                                                    )}

                                                    {/* Time/Rest Indicator */}
                                                    {(set.time || set.rest) && (
                                                        <span style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.2rem',
                                                            fontSize: '0.65rem',
                                                            padding: '0.2rem 0.6rem',
                                                            borderRadius: '6px',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            color: '#94a3b8',
                                                            background: 'rgba(255,255,255,0.05)',
                                                        }}>
                                                            <Clock size={10} style={{ strokeWidth: 3 }} />
                                                            {set.time ? set.time : (ex.rest ? ex.rest : '60s')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {trainingState === 'active' && (
                                                <input
                                                    type="checkbox"
                                                    className="series-checkbox"
                                                    style={{
                                                        appearance: 'none',
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '6px',
                                                        border: '2px solid rgba(255,255,255,0.2)',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        cursor: 'pointer',
                                                        position: 'relative',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onClick={(e) => {
                                                        const checked = e.target.checked;
                                                        if (checked) {
                                                            e.target.style.background = 'var(--primary)';
                                                            e.target.style.borderColor = 'var(--primary)';
                                                            e.target.style.boxShadow = '0 0 10px var(--primary-glow)';
                                                        } else {
                                                            e.target.style.background = 'rgba(255,255,255,0.05)';
                                                            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                                                            e.target.style.boxShadow = 'none';
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: '12px', padding: '0.6rem', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.7rem', color: '#818cf8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <Clock size={14} /> Descanso Ideal: {ex.rest}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Finish Button */}
            {trainingState === 'active' && (
                <div style={{ position: 'fixed', bottom: '6rem', left: '1rem', right: '1rem', zIndex: 100 }}>
                    <button
                        onClick={handleFinishTraining}
                        className="btn-primary"
                        style={{ width: '100%', padding: '1.25rem', justifyContent: 'center', background: 'var(--success)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)' }}
                    >
                        <CheckCircle size={24} /> FINALIZAR TREINO
                    </button>
                </div>
            )}

            {/* Feedback Modal */}
            {showFeedbackModal && (
                <div className="modal-overlay" style={{ zIndex: 1000 }}>
                    <div className="animate-scale-in" style={{
                        maxWidth: '400px',
                        width: '90%',
                        background: 'rgba(5, 10, 20, 0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '2rem',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at top, rgba(0,123,255,0.15) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }}></div>

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ background: 'var(--primary-glow)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', border: '1px solid rgba(0,123,255,0.3)', boxShadow: '0 0 20px rgba(0,123,255,0.2)' }}>
                                <Award size={36} color="var(--primary)" />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Treino Finalizado!</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Como foi a intensidade de hoje?</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
                            {['Muito Leve', 'Normal', 'Difícil', 'Extremo'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setFeedback({ ...feedback, intensity: level })}
                                    style={{
                                        padding: '0.85rem',
                                        borderRadius: '12px',
                                        border: feedback.intensity === level ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                        background: feedback.intensity === level ? 'rgba(0, 123, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                                        color: feedback.intensity === level ? '#fff' : 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        fontWeight: feedback.intensity === level ? 800 : 600,
                                        transition: 'all 0.2s',
                                        boxShadow: feedback.intensity === level ? '0 0 15px rgba(0, 123, 255, 0.2)' : 'none'
                                    }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Gostaria de deixar um comentário?</label>
                            <textarea
                                value={feedback.comment}
                                onChange={e => setFeedback({ ...feedback, comment: e.target.value })}
                                placeholder="Ex: Senti um pouco de dor no ombro esquerdo..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    padding: '1.25rem',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    minHeight: '120px',
                                    resize: 'none',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        <button
                            className="btn-primary"
                            onClick={handleSaveFeedback}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                justifyContent: 'center',
                                fontSize: '1.1rem',
                                fontWeight: 900,
                                borderRadius: '16px',
                                position: 'relative',
                                zIndex: 1,
                                boxShadow: '0 8px 25px var(--primary-glow)'
                            }}
                        >
                            ENVIAR FEEDBACK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentWorkout;
