
(()=>{"use strict";
if("scrollRestoration" in history)history.scrollRestoration="manual";
if(location.hash)history.replaceState(null,"",location.pathname+location.search);
window.scrollTo(0,0);
addEventListener("load",()=>window.scrollTo(0,0));

const CARPETA="certificados";
const POR_PAGINA=8;
const URL_TITULACION="https://titulacion.ucol.mx/validar/186120e6-cf70-41bb-bc05-53019a2a3632";

const EXPERIENCIAS=[
  {puesto:"Cadista / Dibujante CAD",empresa:"Secretaría de la Defensa Nacional",sigla:"SEDENA",inicio:"2025-10",fin:"2025-11",dur:"1 mes",
   pais:"México",estado:"Jalisco",ciudad:"Guadalajara",coords:[20.67,-103.35],tipo:"oficina",
   logros:["Generé planos técnicos y modelos de superficie para proyectos de infraestructura.","Realicé cálculos volumétricos y análisis de nivelación, apoyando la interpretación geométrica del terreno."],
   tools:["AutoCAD Civil 3D","Modelado de superficies","Cálculo volumétrico"]},
  {puesto:"Becario de Investigación",empresa:"Sistema Nacional de Investigadores",sigla:"CONAHCYT",inicio:"2021-12",fin:"2024-11",dur:"3 años",
   pais:"México",estado:"Colima",ciudad:"Colima",coords:[19.24,-103.72],tipo:"investigacion",
   logros:["Propuse y validé una metodología estatal para la ubicación óptima de estaciones de monitoreo de calidad del aire.","Levantamiento de datos geográficos en campo.","Desarrollé cartografía temática y bases de datos geoespaciales.","Colaboré en análisis geoambientales e informes técnicos para el perfil epidemi-toxicológico de Colima · Proyecto Nº 321542."],
   tools:["ArcGIS Pro","Cartografía temática","Geodatabases","Análisis espacial"]},
  {puesto:"Supervisor de Obras",empresa:"Corporativo de Estudios Técnicos y de Ingeniería Civil",sigla:"CRETEC",inicio:"2023-01",fin:"2023-09",dur:"9 meses",
   pais:"México",estado:"Colima",ciudad:"Colima",coords:[19.24,-103.72],tipo:"campo",
   logros:["Supervisé movimientos de tierra y cálculo de volúmenes en proyectos de gran escala.","Generé planos técnicos y modelos de superficie para documentación y control de obra.","Coordiné equipos en campo en el Aeropuerto Internacional de Colima."],
   tools:["Civil 3D","Estación total","GPS","Coordinación de campo"]},
  {puesto:"Auxiliar de Topógrafo",empresa:"Meridiano Topografía",sigla:"",inicio:"2021-01",fin:"2021-07",dur:"7 meses",
   pais:"México",estado:"Colima",ciudad:"Colima",coords:[19.24,-103.72],tipo:"campo",
   logros:["Ejecuté levantamientos planimétricos y altimétricos.","Operé equipos topográficos para captura y análisis de información georreferenciada."],
   tools:["Estación total","Nivel fijo","Levantamientos planimétricos"]}
];

const RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const NS="http://www.w3.org/2000/svg";
let CERTS=[],currentPage=1;

/* TEMA */
const thm=$("#thm"),root=document.documentElement;
const guardado=localStorage.getItem("theme");
const prefersDark=matchMedia("(prefers-color-scheme: dark)").matches;
root.dataset.theme=(guardado==="light"||guardado==="dark")?guardado:(prefersDark?"dark":"light");
thm.setAttribute("aria-pressed",root.dataset.theme==="dark");
thm.addEventListener("click",()=>{
  const nuevo=root.dataset.theme==="dark"?"light":"dark";
  root.dataset.theme=nuevo;
  thm.setAttribute("aria-pressed",nuevo==="dark");
  localStorage.setItem("theme",nuevo);
});

/* BOOT */
const MSGS=["Inicializando sistema...","Cargando perfil profesional...","Verificando credenciales...","Preparando experiencia...","¡Bienvenido a mi portafolio digital!"];
const msg=$("#bootmsg");let mi=0;
const typeMsg=()=>{if(mi>=MSGS.length)return;const t=MSGS[mi];let ci=0;
  const type=()=>{if(ci<=t.length){msg.textContent=t.slice(0,ci);ci++;setTimeout(type,45);}};type();
  mi++;setTimeout(typeMsg,1100);};
const boot=$("#boot");let done=false;
const finish=()=>{if(done)return;done=true;document.body.classList.add("ready");
  boot.classList.add("exit");setTimeout(()=>boot.remove(),800);};

/* SCRAMBLE */
const CH="▓▒░<>/#%&@01";
const scramble=(el,dur=850)=>{const txt=el.textContent;if(RM)return;
  const n=txt.length,t0=performance.now();
  const f=now=>{const p=Math.min(1,(now-t0)/dur),k=Math.floor(p*n);let s=txt.slice(0,k);
    for(let i=k;i<n;i++)s+=txt[i]===" "?" ":CH[Math.random()*CH.length|0];
    el.textContent=s;p<1?requestAnimationFrame(f):el.textContent=txt;};f(t0);};

/* REVEALS */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  e.target.classList.add("in");
  if(e.target.classList.contains("scr"))scramble(e.target,700);
  io.unobserve(e.target);}),{threshold:.12});
