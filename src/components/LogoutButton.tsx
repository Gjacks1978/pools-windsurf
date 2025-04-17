import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LogoutButton() {
  const { signOut, user } = useAuth();
  if (!user) return null;
  return (
    <button
      onClick={signOut}
      className="bg-[#232328] text-[#a1a1aa] px-3 py-1 rounded hover:bg-[#4b206e] hover:text-white transition ml-2"
    >
      Sair
    </button>
  );
}
