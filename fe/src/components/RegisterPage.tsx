import React, { useState } from "react";

import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  isDarkMode: boolean;
}

export default function RegisterPage({ onSwitchToLogin, isDarkMode }: RegisterPageProps) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Harap isi username dan password");
      return;
    }

    if (password.length < 4) {
      setError("Password minimal 4 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password konfirmasi tidak cocok");
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError("Username hanya boleh huruf dan angka");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await register({
        username: username.trim(),
        password,
        display_name: displayName.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Registrasi gagal. Coba username lain.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        
        
        className={`w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] border shadow-2xl relative overflow-hidden ${
          isDarkMode ? "bg-zinc-900/90 border-zinc-800" : "bg-white/90 border-white shadow-indigo-100/50"
        }`}
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div
              
              
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg mb-4"
            >
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black">Daftar Akun Baru</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mulai petualangan belajarmu bersama Aksara</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Huruf dan angka saja"
                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition ${
                  isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
                autoFocus
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Nama Tampilan (opsional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nama panggilan kamu"
                className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition ${
                  isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition pr-10 ${
                    isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password"
                  className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition pr-10 ${
                    isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Sudah punya akun?{" "}
            <button
              onClick={onSwitchToLogin}
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
