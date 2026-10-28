import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, DollarSign, Tag, User, CreditCard, AlignLeft, Repeat } from 'lucide-react';
import { Expense, SubCategory, AppUser } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
  expenseToEdit?: Expense | null;
  subCategories: SubCategory[];
  appUsers: AppUser[];
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
  subCategories,
  appUsers,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [subCategory, setSubCategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('dinheiro');
  const [status, setStatus] = useState<Expense['status']>('pendente');
  const [user, setUser] = useState<string>('');
  const [recurrent, setRecurrent] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setAmount(String(expenseToEdit.amount));
      setDate(expenseToEdit.date);
      setSubCategory(expenseToEdit.subCategory || expenseToEdit.category || '');
      setPaymentMethod(expenseToEdit.paymentMethod);
      setStatus(expenseToEdit.status);
      setUser(expenseToEdit.user || '');
      setRecurrent(!!expenseToEdit.recurrent);
      setNotes(expenseToEdit.notes || '');
    } else {
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setSubCategory(subCategories[0]?.name || 'Operacional');
      setPaymentMethod('dinheiro');
      setStatus('pendente');
      setUser(appUsers[0]?.name || 'Willian Lacerda');
      setRecurrent(false);
      setNotes('');
    }
    setError(null);
  }, [expenseToEdit, isOpen, subCategories, appUsers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor numérico válido maior que zero.');
      return;
    }

    const categoryObj = subCategories.find(s => s.name === subCategory);
    const categoryName = categoryObj ? categoryObj.category : 'Geral';
    const finalDesc = description.trim() || subCategory || 'Despesa Geral';

    const payload: any = {
      description: finalDesc,
      amount: parsedAmount,
      date,
      category: categoryName,
      subCategory: subCategory || categoryName,
      paymentMethod,
      status,
      user: user || 'Administrador',
      recurrent,
      notes: notes.trim(),
    };

    if (expenseToEdit?.id) {
      payload.id = expenseToEdit.id;
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-lg font-bold text-white">
            {expenseToEdit ? 'Editar Despesa' : 'Nova Despesa'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Descrição da Despesa (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Fatura Servidores AWS ou Aluguel Sala 302"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">R$</span>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Data de Vencimento *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Category & Subcategory */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Categoria / Subcategoria
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
            >
              {subCategories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} ({cat.category})
                </option>
              ))}
            </select>
          </div>

          {/* Forma de Pagamento & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">PIX</option>
                <option value="cartao">Cartão</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status da Despesa
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
              >
                <option value="pago">Liquidado (Pago)</option>
                <option value="pendente">Pendente a Pagar</option>
                <option value="agendado">Agendado</option>
              </select>
            </div>
          </div>

          {/* Responsável */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Responsável / Solicitante
            </label>
            <select
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition"
            >
              {appUsers.map(u => (
                <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Recurrence Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="recurrent-check"
              checked={recurrent}
              onChange={(e) => setRecurrent(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="recurrent-check" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
              <Repeat className="w-3.5 h-3.5 text-blue-400" />
              <span>Despesa Recorrente Mensal (Contrato / Assinatura fixa)</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observações & Detalhes Adicionais
            </label>
            <textarea
              rows={2}
              placeholder="Número de nota fiscal, centro de custo ou informações para auditoria..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{expenseToEdit ? 'Salvar Alterações' : 'Cadastrar Despesa'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
