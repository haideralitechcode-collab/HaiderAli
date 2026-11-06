/* Dawn cart helpers for Horizon host theme */
(function () {
  if (!window.routes) {
    window.routes = {
      cart_add_url: (window.Theme && Theme.routes && Theme.routes.cart_add_url) || '/cart/add',
      cart_change_url: (window.Theme && Theme.routes && Theme.routes.cart_change_url) || '/cart/change.js',
      cart_update_url: (window.Theme && Theme.routes && Theme.routes.cart_update_url) || '/cart/update.js',
      cart_url: (window.Theme && Theme.routes && Theme.routes.cart_url) || '/cart',
    };
  }

  if (!window.cartStrings) {
    window.cartStrings = {
      error: 'There was an error while updating your cart. Please try again.',
      quantityError: 'You can only add [quantity] of this item to your cart.',
    };
  }

  if (typeof window.fetchConfig !== 'function') {
    window.fetchConfig = function (type) {
      return {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: `application/${type || 'json'}`,
        },
      };
    };
  }

  if (typeof window.debounce !== 'function') {
    window.debounce = function (fn, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    };
  }

  if (typeof window.ON_CHANGE_DEBOUNCE_TIMER === 'undefined') {
    window.ON_CHANGE_DEBOUNCE_TIMER = 300;
  }

  if (!window.PUB_SUB_EVENTS) {
    window.PUB_SUB_EVENTS = { cartUpdate: 'cart-update' };
  }

  if (typeof window.subscribe !== 'function') {
    const subscribers = {};
    window.subscribe = function (eventName, callback) {
      if (!subscribers[eventName]) subscribers[eventName] = [];
      subscribers[eventName].push(callback);
      return function unsubscribe() {
        subscribers[eventName] = (subscribers[eventName] || []).filter((cb) => cb !== callback);
      };
    };
    window.publish = function (eventName, data) {
      (subscribers[eventName] || []).forEach((cb) => cb(data));
    };
  } else if (typeof window.publish !== 'function') {
    window.publish = function () {};
  }

  if (!window.CartPerformance) {
    window.CartPerformance = {
      measure(_label, callback) {
        if (typeof callback === 'function') callback();
      },
      measureFromEvent() {},
    };
  }

  if (typeof window.trapFocus !== 'function') {
    window.trapFocus = function () {};
  }

  if (typeof window.removeTrapFocus !== 'function') {
    window.removeTrapFocus = function () {};
  }

  if (typeof window.onKeyUpEscape !== 'function') {
    window.onKeyUpEscape = function (event) {
      if (event.code.toUpperCase() !== 'ESCAPE') return;
      const openDetails = event.target.closest('details[open]');
      if (!openDetails) return;
      openDetails.removeAttribute('open');
    };
  }

  window.updateHorizonCartBubble = function (itemCount) {
    const count = Number(itemCount) || 0;
    const bubbleText =
      document.querySelector('[data-testid="cart-drawer-trigger"] .cart-bubble__text') ||
      document.querySelector('.header-actions__cart-icon .cart-bubble__text') ||
      document.querySelector('.cart-bubble__text-count') ||
      document.querySelector('#cart-bubble-text');

    document.querySelectorAll('.cart-bubble__text, .cart-bubble__text-count').forEach((el) => {
      if (count > 0) {
        el.textContent = String(count > 99 ? '99+' : count);
      } else {
        el.textContent = '';
      }
    });

    document.querySelectorAll('cart-icon, .header-actions__cart-icon').forEach((el) => {
      el.classList.toggle('header-actions__cart-icon--empty', count === 0);
    });

    if (bubbleText && count > 0 && !bubbleText.textContent) {
      bubbleText.textContent = String(count > 99 ? '99+' : count);
    }
  };
})();
