'use strict';

function resetListeners() {
  Object.defineProperties(this, {
    listeners: {
      value: {},
      writable: true,
      configurable: true,
    },
    onceListeners: {
      value: {},
      writable: true,
      configurable: true,
    },
    patternListeners: {
      value: [],
      writable: true,
      configurable: true,
    },
    anyListeners: {
      value: [],
      writable: true,
      configurable: true,
    },
    anyOnceListeners: {
      value: [],
      writable: true,
      configurable: true,
    },
    savedEvents: {
      value: [],
      writable: true,
      configurable: true,
    },
  });
}

module.exports = class EventEmitter {
  constructor() {
    resetListeners.call(this);
  }

  addListener(eventName, callback, mod = null) {
    switch (mod) {
      case 'once':
        this.onceListeners[eventName] || (this.onceListeners[eventName] = []);
        this.onceListeners[eventName].push(callback);
        break;
      case 'pattern':
        if (typeof eventName === 'string')
          eventName = new RegExp(eventName);
        this.patternListeners.push([eventName, callback]);
        break;
      case 'any':
        this.anyListeners.push(callback);
        break;
      default:
        this.listeners[eventName] || (this.listeners[eventName] = []);
        this.listeners[eventName].push(callback);
    }
  }

  on(eventName, callback) {
    this.addListener(eventName, callback);
  }

  any(callback) {
    this.addListener(null, callback, 'any');
  }

  once(eventName, callback) {
    this.addListener(eventName, callback, 'once');
  }

  removeListener(eventName, handler) {
    if (arguments.length) {
      if (arguments.length > 1) {
        let listenersArrays = [
          this.anyListeners,
        ];
        this.listeners[eventName] && listenersArrays.push(this.listeners[eventName]);
        this.onceListeners[eventName] && listenersArrays.push(this.onceListeners[eventName]);
        this.patternListeners[eventName] && listenersArrays.push(this.patternListeners[eventName]);

        listenersArrays.forEach(listeners => {
          let index = listeners.indexOf(handler);
          if (~index) {
            listeners.splice(index, 1);
          }
        });
      } else {
        this.listeners[eventName] = [];
        this.onceListeners[eventName] = [];
        this.patternListeners[eventName] = [];
      }
    } else {
      resetListeners.call(this);
    }
  }

  off(...args) {
    this.removeListener(...args);
  }

  emit(eventName, ...args) {
    this.anyListeners.forEach(listener => listener.call(this, eventName, ...args));
    this.listeners[eventName] && callListeners(this.listeners[eventName], args);
    this.onceListeners[eventName] && (callListeners(this.onceListeners[eventName], args), this.onceListeners[eventName] = []);

    this.patternListeners.forEach(([pattern, callback]) => {
      if (pattern.test(eventName))
        callback.apply(this, args);
    });

    function callListeners(listeners, args) {
      listeners.forEach(listener => listener.apply(this, args));
    }
  }
};
