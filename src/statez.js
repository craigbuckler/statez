// stateZ local storage
const
  stateCache = new Map(),                     // state object cache
  syncQ = new Map(),                          // state synchroization queue
  store = 'statez',                           // store identifier
  ls = window.localStorage;                   // localStorage

let
  sync;                                       // synchronization event


// simple requestIdleCallback polyfill
const idleCallback = window.requestIdleCallback || (cb => setTimeout(cb, 20));


// state storage class
class State extends EventTarget {

  // state name
  #stateId = null;

  constructor(stateId) {
    super();
    this.#stateId = stateId;
  }

  get stateId() {
    return this.#stateId;
  }

  // set session property (no event, storage, or broadcast)
  set(property, value) {
    if (typeof value === 'undefined') {
      return Reflect.deleteProperty(this, property);
    }
    else {
      return Reflect.set(this, property, value);
    }
  }

  // add event listener
  addEventListener() {
    super.addEventListener.apply(this, arguments);
  }


  // add event listener
  removeEventListener() {
    super.removeEventListener.apply(this, arguments);
  }

  // dispatch event
  dispatchEvent(detail) {
    const data = { detail, bubbles: false, cancelable: false };
    super.dispatchEvent( new CustomEvent(detail.property, data) );
    super.dispatchEvent( new CustomEvent('*', data) );
  }

}


// state proxy handler
const stateHandler = {

  // set property
  set: (state, property, value) => setState(state, property, value),

  // delete property
  deleteProperty: (state, property) => setState(state, property),

  // get property
  get: (state, property) => {

    const method = state[property];
    if (typeof method === 'function') {

      // method call
      return function(...args) {
        return method.apply(state, args);
      };

    }
    else {

      // property get
      return Reflect.get(state, property);

    }

  }

};


// stateZ factory
function stateZ(stateId, stateDefault) {

  stateId = stateId || store;

  // cached/new store
  if (!stateCache.has(stateId)) {

    stateCache.set(stateId, new Proxy(
      new State(stateId),
      stateHandler
    ));

  }

  // initialize
  const state = stateCache.get( stateId );
  stateInit(state, {...stateDefault});

  return state;

}


// populate initial properties
function stateInit(state, stateDefault) {

  // from storage
  const stateId = state.stateId;

  for (let s = 0; s < ls.length; s++) {

    const key = ls.key(s), sk = storeKey(key);

    if (sk && sk.store === stateId) {
      const prop = sk.property;
      state.set(prop, JSON.parse( ls.getItem( key )) || undefined);
      delete stateDefault[ prop ];
    }

  }

  // from defaults
  for (let p in stateDefault) {
    state[ p ] = stateDefault[p];
  }

}


// update state
function setState(state, property, value) {

  const valueOld = Reflect.get(state, property);
  let ret = true;

  // no change
  if (valueOld === value) return ret;

  // changed
  if (typeof value === 'undefined') {
    ret = Reflect.deleteProperty(state, property);
  }
  else {
    ret = Reflect.set(state, property, value);
  }

  if (ret) {

    // synchronize state
    const
      id = state.stateId + '.' + property,
      data = syncQ.get(id) || { state, property, valueOld };

    data.value = value;
    syncQ.set( id, data );
    sync = sync || idleCallback(syncState);

  }

  return ret;

}


// synchronize state
async function syncState() {

  const sIter = syncQ.values();
  let detail;

  do {

    detail = sIter.next().value;
    if (!detail || detail.value === detail.valueOld) continue;

    const { state, property, value } = detail;

    // trigger events
    state.dispatchEvent(detail);

    // store
    const id = 'sZ.' + state.stateId + '.' + property;

    if (typeof value === 'undefined') {

      // delete item
      console.log(`DB DEL: ${ id }`);
      ls.removeItem( id );

    }
    else {

      // update item
      console.log(`DB PUT: ${ id } = ${ JSON.stringify(value) }`);
      ls.setItem( id, JSON.stringify(value) );

    }

  } while (detail);

  syncQ.clear();
  sync = null;

}


// localStorage event
window.addEventListener('storage', e => {

  const
    sk = storeKey(e.key),
    s = sk && stateCache.get( sk.store );

  if (s) {
    const
      value = e.newValue === null ? undefined : JSON.parse( e.newValue ),
      detail = { state: s, property: sk.property, value, valueOld: s[sk.property] };

    console.log(`B/CAST: ${ sk.store }.${ sk.property } = ${ value }`);
    s.set(sk.property, value);
    s.dispatchEvent(detail);
  }


});


// return { store, property } from a "sZ.store.property" string
function storeKey(key) {
  const k = key.split('.');
  return (k.length === 3 && k[0] === 'sZ' ? { store: k[1], property: k[2] } : null);
}

export { stateZ };
