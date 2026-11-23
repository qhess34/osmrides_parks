'use strict';
/* Catalogue du jeu : type -> lieu -> éléments (docs/hierarchie.md). Chargé par index.html, plan.html et jeu.html.
   Ajouter un lieu = un dossier lieux/<type>/<lieu>/ et une entrée ici. Les fichiers d'un élément : lieux/<type>/<lieu>/<el>.data.js | .js | .game.js. */
const TYPES=[{id:'parc',nom:"Parcs d'attractions"}];
const LIEUX=[{type:'parc',id:'asterix',nom:'Parc Astérix',elements:[
  {id:'zeus',nom:'Tonnerre 2 Zeus'},{id:'hourra',nom:'La Trace du Hourra'},{id:'oziris',nom:'OzIris'},{id:'goudurix',nom:'Goudurix'}]}];
const lieuDir=(t,l)=>'lieux/'+t+'/'+l+'/';
const cleSauvegarde=(t,l,el,mode)=>'t2z.save.'+t+'.'+l+'.'+el+'.'+mode; // les clés t2z.* gardent l'ancien nom du jeu (sauvegardes des joueurs)
/* Migration unique : anciennes clés t2z.save.<el>.<mode> (avant les lieux) -> t2z.save.parc.asterix.<el>.<mode>, puis ancienne clé effacée.
   Pas d'autre compatibilité : les anciens liens ?site= ne sont plus lus. */
(function(){try{
  for(const e of LIEUX[0].elements)for(const m of ['career','sandbox']){
    const o='t2z.save.'+e.id+'.'+m,n=cleSauvegarde('parc','asterix',e.id,m),v=localStorage.getItem(o);
    if(v===null)continue;
    if(localStorage.getItem(n)===null)localStorage.setItem(n,v);
    localStorage.removeItem(o);}
}catch(e){}})();
