"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Verificar se o usuário tem um hash de redefinição de senha válido na URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (!hashParams.get('access_token')) {
      setError('Link de redefinição de senha inválido ou expirado. Por favor, solicite um novo link.');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Senha atualizada com sucesso!');
        // Redirecionar para a página principal após 3 segundos
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (err) {
      setError('Ocorreu um erro ao atualizar sua senha. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xs mx-auto mt-8 p-6 bg-[#18181b] rounded-lg shadow-lg border border-[#4b206e]">
      <h2 className="text-lg font-bold mb-4 text-white text-center">Redefinir Senha</h2>
      
      {error ? (
        <div className="text-red-400 mb-4 text-sm text-center">
          {error}
          <div className="mt-4">
            <button
              onClick={() => router.push('/')}
              className="bg-[#4b206e] text-white rounded py-2 px-4 font-semibold hover:bg-[#6b21a8] transition"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      ) : success ? (
        <div className="text-green-400 mb-4 text-sm text-center">
          {success}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="Nova senha"
            className="rounded px-3 py-2 bg-[#232328] text-white border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            className="rounded px-3 py-2 bg-[#232328] text-white border border-[#4b206e] focus:ring-2 focus:ring-[#4b206e]"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-[#4b206e] text-white rounded py-2 font-semibold hover:bg-[#6b21a8] transition"
            disabled={loading}
          >
            {loading ? 'Aguarde...' : 'Redefinir Senha'}
          </button>
        </form>
      )}
    </div>
  );
}
