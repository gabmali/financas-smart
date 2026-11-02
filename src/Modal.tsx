import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, close, children, busy = false }: { title: string; close: () => void; children: ReactNode; busy?: boolean }) {
 const dialog = useRef<HTMLDialogElement>(null);
 const origin = useRef<HTMLElement | null>(null);
 useEffect(() => {
  const node = dialog.current!;
  origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  node.showModal();
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  return () => {
   node.close();
   document.body.style.overflow = previousOverflow;
   origin.current?.focus();
  };
 }, []);
 return <dialog ref={dialog} className="modal native-modal" aria-label={title} aria-modal="true" onCancel={event => { event.preventDefault(); if (!busy) close(); }} onClick={event => { if (event.target === dialog.current && !busy) { const bounds = dialog.current.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close(); } }}>
  <div className="panel-heading"><h2>{title}</h2><button className="icon-button" disabled={busy} onClick={close} aria-label="Fechar"><X size={21}/></button></div>
  {children}
 </dialog>;
}
