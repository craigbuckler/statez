# Change log

# 1.0.1, 17 June 2022

* fixed synchronization of deleted properties
* minor refactoring
* esbuild update
* demonstration updates
* `README.md` update

# 1.0.0, 14 June 2022

* initial release

## How stateZ works

A private `Target` object, which inherits from `EventTarget`, stores all state values. It provides public methods for `dispatchEvent()`, `cleanState()`, and `syncState()`.

A private `StateHandler` Proxy intercepts property set, get, and delete actions. It checks whether properties have changed and runs `dispatchEvent()` when necessary.

`stateZ()` is a public factory function which creates **stateZ** objects (proxied `Target` objects). These are placed in a `stateStore` object so the same **stateZ** object can be returned for a specific `name`.

A window `beforeunload` event handler runs each **stateZ** `syncState()` function to save data when the page unloads. This saves a single JSON-encoded value using the state object's `name` to local or session storage as appropriate.

A window `storage` event handler runs when `localStorage` changes. If the `key` references a **stateZ** object in `stateStore`, its properties are updated accordingly.
