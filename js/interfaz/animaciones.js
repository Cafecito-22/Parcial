const pagina=location.pathname.split('/').pop()||'index.html';
document.querySelectorAll('.menu a').forEach(a=>{if(a.getAttribute('href')===pagina)a.setAttribute('aria-current','page');});
const elementos=document.querySelectorAll('.editorial-texto,.editorial-contenido,.orientacion-grid article,.contacto-editorial article,.tarjeta-registro,.franja-contenido');
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
 const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}},{threshold:.12});
 elementos.forEach(e=>{e.classList.add('revelar');observer.observe(e);});
}
