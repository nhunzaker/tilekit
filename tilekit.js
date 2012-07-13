/*
 * Tilekit
 *
 * Nate Hunzaker <nate.hunzaker@gmail.com>
 * http://natehunzaker.com
 *
 */


 // (C) Andrea Giammarchi
 //	Special thanks to Alessandro Crugnola [www.sephiroth.it]
 
 function aStar(Grid, Start, Goal, Find) {
	
	var abs  = Math.abs, 
	 	max  = Math.max, 
	 	pow  = Math.pow, 
	 	sqrt = Math.sqrt, 
	 	
	 	cols = Grid[0].length, 
	 	rows = Grid.length, 
	 	limit = cols * rows, 
	 	
	 	Distance = {
			Diagonal: Diagonal,
		 	DiagonalFree: Diagonal,
		 	Euclidean: Euclidean,
		 	EuclideanFree: Euclidean,
		 	Manhattan: Manhattan
		}[Find] || Manhattan;


 	function AStar() {
 
 		switch (Find) {
	 		
 			case "Diagonal":
 			case "Euclidean":
 				Find = DiagonalSuccessors;
 				break;
 				
 			case "DiagonalFree":
 			case "EuclideanFree":
 				Find = DiagonalSuccessors$;
 				break;
 				
 			default:
 				Find = function() {};
 				break;
 		}

 	}

 	function $Grid(x, y) {
	 	return Grid[y][x].isTraversable();
 	}

 	function Node(Parent, Point) {
 		return {
	 		Parent: Parent,
	 		value: Point.x + (Point.y * cols),
	 		x: Point.x,
	 		y: Point.y,
	 		f: 0,
	 		g: 0
	 	};
 	}

 	function Path() {
	 	
 		var $Start = Node(null, { x: Start[0], y: Start[1] }), 
 			$Goal = Node(null, {x: Goal[0], y: Goal[1] }), 
 			AStar = new Array(limit), 
 			Open = [$Start], 
 			Closed = [], 
 			result = [], 
 			$Successors, 
 			$Node, 
 			$Path, 
 			length, 
 			max, 
 			min, 
 			i, 
 			j;
 			
 		while (length = Open.length) {

 			max = limit;
 			min = -1;

 			for (i = 0; i < length; i++) {

 				if (Open[i].f < max) {
 					max = Open[i].f;
 					min = i;
 				}

 			}

 			$Node = Open.splice(min, 1)[0];

 			if ($Node.value === $Goal.value) {

 				$Path = Closed[Closed.push($Node) - 1];

 				do {
 					result.push([$Path.x, $Path.y]);
 				} while ($Path = $Path.Parent);

 				AStar = Closed = Open = [];
 				result.reverse();

 			} else {

 				$Successors = Successors($Node.x, $Node.y);

 				for (i = 0, j = $Successors.length; i < j; i++) {
 					$Path = Node($Node, $Successors[i]);

 					if (!AStar[$Path.value]) {
 						$Path.g = $Node.g + Distance($Successors[i], $Node);
 						$Path.f = $Path.g + Distance($Successors[i], $Goal);
 						Open.push($Path);
 						AStar[$Path.value] = true;
 					}

 				}

 				Closed.push($Node);
 			}

 		}

 		return result;
 	}

 	function Successors(x, y) {
	 	
 		var N = y - 1, 
 			S = y + 1, 
 			E = x + 1, 
 			W = x - 1, 
 			$N = N > -1 && $Grid(x, N), 
 			$S = S < rows && $Grid(x, S), 
 			$E = E < cols && $Grid(E, y), 
 			$W = W > -1 && $Grid(W, y), 
 			result = [];
 			
 		if ($N)
 			result.push({x: x,y: N});
 		if ($E)
 			result.push({x: E,y: y});
 		if ($S)
 			result.push({x: x,y: S});
 		if ($W)
 			result.push({x: W,y: y});

 		Find($N, $S, $E, $W, N, S, E, W, result);

 		return result;
 	}

 	function DiagonalSuccessors($N, $S, $E, $W, N, S, E, W, result) {

 		if ($N) {
 			if ($E && $Grid(E, N))
 				result.push({x: E,y: N});
 			if ($W && $Grid(W, N))
 				result.push({x: W,y: N});
 		}

 		if ($S) {
 			if ($E && $Grid(E, S))
 				result.push({x: E,y: S});
 			if ($W && $Grid(W, S))
 				result.push({x: W,y: S});
 		}

 	}

 	function DiagonalSuccessors$($N, $S, $E, $W, N, S, E, W, result) {

 		$N = N > -1;
 		$S = S < rows;
 		$E = E < cols;
 		$W = W > -1;
  		if ($E) {
 			if ($N && $Grid(E, N))
 				result.push({x: E,y: N});
 			if ($S && $Grid(E, S))
 				result.push({x: E,y: S});
 		}

 		if ($W) {
 			if ($N && $Grid(W, N))
 				result.push({x: W,y: N});
 			if ($S && $Grid(W, S))
 				result.push({x: W,y: S});
 		}

 	}

 	function Diagonal(Point, Goal) {
 		return max(abs(Point.x - Goal.x), abs(Point.y - Goal.y));
 	}

 	function Euclidean(Point, Goal) {
 		return sqrt(pow(Point.x - Goal.x, 2) + pow(Point.y - Goal.y, 2));
 	}

 	function Manhattan(Point, Goal) {
 		return abs(Point.x - Goal.x) + abs(Point.y - Goal.y);
 	}
 	
 	return Path(AStar());

 }
