/* ===== QUALMED — script partagé ===== */
(function(){
  // ---- langue ----
  function setLang(l){
    document.documentElement.lang=l;
    document.querySelectorAll('[data-fr]').forEach(function(el){
      var t=el.getAttribute('data-'+l);
      if(t!==null) el.innerHTML=t;
    });
    document.querySelectorAll('[data-fr-ph]').forEach(function(el){
      var t=el.getAttribute('data-'+l+'-ph');
      if(t!==null) el.setAttribute('placeholder',t);
    });
    document.querySelectorAll('.lang button').forEach(function(b){
      b.classList.toggle('on',b.dataset.lang===l);
    });
    try{localStorage.setItem('qm_lang',l);}catch(e){}
  }
  window.qmSetLang=setLang;
  try{var s=localStorage.getItem('qm_lang'); if(s==='en') setLang('en');}catch(e){}

  document.addEventListener('DOMContentLoaded',function(){
    // année
    var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();

    // burger
    var burger=document.querySelector('.burger'), links=document.getElementById('navlinks');
    if(burger&&links){ burger.addEventListener('click',function(){links.classList.toggle('open');}); }
    document.querySelectorAll('.nav-links a[href]').forEach(function(a){
      a.addEventListener('click',function(){ if(links) links.classList.remove('open'); });
    });

    // FAQ
    document.querySelectorAll('.faq-q').forEach(function(q){
      q.addEventListener('click',function(){ q.parentElement.classList.toggle('open'); });
    });

    // reveal
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
    },{threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
    if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
      document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
    }

    // compteurs animés sur les chiffres-clés
    var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    function animateCount(el){
      var raw=el.textContent.trim();
      var m=raw.match(/^(\d+)(.*)$/);           // nombre + suffixe (+, °, etc.)
      if(!m){ return; }
      var target=parseInt(m[1],10), suffix=m[2]||'';
      if(reduce){ el.textContent=target+suffix; return; }
      var start=null, dur=1100;
      function step(ts){
        if(!start) start=ts;
        var p=Math.min((ts-start)/dur,1);
        var val=Math.round((1-Math.pow(1-p,3))*target);  // easeOutCubic
        el.textContent=val+suffix;
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var cio=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target);} });
    },{threshold:.5});
    document.querySelectorAll('.stat .n').forEach(function(el){ cio.observe(el); });

    // retour haut
    var top=document.querySelector('.to-top');
    if(top){
      window.addEventListener('scroll',function(){ top.classList.toggle('show',window.scrollY>600); });
      top.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
    }

    // cartes cliquables
    document.querySelectorAll('.card.clickable[data-href]').forEach(function(c){
      c.addEventListener('click',function(){ window.location.href=c.getAttribute('data-href'); });
    });

    // photos réelles : si "photo-xxx.jpg" existe, elle remplace le graphique de la bande
    document.querySelectorAll('.photoband .bg[data-photo]').forEach(function(bg){
      var name=bg.getAttribute('data-photo');
      var img=new Image();
      img.onload=function(){ bg.style.backgroundImage="url('"+name+".jpg')"; };
      img.src=name+'.jpg';
    });
  });
})();
