import React, { useState, useEffect } from 'react';
import { X, Check, DollarSign, Calendar, CreditCard, AlignLeft, Shield } from 'lucide-react';
import { Expense } from '../types';

interface LancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  currentUser: string;
  currentSetor: string;
}

export const LancamentoModal: React.FC<LancamentoModalProps> = ({
  isOpen,
  onClose,
  categoryName,
  onSave,
  currentUser,
  currentSetor,
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [status, setStatus] = useState<Expense['status']>('pago');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Dinheiro');
      setStatus('pago');
      setNotes('');
      setError(null);
    }
  }, [isOpen, categoryName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setError('Informe um valor numérico válido.');
      return;
    }

    onSave({
      description: categoryName,
      category: categoryName,
      amount: cleanAmount,
      date,
      paymentMethod,
      status,
      user: currentUser,
      setor: currentSetor,
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#131418] border-t sm:border border-[#23252d] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-none">
        
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1.5 bg-zinc-600 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#1f2128] flex items-center justify-between bg-[#16171d]">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
              NOVO LANÇAMENTO
            </span>
            <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
              {categoryName}
            </h3>
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
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Amount (Valor R$) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Valor da Despesa (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-500 text-sm font-bold font-mono">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-3.5 py-3 sm:py-2.5 bg-[#17181e] border border-[#262833] rounded-xl text-lg sm:text-base text-[#00e676] font-mono font-bold focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Forma de Pagto
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Dinheiro">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="Cartão">Cartão</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('pago')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  status === 'pago'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-[#17181e] text-zinc-400 border-[#262833]'
                }`}
              >
                Pago
              </button>
              <button
                type="button"
                onClick={() => setStatus('pendente')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  status === 'pendente'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                    : 'bg-[#17181e] text-zinc-400 border-[#262833]'
                }`}
              >
                Pendente
              </button>
              <button
                type="button"
                onClick={() => setStatus('agendado')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  status === 'agendado'
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                    : 'bg-[#17181e] text-zinc-400 border-[#262833]'
                }`}
              >
                Agendado
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Observações (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Nota fiscal 4821, fornecedor X..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#17181e] border border-[#262833] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Info pill */}
          <div className="p-2.5 rounded-xl bg-[#17181e] border border-[#202229] flex items-center justify-between text-[11px] text-zinc-400">
            <span>Responsável: <strong className="text-zinc-200">{currentUser}</strong></span>
            <span>Setor: <strong className="text-zinc-200">{currentSetor}</strong></span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#1f2128] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl bg-[#1a1b22] hover:bg-[#22242c] text-zinc-300 text-xs font-semibold transition text-center min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 active:scale-95 min-h-[44px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Lançamento</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