;!function(exports, undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = new Object;
  }

  function configure(conf) {
    if (conf) {
      conf.delimiter && (this.delimiter = conf.delimiter);
      conf.wildcard && (this.wildcard = conf.wildcard);
      if (this.wildcard) {
        this.listenerTree = new Object;
      }
    }
  }

  function EventEmitter(conf) {
    this._events = new Object;
    configure.call(this, conf);
  }

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
        typeLength = type.length, currentType = type[i], nextType = type[i+1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if ((currentType === '*' || currentType === '**') || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
          }
        }
        return listeners;
      } else if(currentType === '**') {
        endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
        if(endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if(branch === '*' || branch === '**') {
              if(tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if(branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i+1);
    }
    
    xxTree = tree['**'];
    if(xxTree) {
      if(i < typeLength) {
        if(xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }
        
        // Build arrays of matching next branches and others.
        for(branch in xxTree) {
          if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if(branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i+2);
            } else if(branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i+1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
            }
          }
        }
      } else if(xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if(xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
    
    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for(var i = 0, len = type.length; i+1 < len; i++) {
      if(type[i] === '**' && type[i+1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name) {

      if (!tree[name]) {
        tree[name] = new Object;
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else if(typeof tree._listeners === 'function') {
          tree._listeners = [tree._listeners, listener];
        }
        else if (isArray(tree._listeners)) {

          tree._listeners.push(listener);

          if (!tree._listeners.warned) {

            var m = defaultMaxListeners;
            
            if (typeof this._events.maxListeners !== 'undefined') {
              m = this._events.maxListeners;
            }

            if (m > 0 && tree._listeners.length > m) {

              tree._listeners.warned = true;
              console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            tree._listeners.length);
              console.trace();
            }
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  };

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    this._events || init.call(this);
    this._events.maxListeners = n;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    };

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {
    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener') {
      if (!this._events.newListener) { return false; }
    }

    // Loop through the *_all* functions and invoke them.
    if (this._all) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        this._all[i].apply(this, args);
      }
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      
      if (!this._all && 
        !this._events.error && 
        !(this.wildcard && this.listenerTree.error)) {

        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    var handler;

    if(this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    }
    else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      if (arguments.length === 1) {
        handler.call(this);
      }
      else if (arguments.length > 1)
        switch (arguments.length) {
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
      return true;
    }
    else if (handler) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        this.event = type;
        listeners[i].apply(this, args);
      }
      return (listeners.length > 0) || this._all;
    }
    else {
      return this._all;
    }

  };

  EventEmitter.prototype.on = function(type, listener) {
    
    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if(this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else if(typeof this._events[type] === 'function') {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
    else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (!this._events[type].warned) {

        var m = defaultMaxListeners;
        
        if (typeof this._events.maxListeners !== 'undefined') {
          m = this._events.maxListeners;
        }

        if (m > 0 && this._events[type].length > m) {

          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {

    if(!this._all) {
      this._all = [];
    }

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          return this;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1)
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }
      }
    }

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          return this;
        }
      }
    } else {
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    }
    else {
      if (!this._events[type]) return this;
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if(this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  if (typeof define === 'function' && define.amd) {
    define(function() {
      return EventEmitter;
    });
  } else {
    exports.EventEmitter2 = EventEmitter; 
  }

}(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);
/*!
  * klass: a classical JS OOP façade
  * https://github.com/ded/klass
  * License MIT (c) Dustin Diaz & Jacob Thornton 2012
  */
!function(a,b){typeof define=="function"?define(b):typeof module!="undefined"?module.exports=b():this[a]=b()}("klass",function(){function f(a){return j.call(g(a)?a:function(){},a,1)}function g(a){return typeof a===c}function h(a,b,c){return function(){var d=this.supr;this.supr=c[e][a];var f=b.apply(this,arguments);return this.supr=d,f}}function i(a,b,c){for(var f in b)b.hasOwnProperty(f)&&(a[f]=g(b[f])&&g(c[e][f])&&d.test(b[f])?h(f,b[f],c):b[f])}function j(a,b){function c(){}function l(){this.initialize?this.initialize.apply(this,arguments):(b||h&&d.apply(this,arguments),j.apply(this,arguments))}c[e]=this[e];var d=this,f=new c,h=g(a),j=h?a:this,k=h?{}:a;return l.methods=function(a){return i(f,a,d),l[e]=f,this},l.methods.call(l,k).prototype.constructor=l,l.extend=arguments.callee,l[e].implement=l.statics=function(a,b){return a=typeof a=="string"?function(){var c={};return c[a]=b,c}():a,i(this,a,d),this},l}var a=this,b=a.klass,c="function",d=/xyz/.test(function(){xyz})?/\bsupr\b/:/.*/,e="prototype";return f.noConflict=function(){return a.klass=b,this},a.klass=f,f})
// The Tilekit Namespace
// -------------------------------------------------- //

;(function() {

    var breaker       = {},
        slice         = Array.prototype.slice,
        nativeForEach = Array.prototype.forEach;
    
    var Tilekit = {

        debug: false,

        each:  function(obj, iterator, context) {

            if (obj == null) {
                return;
            }

            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
                        return;
                    }
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === breaker) {
                            return;
                        }
                    }
                }
            }
        },

        extend: function(obj) {
            Tilekit.each(slice.call(arguments, 1), function(source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            });
            return obj;
        }

    };

    window.TK = window.Tilekit = Tilekit;

}());
// Helpers
//= require ./geo
// -------------------------------------------------- //

Array.prototype.isArray = true;

