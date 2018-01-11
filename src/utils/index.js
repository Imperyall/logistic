import colors from '../constants/colors';
import moment from 'moment';

export const getRouteColor = routeIndex => colors[routeIndex % colors.length];

export const pprintSeconds = seconds => {
  const d = moment.duration(seconds, 'seconds');
  const hours = Math.floor(d.asHours());
  const mins = Math.floor(d.asMinutes()) - hours * 60;

  return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
};

export const debounce = (callback, wait, context = this) => {
  let timeout = null;
  let callbackArgs = null;
  
  const later = () => callback.apply(context, callbackArgs);
  
  return function() {
    callbackArgs = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export class EventUtil {
  constructor({ type, app, event, param }) {
    this.event = event || {};
    this.type = type;
    this.param = param || {};
    this.app = app;
    this.listenerMode = { capture: true };

    this.up = this.up.bind(this);
    this.move = this.move.bind(this);
    this.function_switcher = this.function_switcher.bind(this);
    this.resize_up = this.resize_up.bind(this);
    this.resize_move = this.resize_move.bind(this);
    this.map_up = this.map_up.bind(this);
    this.map_move = this.map_move.bind(this);
    this.map_down = this.map_down.bind(this);

    this.subscribe();
  }

  function_switcher(param) {
    switch(this.type) {
      case 'RESIZE' : {
        if (param === 'move') this.resize_move(); else
        if (param === 'up')   this.resize_up();
        break;
      }

      case 'GOOGLEMAP' : {
        if (param === 'down') this.map_down(); else
        if (param === 'move') this.map_move(); else
        if (param === 'up')   this.map_up();
        break;
      }

      default: {
        return;
      }
    }
  }

  up() {
    document.body.style['pointer-event'] = 'auto';
    document.removeEventListener('mouseup',   this.up,   this.listenerMode);
    document.removeEventListener('mousemove', this.move, this.listenerMode);

    this.function_switcher('up');
  }

  move() {
    this.function_switcher('move');
  }

  subscribe() {
    document.body.style['pointer-event'] = 'none';
    document.addEventListener('mouseup',   this.up,   this.listenerMode);
    document.addEventListener('mousemove', this.move, this.listenerMode);

    event.preventDefault();
    this.function_switcher('down');
  }

  resize_move() {
    let prop = window._divider || 33;
    window._divider = 0;
    const nx = event.clientX;
    window._sb = window.innerWidth - document.body.clientWidth;
    const wi = window.innerWidth - 20 - window._sb;
    prop = Number((wi - nx)/wi*100);
    if (prop > 50) {
      prop = 50;
    } else if (prop < 20) {
      prop = 20;
    }

    this.app.setSizeBlocks(prop);
    window._divider = prop;
  }

  resize_up() {
    this.app.setSizeBlocks(window._divider, true);
  }

  map_down() {
    this.app.handleShowWindow(true);
    this.app.handleWindowPoint({ w_id: this.param.w_id, w_text: this.param.w_text });
  }

  map_up() {
    const { r_id, w_id } = this.app.store.getState()['moveWin'];
    this.app.handleShowWindow(false);
    if (r_id) this.app.moveWaypoints({}, r_id, [w_id]);
  }

  map_move() {
    document.getElementById("moveText").style.top = event.pageY + 15 + "px";
    document.getElementById("moveText").style.left = event.pageX + 15 + "px";
  }
}