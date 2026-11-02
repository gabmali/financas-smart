import Dexie, { type EntityTable } from 'dexie';
export type Account = { id: string; name: string; email: string; salt: string; verifier: string };
const accounts = new Dexie('financas-smart-accounts') as Dexie & { users: EntityTable<Account, 'id'> };
accounts.version(1).stores({ users: 'id,&email' });
function hex(bytes: Uint8Array) { return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''); }
async function derive(password: string, salt: string) {
 const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
 const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:600000,hash:'SHA-256'},key,256);
 return hex(new Uint8Array(bits));
}
export async function register(name:string,email:string,password:string) {
 name=name.trim(); email=email.trim().toLowerCase();
 if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Informe seu nome e um e-mail válido.');
 if(password.length<10) throw new Error('Use uma senha com pelo menos 10 caracteres.');
 if(await accounts.users.where('email').equals(email).count()) throw new Error('Já existe uma conta com este e-mail neste navegador.');
 const salt=hex(crypto.getRandomValues(new Uint8Array(32)));
 const user:Account={id:crypto.randomUUID(),name,email,salt,verifier:await derive(password,salt)};
 try {await accounts.users.add(user);} catch {throw new Error('Não foi possível criar a conta. O e-mail pode já estar cadastrado.');}
 return user;
}
export async function login(email:string,password:string) {
 const user=await accounts.users.where('email').equals(email.trim().toLowerCase()).first();
 const actual=await derive(password,user?.salt||'invalid-account-salt');
 if(!user || actual!==user.verifier) throw new Error('E-mail ou senha incorretos.');
 return user;
}
export async function renameAccount(id:string,name:string) {
 name=name.trim();
 if(!name||name.length>40)throw new Error('Informe um nome com até 40 caracteres.');
 const updated=await accounts.users.update(id,{name});
 if(updated!==1)throw new Error('Conta não encontrada.');
}
