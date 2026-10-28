import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, CreditCard, AlignLeft, MapPin, TrendingUp } from 'lucide-react';
import { Sale } from '../types';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: Omit<Sale, 'id'>, editId?: string) => void;
  currentUser: string;
  initialSale?: Sale | null;
  defaultCity?: string;
  existingCities?: string[];
}

const DEFAULT_CITIES = [
  'AGUIARNÓPOLIS',
  'AMARANTE',
  'ANANÁS',
  'ANGICO',
  'CAMPESTRE',
  'CAROLINA',
  'CENTRO DOS BORGES',
  'DARCINÓPOLIS',
  'LAJEADO',
  'PASSAGEM BOA',
  'PORTO FRANCO',
  'RIACHÃO',
  'RIACHINHO',
  'SÍTIO NOVO',
  'TOCANTINÓPOLIS',
  'WANDERLÂNDIA',
];

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUser,
  initialSale,
  defaultCity,
  existingCities = [],
}) => {
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(defaultCity || 'CAROLINA');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [status, setStatus] = useState<'recebido' | 'a_receber'>('recebido');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availableCities = Array.from(new Set([...DEFAULT_CITIES, ...existingCities, ...(initialSale?.city ? [initialSale.city] : []), ...(defaultCity ? [defaultCity] : [])])).sort();

  useEffect(() => {
    if (isOpen) {
      if (initialSale) {
        setDescription(initialSale.description || "");
        setCity(initialSale.city || "CAROLINA");
        setAmount(initialSale.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        setDate(initialSale.date || new Date().toISOString().slice(0, 10));
        setPaymentMethod(initialSale.paymentMethod || "Dinheiro");
        setStatus(initialSale.status || "recebido");
        setNotes(initialSale.notes || "");
      } else {
        setDescription("");
        setCity(defaultCity || "CAROLINA");
        setAmount("");
        setDate(new Date().toISOString().slice(0, 10));
        setPaymentMethod("Dinheiro");
        setStatus("recebido");
        setNotes("");
      }
      setError(null);
    }
  }, [isOpen, initialSale, defaultCity]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError('Informe um valor de venda válido.');
      return;
    }

    const finalCity = city.trim() || 'CAROLINA';
    const finalDesc = description.trim() || 'Venda de Mercadoria';

    onSave({
      description: finalDesc,
      city: finalCity,
      amount: cleanAmount,
      date,
      paymentMethod,
      status,
      user: currentUser,
      notes: notes.trim(),
    }, initialSale?.id);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#121317] border-t sm:border border-[#23252d] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1.5 bg-zinc-600 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#1f2128] flex items-center justify-between bg-[#15161b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                {initialSale ? 'EDITAR VENDA' : 'NOVA ENTRADA DE VENDA'}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                {initialSale ? 'Atualizar Dados da Venda' : 'Registrar Faturamento'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Descrição & Mercadoria (Opcional) */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Descrição da Venda / Mercadoria (Opcional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Carga Melancia & Hortifrúti Atacado"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#262833] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Cidade / Praça */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Cidade / Praça da Venda *</span>
            </label>
            <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#262833] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500 transition"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

          {/* Amount & Date in 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#00e676]" />
                <span>Valor Total (R$) *</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#262833] rounded-xl text-base font-mono font-bold text-[#00e676] focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Data da Operação *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Forma de Pagamento & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Forma de Pagamento</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão">Cartão</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Status do Faturamento
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatus('recebido')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                    status === 'recebido'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-[#17181e] text-zinc-400 border-[#23252d] hover:text-white'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  <span>Recebido</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('a_receber')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                    status === 'a_receber'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-[#17181e] text-zinc-400 border-[#23252d] hover:text-white'
                  }`}
                >
                  <span>A Receber</span>
                </button>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>Observações / Dados do Lote</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Entrega realizada via caminhão próprio, aguardando compensação..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#1f2128] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl bg-[#181920] hover:bg-[#20222a] text-zinc-300 text-xs font-semibold transition text-center min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold uppercase shadow-lg shadow-emerald-500/10 transition flex items-center justify-center gap-1.5 active:scale-95 min-h-[44px]"
            >
              <Check className="w-3.5 h-3.5 text-black" />
              <span>{initialSale ? 'Atualizar Venda' : 'Salvar Venda'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
