import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const AnimatedExercise = ({ images, name, size = 60, url, tipo }) => {
    const [frame, setFrame] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // Compatibilidade com o formato antigo (images array) ou novo (url string)
    let mediaUrl = url || (images && images[0]);

    // Fallback: Se o caminho for local antigo, reconstrói para a API Estática Ultra Leve (GitHub)
    if (mediaUrl && (mediaUrl.startsWith('/exercises/gifs/') || !mediaUrl.startsWith('http'))) {
        const exerciseName = name || mediaUrl.split('/').pop()?.replace('.gif', '');
        if (exerciseName) {
            mediaUrl = `https://raw.githubusercontent.com/arcelino-cavalcante/api-exercicios-gym/main/videos/${encodeURIComponent(exerciseName)}.mp4`;
        }
    }

    const isVideo = tipo === 'video' || (mediaUrl && mediaUrl.toLowerCase().endsWith('.mp4'));
    const isGif = !isVideo && mediaUrl && mediaUrl.toLowerCase().endsWith('.gif');

    useEffect(() => {
        if (isVideo || isGif || !images || images.length < 2) return;
        const interval = setInterval(() => {
            setFrame((prev) => (prev === 0 ? 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [images, isGif, isVideo]);

    if (!mediaUrl) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                }}
            >
                N/A
            </div>
        );
    }

    const renderMedia = (fullScreen = false) => {
        const style = fullScreen ? {
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '1.5rem',
            boxShadow: '0 30px 60px -12px var(--border-color)',
            background: '#fff',
            border: '1px solid var(--border-color)'
        } : {
            width: size,
            height: size,
            objectFit: 'cover',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: (isGif || isVideo) ? 'transparent' : '#fff',
            cursor: 'zoom-in',
            display: 'block'
        };

        if (isVideo) {
            return (
                <video
                    src={mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={style}
                    onClick={(e) => {
                        if (!fullScreen) {
                            e.stopPropagation();
                            setIsExpanded(true);
                        }
                    }}
                />
            );
        }

        return (
            <img
                src={mediaUrl}
                alt={name}
                onClick={(e) => {
                    if (!fullScreen) {
                        e.stopPropagation();
                        setIsExpanded(true);
                    }
                }}
                style={style}
                loading="lazy"
            />
        );
    };

    return (
        <>
            {renderMedia(false)}

            {isExpanded && createPortal(
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(false);
                    }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        background: 'var(--bg-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem',
                        cursor: 'zoom-out'
                    }}
                >
                    <div className="animate-scale-in" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        gap: '1.5rem',
                        maxWidth: '900px'
                    }}>
                        <div style={{ width: '100%', height: 'auto', maxHeight: '70vh', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {renderMedia(true)}
                        </div>

                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-primary)',
                            background: 'var(--bg-surface)',
                            padding: '1rem 2.5rem',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            width: 'fit-content',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--primary)', lineHeight: 1.2 }}>{name}</h2>
                            <p style={{ opacity: 0.6, margin: '0.4rem 0 0 0', fontSize: '0.85rem' }}>Clique em qualquer lugar para voltar</p>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default AnimatedExercise;
