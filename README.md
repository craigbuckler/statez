# stateZ

**stateZ** (state-easy) is a simple client-side state manager used to save values. Features:

* simple to use, e.g. `myState.x = 1`
* can store data for [current page, current session, or permanently](#advanced-initialization)
* can [synchronize data](#advanced-initialization) across tabs
* [triggers events](#state-change-events) when state changes
* vanilla JavaScript compatible with all frameworks
* fast and lightweight - less than 2KB of code


## Compatibility

**stateZ** works in modern browsers which support ES modules.


## Basic use

Load the module from a CDN:

```js
import { stateZ, stateZtype } from 'https://cdn.jsdelivr.net/npm/statez/dist/statez.js'
```

If using npm and a bundler, install the package:

```sh
npm install statez
```

then import the module locally (path resolution will depend on the bundler):

```js
import { stateZ, stateZtype } from './node_modules/statez/dist/statez.js';
```

Create a named permanent state store:

```js
// create state object
const myState = stateZ({ name: 'myState' });
```

then set and retrieve values:

```js
// set state
myState.x = 123;
myState.y = 'abc';

// get state
console.log( myState.x, myState.y ); // 123 abc

// output all properties
for (let p in myState) {
  console.log(`${ p }: ${ myState[p] }`);
}

// delete state
delete myState.x; // or
myState.x = undefined;
```

You can use the same state in any other script to access the same values:

```js
// another script
function showState() {

  const s = stateZ({ name: 'myState' });
  console.log( s.y ); // abc

}

showState();
```


## Advanced initialization

Pass an initialization object to the `stateZ()` function with the following optional properties:

* `type`: the storage type.
* `name`: a store name. All objects with the same `name` and `type` share the same data.
* `init`: an initial object when no previous state is available.
* `sync`: cross-tab [auto-synchronization](#state-synchronization) time in seconds.

The type can be:

* `stateZtype.permanent`: permanent data storage shared across all tabs which persists until the user wipes their browser's cache (the default).
* `stateZtype.session`: temporary data storage which persists in the current tab and is wiped on close.
* `stateZtype.page`: temporary data storage which persists in the current page view and is wiped on a page refresh or tab close.

When no `name` is specified, a default store is created for each `type`. The following stores are the same:

```js
const s1 = stateZ();
const s2 = stateZ();
```

The following stores are different:

```js
const s3 = stateZ({ type: stateZtype.permanent });
const s4 = stateZ({ type: stateZtype.session });
const s4 = stateZ({ type: stateZtype.page });
```

The `init` object initializes the store when no previous data is available:

```js
const s = stateZ({ name: 'myState', init: { a: 1, b: 2, c: 3 } });

console.log( s.a ); // 1 unless the state was stored or set elsewhere
```


## State synchronization

Permanent and session states are automatically saved when the page unloads. Permanent state is synchronized to other tabs at that point, but this may never occur on some applications.

Setting `sync` to a non-zero value automatically synchronises **permanent** data stores to other browser tabs on the same domain where **stateZ** is loaded:

```js
const s = stateZ({ name: 'myState', sync: 3 });
```

Synchronizing larger states is an expensive operation. The `sync` value sets a (debounce) number of seconds to wait before synchronization occurs. The example above will synchronize no more than once every three seconds regardless of how many state values are updated.

Alternatively, you can set `sync` to `0` (the default) and manually synchronize to other tabs using the `.syncState()` method:

```js
const s = stateZ({ name: 'myState' });
s.a = 1;
s.b = 2;

// synchronize now
s.syncState();
```


## Deleting state

You can delete individual properties using:

```js
delete myState.x
```

or by setting a property to `undefined`:

```js
myState.x = undefined;
```

Delete all properties using the `.cleanState()` method:

```js
myState.cleanState();
```

An empty state object will remove itself from session/permanent storage.


## State change events

You can trigger an event handler when a property updates. This could be useful for data binding or similar activities.

The event handler function receives an object with a `details` property that has the following child properties:

* `.detail.property`: the name of the updated property
* `.detail.value`: the new value
* `.detail.valueOld`: the old value
* `.detail.state`: the **stateZ** object

This example function logs state updates:

```js
// event handler
function stateUpdate(e) {
  console.log(`STATE UPDATE EVENT`);
  console.log(`property name : ${ e.detail.property }`);
  console.log(`updated value : ${ JSON.stringify(e.detail.value) }`);
  console.log(`previous value: ${ JSON.stringify(e.detail.valueOld) }`);
}
```

It can be set as an event listener for any `statez` object using the `.addEventListener() ` method and a `'change'` trigger, e.g.

```js
const myState = stateZ({ name: 'myState', init: { x: 1 } });

// add change listener
myState.addEventListener('change', stateUpdate);
```

The handler runs every time a property value is updated:

```js
myState.x = 1; // no change - no event triggered

myState.x = 2; // value changed
// STATE UPDATE EVENT
// property name : x
// updated value : 2
// previous value: 1

myState.y = 'abc'; // new value
// STATE UPDATE EVENT
// property name : y
// updated value : 'abc'
// previous value: undefined

delete myState.y; // value deleted
// STATE UPDATE EVENT
// property name : y
// updated value : undefined
// previous value: 'abc'
```

Remove a handler with `.removeEventListener()`:

```js
myState.removeEventListener('change', stateUpdate);
```

Handler events are also triggered on **other** tabs when [synchronizing state](#state-synchronization).


## Nested objects and arrays

You can set a **stateZ** property to an array or object:

```js
myState.arr = [1, 2, 3];

myState.obj = {
  x: 1,
  y: [2,2]
  z: { a: 3, b: 4 }
};
```

This triggers change events as necessary.

Setting the same value again will also trigger an event. The values may be identical but the object is different:

```js
myState.arr = [1, 2, 3]; // change event triggered
```

However, setting a child property or array item will **not** trigger a change event:

```js
myState.obj.x = 2;      // no change event
myState.obj.y.push(3);  // no change event
myState.obj.z.b = 5;    // no change event
```

It may be preferable to create a new named store with native values rather than use nested arrays and objects.


## Usage policy

You are free to use this as you like but please do not republish it as your own work.

Please consider [sponsorship](https://github.com/sponsors/craigbuckler) if you use **stateZ** commercially, require support or new features.