// Rounds to a given number
Number.prototype.roundTo = function roundTo (to) {

    if (this < to / 2) {
        return 0;
    }

    var amount = to * Math.round(this / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Floors to a given number
Number.prototype.floorTo = function (to) {

    if (this < to) {
        return 0;
    }

    var amount = to * Math.floor(this / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Ceils to a given number
Number.prototype.ceilTo = function roundTo (to) {

    if (this < to) {
        return to;
    }

    var amount = to * Math.ceil(this / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Given a number, iterate over the absolute value
Number.prototype.times = function(cb, scope) {

    if (this === 0) {
        return;
    }
    
    var i = ~~Math.abs(this),
        n = 0;
    
    do { 
        cb.apply(scope || this, [n]); 
        i--;
        n++;
    } while(i > 0);

};


// Request Animation Frame Polyfill
// -------------------------------------------------- //

if (typeof window !== 'undefined') {
    
    window.requestAnimationFrame = (function(){
        
        return window.requestAnimationFrame    || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ) {
                window.setTimeout(callback, 1000 / 60);
            };

    }());
}


// Bind Polyfill
// -------------------------------------------------- //

if (!Function.prototype.bind) {

    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            FNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof FNOP ? this : oThis,
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        FNOP.prototype = this.prototype;
        fBound.prototype = new FNOP();

        return fBound;
    };

}


// Math Helpers
// -------------------------------------------------- //

Math.percentChance = function(val, callback) {
    if (Math.random() < val / 100) {
        callback();
    }
};

Math.parseDelta = function(number, total) {

    if (/\%/.test(number)) {
        return total * (parseFloat(number, 10) / 100);
    }

    if (/\+|\-/.test(number)) {
        return total + parseFloat(number, 10);
    }
    
    return number;
};


// Formatting helpers
// -------------------------------------------------- //

var Format = window.Format = {};

Format.align = function(orientation, segment, total, offset) {

    if (/bottom|right/ig.test(orientation)) {
        return (total - offset) - segment;
    } else {
        return offset;
    }
    
};
// Geometry Helpers
//-------------------------------------------------- //

(function() {

    var Geo = {};

    Geo.toRadians = function(degrees) {
        return degrees * (Math.PI/180);
    };

    Geo.findAngle = function(point1, point2) {

        if (point1.isArray) {
            point1 = { x: point1[0], y: point1[1] };
        }

        if (point2.isArray) {
            point2 = { x: point2[0], y: point2[1] };
        }

        var angle = Math.atan2(point2.y - point1.y, point2.x - point1.x) * (180 / Math.PI);

        return angle < 0 ? angle + 360: angle;
    };

    Geo.findPoint = function(point, distance, angle, round) {

        round = round || 100;

        var rads = Geo.toRadians(angle);

        return {
            x: point.x + distance * ~~(Math.cos(rads) * round) / round,
            y: point.y + distance * ~~(Math.sin(rads) * round) / round
        };

    };

    Geo.findDistance = function(point1, point2) {

        var distX    = Math.pow(point2.x - point1.x, 2),
            distY    = Math.pow(point2.y - point1.y, 2),
            distance = Math.sqrt(distX + distY);

        return distance;

    };

    Geo.isWithinCone = function(center, point, radius, angle, cone) {

        var trajectory = Geo.findAngle(point, center),
            distance   = Geo.findDistance(center, point);

        if (distance >= radius) {
            return false;
        }

        // 1. The angle from the center through point should be between the cone
        if (angle - cone >= trajectory || trajectory >= angle + cone) {
            return false;
        }

        // 2. The distance from centerX,centerY to X,Y should be less then the Radius
        return true;

    };

    if (typeof module !== 'undefined') {
        global.Geo = Geo;
    } else {
        window.Geo = Geo;
    }

}());
// Primitives.js
// A collection of shape helpers for canvas

// The Rectangle
// -------------------------------------------------- //

var Rectangle = function(canvas, options) {

    var self = this,
        te = options.tileEngine;

    $.extend(this, {
        x      : 0,
        y      : 0,
        stroke : null,
        fill   : null,
        width  : 100,
        height : 100
    }, options);
    
    this.canvas = canvas;
    this.c = this.canvas.getContext('2d');

    if (te) {

        te.on("refresh", function() {
            window.requestAnimationFrame(function() {
                self.draw();
            });
        });

    }

    // Render the rectangle
    this.draw = function() {

        var posX = this.x,
            posY = this.y;
        
        if (this.tile) {
            
            var te     = this.tileEngine,
                canvas = this.canvas,
                tile   = te.tile,
                size   = te.get("size"),
                scroll = te.get("scroll"),
                deltaX = (canvas.width / 2) - (size / 2),
                deltaY = (canvas.height / 2) - (size / 2);
            
            posX = this.tile.x * size;
            posY = this.tile.y * size;
            
            posX += (deltaX) - (scroll.x * 2);
            posY += (deltaY) - (scroll.y * 2);
        }

        // If we have a fill color, create a solid color rectangle
        if (this.fill) {
            this.c.fillStyle = this.fill;
            this.c.fillRect(posX, posY, this.width, this.height);
        }
        
        // If a stroke color has been specified, create a stroke
        // rectangle on top of the fill rectangle
        if (this.stroke) {
            this.c.strokeStyle = this.stroke;
            this.c.strokeRect(posX, posY, this.width, this.height);
        }

    };
    
    return this;
};

// A simple text module

var TextBox = function(options) {

    options = options || {};

    this.header     = options.header || "???";
    this.subheader  = options.subheader || false;
    this.body       = options.body || "";
    this.context    = options.context;
    this.lineheight = options.lineheight || 25;
};

TextBox.prototype.setFont = function(color, font) {
    var ctx = this.context;

    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.font = font;
};

TextBox.prototype.drawWindow = function() {

    var ctx = this.context;

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2),
                 document.width,
                 (document.height * 0.2));

    ctx.fillStyle = "#333";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2) - 2,
                 document.width, 2);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0,
                 document.height - (document.height * 0.2) + 1,
                 document.width,
                 1);

};

TextBox.prototype.drawText = function(text, x, y) {

    this.context.fillText(text,
                          (document.width * 0.1) + (x || 0),
                          (document.height - (document.height * 0.2)) + (y || 0)
                         );
};

TextBox.prototype.drawEllipsis = function() {

    var ctx = this.context,
        width = document.width * 0.93,
        height = document.height - (document.height * 0.05);

    ctx.fillStyle = "#333";
    ctx.fillRect(width,
                 height,
                 5, 5);
    ctx.fillRect(width + 10,
                 height,
                 5, 5);
    ctx.fillRect(width + 20,
                 height,
                 5, 5);
};

TextBox.prototype.draw = function() {

    var ctx = this.context,
        self = this;

    this.drawWindow();


    // The Message header
    // -------------------------------------------------- //

    this.setFont("black", "bold 14pt monospace");
    this.drawText(this.header, 0, 15);

    if (this.subheader) {
        this.setFont("#666", "normal 10pt monospace");
        this.drawText(this.subheader, 0, 40);
    }

    // The Message Contents
    // -------------------------------------------------- //

    this.setFont("#333", "normal 14pt monospace");

    var pixelLength = 0,
        words = this.body.split(" "),
        line = 70, // 70 for the base pixel offset
        i = 0, word = "", measure = 0;

    while(words[i]) {
        word = words[i];
        measure = ctx.measureText(word + " ").width;

        if (pixelLength + measure > document.width * 0.85) {
            pixelLength = 0;
            line += this.lineheight;
        }

        if (line > (document.height * 0.2) - (document.height * 0.05)) {
            return;
        }

        self.drawText(word, pixelLength, line);

        pixelLength += ctx.measureText(word + " ").width;

        i++;
    }

    this.drawEllipsis();

    return;

};
/**
 * A simple timer
 */

(function(Tilekit) {

    var Timer = Tilekit.Timer = function() {
        this.date = new Date();
    };

    Timer.prototype.update = function() {
        var d = new Date();
        this.date = d;
    };

    Timer.prototype.getMilliseconds = function() {
        return this.date.getTime();
    };

    Timer.prototype.getSeconds = function() {
        return Math.round(this.date.getTime() / 1000);
    };

}(window.Tilekit));
// A generic sprite class
// -------------------------------------------------- //

