import React, { useState } from 'react';
import { 
  Lock, 
  Shield, 
  LogIn, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight,
  User,
  KeyRound
} from 'lucide-react';
import { AppUser } from '../types';

interface LoginViewProps {
  appUsers: AppUser[];
  onLogin: (user: AppUser) => void;
  companyName?: string;
  logoUrl?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  appUsers,
  onLogin,
  companyName = 'WL SYSTEM',
  logoUrl = '/logo.png',
}) => {
  // Always start with clean, empty fields so credentials must be re-entered every time
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setError('Por favor, informe o nome de usuário.');
      return;
    }

    if (!cleanPassword) {
      setError('Por favor, informe a senha de acesso.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user by name or username (case-insensitive)
      const matchedUser = appUsers.find(
        (u) =>
          u.name.trim().toLowerCase() === cleanUsername.toLowerCase() ||
          (u.username && u.username.trim().toLowerCase() === cleanUsername.toLowerCase())
      );

      if (!matchedUser) {
        setError('Usuário não encontrado. Verifique o nome digitado.');
        setIsLoading(false);
        return;
      }

      if (matchedUser.active === false) {
        setError('Este usuário está inativo no sistema. Contate o Administrador Geral.');
        setIsLoading(false);
        return;
      }

      const expectedPass = matchedUser.pass ? String(matchedUser.pass).trim() : '';

      // If user has a password configured, validate it
      if (expectedPass && expectedPass !== cleanPassword) {
        setError('Senha incorreta. Verifique os dados e tente novamente.');
        setIsLoading(false);
        return;
      }

      // Successful login
      onLogin(matchedUser);
    }, 200);
  };

  return (
    <div className="min-h-screen w-full bg-[#08090b] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Background Ambience / Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[400px] h-[220px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1f222e_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-sm sm:max-w-md z-10 animate-fade-in space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#121318] border border-[#222430] shadow-xl shadow-black/60 mb-1">
            <img 
              src={logoUrl} 
              alt={companyName}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="h-12 w-auto object-contain max-w-[160px]"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase flex items-center justify-center gap-2">
              <span>{companyName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1">
              Sistema de Gestão Financeira
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#101115]/95 backdrop-blur-xl border border-[#20222a] rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 space-y-5">
          
          <div className="flex items-center gap-2 pb-2 border-b border-[#1c1d24]">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              Acesso de Usuário
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            
            {/* Campo 1: Nome do Usuário */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>Nome de Usuário *</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="wl_username"
                  autoComplete="off"
                  required
                  autoFocus
                  placeholder="Digite seu nome de usuário..."
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full px-4 py-3 bg-[#16171e] border border-[#272935] focus:border-emerald-500 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none transition shadow-inner font-medium tracking-wide"
                />
              </div>
            </div>

            {/* Campo 2: Senha de Acesso */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Senha de Acesso *</span>
                </span>
                <span className="text-[10px] text-zinc-500 normal-case font-normal">
                  PIN ou senha pessoal
                </span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="wl_password"
                  autoComplete="new-password"
                  required
                  placeholder="Digite sua senha..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-4 pr-11 py-3 bg-[#16171e] border border-[#272935] focus:border-emerald-500 rounded-2xl text-sm text-white placeholder-zinc-500 focus:outline-none transition shadow-inner font-medium tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-white transition"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>AUTENTICANDO...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ACESSAR SISTEMA</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-[#1d1f27] text-center">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Acesso seguro com autenticação de credenciais. Permissões gerenciadas pelo Administrador Geral.
            </p>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-zinc-600 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-zinc-500" />
          <span>Ambiente Seguro • WL SYSTEM v3.4</span>
        </div>

      </div>

    </div>
  );
};
