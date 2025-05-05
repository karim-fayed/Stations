/**
 * Polyfills for older browsers
 * This file adds support for features that might be missing in older browsers
 */

// Polyfill for requestAnimationFrame
(function() {
  var lastTime = 0;
  var vendors = ['webkit', 'moz', 'ms', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());

// Polyfill for Element.matches
if (!Element.prototype.matches) {
  Element.prototype.matches = 
    Element.prototype.matchesSelector || 
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector || 
    Element.prototype.oMatchesSelector || 
    Element.prototype.webkitMatchesSelector ||
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;            
    };
}

// Polyfill for Element.closest
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// Polyfill for Object.assign
if (typeof Object.assign !== 'function') {
  Object.assign = function(target) {
    if (target === null || target === undefined) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);
    
    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource !== null && nextSource !== undefined) { 
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Polyfill for Array.from
if (!Array.from) {
  Array.from = function (object) {
    return [].slice.call(object);
  };
}

// Polyfill for CustomEvent
(function () {
  if (typeof window.CustomEvent === "function") return false;
  
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  
  window.CustomEvent = CustomEvent;
})();

// Polyfill for NodeList.forEach
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// Polyfill for Promise
if (typeof Promise === 'undefined') {
  console.warn('Promise polyfill needed - consider adding a full polyfill library');
}

// Safari specific fixes
(function() {
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (isSafari) {
    // Fix for Safari's handling of position:fixed elements
    document.documentElement.classList.add('safari');
    
    // Fix for Safari's handling of z-index
    var style = document.createElement('style');
    style.textContent = `
      .mapboxgl-popup { transform: translateZ(0) !important; }
      .mapboxgl-marker { transform: translate(-50%, -50%) translateZ(0) !important; }
    `;
    document.head.appendChild(style);
  }
  
  // iOS specific fixes
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if (isIOS) {
    document.documentElement.classList.add('ios');
    
    // Fix for iOS scrolling and touch handling
    document.addEventListener('touchmove', function(e) {
      if (e.target.closest('.mapboxgl-popup-content')) {
        e.stopPropagation();
      }
    }, { passive: false });
  }
})();