(function(Tilekit) {

    var Sprite = function(src, width, height, offsetX, offsetY, frames, duration, target) {

        this.spritesheet = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.width = width;
        this.height = height;
        this.frames = 1;
        this.currentFrame = 0;
        this.duration = 1;
        this.posX = 0;
        this.posY = 0;
        this.shown = true;
        this.zoomLevel = 1;
        this.shadow = null;

        this.setSpritesheet(src);
        this.setOffset(offsetX, offsetY);
        this.setFrames(frames);
        this.setDuration(duration);

        this.target = target;

        this.timer = new Tilekit.Timer();

        this.created_at = this.timer.getMilliseconds();

        var d = new Date();

        if (this.duration > 0 && this.frames > 0) {
            this.ftime = d.getTime() + (this.duration / this.frames);
        } else {
            this.ftime = 0;
        }

    };

    Sprite.prototype.setSpritesheet = function(src) {
        
        // Don't duplicate work, adding needless http requests for
        // the same image

        if (this.spritesheet instanceof Image && this.spritesheet.src === src) {
            return this;
        }
        
        if (src instanceof Image) {
            this.spritesheet = src;
        } else {
            this.spritesheet = new Image();
            this.spritesheet.src = src;
        }

        return this;
    };

    Sprite.prototype.setPosition = function(x, y) {
        this.posX = x;
        this.posY = y;

        return this;
    };

    Sprite.prototype.setOffset = function(x, y) {
        this.offsetX = x;
        this.offsetY = y;

        return this;
    };

    Sprite.prototype.setFrames = function(fcount) {
        this.currentFrame = 0;
        this.frames = fcount;

        return this;
    };

    Sprite.prototype.setDuration = function(duration) {
        this.duration = duration;

        return this;
    };

    Sprite.prototype.nextFrame = function() {

        if (this.duration > 0) {

            var d = new Date();

            if (this.duration > 0 && this.frames > 0) {
                this.ftime = d.getTime() + (this.duration / this.frames);
            } else {
                this.ftime = 0;
            }

            this.offsetX = this.width * this.currentFrame;

            if (this.currentFrame === (this.frames - 1)) {
                this.currentFrame = 0;
            } else {
                this.currentFrame++;
            }

        }

        return this;
    };

    Sprite.prototype.animate = function(t) {

        // Default to the sprites native timer
        t = t || this.timer;

        t.update();

        if (t.getMilliseconds() > this.ftime) {
            this.nextFrame ();
        }

        return this;
    };

    Sprite.prototype.draw = function(c, drawShadow, degrees) {

        c = c || this.target;

        if (this.shown) {

            if (drawShadow !== undefined && drawShadow) {

                if (this.shadow === null) { // Shadow not created yet

                    var sCnv = document.createElement("canvas");
                    var sCtx = sCnv.getContext("2d");

                    sCnv.width = this.width;
                    sCnv.height = this.height;

                    sCtx.drawImage(this.spritesheet,
                                   this.offsetX,
                                   this.offsetY,
                                   this.width,
                                   this.height,
                                   0,
                                   0,
                                   this.width * this.zoomLevel,
                                   this.height * this.zoomLevel);

                    var idata = sCtx.getImageData(0, 0, sCnv.width, sCnv.height);

                    for (var i = 0, len = idata.data.length; i < len; i += 4) {
                        idata.data[i] = 0; // R
                        idata.data[i + 1] = 0; // G
                        idata.data[i + 2] = 0; // B
                    }

                    sCtx.clearRect(0, 0, sCnv.width, sCnv.height);
                    sCtx.putImageData(idata, 0, 0);

                    this.shadow = sCtx;
                }

                c.save();
                c.globalAlpha = 0.1;

                var sw = this.width * this.zoomLevel;
                var sh = this.height * this.zoomLevel;

                c.drawImage(this.shadow.canvas, this.posX, this.posY - sh, sw, sh * 2);
                c.restore();
            }

            c.drawImage(this.spritesheet,
                        this.offsetX,
                        this.offsetY,
                        this.width,
                        this.height,
                        this.posX,
                        this.posY,
                        this.width * this.zoomLevel,
                        this.height * this.zoomLevel);
        }

        return this;
    };

    Tilekit.Sprite = Sprite;

}(window.Tilekit));
// Entity
//
//= require libs/klass
//
// -------------------------------------------------- //

(function(TK) {

    "use strict";

    TK.Entity = window.klass({

        attributes: {},
        layers: {},

        initialize: function(options, layers) {
            this.attributes = TK.extend({}, this.attributes, options);
            this.layers     = TK.extend({}, this.layers, layers);
        },

        // Getters and Setters
        // -------------------------------------------------- //

        get: function(key) {
            return this.attributes[key];
        },

        set: function(key, value) {

            var previous = this.attributes[key];

            this.attributes[key] = value;
            this.emit(["change", "change:" + value], value, previous);

            return this.attributes[key];
        },

        // Layers
        // -------------------------------------------------- //

        addLayer: function(namespace, layer, scope) {

            if (!namespace) {
                throw new Error("Entity#addLayer - Layer requires a namespace");
            }

            if (typeof namespace === 'object') {

                for (var n in namespace) {

                    if (namespace.hasOwnProperty(n)) {
                        this.addLayer(n, namespace[n], scope);
                    }

                }

                return this;

            }

            this.layers[namespace] = layer.bind(scope || this);

            return layer;
        },

        removeLayer: function(name) {
            if (this.layers[name]) {
                delete this.layers[name];
            }
        },

        renderLayers: function(ctx) {

            var layers = this.layers;

            for (var layer in layers) {

                if (layers.hasOwnProperty(layer) && typeof layers[layer] === 'function') {
                    layers[layer].apply(this, [ctx || this.ctx, Date()]);
                }

            }

        }

    });

    TK.extend(TK.Entity.prototype, window.EventEmitter2.prototype);

}(window.Tilekit));
// A Class For All Tiles
// -------------------------------------------------- //

(function(Tilekit) {

    var round = Math.round;

    var Tile = window.klass({

        x: 0, y: 0,
        width: 32, height: 32,
        layers: [],

        initialize: function(options) {
            Tilekit.extend(this, options);
        },

        isTraversable: function() {

            if (this.__blockOnce) {
                this.__blockOnce = undefined;
                return false;
            }

            return this.layers[1] === undefined || this.layers[1] === 0;

        },

        isBlocking: function() {
            return this.layers[1] > 0;
        },

        roundedTile: function() {
            return {
                x : round(this.x),
                y : round(this.y)
            };
        }

    });

    Tilekit.Tile = Tile;

}(window.Tilekit));
// The Grid
//
// EVENTS:
// "ready" - Initial ready state after tilemap is been processed
// "draw" - Emits on redraw
// "portal" = Emits whenever a tile with a portal is triggered
// -------------------------------------------------- //

