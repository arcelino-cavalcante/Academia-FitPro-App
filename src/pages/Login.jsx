import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Dumbbell } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, register, user, loading, error, init } = useAuthStore();
    const navigate = useNavigate();

    // Call init on component mount to listen to auth state changes
    useEffect(() => {
        init();
    }, [init]);

    useEffect(() => {
        if (!loading && user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, name);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <div className="loader"></div>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '1.5rem',
            background: 'var(--bg-primary)',
            background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.1) 0%, transparent 40%)'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        background: 'var(--primary-glow)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-full)',
                        marginBottom: '1rem'
                    }}>
                        <Dumbbell size={32} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        FitPro <span style={{ color: 'var(--primary)' }}>SaaS</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isLogin ? 'Bem-vindo de volta! Faça login.' : 'Crie sua conta de Treinador.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!isLogin && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', marginLeft: '0.2rem' }}>Nome Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                                required={!isLogin}
                                className="glass-panel"
                                style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', marginLeft: '0.2rem' }}>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', marginLeft: '0.2rem' }}>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="glass-panel"
                            style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--border-color)', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center', marginTop: '0.5rem' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ padding: '1rem', marginTop: '1rem', justifyContent: 'center', fontSize: '1rem' }}
                    >
                        {isSubmitting ? (
                            <span className="loader" style={{ width: '20px', height: '20px' }}></span>
                        ) : (
                            <>
                                {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                                {isLogin ? 'Entrar Agora' : 'Criar Conta'}
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