$$(".reveal,.panel").forEach(el=>io.observe(el));

/* TILT CREDENCIAL */
const cred=$("#cred");
if(cred&&!RM){
  cred.addEventListener("mousemove",e=>{
    const r=cred.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    cred.style.transform=`rotateY(${(px*14).toFixed(2)}deg) rotateX(${(-py*12).toFixed(2)}deg)`;
    cred.style.setProperty("--gx",(px*100+50)+"%");
    cred.style.setProperty("--gy",(py*100+50)+"%");
  });
  cred.addEventListener("mouseleave",()=>{cred.style.transform="rotateY(0deg) rotateX(0deg)";});
}
const cimg=$("#credimg");
if(cimg){cimg.addEventListener("error",function(){
  if(cimg.src.indexOf("foto.png")!==-1){cimg.src="foto.jpg";}
  else{cimg.style.display="none";$("#credmono").style.display="grid";}});}

/* SCROLL PROGRESS */
const bar=$("#bar");let tick=false;
const onScroll=()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{
  const d=document.documentElement,max=d.scrollHeight-innerHeight;
  bar.style.transform=`scaleX(${max?d.scrollTop/max:0})`;tick=false;});};
addEventListener("scroll",onScroll,{passive:true});onScroll();

/* NAV ACTIVO */
const nio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  $$(".nav ul a").forEach(a=>a.classList.toggle("act",a.getAttribute("href")==="#"+e.target.id));}),
  {rootMargin:"-40% 0px -55% 0px"});
$$("main section[id]").forEach(s=>nio.observe(s));

/* NAVEGACIÓN INTERNA */
const navEl=$(".nav");
function navegarA(hash){
  const t=document.querySelector(hash);if(!t)return;
  const navH=navEl.offsetHeight;let y=0;
  if(hash!=="#inicio"){
    const el=t.querySelector(".shead")||t;
    y=el.getBoundingClientRect().top+window.scrollY-(navH+32);
    y=Math.max(0,y);
  }
  window.scrollTo({top:y,behavior:RM?"auto":"smooth"});
}
document.addEventListener("click",e=>{
  const a=e.target.closest('a[href^="#"]');if(!a)return;
  const hash=a.getAttribute("href");
  if(hash.length<2||!document.querySelector(hash))return;
  e.preventDefault();navegarA(hash);history.replaceState(null,"",hash);
});

/* ============================================================
   MAPA — SOLO mexico-data.js. Encuadre automático = bbox de TODA
   la geometría existente; ese encuadre es el límite de zoom-out.
   ============================================================ */