(function(window, TK) {

    "use strict";

    var Sprite = TK.Sprite,
        Tile   = TK.Tile,
        Entity = TK.Entity;

    var Geo   = window.Geo,
        aStar = window.aStar,
        floor = Math.floor,
        ceil  = Math.ceil,
        round = Math.round,
        $ = window.jQuery;

    var Grid = TK.Grid = Entity.extend({
        
        attributes:{
            encoding: 24,
            resize: true,
            paused: false,
            scroll: {
                x: 0,
                y: 0
            },
            size: 32
        },

        initialize: function(canvas, tilemap, options) {

            var self = this;

            options = options || {};

            // Attributes
            // -------------------------------------------------- //

            this.attributes = TK.extend({}, this.attributes, {
                tileset    : tilemap.tileset
            }, options, {
                created_at : Date.now()
            });
            
            this.canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
            this.ctx = this.canvas.getContext('2d');

            // Event Handling
            // -------------------------------------------------- //

            this.on('ready', function() {
                
                var resize = this.get("resize"),
                    start  = this.get("start_location");
                
                if (resize !== false) {
                    window.addEventListener("resize", function() {
                        self.fillspace();
                    });
                    self.fillspace();
                }

                if (start) {
                    self.panTo(options.start_location);
                }

                self.begin();

            });

            function mouseEmit(e) {

                var size   = self.get("size"),
                    center = self.findCenter();
                
                e.tile = self.getTileAt(e.offsetX, e.offsetY);
                e.position = {
                    x: (e.tile.x * size) + center.x,
                    y: (e.tile.y * size) + center.y
                };

                self.set("mouse", e);
                self.emit(e.type, e);

            }
            
            
            // Events
            // -------------------------------------------------- //

            this.canvas.addEventListener("onContextMenu", function() {
                return false;
            });
            
            this.canvas.addEventListener("click", mouseEmit);
            this.canvas.addEventListener("mousemove", mouseEmit);
            this.canvas.addEventListener("mousedown", mouseEmit);
            this.canvas.addEventListener("mouseup", mouseEmit);


            // Portals
            // -------------------------------------------------- //

            this.start_location = options.start_location;
            this.portals = options.portals || [];

            var emitPortal = function() {
                self.emit("portal", data);
            };

            for (var p = 0, len = this.portals.length; p < len; p++) {
                var data = this.portals[p];
                this.on("tile:" + [data.x , data.y].join(","), emitPortal);
            }


            // Prerendering is super efficient, let's capitalize on it
            // -------------------------------------------------- //

            var base = this.base = document.createElement("canvas");
            this.baseCtx = base.getContext('2d');

            var staging = this.staging = document.createElement("canvas");
            this.stagingCtx = staging.getContext('2d');

            var debug = this.debug = document.createElement("canvas");
            this.debugCtx = debug.getContext('2d');

            var overlay = this.overlay = document.createElement("canvas");
            this.overlayCtx = overlay.getContext('2d');

            base.height = debug.height = staging.height = overlay.height = options.canvasHeight || 2000;
            base.width  = debug.width  = staging.width  = overlay.width  = options.canvasWidth || 2000;


            // Render the initial map state
            // -------------------------------------------------- //

            if (tilemap) {
                this.generateTilemap(tilemap.data);
            }

        }

    });

    Grid.prototype.zoom = function(scale) {
        scale = this.scale = scale / 100;
        this.ctx.scale(scale, scale);
    };


    // Utilities
    // -------------------------------------------------- //

    Grid.methods({

        toJSON: function() {
            return TK.extend(this.attributes,{
                name    : this.name,
                data    : this.encode(),
                start_x : this.start_location.x,
                start_y : this.start_location.y
            });
        },

        encode: function encode(array) {

            var self = this,
                output = "",
                encoding = this.get("encoding"),
                a;

            array = array || this.tilemap;

            for (var i = 0, len = array.length; i < len; i++) {

                a = array[i];

                if (a.isArray) {

                    if (a[0].isArray && i !== 0) {
                        output += "." + self.encode(a);
                    } else {
                        output += "\n" + self.encode(a);
                    }

                } else {
                    output += a < encoding ? "0" + a.toString(encoding) : a.toString(encoding);
                }

            }

            return output.trim();

        },

        isBlocking: function(tile) {
            return this.tilemap[tile.y][tile.x].isBlocking();
        }

    });

    // Game loop methods
    // -------------------------------------------------- //

    Grid.methods({

        begin: function gameLoop() {
            
            if (this.attributes.paused) {
                return false;
            }

            window.requestAnimationFrame(this.begin.bind(this));

            gameLoop.then = gameLoop.then || this.created_at;
            gameLoop.now = Date.now();

            this.set("fps", 1000 / (gameLoop.now - gameLoop.then));
            this.shift = 60 / (1000 / (gameLoop.now - gameLoop.then));

            gameLoop.then = gameLoop.now;

            return this.draw();

        },

        pause: function () {
            this.set("paused", true);
        },

        play: function () {
            this.set("paused", false);
            this.begin();
        }

    });


    // Calculations
    // -------------------------------------------------- //

    Grid.methods({

        generateTilemap: function(data) {

            var self = this,
                size = this.get("size"),
                tileset = this.get("tileset"),
                type;

            this.tileSprite = new Sprite(tileset, size, size, 0, 0, this.stagingCtx);

            // Finally, we need some calculations to help the tileengine paint the map
            var sampleTileSet = new window.Image();
            sampleTileSet.src = tileset;

            // For interpretation, we need to know how deep the tileset runs
            // before moving to the next line
            sampleTileSet.onload = function() {

                self.tilesetDepth = sampleTileSet.width / size;
                self.tilemap = [];
                
                var map	= data.trim().split("."),
                    offset = self.findCenter(),
                    encoding = self.get("encoding");
                
                // For every layer...

                for (var z = 0; map[z]; z++) {

                    for (var y = 0, layer = map[z].trim().split("\n"); layer[y]; y++ ) {

                        self.tilemap[y] = self.tilemap[y] || [];

                        for (var x = 0, row = [], segment = layer[y].trim(); segment[x]; x += 2) {

                            // Add the value
                            type = parseInt(segment.slice(x, x + 2), encoding);

                            var tile = self.tilemap[y][x / 2] = self.tilemap[y][x / 2] || new Tile({
                                x: x / 2,
                                y: y,
                                width: size,
                                height: size,
                                layers: [0,0,0]
                            });

                            self.tilemap[y][x / 2].layers[z] = type;

                            // Draw it on the map
                            offset = self.calculateTileOffset(type);

                            var posX = size * x / 2,
                                posY = size * y;

                            self.tileSprite.setOffset(offset.x, offset.y);
                            self.tileSprite.setPosition(posX, posY);
                            self.tileSprite.draw(self.baseCtx);

                            // If we're dealing with an overlay, let's add it to that
                            // layer
                            if (z > 1 && type > 0) {
                                self.tileSprite.draw(self.overlayCtx);
                            }

                            // Helper for showing blocking layer
                            // -------------------------------------------------- //

                            if (TK.debug && z === 1 && type > 0) {
                                self.debugCtx.fillStyle = "rgba(200, 100, 0, 0.4)";
                                self.debugCtx.fillRect(posX, posY, size, size);
                            }


                            // Helper for showing overlay layer
                            // -------------------------------------------------- //

                            if (TK.debug && z > 1 && type > 0) {
                                self.debugCtx.fillStyle = "rgba(250, 256, 0, 0.4)";
                                self.debugCtx.fillRect(posX, posY, size, size);
                            }

                        }

                    }

                }

                self.save();
                
                if (TK.debug) {
                    self.drawPortals();
                }

                self.emit("ready");

            };

        }

    });

    // Calculations
    // -------------------------------------------------- //

    // Returns the tileX, tileY of the center of the map
    Grid.methods({

        findCenter: function() {

            var size   = this.get("size") / 2,
                scroll = this.get('scroll'),
                canvas = this.canvas;

            return {
                x : (canvas.width / 2) - size - (scroll.x * 2),
                y : (canvas.height / 2) - size - (scroll.y * 2)
            };

        },

        getTileAt: function(x, y) {

            var size   = this.get('size'),
                center = this.findCenter();

            x = this.canvas.width - (this.canvas.width - x) - center.x;
            y = this.canvas.height - (this.canvas.height - y) - center.y;

            return {
                x: x.floorTo(size) / size,
                y: y.floorTo(size) / size
            };
        },

        // Finds the offset (x, y) of a tile given it's slot value
        calculateTileOffset: function(slot) {

            // The slot of the tile
            var size = this.get('size'),
                depth = this.tilesetDepth,
                offset = {
                    x: 0,
                    y: floor(slot / depth) * size
                };

            // Is the slot not within the first row?
            offset.x = (slot > depth - 1 ) ? (slot % depth) : slot;
            offset.x *= size;

            return offset;
        },

        calculatePixelOffset: function(tile) {

            var center = this.findCenter(),
                size   = this.get('size');

            return {
                x : (tile.x * size) + center.x,
                y : (tile.y * size) + center.y
            };

        }

    });


    // Rendering
    // -------------------------------------------------- //

    Grid.methods({

        save: function() {
            this.baseCtx.save();
            this.debugCtx.save();
            this.overlayCtx.save();
        },

        fillspace: function() {

            var size = this.get('size');

            // We round to the width/height to make rendering more efficient
            // and significantly clearer
            this.canvas.width = document.width.roundTo(size);
            this.canvas.height = document.height.roundTo(size);

            return this;
        },

        // Replace a specific tile
        replaceTile: function(x, y, layer, slot) {

            var size = this.get("size"),
                tile;

            // Handle missing rows
            if (!this.tilemap[y]) {
                this.tilemap[y] = [];
            }

            if (!this.tilemap[y][x]) {
                this.tilemap[y][x] = new Tile(x, y, size, size);
            }

            tile = this.tilemap[y][x];

            tile.layers[layer] = slot;

            this.drawTile(tile);
            
            return this;
        },

        // Wipes the board clean
        // Mostly, this is used to take care of transparency rendering

        clear: function() {
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
            this.stagingCtx.clearRect(0,0, this.staging.width, this.staging.height);
        },

        panTo: function(coords) {

            if (!coords) {
                return console.error("Grid#panTo: Coordinates must be specified for panning.");
            }

            var size = this.get('size') / 2;

            this.set("scroll", {
                x: round(coords.x * size),
                y: round(coords.y * size)
            });

            return this;
        },

        drawTile: function drawTile(tile, layerOffset) {

            var size    = this.get('size'),
                center  = this.findCenter(),
                current = layerOffset || 0,
                sprite  = this.tileSprite,
                layers  = tile.layers,
                offset, value;

            sprite.setPosition(tile.x * size, tile.y * size);

            this.baseCtx.clearRect(tile.x * size, tile.y * size, size, size);

            for (var c = 0, len = layers.length; c < len; c++) {
                offset = this.calculateTileOffset(layers[c]);
                sprite.setOffset(offset.x, offset.y);
                sprite.draw(this.baseCtx);
            }

        },

        drawPortals: function drawPortals() {

            var ctx  = this.debugCtx,
                size = this.get('size');

            if (this.start_location) {
                ctx.strokeStyle = "rgb(255, 180, 10)";
                ctx.fillStyle = "rgba(255, 180, 10, 0.5)";
                ctx.fillRect(
                    this.start_location.x * size,
                    this.start_location.y * size,
                    size, size
                );
                ctx.strokeRect(
                    this.start_location.x * size,
                    this.start_location.y * size,
                    size, size
                );

            }

            for (var p = 0; p < this.portals.length; p++) {
                ctx.strokeStyle = "rgb(200, 20, 250)";
                ctx.fillStyle = "rgba(200, 20, 250, 0.4)";
                ctx.fillRect(
                    this.portals[p].x * size,
                    this.portals[p].y * size,
                    size, size
                );
                ctx.strokeRect(
                    this.portals[p].x * size,
                    this.portals[p].y * size,
                    size, size
                );
            }

        },

        draw: function() {

            var ctx	= this.ctx,
                center = this.findCenter(),
                layers = this.layers;

            // Clear the current state
            this.clear();

            // Draw the prerendered state
            this.stagingCtx.drawImage(this.base, 0, 0);
            this.stagingCtx.save();

            this.emit("refresh");

            // Draw Output
            // -------------------------------------------------- //
            ctx.drawImage(this.staging, center.x, center.y);
            ctx.drawImage(this.overlay, center.x, center.y);

            // Draw Layers
            this.renderLayers(ctx);

            return true;

        }

    });

    // Pathfinding
    // -------------------------------------------------- //

    Grid.methods({

        plotCourse: function(start, end, additional) {

            var original = {},
                tilemap  = this.tilemap;

            for ( var a in (additional || {}) ) {
                if (additional.hasOwnProperty(a)) {
                    var t = additional[a].tile();
                    original[a] = tilemap[t.y][t.x].layers[1];
                    tilemap[t.y][t.x].layers[1] = 1;
                }
            }

            var results = aStar(tilemap, [start.x, start.y], [end.x, end.y]),
                points  = [];

            for (var w = 0, len = results.length, angle; w + 1 < len; w++) {

                angle = Geo.findAngle(results[w], results[w+1]);

                // TODO: Fix this disgusting patchwork
                if (angle === 90) {
                    angle = 270;
                } else if (angle === 270) {
                    angle = 90;
                }

                points.push(angle);

            }

            for (var b in additional) {
                if (additional.hasOwnProperty(b)) {
                    var s = additional[b].tile();
                    tilemap[s.y][s.x].layers[1] = original[b];
                }
            }

            return points;

        }

    });

}(window, window.Tilekit));
// Unit.js
//
// EVENTS:
//
// "blocked" - when movement is prohibited by terrain
// "collision" - when movement is prohibited by characters
// "vision" - when another object comes into vision
// "refresh" - when the sprite is redrawn
// "change" - when an attribute is changed
//
// -------------------------------------------------- //

