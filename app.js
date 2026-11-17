'use strict';
// Menú, filtros de la Academia y fichas de capacitación (del diseño original de MZ).
const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#navegacion');
function closeMenu(){menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}
if(menuButton&&menu){
  menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open);});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
}

const filterButtons=document.querySelectorAll('[data-filter]');
const products=document.querySelectorAll('.product');
filterButtons.forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  document.querySelector('.catalog').dataset.filter=filter;
  filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  let count=0;
  products.forEach(product=>{product.hidden=filter!=='all'&&product.dataset.category!==filter;if(!product.hidden)count++;});
  document.querySelector('#catalog-count').textContent=count+(count===1?' propuesta':' propuestas');
  document.querySelector('.catalog-toolbar').scrollIntoView({block:'start',behavior:'instant'});
}));

// Fichas de las capacitaciones a medida (las guías ya tienen su propia página de curso).
const catalog={
 'contabilidad':{type:'Capacitación a medida · Para equipos',title:'Contabilidad para el trabajo diario',description:'Formación para comprender cómo las operaciones de la empresa se reflejan en su información contable.',content:['Compras, ventas, cobros y pagos en el trabajo cotidiano.','Relación entre las tareas administrativas y los registros contables.','Alcance y ejemplos a definir según las necesidades del equipo.','Consultá programa, modalidad, duración y presupuesto.']},
 'impuestos':{type:'Capacitación a medida · Para equipos',title:'Impuestos en la práctica',description:'Una introducción al impacto impositivo de las operaciones habituales de la empresa.',content:['Relación entre compras, ventas, facturación y obligaciones impositivas.','Comprensión del rol de cada área en la información fiscal.','Propuesta adaptada a las tareas de tu organización.','Consultá programa, modalidad, duración y presupuesto.']}
};
const dialog=document.querySelector('#product-dialog');let opener;
if(dialog){
  document.querySelectorAll('[data-product]').forEach(button=>button.addEventListener('click',()=>{
    const product=catalog[button.dataset.product];if(!product)return;opener=button;
    document.querySelector('#dialog-type').textContent=product.type;
    document.querySelector('#dialog-title').textContent=product.title;
    document.querySelector('#dialog-description').textContent=product.description;
    const list=document.querySelector('#dialog-content');
    list.replaceChildren(...product.content.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    document.querySelector('#dialog-consult').href='mailto:info@mzaccounting.com.ar?subject='+encodeURIComponent('Consulta Academia MZ · '+product.title)+'&body='+encodeURIComponent('Hola Maru y Zulma:\nQuisiera consultar por '+product.title+'.\n¿Me comparten programa, modalidad, duración y presupuesto?\n\nGracias.');
    dialog.showModal();document.body.classList.add('modal-open');
  }));
  document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus();});
}
