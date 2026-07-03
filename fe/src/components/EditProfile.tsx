import React, { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, User, Upload } from "lucide-react";
import { apiGet, apiPut } from "../services/apiClient";

interface ProfileData {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  level: number;
  current_xp: number;
}

interface EditProfileProps {
  isDarkMode: boolean;
  onBack: () => void;
}

export default function EditProfile({ isDarkMode, onBack }: EditProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ success: boolean; data: ProfileData }>("/api/settings/profile")
      .then((res) => {
        setProfile(res.data);
        setDisplayName(res.data.display_name || res.data.username);
        setAvatarUrl(res.data.avatar_url || "");
      })
      .catch(() => setError("Gagal memuat profil"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran maks 500KB (biar muat di MySQL max_allowed_packet)
    if (file.size > 500 * 1024) {
      setError("Ukuran gambar maksimal 500KB");
      return;
    }

    // Preview lokal
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarPreview(dataUrl);
      setAvatarUrl(dataUrl); // Kirim sebagai data URL ke backend
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Nama tampilan tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      await apiPut("/api/auth/profile", {
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim() || null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setError("Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with back */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl transition ${isDarkMode ? "hover:bg-zinc-800" : "hover:bg-gray-100"}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black">Edit Profil</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Perbarui informasi akunmu</p>
        </div>
      </div>

      {/* Avatar Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 sm:p-8 rounded-3xl border text-center ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white shadow-sm border-gray-200"}`}
      >
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-md mx-auto overflow-hidden">
            {avatarPreview || avatarUrl ? (
              <img
                src={avatarPreview || avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback ke initial jika gambar gagal load
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              displayName.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
            title="Upload foto"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="font-bold text-lg mt-3">{displayName}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{profile?.username}</p>
        <p className="text-xs text-gray-400 mt-1">Level {profile?.level || 1} • {profile?.current_xp || 0} XP</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white shadow-sm border-gray-200"}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
            <User className="w-5 h-5" />
          </div>
          <h3 className="font-bold">Informasi Profil</h3>
        </div>

        {/* Username (readonly) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Username</label>
          <input
            type="text"
            value={profile?.username || ""}
            disabled
            className={`w-full px-4 py-3 rounded-xl text-sm border opacity-60 cursor-not-allowed ${
              isDarkMode ? "bg-zinc-800 border-zinc-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"
            }`}
          />
          <p className="text-[10px] text-gray-400 mt-1">Username tidak bisa diubah</p>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nama Tampilan</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nama panggilan kamu"
            className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
              isDarkMode ? "bg-zinc-800 border-zinc-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"
            }`}
          />
        </div>

        {/* Keterangan avatar */}
        {avatarPreview && (
          <div className="text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800/50 rounded-xl px-4 py-2">
            ✅ Gambar siap diupload. Klik Simpan untuk menyimpan perubahan.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
          ) : saveSuccess ? (
            <><CheckCircle2 className="w-4 h-4" /> Tersimpan!</>
          ) : (
            <><Save className="w-4 h-4" /> Simpan</>
          )}
        </button>
      </motion.div>
    </div>
  );
}
