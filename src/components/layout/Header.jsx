import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const { profile, user, logout } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await logout();
        navigate('/login');
    };

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Obter iniciais para o avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const displayName = profile?.name || user?.displayName || 'Usuário';
    const initals = getInitials(displayName);

    // Get page title based on current path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/' || path === '/dashboard') return 'Dashboard';
        if (path === '/students') return 'Alunos';
        if (path === '/workouts') return 'Meus Modelos 🏋️';
        if (path === '/my-workout') return 'Meu Treino 🏋️';
        if (path === '/admin') return 'Master Admin';
        return '';
    };

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'calc(1rem + env(safe-area-inset-top, 0px)) 1.5rem 1rem 1.5rem',
            margin: '0 -1rem 1.5rem -1rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                }}>
                    {getPageTitle()}
                </h1>
            </div>

            <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                    onClick={toggleMenu}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'var(--border-color)',
                        border: '1px solid var(--border-color)',
                        padding: '0.4rem 0.8rem 0.4rem 0.4rem',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--border-color)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'var(--border-color)'}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        {initals}
                    </div>

                    <div style={{ display: 'none', flexDirection: 'column', alignItems: 'flex-start' }} className="desktop-only-flex">
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName.split(' ')[0]}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {profile?.role === 'STUDENT' ? 'ALUNO' : profile?.role === 'TRAINER' ? 'TREINADOR' : 'MASTER'}
                        </span>
                    </div>

                    <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: isMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        width: '220px',
                        background: 'var(--bg-color)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-sm)',
                        overflow: 'hidden',
                        animation: 'slideUp 0.2s ease-out'
                    }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                        </div>

                        <div style={{ padding: '0.5rem' }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--error)',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <LogOut size={18} />
                                Sair do APP
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .desktop-only-flex {
                        display: flex !important;
                    }
                }
            `}</style>
        </header>
    );
};

export default Header;