(function(Tilekit) {

    "use strict";

    var round = Math.round,
        abs   = Math.abs,
        PI    = Math.PI,
        Geo   = window.Geo,
        findDistance = Geo.findDistance,
        isWithinCone = Geo.isWithinCone,
        requestAnimationFrame = window.requestAnimationFrame,
        Sprite = Tilekit.Sprite;

    var Unit = Tilekit.Unit = Tilekit.Entity.extend({

        attributes: {
            speed: 1,
            face: 270,
            hearing: 64,
            vision: 96,
            visionCone: 30,
            position: {
                x: 0,
                y: 0
            }
        },

        layers: {},

        isUnit: true,

        tile: function() {

            var size = this.grid.get("size"),
                pos  = this.get("position");

            return {
                x: pos.x / size,
                y: pos.y / size
            };

        },

        initialize: function(name, scene, options) {

            var grid = scene.grid,
                size = grid.get('size'),
                self = this;

            this.scene = scene;
            this.grid  = scene.grid;
            this.ctx   = scene.grid.stagingCtx;

            this.set("position", {
                x: options.tile.x * size,
                y: options.tile.y * size
            });

            this.sprite = new Sprite(options.image, size, size, 0, 0, 3, 200, this.ctx);

            grid.on('refresh', this.draw.bind(this), this);

            this.on('draw', function() {
                self.renderLayers(self.ctx);
            });

            // Attributes
            // -------------------------------------------------- //

            this.attributes = $.extend(true, {
                name: name,
                created_at: Date.now()
            }, this.attributes, options);

            this.layers = $.extend({}, this.layers);
        }

    });

    // Getters and Setters
    // -------------------------------------------------- //

    Unit.methods({

        getTileFront: function(offset) {
            return Geo.findPoint(this.tile, offset || 1, this.get("face"));
        },

        getTileBack: function(offset) {
            return Geo.findPoint(this.tile, offset || 1, -this.get("face"));
        },

        setFace: function(direction) {

            if (typeof direction !== 'number') {
                if (Tilekit.debug) {
                    console.error("Unit#setFace requires a numerical direction.");
                }
                return false;
            }

            var face = direction.isUnit ? abs(direction.get("face") - 180) : direction;

            // What direction are we dealing with?
            switch(direction) {
            case 90  : this.sprite.setOffset(0,100); break;
            case 270 : this.sprite.setOffset(0,0);   break;
            case 0   : this.sprite.setOffset(0,150); break;
            case 180 : this.sprite.setOffset(0,50);  break;
            }

            this.set("face", face);

            return this;
        }

    });


    // Utilities
    // -------------------------------------------------- //

    Unit.methods({

        toJSON: function() {
            return $.extend({}, this.attributes, this.tile());
        },

        remove: function() {
            this.grid.removeListener("refresh", this.draw);
        }

    });

    // Rendering Methods
    // -------------------------------------------------- //

    Unit.methods({

        draw: function() {
            var pos = this.get("position");

            this.sprite.setPosition(pos.x, pos.y).draw();
            this.emit("draw");
        }

    });

    // Movement
    // -------------------------------------------------- //

    Unit.methods({

        halt: function(trigger) {

            var size = this.grid.get('size'),
                pos  = this.get('position');

            this.moving = false;

            this.set("position", {
                x: pos.x.roundTo(size),
                y: pos.y.roundTo(size)
            });

            var tile = this.tile();
            this.sprite.currentFrame = 0;

            if (trigger) {
                this.grid.emit("tile:" + tile.x + "," + tile.y);
                this.grid.emit("tile:*," + tile.y);
                this.grid.emit("tile:" + tile.x + ",*");
            }

        },

        move: function(direction, pan, callback) {

            // Prevent any other move actions until the old one finishes
            if (this.moving) {
                return false;
            }

            this.moving = true;

            callback = callback || function(){};

            // At the very least, get the character facing in the intended direction
            this.setFace(direction);

            var grid      = this.grid,
                shift     = round(this.grid.shift),
                size      = grid.get('size'),
                speed     = this.get("speed"),
                pos       = this.get("position"),
                self      = this;

            // What direction are we dealing with?
            var delta = Geo.findPoint({ x: 0, y: 0 }, 1, -direction),
                goal  = Geo.findPoint(pos, size, -direction);

            // Hit detection
            if (this.detectHit(delta.x * size, delta.y * size) ) {
                return this.halt(true);
            }

            function animate() {

                var pos   = self.get("position");

                self.set("position", {
                    x: pos.x + delta.x * shift * speed,
                    y: pos.y + delta.y * shift * speed
                });

                // Do we pan the screen with this character?
                if (pan) {
                    grid.panTo(self.tile());
                }

                if (pos.x === goal.x && pos.y === goal.y) {
                    self.halt(true);
                    return callback.apply(self, [Date.now()]);
                }

                self.sprite.animate();
                return requestAnimationFrame(animate);
            }

            animate();

            return this;

        },

        setPath: function (destination, options) {

            options = options || {};

            var self = this,
                waypoints = [],
                grid = this.grid,
                tile = this.tile();

            if (destination.isUnit) {
                destination = destination.tile;
            }

            // If it's a tile, then let's do some calculations

            tile = {
                x : round(tile.x),
                y : round(tile.y)
            };

            waypoints = grid.plotCourse(tile, destination, this.scene.units);

            var path = this.set("path", waypoints);

            function traceSteps() {

                var move = path.shift();

                if (move !== undefined) {
                    self.move(move, options.pan, traceSteps);
                }

            }

            traceSteps();

        },

        detectHit: function(offsetX, offsetY) {

            var others  = this.scene.units,
                grid    = this.grid,
                size    = grid.get('size'),
                pos     = this.get("position"),
                tile    = this.tile(),
                name    = this.get("name").toLowerCase(),
                blocked = false;

            // Tiles in Focus
            // -------------------------------------------------- //

            var start = {
                x: pos.x + (offsetX || 0),
                y: pos.y + (offsetY || 0)
            };

            var active = {
                x: start.x / size,
                y: start.y / size
            };

            // Check for hits on the blocking layer (1 is the blocking layer)
            // -------------------------------------------------- //

            if ( grid.isBlocking(active) ) {
                this.emit("blocked", active);
                blocked = true;
            }

            // Check for other player movement
            // -------------------------------------------------- //

            for (var c in others) {

                if ( others.hasOwnProperty(c) && others[c] !== this ) {

                    var other   = others[c],
                        end     = other.get("position"),
                        prox    = findDistance(start, end) - size / 2,
                        vision  = other.get("vision") || 0,
                        cone    = other.get("visionCone") || 0,
                        hearing = other.get("hearing") || 0,
                        angle   = other.get("face");

                    // Detect characters in proximity to self
                    // -------------------------------------------------- //

                    if (isWithinCone(end, start, vision, angle, cone)) {
                        other.emit(["see", "see:" + name], this);
                    }

                    if (hearing > prox) {
                        other.emit(["hear", "hear" + name], this);
                    }

                    // Detect characters in blocking distance
                    // -------------------------------------------------- //

                    if (size > prox + size) {

                        var who = other.get("name").toLowerCase();

                        this.emit(["collision", "collision:" + who], other);
                        other.emit(["collision", "collision:" + name], this);

                        blocked = true;
                    }
                }

            }

            return blocked;
        }
    });

}(window.Tilekit));
// Character.js
//
// EVENTS:
//
// "blocked" - when movement is prohibited by terrain
// "collision" - when movement is prohibited by other units
// "see" - when another object comes into visual range
// "hear" - when another object comes into hearing range
// "refresh" - when the sprite is redrawn
// "change" - when an attribute is changed
//
// -------------------------------------------------- //

