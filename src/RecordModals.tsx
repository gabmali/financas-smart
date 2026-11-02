import { useRef, useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { db, type Transaction, type Goal } from './db';
import { categories, validateTransaction, validateGoal } from './finance';
import { Modal } from './Modal';

function useSave() {
 const locked = useRef(false);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 async function save(event: FormEvent, operation: () => Promise<void>) {
  event.preventDefault();
  if (locked.current) return;
  locked.current = true; setBusy(true); setError('');
  try { await operation(); } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível salvar.'); }
  finally { locked.current = false; setBusy(false); }
 }
 return { busy, error, save };
}
export function TransactionModal({value,close,notify}:{value:Transaction;close:()=>void;notify:(s:string)=>void}) {
 const [v,set]=useState(value); const {busy,error,save}=useSave();
 return <Modal title={v.id?'Editar transação':'Nova transação'} close={close} busy={busy}><form onSubmit={event=>save(event,async()=>{const valid=validateTransaction(v);await db.transactions.put({...valid,...(v.id?{id:v.id}:{})});notify('Transação salva.');close();})}>
  <fieldset disabled={busy}><div className="type-switch"><button type="button" className={v.type==='expense'?'selected':''} onClick={()=>set({...v,type:'expense'})}><ArrowUpRight size={17}/>Despesa</button><button type="button" className={v.type==='income'?'selected income':''} onClick={()=>set({...v,type:'income',category:'Salário'})}><ArrowDownLeft size={17}/>Receita</button></div>
  <label>Descrição<input autoFocus required maxLength={100} value={v.title} onChange={e=>set({...v,title:e.target.value})} placeholder="Ex.: Compras do mercado"/></label>
  <div className="form-grid"><label>Valor (R$)<input required type="number" min="0.01" max="999999999" step="0.01" value={v.amount||''} onChange={e=>set({...v,amount:Number(e.target.value)})}/></label><label>Data<input required type="date" value={v.date} onChange={e=>set({...v,date:e.target.value})}/></label></div>
  <label>Categoria<select value={v.category} onChange={e=>set({...v,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label></fieldset>
  {error&&<p className="error" role="alert">{error}</p>}<div className="modal-actions"><button disabled={busy} type="button" className="secondary" onClick={close}>Cancelar</button><button disabled={busy} className="primary" type="submit">{busy?'Salvando…':'Salvar transação'}</button></div>
 </form></Modal>;
}
export function GoalModal({value,close,notify}:{value:Goal;close:()=>void;notify:(s:string)=>void}) {
 const [v,set]=useState(value);const {busy,error,save}=useSave();
 return <Modal title={v.id?'Atualizar meta':'Nova meta'} close={close} busy={busy}><form onSubmit={event=>save(event,async()=>{const valid=validateGoal(v);await db.goals.put({...valid,...(v.id?{id:v.id}:{})});notify('Meta salva.');close();})}><fieldset disabled={busy}>
  <label>Qual é o seu objetivo?<input autoFocus required maxLength={80} value={v.title} onChange={e=>set({...v,title:e.target.value})} placeholder="Ex.: Reserva de emergência"/></label>
  <div className="form-grid"><label>Valor da meta (R$)<input required type="number" min="0.01" max="999999999" step="0.01" value={v.target||''} onChange={e=>set({...v,target:Number(e.target.value)})}/></label><label>Já guardado (R$)<input required type="number" min="0" max="999999999" step="0.01" value={v.saved} onChange={e=>set({...v,saved:Number(e.target.value)})}/></label></div>
  <label>Prazo (opcional)<input type="date" value={v.deadline} onChange={e=>set({...v,deadline:e.target.value})}/></label><p className="muted">A meta é um acompanhamento. Atualizar o valor guardado não cria uma transação.</p></fieldset>
  {error&&<p className="error" role="alert">{error}</p>}<div className="modal-actions"><button disabled={busy} type="button" className="secondary" onClick={close}>Cancelar</button><button disabled={busy} className="primary">{busy?'Salvando…':'Salvar meta'}</button></div>
 </form></Modal>;
}
