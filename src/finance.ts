import type { Goal, Transaction } from './db';

export const categories = ['Alimentação','Moradia','Transporte','Contas','Lazer','Saúde','Educação','Compras','Salário','Freelance','Outros'];
export function isValidDate(value: unknown): value is string {
 if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
 const date = new Date(`${value}T12:00:00Z`);
 return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function record(value: unknown): Record<string, unknown> {
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Registro inválido.');
 return value as Record<string, unknown>;
}
function title(value: unknown, maximum: number): string {
 if (typeof value !== 'string' || !value.trim() || value.length > maximum) throw new Error(`A descrição deve ter entre 1 e ${maximum} caracteres.`);
 return value.trim();
}
export function isMoney(value: unknown, allowZero = false): value is number {
 return typeof value === 'number' && Number.isFinite(value) && value >= (allowZero ? 0 : 0.01) && value <= 999999999 && Math.abs(value * 100 - Math.round(value * 100)) < 0.00001;
}
export function validateTransaction(value: unknown): Omit<Transaction, 'id'> {
 const v = record(value);
 if (!isMoney(v.amount)) throw new Error('Informe um valor positivo com no máximo duas casas decimais.');
 if (v.type !== 'income' && v.type !== 'expense') throw new Error('Tipo de transação inválido.');
 if (typeof v.category !== 'string' || !categories.includes(v.category)) throw new Error('Categoria inválida.');
 if (!isValidDate(v.date)) throw new Error('Informe uma data existente.');
 return { title: title(v.title, 100), amount: Math.round(v.amount * 100) / 100, type: v.type, category: v.category, date: v.date };
}
export function validateGoal(value: unknown): Omit<Goal, 'id'> {
 const v = record(value);
 if (!isMoney(v.target) || !isMoney(v.saved, true)) throw new Error('Informe valores válidos com no máximo duas casas decimais.');
 if (v.deadline !== '' && !isValidDate(v.deadline)) throw new Error('Informe um prazo existente.');
 return { title: title(v.title, 80), target: Math.round(v.target * 100) / 100, saved: Math.round(v.saved * 100) / 100, deadline: v.deadline as string };
}
export function parseBackup(value: unknown) {
 const v = record(value);
 if (v.version !== 1 || !Array.isArray(v.transactions) || !Array.isArray(v.goals)) throw new Error('Formato de backup inválido.');
 return { transactions: v.transactions.map(validateTransaction), goals: v.goals.map(validateGoal) };
}
export function simulate(initial: number, monthly: number, annualRate: number, years: number) {
 if (![initial, monthly, annualRate, years].every(Number.isFinite) || initial < 0 || initial > 100000000 || monthly < 0 || monthly > 1000000 || annualRate < 0 || annualRate > 50 || years < 1 || years > 50) throw new Error('Parâmetros de simulação inválidos.');
 const months = Math.round(years * 12);
 const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
 let balance = initial;
 const data = [{ name: 'Início', Patrimônio: initial, Aportes: initial }];
 for (let month = 1; month <= months; month++) {
  balance = balance * (1 + monthlyRate) + monthly;
  if (month % 12 === 0 || month === months) data.push({ name: month % 12 === 0 ? `Ano ${month / 12}` : `${month} meses`, Patrimônio: Math.round(balance * 100) / 100, Aportes: initial + monthly * month });
 }
 return { balance, invested: initial + monthly * months, months, data };
}
export function expenseCategories(items: Transaction[]) {
 return categories.map(name => ({name, value: items.filter(t => t.type === 'expense' && t.category === name).reduce((sum, t) => sum + t.amount, 0)})).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
}
