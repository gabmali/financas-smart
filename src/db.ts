import Dexie, { type EntityTable } from 'dexie';
export type Transaction = { id?: number; title: string; amount: number; type: 'income' | 'expense'; category: string; date: string };
export type Goal = { id?: number; title: string; target: number; saved: number; deadline: string };
function createDatabase(name: string) { return new Dexie(name) as Dexie & { transactions: EntityTable<Transaction, 'id'>; goals: EntityTable<Goal, 'id'> }; }
export let db = createDatabase('financas-smart');
db.version(1).stores({ transactions: '++id,date,type,category', goals: '++id' });
export function selectAccountDatabase(id: string) { db.close(); db = createDatabase(`financas-smart-user-${id}`); db.version(1).stores({ transactions: '++id,date,type,category', goals: '++id' }); return db.open(); }
export const money = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
export const today = () => new Date().toLocaleDateString('sv-SE');
export async function loadDemo() {
 const month = today().slice(0,7);
 await db.transaction('rw', db.transactions, db.goals, async () => {
 if (await db.transactions.count() || await db.goals.count()) throw new Error('Os dados de exemplo só podem ser carregados quando não houver registros.');
 await db.transactions.bulkAdd([
 {title:'Salário',amount:6500,type:'income',category:'Salário',date:`${month}-05`},
 {title:'Projeto freelance',amount:1800,type:'income',category:'Freelance',date:`${month}-12`},
 {title:'Aluguel do apartamento',amount:1800,type:'expense',category:'Moradia',date:`${month}-06`},
 {title:'Compras do mês',amount:642.5,type:'expense',category:'Alimentação',date:`${month}-09`},
 {title:'Internet e celular',amount:189.9,type:'expense',category:'Contas',date:`${month}-10`},
 {title:'Restaurante',amount:128,type:'expense',category:'Alimentação',date:`${month}-15`},
 {title:'Combustível',amount:280,type:'expense',category:'Transporte',date:`${month}-16`},
 {title:'Cinema com amigos',amount:85,type:'expense',category:'Lazer',date:`${month}-18`}]);
 await db.goals.bulkAdd([{title:'Reserva de emergência',target:20000,saved:8500,deadline:`${new Date().getFullYear()+1}-12-31`},{title:'Próxima viagem',target:8000,saved:2400,deadline:`${new Date().getFullYear()+1}-07-01`}]);
 });
}

