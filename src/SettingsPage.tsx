import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { renameAccount } from './auth';
import { today } from './db';
import { parseBackup } from './finance';
import { exportBackup, restoreBackup } from './backup';

export function SettingsPage({accountId,name,setName,notify}:{accountId:string;name:string;setName:(s:string)=>void;notify:(s:string)=>void}) {
 const [draft,setDraft]=useState(name);
 const [profileError,setProfileError]=useState('');
 const [importError,setImportError]=useState('');
 const [saving,setSaving]=useState(false);
 const [importing,setImporting]=useState(false);
 const profileLock=useRef(false); const backupLock=useRef(false);
 async function downloadBackup(){
  try {
   const data=await exportBackup();
   const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
   const anchor=document.createElement('a');anchor.href=url;anchor.download=`financas-smart-${today()}.json`;anchor.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Backup exportado.');
  }catch{notify('Não foi possível exportar o backup.');}
 }
 return <><div className="page-heading"><div><div className="eyebrow">SEU PLANEJAMENTO, MAIS SIMPLES</div><h1>Do seu jeito</h1><p>Seu perfil, suas preferências e seus dados.</p></div></div>
  <div className="settings-grid"><section className="panel"><h2>Perfil pessoal</h2>
   <form onSubmit={async event=>{
    event.preventDefault(); if(profileLock.current)return;
    profileLock.current=true;setSaving(true);setProfileError('');
    try {await renameAccount(accountId,draft);setName(draft.trim());notify('Perfil atualizado.');}
    catch {setProfileError('Não foi possível salvar o perfil. Tente novamente.');}
    finally{profileLock.current=false;setSaving(false);}
   }}><label>Como podemos chamar você?<input required disabled={saving} maxLength={40} value={draft} onChange={e=>setDraft(e.target.value)}/></label>
   {profileError&&<p className="error" role="alert">{profileError}</p>}<button disabled={saving} className="primary">{saving?'Salvando…':'Salvar perfil'}</button></form>
  </section><section className="panel"><h2>Seus dados estão com você</h2>
   <p className="muted">As transações e metas ficam no IndexedDB deste navegador. Limpar os dados do site pode apagá-las. Exporte backups regularmente para guardar uma cópia.</p>
   <button disabled={importing} className="secondary" onClick={downloadBackup}><Download size={16}/>Exportar backup JSON</button>
   <label className="import-label">{importing?'Restaurando backup…':'Restaurar backup'}<input disabled={importing} type="file" accept="application/json,.json" onChange={async event=>{
    const input=event.currentTarget;const file=input.files?.[0];if(!file||backupLock.current)return;
    backupLock.current=true;setImporting(true);setImportError('');
    try{
     if(file.size>10*1024*1024)throw new Error('O arquivo deve ter no máximo 10 MB.');
     const data:unknown=JSON.parse(await file.text());parseBackup(data);
     if(!confirm('Restaurar este backup? As transações e metas atuais desta conta serão substituídas.'))return;
     await restoreBackup(data);notify('Backup restaurado.');
    }catch(error){setImportError(error instanceof Error?error.message:'Não foi possível restaurar o backup.');}
    finally{input.value='';backupLock.current=false;setImporting(false);}
   }}/></label>{importError&&<p className="error" role="alert">{importError}</p>}
   <div className="info-note">Os registros da versão sem login foram preservados, mas não podem ser copiados diretamente entre contas. Para recuperar dados antigos, restaure um backup pessoal exportado anteriormente.</div>
  </section></div>
 </>;
}
