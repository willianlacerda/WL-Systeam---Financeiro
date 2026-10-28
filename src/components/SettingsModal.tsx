import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Upload, 
  Download, 
  Save, 
  ShieldCheck, 
  FileJson,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { CompanySettings, FinancialData } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  fullData: FinancialData;
  onRestoreData: (data: FinancialData) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  fullData,
  onRestoreData,
}) => {
  const [companyName, setCompanyName] = useState(settings?.companyName || 'WL System Financeiro');
  const [cnpj, setCnpj] = useState(settings?.cnpj || '45.123.789/0001-90');
  const [currency, setCurrency] = useState(settings?.currency || 'BRL');
  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.logoUrl || null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);

        // Save via electronAPI if available
        if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.saveLogo === 'function') {
          try {
            await window.electronAPI.saveLogo(base64);
          } catch (err) {
            console.error(err);
          }
        } else {
          // Save via server API
          try {
            await fetch('/api/logo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataBase64: base64 })
            });
          } catch (err) {
            console.error(err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_wl_system_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setMessage('Backup baixado com sucesso!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.expenses)) {
            onRestoreData(parsed);
            setMessage('Dados restaurados com sucesso a partir do arquivo JSON!');
            setTimeout(() => setMessage(null), 4000);
          } else {
            alert('Formato de arquivo inválido. Deve ser um backup JSON do WL System.');
          }
        } catch (err) {
          alert('Erro ao processar o arquivo JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      companyName: companyName.trim(),
      cnpj: cnpj.trim(),
      currency,
      logoUrl: logoPreview || undefined,
    });
    setMessage('Configurações salvas!');
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">
              Configurações & Backup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {message && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome da Empresa / Organização
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  CNPJ (opcional)
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Moeda Padrão
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano (USD $)</option>
                  <option value="EUR">Euro (EUR €)</option>
                </select>
              </div>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Logo Personalizado da Empresa
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Empresa"
                    className="h-12 w-12 object-contain rounded-xl bg-slate-950 border border-slate-800 p-1"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 font-bold">
                    WL
                  </div>
                )}
                <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer flex items-center gap-2 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Escolher Imagem (PNG/JPG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </form>

          {/* Backup & Restore section */}
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>Gerenciamento de Dados & Cópias de Segurança</span>
            </h4>
            <p className="text-xs text-slate-400">
              Exporte todos os lançamentos, categorias e usuários para arquivo JSON ou restaure um backup prévio.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleDownloadBackup}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Baixar Backup (JSON)</span>
              </button>

              <label className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition">
                <FileJson className="w-4 h-4 text-emerald-400" />
                <span>Restaurar Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
