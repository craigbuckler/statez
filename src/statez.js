/*
stateZ: eazy state management
By Craig Buckler
*/

// state object cache
const stateStore = {};

// types of store
const stateZtype = {
  page: null,
  session: 'sessionStorage',
  permanent: 'localStorage'
};

// state object
class Target extends EventTarget {

  #StateName = null;
  #StateType = null;
  #StateSync = 0;
  #TimerSync = null;

  // initialization
  constructor(stateType, stateName, stateDefault, stateSync = 0) {

    super();

    this.#StateName = stateName;
    this.#StateType = stateType && window[ stateType ];
    this.#StateSync = stateSync;

    if (this.#StateType) {
      stateDefault = JSON.parse( this.#StateType.getItem( stateName ) ) || stateDefault;
    }

    // populate properties
    for (let p in stateDefault) {
      this[p] = stateDefault[p];
    }

    if (this.#StateSync) this.syncState();

  }


  // dispatch an event
  dispatchEvent(detail = {}) {

    detail.state = stateStore[ this.#StateName ];
    super.dispatchEvent( new CustomEvent('change', { detail, bubbles: false, cancelable: false }));

    // auto-sync state
    if (this.#StateSync) {
      clearTimeout( this.#TimerSync );
      this.#TimerSync = setTimeout(() => this.syncState(), this.#StateSync);
    }

  }


  // remove all properties
  cleanState() {

    Object.getOwnPropertyNames(this).forEach(property => {
      const detail = { property, valueOld: this[property] };
      delete( this[property] );
      this.dispatchEvent( detail );
    });

  }

  // save and synchronize properties
  syncState() {

    if (this.#StateType) {
      this.#StateType.setItem( this.#StateName, JSON.stringify( this ) );
    }

  }

}


// state proxy
const stateHandler = {

  // set property
  set: (target, property, value) => {

    const valueOld = Reflect.get(target, property);
    let ret = true;

    // property changed?
    if ( valueOld !== value && typeof target[property] !== 'function' ) {

      ret = Reflect.set(target, property, value);

      // change event
      if (ret) {
        target.dispatchEvent( { property, value, valueOld } );
      }

      if (typeof value === 'undefined') {
        Reflect.deleteProperty(target, property);
      }

    }

    return ret;

  },

  // delete property
  deleteProperty: (target, property) => {

    const
      valueOld = Reflect.get(target, property),
      del = Reflect.getOwnPropertyDescriptor(target, property) && Reflect.deleteProperty(target, property);

    // change event
    if (del) {
      target.dispatchEvent( { property, valueOld } );
    }

    return true;

  },

  // get property
  get: (target, property) => {

    const method = target[property];

    if (typeof method === 'function') {

      // Target method call
      return function(...args) {
        return method.apply(target, args);
      };

    }
    else {

      // Target property fetch
      return Reflect.get(target, property);

    }

  }

};


// proxy factory
function stateZ({
  type = stateZtype.permanent,
  name = null,
  init = null,
  sync = 0
} = {}) {

  // default name
  name = name || 'stateZ' + (type || 'page');

  // named store exists?
  if ( !stateStore[ name ] ) {

    // initialize new state proxy
    stateStore[ name ] = new Proxy(
      new Target( type, name, init, sync ),
      stateHandler
    );

  }

  return stateStore[ name ];

}


// localStorage event
window.addEventListener('storage', e => {

  const state = stateStore[ e.key ];
  if (state) {

    const
      update = JSON.parse( e.newValue ),
      prop = new Set([...Object.getOwnPropertyNames(state) ,...Object.getOwnPropertyNames(update)]);

    prop.forEach(p => {

      if (JSON.stringify( state[p] ) != JSON.stringify( update[p] )) {

        if (typeof update[p] === 'undefined') delete state[p];
        else state[p] = update[p];

      }

    });

  };

});


// save on page unload
window.addEventListener('beforeunload', () => {

  Object.values(stateStore).forEach(ss => ss.syncState());

});


export { stateZ, stateZtype };