const proj=(lat,lon)=>[+((lon+180)*2.7778).toFixed(2),+((90-lat)*2.7778).toFixed(2)];
const fmtCoords=c=>`${Math.abs(c[0]).toFixed(2)}° ${c[0]>=0?"N":"S"} · ${Math.abs(c[1]).toFixed(2)}° ${c[1]>=0?"E":"O"}`;
const norm=s=>(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const VW=1000,VH=500;
let GB=null,kMin=1,kMax=1,vk=1,vx=0,vy=0,dragMoved=false,pDown=null;
const MAPA_ESTADOS=(typeof window!=="undefined"&&(window.MAPA_ESTADOS||window.MEXICO_ESTADOS))?(window.MAPA_ESTADOS||window.MEXICO_ESTADOS):[];
const svg=$("#worldmap"),worldG=$("#worldG"),mapview=$("#mapview"),maptip=$("#maptip"),mapstatus=$("#mapstatus");
let MARKS=[];

function dp(pts,tol){const n=pts.length;if(n<4)return pts;
  const keep=new Uint8Array(n);keep[0]=keep[n-1]=1;const st=[[0,n-1]];
  while(st.length){const [a,b]=st.pop();if(b-a<2)continue;
    const [x1,y1]=pts[a],[x2,y2]=pts[b];
    const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1e-9;
    let maxd=-1,idx=-1;
    for(let i=a+1;i<b;i++){const d=Math.abs(dy*(pts[i][0]-x1)-dx*(pts[i][1]-y1))/L;if(d>maxd){maxd=d;idx=i;}}
    if(maxd>tol){keep[idx]=1;st.push([a,idx],[idx,b]);}}
  const o=[];for(let i=0;i<n;i++)if(keep[i])o.push(pts[i]);return o;}

function fitBBox(b,pad){
  const bw=Math.max(1e-6,b.maxx-b.minx),bh=Math.max(1e-6,b.maxy-b.miny);
  const k=Math.min(VW/bw,VH/bh)*(pad||0.92);
  const cx=(b.minx+b.maxx)/2,cy=(b.miny+b.maxy)/2;
  return {k,vx:VW/2-k*cx,vy:VH/2-k*cy};
}
function clampView(){
  if(!GB)return;
  vk=Math.min(kMax,Math.max(kMin,vk));
  const minx=VW-vk*GB.maxx,maxx=-vk*GB.minx;
  const miny=VH-vk*GB.maxy,maxy=-vk*GB.miny;
  vx=Math.min(maxx,Math.max(minx,vx));
  vy=Math.min(maxy,Math.max(miny,vy));
}
function applyView(){
  worldG.setAttribute("transform",`translate(${vx} ${vy}) scale(${vk})`);
  MARKS.forEach(m=>m.g.setAttribute("transform",`translate(${m.x} ${m.y}) scale(${(1/vk).toFixed(3)})`));
  mapview.classList.toggle("zoomed",vk>kMin*1.4);
  $$("#countries .pais").forEach(p=>p.classList.toggle("sel",p.dataset.pais===selPais));
}
function zoomAt(sx,sy,f){
  const k2=Math.min(kMax,Math.max(kMin,vk*f));
  vx=sx-(sx-vx)*(k2/vk);vy=sy-(sy-vy)*(k2/vk);vk=k2;clampView();applyView();
}
function resetView(){
  if(GB){const f=fitBBox(GB,0.92);vk=f.k;vx=f.vx;vy=f.vy;}
  else{vk=1;vx=0;vy=0;}
  applyView();
}

function renderMap(){
  let g="";
  for(let lon=-120;lon<=-85;lon+=5){const x=(lon+180)*2.7778;g+=`<line x1="${x}" y1="0" x2="${x}" y2="500"/>`;}
  for(let lat=10;lat<=35;lat+=5){const y=(90-lat)*2.7778;g+=`<line x1="0" y1="${y}" x2="1000" y2="${y}"/>`;}
  $("#grat").innerHTML=g;

  const matched={};
  EXPERIENCIAS.forEach(e=>{matched[norm(e.pais)+"|"+norm(e.estado)]=true;});
  const cG=$("#countries");cG.innerHTML="";

  // bbox global desde TODA la geometría existente => encuadre automático
  let GBt=null;
  const frag=document.createDocumentFragment();
  MAPA_ESTADOS.forEach(s=>{
    const key=norm(s.p)+"|"+norm(s.n);
    const isM=matched[key];
    s.g.forEach(ring=>{
      const n=ring.length;if(n<3)return;
      let pts=new Array(n);let minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;
      for(let i=0;i<n;i++){const [x,y]=proj(ring[i][1],ring[i][0]);pts[i]=[x,y];
        if(x<minx)minx=x;if(x>maxx)maxx=x;if(y<miny)miny=y;if(y>maxy)maxy=y;}
      if(!GBt)GBt={minx,miny,maxx,maxy};
      else{GBt.minx=Math.min(GBt.minx,minx);GBt.miny=Math.min(GBt.miny,miny);GBt.maxx=Math.max(GBt.maxx,maxx);GBt.maxy=Math.max(GBt.maxy,maxy);}
      if(isM){
        let d="";for(let i=0;i<n;i++){d+=(i?"L":"M")+pts[i][0]+","+pts[i][1];}d+="Z";
        const el=document.createElementNS(NS,"path");
        el.setAttribute("d",d);el.setAttribute("class","pais hasjobs");
        el.dataset.pais=s.p;el.dataset.estado=s.n;
        el.addEventListener("mousemove",ev=>showTip(ev,`${s.n}, ${s.p} · clic para ver trabajos`));
        el.addEventListener("mouseleave",hideTip);
        el.addEventListener("click",ev=>{ev.stopPropagation();if(dragMoved)return;openStateModal(s);});
        frag.appendChild(el);
      }else{
        if((maxx-minx)<0.02&&(maxy-miny)<0.02)return;
        let red=n>300?dp(pts,0.5):pts;
        let d="";for(let i=0;i<red.length;i++){d+=(i?"L":"M")+red[i][0]+","+red[i][1];}d+="Z";
        const el=document.createElementNS(NS,"path");
        el.setAttribute("d",d);el.setAttribute("class","pais");
        el.addEventListener("mousemove",ev=>showTip(ev,`${s.n}, ${s.p}`));
        el.addEventListener("mouseleave",hideTip);
        frag.appendChild(el);
      }
    });
  });
  cG.appendChild(frag);

  GB=GBt;
  if(GB){const f=fitBBox(GB,0.92);kMin=f.k;kMax=f.k*160;vk=f.k;vx=f.vx;vy=f.vy;}
  else{vk=1;vx=0;vy=0;}
  $("#maptitle").textContent="⌖ CARTA · MÉXICO";
  mapstatus.textContent=GB?`ENCUADRE AUTOMÁTICO · ${MAPA_ESTADOS.length} GEOMETRÍAS`:"SIN GEOMETRÍAS";
  renderStates();
  applyView();
}

function renderStates(){
  const P=detectar();
  const sG=$("#states");sG.innerHTML="";MARKS=[];
  Object.values(P).forEach(c=>Object.values(c.estados).forEach(st=>{
    const [x,y]=proj(st.coords[0],st.coords[1]);
    const g=document.createElementNS(NS,"g");
    g.setAttribute("class","st-mark");
    g.innerHTML=`<circle class="ring" r="6"/><circle class="core" r="2.2"/><text y="-9">${st.estado.toUpperCase()}</text>`;
    g.addEventListener("click",ev=>{ev.stopPropagation();if(dragMoved)return;
      const st2=MAPA_ESTADOS.find(s=>norm(s.n)===norm(st.estado)&&norm(s.p)===norm(c.pais));
      openStateModal(st2||{n:st.estado,p:c.pais});});
    g.addEventListener("mousemove",ev=>showTip(ev,`${st.estado} · ${st.jobs.length} trabajo(s)`));
    g.addEventListener("mouseleave",hideTip);
    sG.appendChild(g);MARKS.push({g,x,y});
  }));
}

function detectar(){
  const P={};
  EXPERIENCIAS.forEach(e=>{
    const p=P[e.pais]||(P[e.pais]={pais:e.pais,jobs:[],estados:{},centroid:e.coords});
    p.jobs.push(e);
    (p.estados[e.estado]||(p.estados[e.estado]={estado:e.estado,jobs:[],coords:e.coords})).jobs.push(e);
  });
  return P;
}

function showTip(e,txt){
  const r=mapview.getBoundingClientRect();
  maptip.textContent=txt;maptip.classList.add("on");
  maptip.style.left=Math.min(r.width-10,(e.clientX-r.left)+14)+"px";
  maptip.style.top=Math.max(0,(e.clientY-r.top)-30)+"px";
}
function hideTip(){maptip.classList.remove("on");}

/* Ventana interna: trabajos del estado; click en trabajo => detalle */
const modal=$("#modal"),mhead=$("#mhead"),mfoot=$("#mfoot"),imgview=$("#imgview"),mclose=$("#mclose");
const MESN=["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const fmtYM=ym=>{const [y,m]=ym.split("-");return `${MESN[+m-1]} ${y}`;};
function openStateModal(st){
  const jobs=EXPERIENCIAS.filter(e=>norm(e.estado)===norm(st.n)&&norm(e.pais)===norm(st.p));
  mhead.innerHTML=`<span class="modal-badge">ESTADO</span><h3>${st.n}, ${st.p}</h3><span class="iss">${jobs.length} trabajo(s) registrado(s)</span>`;
  imgview.innerHTML=`<div class="jobs-list">`+(jobs.length?jobs.map(e=>`
    <div class="job-card">
      <div class="job-h"><div><h4>${e.puesto}</h4><p>${e.empresa}${e.sigla?` (${e.sigla})`:''}</p></div><span class="xchev">▾</span></div>
      <div class="job-b"><div class="job-b-in">
        <p class="xloc">⌖ ${e.ciudad}, ${e.estado} · ${fmtYM(e.inicio)} — ${fmtYM(e.fin)} · ${e.dur}</p>
        <ul>${e.logros.map(l=>`<li>${l}</li>`).join('')}</ul>
        <div class="chips">${e.tools.map(t=>`<span class="chip">${t}</span>`).join('')}</div>
      </div></div>
    </div>`).join(''):`<p class="no-results">Sin trabajos registrados en ${st.n}.</p>`)+`</div>`;
  mfoot.innerHTML=`Haz clic en un trabajo para ver su detalle · ${st.n}, ${st.p}`;
  imgview.querySelectorAll(".job-card").forEach(jc=>{
    jc.querySelector(".job-h").addEventListener("click",()=>jc.classList.toggle("open"));
  });
  modal.classList.add("on");document.body.style.overflow="hidden";
}
function closeModal(){modal.classList.remove("on");document.body.style.overflow="";imgview.innerHTML="";}
mclose.addEventListener("click",closeModal);
modal.addEventListener("click",e=>{if(e.target===modal)closeModal();});

/* Interacción del mapa */
const endPan=e=>{try{mapview.releasePointerCapture(e.pointerId);}catch(_){} pDown=null;setTimeout(()=>{dragMoved=false;},0);};
mapview.addEventListener("wheel",e=>{e.preventDefault();const r=svg.getBoundingClientRect();const sx=(e.clientX-r.left)*VW/r.width,sy=(e.clientY-r.top)*VH/r.height;zoomAt(sx,sy,e.deltaY<0?1.25:1/1.25);},{passive:false});
mapview.addEventListener("pointerdown",e=>{e.preventDefault();pDown=[e.clientX,e.clientY,vx,vy];dragMoved=false;try{mapview.setPointerCapture(e.pointerId);}catch(_){}});
mapview.addEventListener("pointermove",e=>{
  if(!pDown)return;
  const r=svg.getBoundingClientRect();
  const dx=(e.clientX-pDown[0])*VW/r.width,dy=(e.clientY-pDown[1])*VH/r.height;
  if(Math.abs(e.clientX-pDown[0])+Math.abs(e.clientY-pDown[1])>5)dragMoved=true;
  if(GB){
    vx=Math.min(-vk*GB.minx,Math.max(VW-vk*GB.maxx,pDown[2]+dx));
    vy=Math.min(-vk*GB.miny,Math.max(VH-vk*GB.maxy,pDown[3]+dy));
  }
  applyView();
});
mapview.addEventListener("pointerup",endPan);
mapview.addEventListener("pointercancel",endPan);
mapview.addEventListener("contextmenu",e=>e.preventDefault());
mapview.addEventListener("dblclick",e=>e.preventDefault());
$("#zin").addEventListener("click",()=>zoomAt(VW/2,VH/2,1.5));
$("#zout").addEventListener("click",()=>zoomAt(VW/2,VH/2,1/1.5));
$("#zreset").addEventListener("click",resetView);
// Keyboard accessibility for map controls
const mapKeys=e=>{
  if(e.target.closest(".map-ctrl")||e.target===mapview){
    switch(e.key){
      case "+":case "=":zoomAt(VW/2,VH/2,1.5);break;
      case "-":zoomAt(VW/2,VH/2,1/1.5);break;
      case "0":resetView();break;
      case "ArrowUp":vy+=20;clampView();applyView();break;
      case "ArrowDown":vy-=20;clampView();applyView();break;
      case "ArrowLeft":vx+=20;clampView();applyView();break;
      case "ArrowRight":vx-=20;clampView();applyView();break;
    }
  }
};
document.addEventListener("keydown",mapKeys);


/* LISTA LATERAL */
let selPais=null,selEstado=null,xPage=0,selFiltro="all";
const XPAGE=2;

/* Calcular estadísticas */
function calcStats(){
  const total=EXPERIENCIAS.length;
  const empresas=[...new Set(EXPERIENCIAS.map(e=>e.empresa))].length;
  const estados=[...new Set(EXPERIENCIAS.map(e=>e.estado))].length;
  let anosTotal=0;
  EXPERIENCIAS.forEach(e=>{
    const [y,m]=e.inicio.split("-").map(Number);
    const [yf,mf]=e.fin.split("-").map(Number);
    const meses=(yf-y)*12+(mf-m)+1;
    anosTotal+=meses/12;
  });
  $("#totalxp").textContent=total;
  $("#totalempresas").textContent=empresas;
  $("#totalestados").textContent=estados;
  $("#totalanos").textContent=anosTotal>=1?anosTotal.toFixed(1):"<1";
}

function getFilteredX(){
  let list=[...EXPERIENCIAS].sort((a,b)=>b.fin.localeCompare(a.fin));
  if(selFiltro&&selFiltro!=="all")list=list.filter(e=>e.tipo===selFiltro);
  if(selEstado)list=list.filter(e=>e.estado===selEstado);
  else if(selPais)list=list.filter(e=>e.pais===selPais);
  const q=norm($("#xsearch").value.trim());
  if(q)list=list.filter(e=>norm(`${e.puesto} ${e.empresa} ${e.sigla} ${e.estado} ${e.pais} ${e.tools.join(" ")}`).includes(q));
  return list;
}
function renderXList(){
  const list=getFilteredX();
  const total=list.length;
  const pages=Math.max(1,Math.ceil(total/XPAGE));
  if(xPage>=pages)xPage=pages-1;
  const items=list.slice(xPage*XPAGE,xPage*XPAGE+XPAGE);
  const L=$("#xlist");L.innerHTML="";
  if(!total){L.innerHTML='<p class="no-results">Sin coincidencias.</p>';}
  items.forEach(e=>{
    const card=document.createElement("div");
    card.className="xp-card";
    card.setAttribute("role","listitem");
    const badge=e.tipo==="campo"?"🏗️":e.tipo==="oficina"?"💻":"🔬";
    card.innerHTML=`
      <div class="xh">
        <div><h3>${e.puesto}</h3><p class="org">${e.empresa}${e.sigla?` <em>(${e.sigla})</em>`:""}</p></div>
        <div class="xmeta"><time>${fmtYM(e.inicio)} — ${fmtYM(e.fin)}</time><span class="xdur">${e.dur}</span><span class="xbadge">${badge}</span><span class="xchev">▾</span></div>
      </div>
      <div class="xp-body"><div class="xp-body-in">
        <p class="xloc">⌖ ${e.ciudad}, ${e.estado}, ${e.pais} · ${fmtCoords(e.coords)}</p>
        <ul>${e.logros.map(l=>`<li>${l}</li>`).join("")}</ul>
        <div class="chips">${e.tools.map(t=>`<span class="chip">${t}</span>`).join("")}</div>
      </div></div>`;
    card.querySelector(".xh").addEventListener("click",()=>card.classList.toggle("open"));
    L.appendChild(card);
  });
  const pg=$("#xpager");
  if(total>XPAGE){
    pg.innerHTML=`<button class="pg-btn" id="xprev" ${xPage===0?"disabled":""} aria-label="Página anterior">‹</button>
      <span class="pg-info" aria-live="polite">${xPage*XPAGE+1}–${Math.min(total,(xPage+1)*XPAGE)} DE ${total}</span>
      <button class="pg-btn" id="xnext" ${xPage>=pages-1?"disabled":""} aria-label="Página siguiente">›</button>`;
    $("#xprev").addEventListener("click",()=>{xPage--;renderXList();});
    $("#xnext").addEventListener("click",()=>{xPage++;renderXList();});
  }else{pg.innerHTML=total?`<span class="pg-info">${total} REGISTRO${total!==1?"S":""}</span>`:"";}
}
// Debounce helper for search inputs
const debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn.apply(this,a),ms);};};

