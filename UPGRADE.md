# stateZ 1.x to 2.x upgrade

Breaking changes between version 1 and version 2:

* simpler constructor and usage
* stored properties now merged with individual initialization object properties
* `addEventListener` `"change"` event type renamed to `"*"`
* can trigger events on individual property changes with `state.addEventListener('myProp', fn)`
* automatic tab/window synchronization so `.syncState()` method is no longer available
* no session storage, but a new `.set(property, value)` can set local in-page state
* `.cleanState()` method removed
* no page `unload` event: improves [bfcache](https://web.dev/bfcache/) performance for back/forward page navigation
* properties saved as individual localStorge values: improves saving and `JSON.stringify()` performance


## Import

The `stateZtype` storage type has been removed so change v2 import statements from:

```js
import { stateZ, stateZtype } from ...
```

to v2:

```js
import { stateZ } from ...
```


## stateZ constructor

The v1 constructor is passed an object with `type`, `name`, `init`, and `sync` properties. v2 requires a name and initialization object, e.g.

```js
const state = stateZ('myState', { a: 1, b: 2, c: 3 });
```

v1 used the whole initialization object when no previous state was stored. If values were only available for `a` and `b`, `c` would remain `undefined` and the initialization object was ignored.

v2 still uses stored values by default, but merges initialization object properties. If values were only available for `a` and `b`, `c` is also set to `3` and stored accordingly.


### Converting v1 stored data to v2 format

v1 stores state object properties in a single JSON-encoded string in localStorage. A state object named `myState` has a `myState` value set.

A v2 object can be initialized with v1 values before removal, e.g.

```js
// get v1 state for "myState"
const v1state = JSON.parse( localStorage.getItem('myState') || '{}' );

// optionally change or merge new values
v1state.a = 'new a value';
v1state.x = v1state.x || 'x value if not already defined';

// initialize v2 stateZ object with v1 data
const myState = stateZ('myState', v1state);

// delete old v1 state
localStorage.removeItem('myState')
```

v2 localStorage values are stored individually using the state and property names, e.g. `sZ.myState.a` and `sZ.myState.x`.


## State change events

A v1 `"change"` event handler triggers when any property changes:

```js
state.addEventListener('change', handler);
```

Rename `"change"` to `"*"` in v2:

```js
state.addEventListener('*', handler);
```

You can also trigger events when an individual property changes:

```js
// call handler when state.myProp changes
state.addEventListener('myProp', handler);
```

Handler functions receive identical event objects in both v1 and v2. Its `.detail` property defines an object with `state`, `property`, `value`, and `oldValue`.

Note that v2 update events run when the CPU is idle and the state has changed. v1 would trigger event changes immediately which could cause performance issues.

Auto-synchronization triggers identical events on other tabs and windows on the same domain using the same stateZ ID.


### New .set(property, value) method

Sets temporary session-like values in the current tab. It does not trigger events, storage, or synchronization.


## Removed .cleanState() method

The v1 `.cleanState()` method no longer exists. You can replace it with the following code and optionally choose which values to remove:

```js
for (let p in state) delete state[p];
```
