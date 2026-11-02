import { db } from './db';
import { parseBackup } from './finance';

export async function exportBackup() {
 const database = db;
 return database.transaction('r', database.transactions, database.goals, async () => ({ version: 1, transactions: await database.transactions.toArray(), goals: await database.goals.toArray() }));
}
export async function restoreBackup(value: unknown) {
 const validated = parseBackup(value);
 const database = db;
 await database.transaction('rw', database.transactions, database.goals, async () => {
  await database.transactions.clear(); await database.goals.clear();
  await database.transactions.bulkAdd(validated.transactions); await database.goals.bulkAdd(validated.goals);
 });
}