$("#xsearch").addEventListener("input",debounce(()=>{xPage=0;renderXList();},300));

/* Filtros rápidos */
$$('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.filter-btn').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
    btn.classList.add('active');
    btn.setAttribute('aria-pressed','true');
    selFiltro=btn.dataset.filter;
    xPage=0;
    renderXList();
  });
});

function renderCrumbs(){}
/* CERTIFICADOS */
const MESES={"enero":"01","febrero":"02","marzo":"03","abril":"04","mayo":"05","junio":"06","julio":"07","agosto":"08","septiembre":"09","setiembre":"09","octubre":"10","noviembre":"11","diciembre":"12","ene":"01","feb":"02","mar":"03","abr":"04","may":"05","jun":"06","jul":"07","ago":"08","sep":"09","oct":"10","nov":"11","dic":"12","january":"01","february":"02","march":"03","april":"04","june":"06","july":"07","august":"08","october":"10","november":"11","december":"12"};
const cap1=s=>{s=(s||"").trim();return s?s.charAt(0).toUpperCase()+s.slice(1):"";};
function parseFecha(d){
  if(!d)return{codigo:"",texto:""};
  const y=(d.match(/20\d{2}/)||[""])[0];
  const low=d.toLowerCase();let mm="";
  for(const k in MESES){if(low.includes(k)){mm=MESES[k];break;}}
  return{codigo:y?(mm?y+"-"+mm:y):"",texto:cap1(d)};
}
function parseArchivo(f){
  const base=f.replace(/\.(jpe?g|png)$/i,"").trim();
  const parts=(base.includes(",")?base.split(/\s*,\s*/):base.split(/\s*[-–—|]\s*/)).map(s=>s.trim()).filter(Boolean);
  let inst="",name="",datePart="",serial="";
  if(parts.length>=4){inst=parts[0];serial=parts[parts.length-1];datePart=parts[parts.length-2];name=parts.slice(1,parts.length-2).join(", ");}
  else if(parts.length===3){inst=parts[0];if(/\d{4}/.test(parts[2])){datePart=parts[2];name=parts[1];}else name=parts[1]+", "+parts[2];}
  else if(parts.length===2){inst=parts[0];name=parts[1];}
  else name=parts[0]||base;
  const {codigo,texto}=parseFecha(datePart);
  return{institucion:inst.trim(),nombre:name.trim(),fecha:codigo,fechaTexto:texto,serial:serial.trim()};
}
const construirItem=archivo=>({id:0,...parseArchivo(archivo),src:`${CARPETA}/${archivo}`});
const grid=$("#certgrid"),nores=$("#nores"),sugg=$("#sugg"),
      filters=$("#certfilters"),fyear=$("#fyear"),fiss=$("#fiss"),fsearch=$("#fsearch"),
      pagination=$("#pagination"),pgcount=$("#pgcount");
