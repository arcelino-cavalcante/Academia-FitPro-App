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
        <div className="animate-fade-in" style={{ paddingBottom: '7rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Meu Treino 🏋️</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Foco total, {profile?.name || user?.displayName}!</p>
                    </div>
                    {trainingState === 'active' && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'pulse 2s infinite' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }}></div>
                            EM TREINO
                        </div>
                    )}
                </div>

                {trainingState === 'idle' && (
                    <button
                        className="btn-primary"
                        onClick={handleStartTraining}
                        style={{ width: '100%', padding: '1.25rem', justifyContent: 'center', fontSize: '1.1rem', borderRadius: '16px', boxShadow: '0 10px 25px var(--primary-glow)' }}
                    >
                        <Play size={24} fill="currentColor" /> INICIAR TREINO DE HOJE
                    </button>
                )}
            </header>

            {/* Day Selector */}
            {trainingState !== 'active' && (
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    {myWorkout.routine.map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedDayIndex(idx)}
                            style={{
                                padding: '1rem 1.5rem',
                                whiteSpace: 'nowrap',
                                borderRadius: '12px',
                                border: selectedDayIndex === idx ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                                background: selectedDayIndex === idx ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                color: selectedDayIndex === idx ? '#000' : '#fff',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                minWidth: '90px'
                            }}
                        >
                            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{day.id}</span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.2rem' }}>{day.dayName}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Exercises List */}
            {currentDay && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem' }}>
                            {currentDay.dayName}
                        </h2>
                        {trainingState === 'active' && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Iniciado há {Math.round((now - startTime) / 1000 / 60)} min
                            </span>
                        )}
                    </div>

                    {currentDay.exercises.map((ex, exIdx) => (
                        <div key={ex.exId || exIdx} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', position: 'relative', overflow: 'hidden' }}>
                            {ex.isAdvanced && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }}></div>}

                            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'nowrap' }}>
                                <div style={{ flexShrink: 0 }}>
                                    <AnimatedExercise images={ex.images} name={ex.name} size={90} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.2, margin: 0 }}>{ex.name}</h3>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{ex.muscleGroup} • {ex.equipment}</p>
                                        </div>
                                    </div>

                                    {!ex.isAdvanced ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Séries</div>
                                                <div style={{ fontWeight: 800, color: '#fff' }}>{ex.sets}</div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Reps</div>
                                                <div style={{ fontWeight: 800, color: '#fff' }}>{ex.reps}</div>
                                            </div>
                                            <div style={{ background: 'rgba(99,102,241,0.05)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.55rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700 }}>Rest</div>
                                                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{ex.rest}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {ex.detailedSets?.map((set, sIdx) => (
                                                <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)' }}>
                                                        {sIdx + 1}
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{set.reps} reps</span>
                                                            <span className={`intensity-badge ${set.intensity === 'Aquecimento' ? 'intensity-warmup' :
                                                                set.intensity === 'Ajuste' ? 'intensity-adjust' :
                                                                    set.intensity === 'Moderada' ? 'intensity-moderate' :
                                                                        set.intensity === 'Alta' ? 'intensity-high' : 'intensity-max'
                                                                }`} style={{ fontSize: '0.55rem', padding: '0.1rem 0.4rem' }}>
                                                                {set.intensity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {trainingState === 'active' && (
                                                        <input
                                                            type="checkbox"
                                                            className="series-checkbox"
                                                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                            <div style={{ fontSize: '0.65rem', color: 'var(--primary)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
                                                <Clock size={12} /> DESCANSO: {ex.rest}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                    <div className="modal-content glass-panel animate-scale-in" style={{ maxWidth: '400px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary-glow)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <Award size={32} color="var(--primary)" />
                            </div>
                            <h2>Treino Finalizado!</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Como foi a intensidade de hoje?</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            {['Muito Leve', 'Normal', 'Difícil', 'Extremo'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setFeedback({ ...feedback, intensity: level })}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        border: feedback.intensity === level ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                                        background: feedback.intensity === level ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
                                        color: feedback.intensity === level ? 'var(--primary)' : '#fff',
                                        fontSize: '0.85rem',
                                        fontWeight: 700
                                    }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Gostaria de deixar um comentário?</label>
                            <textarea
                                value={feedback.comment}
                                onChange={e => setFeedback({ ...feedback, comment: e.target.value })}
                                placeholder="Ex: Senti um pouco de dor no ombro esquerdo..."
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: '#fff', fontSize: '0.9rem', minHeight: '100px', resize: 'none' }}
                            />
                        </div>

                        <button className="btn-primary" onClick={handleSaveFeedback} style={{ width: '100%', padding: '1rem', justifyContent: 'center' }}>
                            Enviar Feedback e Salvar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentWorkout;
