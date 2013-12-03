/*! d3 plugin for Hammer.JS - v1.0.0 - 2013-12-03
 * http://eightmedia.github.com/hammer.js
 *
 * Copyright (c) 2013 Nicholas Bollweg <nick.bollweg@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
  'use strict';

function setup(Hammer, d3) {
  // from https://github.com/EightMedia/hammer.js/wiki/Getting-Started#gesture-options
  var option_names = [
    'drag',
    'drag_block_horizontal',
    'drag_block_vertical',
    'drag_lock_to_axis',
    'drag_max_touches',
    'drag_min_distance',
    'hold',
    'hold_threshold',
    'hold_timeout',
    'prevent_default',
    'prevent_mouseevents',
    'release',
    'show_touches',
    'stop_browser_behavior',
    'swipe',
    'swipe_max_touches',
    'swipe_velocity',
    'tap',
    'tap_always',
    'tap_max_distance',
    'tap_max_touchtime',
    'doubletap_distance',
    'doubletap_interval',
    'touch',
    'transform',
    'transform_always_block',
    'transform_min_rotation',
    'transform_min_scale'
  ];

  /**
   * d3 plugin
   * create a d3.hammer factory, which you can add to a selection e.g.
   * selection(..).call(d3.hammer())
   * @param   {d3.select}
   * @return  {jQuery}
   */
  d3.hammer = function(options) {
    var _options = {},
      _on = {};

    // the main d3-style function, usually called with <selection>.call()
    var my = function(selection){
      selection.each(function(datum, index){
        // avoid scope issues
        var $ = this,
          // dereference functors
          options = d3.entries(_options)
            .reduce(function(memo, option){
              memo[option.key] = typeof option.value === 'function' ?
                  option.value.call($, datum, index) :
                  option.value;
                return memo;
              }, {}),
          // create instance
          inst = new Hammer($, options);
        
        d3.entries(_options)
          .map(function(gesture){
            inst.on(gesture.key, function(e){
              var o = d3.event;
              d3.event = e;
  
              try{
                gesture.value.call(this, this.__data__, index);
              }finally{
                d3.event = o;
              }
              
            });
          });
      });
    };
    
    // proxy d3-style configurators... except defaults are not exposed
    option_names.map(function(name){
      my[name] = function(_){
        if(!arguments.length){ return _options[name]; }
        _options[name] = _;
        return my;
      };
    });
    
    // then, if any options were passed, set them...
    d3.entries(options || {}).map(function(option){
      my[option.key](option.value);
    });
    
    // actually set up handlers, where the handler is a d3-style callback
    // function(datum, index){}
    my.on = function(gesture, handler){
      var argn = arguments.length,
        gtype = typeof gesture;

      // getters
      if(argn === 0){
        return Hammer.utils.extend({}, _on);
      }else if(argn === 1 && gtype === 'string'){
        return _on[gesture];
      }

      // setters
      if(argn === 1 && gtype === 'object'){
        Hammer.utils.extend(_on, gesture);
      }else if(argn === 2 && handler == null){
        delete _on[gesture];
      }else{
        _on[gesture] = handler;
      }

      return my;
    };
    
    //the chaining callback
    return my;
  };
}

  // Based off Lo-Dash's excellent UMD wrapper (slightly modified) - https://github.com/bestiejs/lodash/blob/master/lodash.js#L5515-L5543
  // some AMD build optimizers, like r.js, check for specific condition patterns like the following:
  if(typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module
    define(['hammer', 'd3'], setup);
  
  }
  else {
    setup(window.Hammer, window.d3);
  }
})(this);