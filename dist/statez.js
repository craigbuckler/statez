/*
statez 2.0.0 - Simple client-side state manager with events, synchronization, and local storage
https://github.com/craigbuckler/statez#readme
Craig Buckler, 2023-08-26
*/
var c=new Map,u=new Map,y="statez",i=window.localStorage,a,v=window.requestIdleCallback||(t=>setTimeout(t,20)),d=class extends EventTarget{#e=null;constructor(e){super(),this.#e=e}get stateId(){return this.#e}set(e,n){return typeof n>"u"?Reflect.deleteProperty(this,e):Reflect.set(this,e,n)}addEventListener(){super.addEventListener.apply(this,arguments)}removeEventListener(){super.removeEventListener.apply(this,arguments)}dispatchEvent(e){let n={detail:e,bubbles:!1,cancelable:!1};super.dispatchEvent(new CustomEvent(e.property,n)),super.dispatchEvent(new CustomEvent("*",n))}},g={set:(t,e,n)=>p(t,e,n),deleteProperty:(t,e)=>p(t,e),get:(t,e)=>{let n=t[e];return typeof n=="function"?function(...s){return n.apply(t,s)}:Reflect.get(t,e)}};function E(t,e){t=t||y,c.has(t)||c.set(t,new Proxy(new d(t),g));let n=c.get(t);return h(n,{...e}),n}function h(t,e){let n=t.stateId;for(let s=0;s<i.length;s++){let r=i.key(s),o=f(r);if(o&&o.store===n){let l=o.property;t.set(l,JSON.parse(i.getItem(r))||void 0),delete e[l]}}for(let s in e)t[s]=e[s]}function p(t,e,n){let s=Reflect.get(t,e),r=!0;if(s===n)return r;if(typeof n>"u"?r=Reflect.deleteProperty(t,e):r=Reflect.set(t,e,n),r){let o=t.stateId+"."+e,l=u.get(o)||{state:t,property:e,valueOld:s};l.value=n,u.set(o,l),a=a||v(w)}return r}async function w(){let t=u.values(),e;do{if(e=t.next().value,!e||e.value===e.valueOld)continue;let{state:n,property:s,value:r}=e;n.dispatchEvent(e);let o="sZ."+n.stateId+"."+s;typeof r>"u"?i.removeItem(o):i.setItem(o,JSON.stringify(r))}while(e);u.clear(),a=null}window.addEventListener("storage",t=>{let e=f(t.key),n=e&&c.get(e.store);if(n){let s=t.newValue===null?void 0:JSON.parse(t.newValue),r={state:n,property:e.property,value:s,valueOld:n[e.property]};n.set(e.property,s),n.dispatchEvent(r)}});function f(t){let e=t.split(".");return e.length===3&&e[0]==="sZ"?{store:e[1],property:e[2]}:null}export{E as stateZ};