function desdeManifest(){
  const m=window.MANIFEST_CERTS;
  if(Array.isArray(m)&&m.length)return m.filter(x=>x&&x.archivo).map(x=>construirItem(x.archivo));
  return null;
}
async function listarDirectorio(){
  try{
    const res=await fetch(`${CARPETA}/`,{cache:"no-store"});
    if(!res.ok)return null;
    const doc=new DOMParser().parseFromString(await res.text(),"text/html");
    const files=[...doc.querySelectorAll("a[href]")]
      .map(a=>decodeURIComponent(a.getAttribute("href")))
      .filter(h=>h&&/\.(jpe?g|png)$/i.test(h)&&!/^(\.\.|\/|http|\?|#)/.test(h));
    return files.length?files:null;
  }catch(e){return null;}
}
const cargarImagen=src=>new Promise(res=>{const im=new Image();im.onload=()=>res(true);im.onerror=()=>res(false);im.src=src;});
async function sondearArchivos(){
  const cand=[];
  for(let i=1;i<=30;i++){cand.push(`${i}.jpg`,`${i}.png`);}
  for(let i=1;i<=20;i++){const n=String(i).padStart(2,"0");cand.push(`cert-${n}.jpg`,`cert-${n}.png`,`certificado-${n}.jpg`,`certificado-${n}.png`);}
  const res=await Promise.all(cand.map(async f=>({f,ok:await cargarImagen(`${CARPETA}/${f}`)})));
  const found=res.filter(r=>r.ok).map(r=>r.f);
  return found.length?found:null;
}
async function initCerts(){
  let certs=desdeManifest();
  if(!certs){const f=await listarDirectorio();if(f)certs=f.map(construirItem);}
  if(!certs){const f=await sondearArchivos();if(f)certs=f.map(construirItem);}
  if(!certs)return;
  CERTS=certs.sort((a,b)=>(b.fecha||"").localeCompare(a.fecha||""));
  CERTS.forEach((c,i)=>c.id=i+1);
  filters.style.display="flex";buildFilters();renderGrid();
}
function buildFilters(){
  const cy=fyear.value,ci=fiss.value;
  fyear.innerHTML='<option value="">Todos los años</option>';
  fiss.innerHTML='<option value="">Todas las instituciones</option>';
  [...new Set(CERTS.map(c=>(c.fecha||"").slice(0,4)).filter(Boolean))].sort().reverse().forEach(y=>fyear.add(new Option(y,y)));
  const isss=[...new Set(CERTS.map(c=>c.institucion).filter(Boolean))].sort();
  isss.forEach(i=>fiss.add(new Option(i,i)));
  fyear.value=cy;fiss.value=ci;
  if(!isss.length)fiss.style.display="none";else fiss.style.display="";
}
const subseq=(w,t)=>{let i=0;for(const ch of t){if(ch===w[i])i++;if(i===w.length)return true;}return false;};
function scoreCert(c,words){
  const name=norm(c.nombre),iss=norm(c.institucion),yr=(c.fecha||"").slice(0,4),ser=norm(c.serial);
  let total=0;
  for(const w of words){
    let s=0;
    if(name.includes(w))s+=6;
    else if(name.split(/\s+/).some(t=>t.startsWith(w)))s+=4;
    if(iss.includes(w))s+=4;
    if(yr===w)s+=3;
    if(ser.includes(w))s+=2;
    if(!s&&w.length>=3&&(subseq(w,name)||subseq(w,iss)))s+=1;
    if(!s)return 0;
    total+=s;
  }
  return total;
}
function getFiltered(){
  const y=fyear.value,iss=fiss.value;
  const words=norm(fsearch.value).split(/\s+/).filter(Boolean);
  let list=CERTS.filter(c=>(!y||(c.fecha||"").startsWith(y))&&(!iss||c.institucion===iss));
  if(words.length){
    list=list.map(c=>({c,s:scoreCert(c,words)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).map(x=>x.c);
  }
  return list;
}
function renderGrid(){
  const filtered=getFiltered();
  const totalPages=Math.max(1,Math.ceil(filtered.length/POR_PAGINA));
  if(currentPage>totalPages)currentPage=totalPages;
  const start=(currentPage-1)*POR_PAGINA;
  const items=filtered.slice(start,start+POR_PAGINA);
  grid.innerHTML="";pagination.innerHTML="";pgcount.textContent="";
  nores.style.display=filtered.length?"none":"block";
  if(!filtered.length){sugg.textContent=`Prueba: ${CERTS.slice(0,3).map(c=>c.nombre.split(" ")[0]).join(", ")}`;return;}
  items.forEach((c,i)=>{
    const year=(c.fecha||"").slice(0,4);
    const card=document.createElement("div");
    card.className="cert-card reveal in";
    card.innerHTML=`
      <div class="cert-thumb"><img src="${c.src}" alt="${c.nombre}" loading="lazy" decoding="async" draggable="false"></div>
      <h3>${c.nombre}</h3>${year?`<time>${year}</time>`:""}<div class="view">👁</div>`;
    const img=card.querySelector(".cert-thumb img");
    img.addEventListener("load",()=>img.classList.add("ld"));
    if(img.complete&&img.naturalWidth)img.classList.add("ld");
    img.addEventListener("error",()=>{card.style.display="none";});
    card.addEventListener("click",()=>openModalCert(c));
    grid.appendChild(card);
  });
  renderPagination(filtered.length,totalPages,start,items.length);
}
function renderPagination(total,totalPages,start,shown){
  pgcount.textContent=`Mostrando ${start+1}–${start+shown} de ${total}`;
  if(totalPages<=1)return;
  let html=`<button class="pg-btn" data-p="${currentPage-1}" ${currentPage===1?"disabled":""}>‹</button>`;
  for(let i=1;i<=totalPages;i++){
    if(totalPages>7&&i>2&&i<totalPages-1&&Math.abs(i-currentPage)>1){if(i===3||i===totalPages-2)html+='<span class="pg-dots">…</span>';continue;}
    html+=`<button class="pg-btn ${i===currentPage?"active":""}" data-p="${i}">${i}</button>`;
  }
  html+=`<button class="pg-btn" data-p="${currentPage+1}" ${currentPage===totalPages?"disabled":""}>›</button>`;
  pagination.innerHTML=html;
  pagination.querySelectorAll(".pg-btn").forEach(b=>b.addEventListener("click",()=>{
    const p=parseInt(b.dataset.p);if(p>=1&&p<=totalPages&&p!==currentPage){currentPage=p;renderGrid();navegarA("#certificados");}
  }));
}
fyear.addEventListener("change",()=>{currentPage=1;renderGrid();});
fiss.addEventListener("change",()=>{currentPage=1;renderGrid();});
fsearch.addEventListener("input",debounce(()=>{currentPage=1;renderGrid();},300));

/* MODAL CERTIFICADO */
function openModalCert(c){
  const year=(c.fecha||"").slice(0,4);
  mhead.innerHTML=`<span class="modal-badge">CERTIFICADO</span><h3>${c.nombre}</h3>
    ${c.institucion?`<span class="iss">${c.institucion}</span>`:""}
    ${(c.fechaTexto||year)?`<time>${c.fechaTexto||year}</time>`:""}`;
  mfoot.innerHTML=`Vista de consulta${c.institucion?" · "+c.institucion:""}`;
  imgview.innerHTML=`<img src="${c.src}" alt="${c.nombre}" decoding="async" draggable="false">`;
  imgview.querySelector("img").addEventListener("error",()=>{
    imgview.innerHTML='<div class="img-error">No se pudo cargar la imagen.</div>';});
  modal.classList.add("on");document.body.style.overflow="hidden";
}

/* VERIFICACIÓN */
const vmodal=$("#vmodal"),vload=$("#vload"),vfall=$("#vfall"),vstatus=$("#vstatus"),vshot=$("#vshot"),vmsg=$("#vmsg");
let vTimers=[];
const vClear=()=>{vTimers.forEach(clearTimeout);vTimers=[];};
function abrirV(){
  vClear();vfall.hidden=true;
  vshot.style.display="none";vshot.removeAttribute("src");
  vload.classList.remove("hide");
  vstatus.textContent="Verificación en curso…";
  vmodal.classList.add("on");document.body.style.overflow="hidden";
  const seq=["Conectando con titulacion.ucol.mx…","Validando código de verificación…","Mostrando resultado…"];
  seq.forEach((m,i)=>vTimers.push(setTimeout(()=>{vmsg.textContent=m;},i*700)));
  vTimers.push(setTimeout(()=>{vshot.src="verificacion.png";},seq.length*700+200));
}
vshot.addEventListener("load",()=>{vClear();vload.classList.add("hide");vshot.style.display="block";vstatus.textContent="Verificación oficial · Universidad de Colima";});
vshot.addEventListener("error",()=>{
  if((vshot.getAttribute("src")||"")==="verificacion.png"){vshot.src="verificacion.jpg";}
  else{vClear();vload.classList.add("hide");vshot.style.display="none";vfall.hidden=false;vstatus.textContent="Captura local no disponible";}
});
$("#verifybtn").addEventListener("click",abrirV);
$("#vcopy").addEventListener("click",async e=>{
  const b=e.currentTarget,o=b.textContent;
  try{await navigator.clipboard.writeText(URL_TITULACION);b.textContent="ENLACE COPIADO ✓";}catch{}
  setTimeout(()=>b.textContent=o,2200);
});
function closeV(){vmodal.classList.remove("on");document.body.style.overflow="";vClear();
  setTimeout(()=>{vshot.style.display="none";vshot.removeAttribute("src");},300);}
$("#vclose").addEventListener("click",closeV);
vmodal.addEventListener("click",e=>{if(e.target===vmodal)closeV();});

/* PROTECCIÓN */
const proteger=e=>{if(e.target.closest("#certificados,#modal,#vmodal,#mapview"))e.preventDefault();};
document.addEventListener("contextmenu",proteger);
document.addEventListener("dragstart",proteger);
document.addEventListener("copy",proteger);
addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    if(modal.classList.contains("on"))closeModal();
    if(vmodal.classList.contains("on"))closeV();
    return;
  }
  const protegido=modal.classList.contains("on")||vmodal.classList.contains("on");
  if(protegido&&(e.ctrlKey||e.metaKey)){
    const k=e.key.toLowerCase();
    if(["s","p","c","x","u","a"].includes(k)||(e.shiftKey&&["i","j","c","s"].includes(k)))e.preventDefault();
  }
});

$("#copymail").addEventListener("click",async e=>{
  const btn=e.currentTarget,s=btn.querySelector("span"),o=s.textContent,mail="velazcoochoajosmanuel@gmail.com";
  try{await navigator.clipboard.writeText(mail);s.textContent="COPIADO ✓";btn.setAttribute("aria-live","polite");}
  catch{location.href="mailto:"+mail;return;}
  setTimeout(()=>{s.textContent=o;btn.removeAttribute("aria-live");},2200);});

$("#yr").textContent=new Date().getFullYear();

/* INICIO */
renderMap();
calcStats();
renderCrumbs();
renderXList();
initCerts();

if(RM){boot.remove();document.body.classList.add("ready");}
else{boot.classList.add("go");typeMsg();setTimeout(finish,3400);boot.addEventListener("click",finish);}
})();