(function(Tilekit) {

    var Character = Tilekit.Character = Tilekit.Unit.extend({

        attributes: {
            comment: "",
            emote: "",
            speed: 2,
            face: 270,
            hearing: 64,
            vision: 96,
            visionCone: 30
        },

        showName: false,

        initialize: function(name, scene, options) {

            this.supr(name, scene, options);

            var size = scene.grid.get("size");

            this.emote_sprite = new Tilekit.Sprite("/assets/emotes.png", size, size, 0, 0);
            this.layers = Tilekit.extend(this.layers, {

                emote: function() {

                    var emote = this.emote_sprite,
                        pos   = this.get("position"),
                        size  = this.grid.get('size'),
                        which = {

                            // Emotions
                            "surprised" : [0, 0],
                            "sad"       : [32, 0],
                            "love"      : [64, 0],
                            "power"     : [96, 0],
                            "happy"     : [128, 0],
                            "disguise"  : [160, 0],

                            // Events
                            "poison"    : [0, 32],
                            "quest"     : [32, 32],
                            "idea"      : [64, 32],

                            // Sense
                            "see"       : [0, 64],
                            "hear"      : [32, 64]

                        }[this.get("emote")] || false;

                    if (!which) {
                        return false;
                    }

                    emote.setPosition(pos.x, pos.y - (size + (Math.cos( Date.now() / 500) * 2) ) );
                    emote.setOffset( which[0], which[1] );
                    emote.draw(this.ctx);

                },

                renderName: function() {

                    if (!this.showName) {
                        return;
                    }

                    var c = this.ctx,
                        name = this.get("name");

                    c.font = "15px monospace";
                    c.fillStyle = "#000";

                    var textWidth = this.ctx.measureText(name).width;

                    c.fillText(name,
                               (this.tile.x * 32) - (textWidth / 10),
                               (this.tile.y * 31)
                              );
                }
                
            });
        }

    });

}(window.Tilekit));
// Scene.js
// 
//= require tilekit/text
//= require tilekit/grid
// -------------------------------------------------- //

