import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else setSuccess('Login realizado com sucesso!');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else setSuccess('Cadastro realizado! Verifique seu email.');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (error) setError(error.message);
        else {
          setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
          // Voltar para o modo de login após 3 segundos
          setTimeout(() => {
            setMode('login');
            setSuccess(null);
          }, 3000);
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xs mx-auto mt-8 p-6 bg-[#18181b] rounded-lg shadow-lg border border-[#4b206e]">
      <h2 className="text-lg font-bold mb-4 text-white text-center">
        {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Recuperar Senha'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          className="rounded px-3 py-2 bg-[#232328] text-white border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {mode !== 'reset' && (
          <input
            type="password"
            placeholder="Senha"
            className="rounded px-3 py-2 bg-[#232328] text-white border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        )}
        <button
          type="submit"
          className="bg-[#4b206e] text-white rounded py-2 font-semibold hover:bg-[#6b21a8] transition"
          disabled={loading}
        >
          {loading ? 'Aguarde...' : 
            mode === 'login' ? 'Entrar' : 
            mode === 'signup' ? 'Cadastrar' : 
            'Enviar Email de Recuperação'}
        </button>
      </form>
      {error && <div className="text-red-400 mt-2 text-sm text-center">{error}</div>}
      {success && <div className="text-green-400 mt-2 text-sm text-center">{success}</div>}
      <div className="mt-4 text-center flex flex-col gap-2">
        {mode === 'login' && (
          <>
            <button
              className="text-xs text-[#a1a1aa] hover:underline"
              onClick={() => setMode('signup')}
            >
              Não tem conta? Cadastre-se
            </button>
            <button
              className="text-xs text-[#a1a1aa] hover:underline"
              onClick={() => setMode('reset')}
            >
              Esqueci minha senha
            </button>
          </>
        )}
        {mode === 'signup' && (
          <button
            className="text-xs text-[#a1a1aa] hover:underline"
            onClick={() => setMode('login')}
          >
            Já tem conta? Entrar
          </button>
        )}
        {mode === 'reset' && (
          <button
            className="text-xs text-[#a1a1aa] hover:underline"
            onClick={() => setMode('login')}
          >
            Voltar para o login
          </button>
        )}
      </div>
    </div>
  );
}
