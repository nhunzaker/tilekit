/*
 * Tilekit
 *
 * Nate Hunzaker <nate.hunzaker@gmail.com> (http://natehunzaker.com)
 * 
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
        
        defaults: {
            
            font: "bold 18pt Helvetica",

            character_sprite: "character.png",
            emote_sprite: "emote.png"
        },

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
// 
// Common functions and absolutely essential polyfills
// -------------------------------------------------- //

Array.prototype.isArray = true;

// Request Animation Frame Polyfill (absolutely essential)
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

// Math Helpers
// -------------------------------------------------- //

// Rounds to a given number
Math.roundTo = function roundTo (num, to) {

    if (num < to / 2) {
        return 0;
    }

    var amount = to * Math.round(num / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Floors to a given number
Math.floorTo = function (num, to) {

    if (num < to) {
        return 0;
    }

    var amount = to * Math.floor(num / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
};

// Ceils to a given number
Math.ceilTo = function roundTo (num, to) {

    if (num < to) {
        return to;
    }

    var amount = to * Math.ceil(num / to);

    if (amount === 0) {
        amount = to;
    }

    return amount;
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
    
    window.Geo = Geo;

}());
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
// Primitives
// -------------------------------------------------- //

(function(Tilekit) {

    Tilekit.Text = function(ctx, text, x, y, options) {
        
        ctx.globalAlpha = options.alpha || 1;
        ctx.globalCompositeOperation = options.composite;

        ctx.font = options.font || Tilekit.defaults.font;
        ctx.fillStyle = options.color || "#fff";

        if (options && options.align === "center") {
            x -= ctx.measureText(text).width / 2;
        }
        
        ctx.fillText(text, x, y);

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    };

    Tilekit.Rectangle = function(ctx, x, y, width, height, options) {
        
        ctx.globalAlpha = options.alpha || 1;
        ctx.globalCompositeOperation = options.composite;

        ctx.fillStyle = options.fill;
        ctx.fillRect(x, y, width, height);
        
        if (options.stroke) {
            ctx.lineWidth = options.lineWidth || 1;
            ctx.strokestyle = options.stroke;
            ctx.strokeRect(x + 1, y + 1, width - 1, height - 1);
        }
        
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
    };

}(window.Tilekit));
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

    var Sprite = function(src, options) {
        
        Tilekit.extend(this, {
            width: 0,
            height: 0,

            offset: {
                x : 0,
                y: 0
            },
            base_offset: {
                x: 0,
                y: 0
            },
            
            padding: 0,
            position: {
                x: 0,
                y: 0
            },
            base_position: {
                x: 0,
                y: 0
            },

            frames: 1, 
            currentFrame: 0,
            iterations: 0,

            duration: 1,
            spritesheet: null,
            shadow: null,
            shown: true,
            zoomLevel: 1,
            target: null,
            timer: new Tilekit.Timer()
            
        }, options);            
        
        this.shift = this.width;

        this.setSpritesheet(src);
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
        this.position.x = x;
        this.position.y = y;
        return this;
    };

    Sprite.prototype.setOffset = function(x, y) {

        if (typeof x !== 'undefined') {
            this.offset.x = x;
        }

        if (typeof y !== 'undefined') {
            this.offset.y = y;
        }

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

            this.offset.x = this.base_offset.x + (this.shift * this.currentFrame);

            if (this.currentFrame === (this.frames - 1)) {
                this.currentFrame = 0;
                this.iterations++;
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
    
    Sprite.prototype.drawShadow = function(c, degrees) {

            if (this.shadow === null) { // Shadow not created yet

                var sCnv = document.createElement("canvas");
                var sCtx = sCnv.getContext("2d");

                sCnv.width = this.width;
                sCnv.height = this.height;

                sCtx.drawImage(this.spritesheet,
                               this.offset.x,
                               this.offset.y,
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

            c.drawImage(this.shadow.canvas, this.pos.x, this.pos.y - sh, sw, sh * 2);
            c.restore();

    };
    
    Sprite.prototype.draw = function(c, drawShadow, degrees) {

        c = c || this.target;

        if (!this.shown) {
            return false; 
        }
        
        if (drawShadow) {
            this.drawShadow(c, drawShadow, degrees);
        }       

        c.drawImage(this.spritesheet,
                    this.offset.x,
                    this.offset.y,
                    this.width,
                    this.height,
                    this.position.x - this.padding,
                    this.position.y - this.padding,
                    this.width * this.zoomLevel,
                    this.height * this.zoomLevel);

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

            this.canvas     = document.createElement("canvas");
            this.ctx        = this.canvas.getContext('2d');
        },

        // Getters and Setters
        // -------------------------------------------------- //

        get: function(key) {
            return this.attributes[key];
        },

        set: function(key, value) {

            if (typeof key === 'object') {

                for (var k in key) {

                    if (key.hasOwnProperty(k)) {
                        this.set(k, key[k]);
                    }

                }

            }
            
            var previous = this.attributes[key];

            this.attributes[key] = value;

            this.emit("change", value, previous);
            this.emit("change:" + key, value, previous);

            return this.attributes[key];
        },

        is: function(key, condition) {
            return this.get(key) === (condition || true);
        },

        // Layers
        // -------------------------------------------------- //

        addLayer: function(namespace, layer, scope, duration) {

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
            
            var bound = layer.bind(scope || this);
            
            bound.created_at = Date.now();
            bound.expires_at = duration || false;
            bound.callback = function() {};
            
            this.layers[namespace] = bound;

            return {

                then: function(cb) {
                    bound.callback = cb;
                }

            };

        },

        removeLayer: function(name) {
            if (this.layers[name]) {
                delete this.layers[name];
            }
        },

        renderLayers: function(ctx) {

            var layers = this.layers,
                layer,
                date = new Date();

            for (var l in layers) {

                if (layers.hasOwnProperty(l) && typeof layers[l] === 'function') {
                    
                    layer = layers[l];
                    layer(ctx || this.ctx, date, layer.created_at);

                    if (layer.expires_at !== false && date.getTime() - layer.created_at > layer.expires_at) {
                        this.layers[l].callback.apply(this, date);
                        delete this.layers[l];
                    }
                    
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
    
    var Tile = Tilekit.Entity.extend({

        defaults: {
            x: 0, 
            y: 0,
            width: 32, 
            height: 32
        },
            
        layers: [],

        initialize: function(options) {
            Tilekit.extend(this, this.defaults, options);
        },

        isTraversable: function() {
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
        },

        draw: function(c) {

            var grid = this.grid,
                sprite = this.sprite,
                layers = this.layers,
                pos = this.sprite.position;

            for (var i = 0, len = layers.length; i < len; i++) {

                var type = layers[i],
                    offset = grid.calculateTileOffset(type);

                sprite.setOffset(offset.x, offset.y);
                sprite.draw(c);

                if (i > 1 && type > 0) {
                    sprite.draw(grid.overlayCtx);
                } else {
                    sprite.draw();
                }
            }

            if (Tilekit.debug) {
                this.debug();
            }
            
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

    var Sprite  = TK.Sprite,
        Tile    = TK.Tile,
        Entity  = TK.Entity;

    var Geo     = window.Geo,
        aStar   = window.aStar,
        floor   = Math.floor,
        floorTo = Math.floorTo,
        ceil    = Math.ceil,
        round   = Math.round,
        roundTo = Math.roundTo,
        min     = Math.min,
        max     = Math.max;

    var Grid = TK.Grid = Entity.extend({
        
        attributes:{
            encoding: 24,
            resize: true,
            paused: false,
            scroll: {
                x: 0,
                y: 0
            },
            size: 32,
            tileset: []
        },

        scale: 1,

        initialize: function(canvas, tilemap, options) {

            var self = this;

            options = options || {};

            // Attributes
            // -------------------------------------------------- //

            this.attributes = TK.extend({}, this.attributes, {
                tileset    : tilemap && tilemap.tileset || []
            }, options, {
                created_at : Date.now()
            });
            
            // Let's super bulletproof our target canvas
            // -------------------------------------------------- //
            
            if (typeof canvas === 'string'){
                
                var sel = document.querySelector(canvas);
                
                if (!sel) {
                    throw new Error("Please provide either a canvas or query selector for this Grid to target");
                }
                
                if (sel instanceof window.HTMLCanvasElement) {
                    this.canvas = sel;
                } else {
                    this.canvas = document.createElement("canvas");
                    sel.appendChild(this.canvas);
                } 

            } else if (canvas instanceof window.HTMLCanvasElement) {
                this.canvas = canvas;
            } else {
                this.canvas = document.createElement("canvas");
            }
            
            this.ctx = this.canvas.getContext('2d');
            
            // Event Handling
            // -------------------------------------------------- //
            
            this.on('ready', function() {
                
                var resize = this.get("resize"),
                    start  = this.get("start_location"),
                    self = this;
                
                window.addEventListener("resize", function() {
                    self.fillspace();
                });

                self.fillspace();

                if (start) {
                    self.panTo(options.start_location);
                }

                window.onblur = function() {
                    self.pause();
                };

                self.begin();

            });

            function mouseEmit(e) {
                
                var size   = self.get("size"),
                    center = self.findCenter();
                
                e.tile = self.getTileAt(e.offsetX, e.offsetY);
                e.position = {
                    x: (e.offsetX * size) + center.x,
                    y: (e.offsetY * size) + center.y
                };

                self.set("mouse", e);
                self.emit(e.type, e);
                
            }
            
            // Events
            // -------------------------------------------------- //
            
            if (this.canvas.parentNode) { 
             
                this.canvas.parentNode.oncontextmenu = function() {
                    return false;
                };

            }

            this.canvas.addEventListener("click", mouseEmit);
            this.canvas.addEventListener("mousemove", mouseEmit);
            this.canvas.addEventListener("mousedown", mouseEmit);
            this.canvas.addEventListener("mouseup", mouseEmit);
            this.canvas.addEventListener("mousewheel", mouseEmit);


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
        this.scale = max(0.5, min(4, this.scale * scale) );
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

            array = array || this.tilemap;

            var self = this,
                output = "",
                encoding = this.get("encoding"),
                a,
                i = 0,
                len = array.length;

            while (i < len) {

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

                i++;
            }

            return output;

        },

        isBlocking: function(tile) {
            
            var y = round(tile.y),
                x = round(tile.x);
            
            return this.tilemap[y][x].isBlocking();

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
            
            if (this.get("paused")) {
                return;
            }
            
            this.set("paused", true);

            var ctx = this.ctx,
                canvas = this.canvas;
            
            TK.Rectangle(ctx, 0, 0, document.width, document.height, { fill: "rgba(0,0,0,0.6)" });

            TK.Text(ctx, "PAUSED", canvas.width / 2, canvas.height / 2 + 1, { align: "center", color: "#000" });
            TK.Text(ctx, "PAUSED", canvas.width / 2, canvas.height / 2,     { align: 'center', color: "#fff" });

        },

        play: function () {
            this.set("paused", false);
            this.begin();
        },

        toggle: function() {
            if ( this.get("paused") ){
                this.play();
            } else {
                this.pause();
            }
        }

    });


    // Calculations
    // -------------------------------------------------- //

    Grid.methods({

        generateTilemap: function(data) {

            var self = this,
                size = this.get("size"),
                tileset = this.get("tileset"),
                type,
                x, y ,z, 
                layer, segment, 
                height, row, depth;

            this.tileSprite = new Sprite(tileset, {
                width: size,
                height: size, 
                target: this.stagingCtx
            });

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

                for (z = 0; map[z]; z++) {

                    for (y = 0, layer = map[z].trim().split("\n"); layer[y]; y++ ) {

                        self.tilemap[y] = self.tilemap[y] || [];

                        for (x = 0, row = [], segment = layer[y].trim(); segment[x]; x += 2) {

                            // Add the value
                            type = parseInt(segment.slice(x, x + 2), encoding);
                            offset = self.calculateTileOffset(type);
                            
                            var tile = self.tilemap[y][x / 2] = self.tilemap[y][x / 2] || new Tile({
                                grid: self,
                                x: x / 2,
                                y: y,
                                width: size,
                                height: size,
                                layers: [0,0,0],

                                sprite: new Sprite(tileset, {
                                    width: size,
                                    height: size, 
                                    target: self.baseCtx,
                                    position: {
                                        x: size * x / 2,
                                        y: size * y
                                    },
                                    offset: offset
                                })
                            });
                            
                            tile.layers[z] = type;

                        }

                    }

                }
                
                // Render output
                // -------------------------------------------------- //

                for (y = 0, height = self.tilemap.length; y < height; y++) {
                    for (x = 0, row = self.tilemap[y], depth = row.length; x < depth; x++) {
                        self.tilemap[y][x].draw();
                    }
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
                x : (canvas.width / this.scale / 2) - size - (scroll.x * 2),
                y : (canvas.height / this.scale / 2) - size - (scroll.y * 2) 
            };

        },

        getTileAt: function(x, y) {

            var size   = this.get('size'),
                center = this.findCenter();

            x = this.canvas.width - (this.canvas.width - x) - center.x;
            y = this.canvas.height - (this.canvas.height - y) - center.y;

            return {
                x: floorTo(x, size) / size,
                y: floorTo(y, size) / size
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
        }

    });
    
    
    // Rendering
    // -------------------------------------------------- //

    Grid.methods({

        fillspace: function() {

            var size = this.get('size');

            this.canvas.width  = roundTo(window.innerWidth, size);
            this.canvas.height = roundTo(window.innerHeight, size);

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

        draw: function() {

            var ctx	= this.ctx,
                center = this.findCenter(),
                layers = this.layers;

            // Clear the current state
            this.clear();

            // Draw the prerendered state
            this.stagingCtx.drawImage(this.base, 0, 0);

            this.emit("refresh");

            // Draw Output
            // -------------------------------------------------- //

            ctx.scale(this.scale, this.scale);

            ctx.drawImage(this.staging, center.x, center.y);
            ctx.drawImage(this.overlay, center.x, center.y);

            // Draw Layers
            this.renderLayers(ctx);

            ctx.scale(1 / this.scale, 1 / this.scale);

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

                    var t = additional[a].tile(),
                        focus = {
                            x: round(t.x),
                            y: round(t.y)
                        };
                    
                    original[a] = tilemap[focus.y][focus.x].layers[1];
                    tilemap[focus.y][focus.x].layers[1] = 1;

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

                    var s = additional[b].tile(),
                        undo = {
                            x: round(s.x),
                            y: round(s.y)
                        };
                    
                    tilemap[undo.y][undo.x].layers[1] = original[b];

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
    
    var Geo     = window.Geo,
        Sprite  = Tilekit.Sprite;

    var round   = Math.round,
        roundTo = Math.roundTo,
        abs     = Math.abs,
        PI      = Math.PI,

        findDistance = Geo.findDistance,
        findPoint    = Geo.findPoint,
        isWithinCone = Geo.isWithinCone,
        requestAnimationFrame = window.requestAnimationFrame;

    var Unit = Tilekit.Unit = Tilekit.Entity.extend();

    // Defaults
    Unit.statics({

        defaults: {

            animation: "stand",

            face: 270,

            health: 100,
            maxHealth: 100,

            path: [],
            position: { x: 0, y: 0 },

            // Senses
            // ------------------------- //

            hearing: 64,
            vision: 96,
            visionCone: 30,

            // Speed
            // ------------------------- //

            attack_speed: 1,
            movement_speed: 2,

            // Attributes
            // ------------------------- //

            strength: 1,
            dexterity: 1,
            intelligence: 1,
            vitality: 1
            
        }

    });
    
    Unit.methods({
        
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

            this.canvas = document.createElement("canvas");
            this.ctx    = this.canvas.getContext('2d');

            this.canvas.width = 2000;
            this.canvas.height = 2000;

            options = options || {};

            if (options.tile) {

                this.set("position", {
                    x: options.tile.x * size,
                    y: options.tile.y * size
                });

            }

            this.sprite = new Sprite(options.image, {
                width: size * 2,
                height: size * 2,
                target: this.ctx,
                padding: size / 2
            });

            if (grid) {
                this.__boundDraw = this.draw.bind(this);
                grid.on('refresh', this.__boundDraw, this);
            }
            
            this.on('draw', function() {
                self.renderLayers(self.ctx);
            });
            
            this.on("change:animation", function(next, prev) {

                if (prev === next) {
                    self.sprite.iterations = 0;
                    return;
                }
                
                var animation = self.animations[next];

                if (animation) {
                    self.sprite.iterations = 0;
                    self.sprite.base_offset.x = animation.offset.x || 0;
                    self.sprite.base_offset.y = animation.offset.y || 0;
                    self.sprite.shift = animation.shift || self.sprite.width;
                    self.sprite.setFrames(animation.frames || 1);
                    self.sprite.setDuration(animation.duration || 1);
                }

            });

            this.on("change:health", function(next, prev) {
                
                var pos   = this.get("position"),
                    size  = this.grid.get("size"),
                    min   = Math.min,
                    max   = Math.max,
                    ratio = min(1, max(0.01, next / this.get("maxHealth")) ),
                    delta = next - prev;
                
                if (next <= 0) {
                    this.death();
                }
                
                // Did we lose health?
                if (next < prev) {
                    
                    // Yes : Flag Damage

                    this.addLayer("pain-" + Date.now(), function(ctx, date, birth) {
                        
                        var now = (date.getTime() - birth) / 1000;
                        
                        Tilekit.Text(ctx, delta, pos.x + (size / 2), pos.y - size * now, { 
                            alpha: min(0.8, 0.1 / now),
                            align: "center",
                            color: "red",
                            font: 8 + (now * 10) + "pt Helvetica"
                        });

                    }, this, 1000);
                    
                    this.addLayer("healthchange", function(ctx, date, birth) {
                        
                        var now = (date.getTime() - birth) / 1000;
                        
                        Tilekit.Rectangle(ctx, pos.x, pos.y, size, size, { 
                            fill: "red",
                            alpha: min(0.6, 0.1 / now),
                            composite: "source-atop"
                        });
                        
                    }, this, 1000);

                } else {

                    // No : Flag Healing

                    this.addLayer("health" + Date.now(), function(ctx, date, birth) {

                        var now = (date.getTime() - birth) / 1000;

                        Tilekit.Rectangle(ctx, pos.x, pos.y, size, size, { 
                            fill: "aquamarine",
                            alpha: min(0.6, 0.1 / now),
                            composite: "source-atop"
                        });
                        
                    }, this, 1000);

                    this.addLayer("pleasure-" + Date.now(), function(ctx, date, birth) {
                        
                        var now = (date.getTime() - birth) / 1000;
                        
                        Tilekit.Text(ctx, delta, pos.x + (size / 2), pos.y - size * now, { 
                            alpha: min(0.8, 0.1 / now),
                            align: "center",
                            color: "green",
                            font: 8 + (now * 10) + "pt Helvetica"
                        });

                    }, this, 1000);
                }

                var color = ["red", "crimson", "crimson", 
                             "orange", "orange", "gold", "yellow",
                             "lime", "lime", "lime"
                            ][round(ratio * 9)];
                
                this.addLayer("healthbar", function(ctx, date, birth) {
                    
                    var pos = this.get("position"),
                        now = (date.getTime() - birth) / 1000;
                    
                    Tilekit.Rectangle(ctx, pos.x, pos.y - size / 4, size, size / 8, { 
                        fill: "black",
                        alpha: 0.7
                    });
                    
                    Tilekit.Rectangle(ctx, pos.x, pos.y - size / 4, size * ratio, size / 8, { 
                        fill: color,
                        stroke: "rgba(0,0,0,0.25)",
                        alpha: 0.7
                    });
                    
                }, this, 1500);
                
            });

            // Attributes
            // -------------------------------------------------- //

            this.attributes = Tilekit.extend({}, Unit.defaults, {
                name: name,
                created_at: Date.now()
            }, this.attributes, options);

            this.layers = Tilekit.extend({}, this.layers);

            this.setFace(this.get("face"));
            

            // Animations
            // -------------------------------------------------- //

            this.animations = {

                stand: {
                    offset: {
                        x: 0,
                        y: 0
                    }
                },

                walk: {
                    frames: 2,
                    duration: 220,
                    offset: {
                        x: size * 2,
                        y: size * 2
                    },
                    shift: size * 2
                },

                attack: {
                    frames: 3,
                    duration: 200,
                    offset: {
                        x: 194,
                        y: size * 2
                    },
                    shift: size * 2,
                    iterations: 1
                },

                spell: {
                    frames: 3,
                    duration: 400,
                    offset: {
                        x: 450,
                        y: size * 2
                    },
                    shift: size * 2,
                    iterations: 1
                }

            };

        }

    });

    // Getters and Setters
    // -------------------------------------------------- //

    Unit.methods({
        getTileFront: function(offset) {
            return findPoint(this.tile(), offset || 1, -this.get("face"));
        },
        getTileBack: function(offset) {
            return findPoint(this.tile(), offset || 1, this.get("face"));
        },
        setFace: function(direction) {

            var face = direction.isUnit ? abs(direction.get("face") - 180) : direction,
                size = this.grid.get('size');

            // What direction are we dealing with?
            switch(direction) {
            case 90  : this.sprite.setOffset(undefined, size * 4); break;
            case 270 : this.sprite.setOffset(undefined, 0); break;
            case 0   : this.sprite.setOffset(undefined, size * 6); break;
            case 180 : this.sprite.setOffset(undefined, size * 2); break;
            }

            this.set("face", face);

            return this;
        }
    });


    // Utilities
    // -------------------------------------------------- //

    Unit.methods({
        toJSON: function() {
            return Tilekit.extend({}, this.attributes, this.tile());
        },
        remove: function() {
            this.grid.removeListener("refresh", this.__boundDraw);
        }
    });

    // Actions
    // -------------------------------------------------- //

    Unit.methods({
        attack: function() {
            this.halt();
            this.set("animation", "attack");
            this.emit("attack", this.getTileFront());
        },
        shoot: function() {
            this.halt();
            this.set("animation", "attack");
            this.emit("attack", this.getTileFront());
        },
        spell: function() {
            this.halt();
            this.set("animation", "spell");
            this.emit("spell", this.tile());
        },
        death: function() {

            var pos = this.get("position"),
                size = this.grid.get("size");

            this.scene.remove(this);

        }
    });

    // Rendering Methods
    // -------------------------------------------------- //

    Unit.methods({

        clear: function() {
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
        },

        draw: function() {
            
            var pos  = this.get("position"),
                anim = this.animations[this.get("animation")];
            
            this.clear();
            
            if (anim.iterations !== 0 && this.sprite.iterations >= anim.iterations) {
                this.set("animation", "stand");
            }

            this.sprite.animate();
            this.sprite.setPosition(pos.x, pos.y).draw();

            this.emit("draw");
            this.grid.stagingCtx.drawImage(this.canvas, 0,0);
            
        }
    });

    // Movement
    // -------------------------------------------------- //

    Unit.methods({

        halt: function(trigger) {

            var size = this.grid.get('size'),
                pos  = this.get('position'),
                tile = this.tile();

            this.set({
                moving: false,
                position: {
                    x: roundTo(pos.x, size),
                    y: roundTo(pos.y, size)
                },
                path: [],
                animation: "stand"
            });

            if (trigger) {
                this.grid.emit("tile:" + tile.x + "," + tile.y);
                this.grid.emit("tile:*," + tile.y);
                this.grid.emit("tile:" + tile.x + ",*");
            }

        },

        move: function move (direction, pan, callback) {
            
            if (this.get("moving")) {
                return false;
            }
            
            this.set("moving", true);

            // We use this function to make sure we are always
            // moving in the correct direction
            var audit = move.__audit = Date.now();

            callback = callback || function(){};
            
            // At the very least, get the character facing in the intended direction
            this.setFace(direction);

            var grid  = this.grid,
                self  = this,
                
                size  = grid.get('size'),
                speed = this.get("movement_speed"),
                pos   = this.get("position"),
                
                delta = findPoint({ x: 0, y: 0 }, 1, -direction),
                goal  = findPoint(pos, size, -direction);

            this.set("animation", "walk");
            
            // Hit detection
            if (this.detectHit(delta.x * size, delta.y * size) ) {
                return this.halt(true);
            }
            
            function animate() {
                
                var shift = round(grid.shift);

                pos.x += delta.x * shift * speed;
                pos.y += delta.y * shift * speed;

                // Do we pan the screen with this character?
                if (pan) {
                    grid.panTo(self.tile());
                }

                if ( pos.x === goal.x && pos.y === goal.y || audit !== move.__audit) {
                    self.halt(true);
                    return callback.apply(self, [Date.now()]);
                }
                
                return requestAnimationFrame(animate);

            }

            animate();

            return this;

        },

        setPath: function fn(destination, options) {
            
            // We use this function to make sure we are always
            // moving in the correct direction
            var audit = fn.__audit = Date.now();
            
            options = options || {};

            var self = this,
                tile = this.tile(),
                path;

            if ( this.is("moving") ) {
                this.halt();
            }

            if (destination.isUnit) {
                destination = destination.tile;
            }

            tile = {
                x : round(tile.x),
                y : round(tile.y)
            };

            path = this.set(
                "path", this.grid.plotCourse(tile, destination, this.scene.units)
            );
            
            function traceSteps() {
                if ( path.length && audit === fn.__audit) {
                    self.move(path.shift(), options.pan, traceSteps);
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

    var findPoint = window.Geo.findPoint;

    var Character = Tilekit.Character = Tilekit.Unit.extend();

    Character.statics({

        defaults: {
            comment: "",
            emote: "",
            movement_speed: 2,
            hearing: 64,
            vision: 96,
            visionCone: 30
        }

    });

    Character.methods({

        showName: false,

        initialize: function(name, scene, options) {

            this.supr(name, scene, options);

            Tilekit.extend(this.attributes, Character.defaults, options);

            var size = scene.grid.get("size");

            this.emote_sprite = new Tilekit.Sprite(Tilekit.defaults.emote_sprite, size, size, 0, 0);

            this.addLayer("emote", function() {

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

            }, this);

            this.addLayer("renderName", function() {

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
            }, this);
        }
    });

}(window.Tilekit));
// Projectile
// -------------------------------------------------- //

(function(TK) {
    
    var Projectile = TK.Entity.extend({
        
        initialize: function(options) {

        }
        
    });
    
    TK.Projectile = Projectile;
    
}(window.Tilekit));
// Scene.js
// -------------------------------------------------- //

(function(Tilekit) {
    
    var Character = Tilekit.Character,
        TextBox = window.Textbox;
    
    var Scene = Tilekit.Scene = window.klass(function(options) {

        options = options || {};
        
        Tilekit.extend(this, {
            units: []
        }, options);

        if (this.units.length) {
            this.add(this.units);
        }

    });

    // Add a player to the map
    Scene.prototype.add = function(options) {

        var slot = 0, c;
        
        // Handle multiple entries
        // -------------------------------------------------- //

        if (options.isArray) {

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

        if (options instanceof Tilekit.Unit) {
            c = this.units[options.get("name")] = options;
            return c;
        }

        // Handle single entries
        // -------------------------------------------------- //
        
        options = Tilekit.extend({}, {
            image: Tilekit.defaults.character_sprite,
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

        if (name instanceof Tilekit.Unit) {
            name = name.get("name");
        }

        if (!this.units[name]) {
            return;
        }

        this.units[name].remove();

        delete this.units[name];
    };

    // Messaging
    // -------------------------------------------------- //

    Scene.prototype.message = function(header, message, callback) {
        
        var grid = this.grid,
            uuid = Date.now();

        callback = callback || function(){};
        
        // Okay, now generate the new message
        this.grid.addLayer("message-" + uuid, function(ctx, date) {
            
            var text = new TextBox({
                header: header,
                subheader: new Array(header.length + 3).join("-"),
                body: message,
                context: grid.c
            });

            text.draw.apply(text);
        });

        $(window).one("keydown", function remove(e) {
            grid.removeLayer("message-" + uuid);
            callback(e);
            return false;
        });        

    };


    // Querying
    // -------------------------------------------------- //

    Scene.prototype.find = function(condition) {
        
        for (var u in this.units) {
            if (this.units.hasOwnProperty(u) && condition(this.units[u])) { 
                return this.units[u];
            }
        }

        return false;

    };

    // Find a character at a specific tile
    Scene.prototype.findAt = function(tile, callback) {

        var tile2;

        for (var c in this.units) {
            
            if (this.units.hasOwnProperty(c) ) {
                
                tile2 = this.units[c].tile();

                if (tile.x === tile2.x && tile.y === tile2.y) {
                    
                    if (callback) {
                        callback(this.units[c]);
                    } else {
                        return this.units[c];
                    }
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
// Battle Mechanics
// -------------------------------------------------- //

(function(TK) {

    // Combat
    // -------------------------------------------------- //
    
    var Battle = TK.Battle = window.klass({
        
        initialize: function(scene) {
            
            if (!scene) { 
                throw new Error("Tilekit::Battle#initialize requires a scene");
            }

            this.scene = scene;
        },
        
        damage: function(tile, amount) {
            
            var target, health;
            target = tile instanceof TK.Unit ? tile : this.scene.findAt(tile);
            
            if (target) {
                health = target.get("health");
                target.set("health", health - amount);
            }
            
        },

        heal: function(tile, amount) {

            var target, health;
            target = tile instanceof TK.Unit ? tile : this.scene.findAt(tile);
            
            if (target) {
                health = target.get("health");
                target.set("health", health + amount);
            }
        }

    });


}(window.Tilekit));