(function(Tilekit) {
    
    var Character = Tilekit.Character,
        TextBox = window.Textbox;
    
    var Scene = Tilekit.Scene = window.klass(function(options) {

        options = options || {};
        
        $.extend(this, {
            units: []
        }, options);

        this.grid = options.grid;

        if (this.units.length) {
            this.add(this.units);
        }

    });

    // Add a player to the map
    Scene.prototype.add = function(options) {

        var slot = 0, c;

        // Handle multiple entries
        // -------------------------------------------------- //

        if ($.isArray(options)) {

            while (options[slot]) {

                c = options[slot];
                
                c.tile = c.tile || {
                    x: c.x || 0, 
                    y: c.y || 0
                };

                this.add(c);
                slot++;
            }

            return;
        }

        // Handle single entries
        // -------------------------------------------------- //
        
        options = $.extend({}, {
            image: "/assets/players/default.png",
            tile: {
                x: options.x || 0,
                y: options.y || 0
            }
        }, options);
        
        c = this.units[options.name] = new Character(options.name, this, options);

        return c;

    };

    // Remove players from map
    Scene.prototype.remove = function(name) {

        if (!this.units[name]) {
            return;
        }

        this.units[name].remove();

        delete this.units[name];
    };

    // Messaging
    // -------------------------------------------------- //

    Scene.prototype.message = function(header, message, callback) {
        
        var grid = this.grid;

        callback = callback || function(){};
        
        // Okay, now generate the new message
        this.grid.addLayer("message", function(ctx, date) {
            
            var text = new TextBox({
                header: header,
                subheader: new Array(header.length + 3).join("-"),
                body: message,
                context: grid.c
            });

            text.draw.apply(text);
        });

        $(window).one("keydown", function remove(e) {
            grid.removeLayer("message");
            callback(e);
            return false;
        });        

    };


    // Querying
    // -------------------------------------------------- //

    Scene.prototype.find = function(condition) {
        
        var result;

        for (var u in this.units) {
            if (condition(this.units[u])) {
                return result;
            }
        }

        return false;

    };

    // Find a character at a specific tile
    Scene.prototype.findAt = function(tile, callback) {

        var tile2;

        for (var c in this.units) {
            
            tile2 = this.units[c].tile;

            if (tile.x === tile2.x && tile.y === tile2.y) {
                
                if (callback) {
                    callback(this.units[c]);
                } else {
                    return this.units[c];
                }
            }

        }

    };


    // JSON Operations
    // -------------------------------------------------- //

    // GET
    Scene.prototype.fetch = function(url, callback) {
        
        $.get(url, function(data) {
            callback(data);
        });

        return {
            then: function(fn) {
                callback = fn;
            }
        };

    };

}(window.Tilekit));