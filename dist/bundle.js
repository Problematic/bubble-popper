webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	window.addEventListener('load', function () {
	    var Phaser = __webpack_require__(4);

	    var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '');

	    game.state.add('Boot', __webpack_require__(1));
	    game.state.add('Preload', __webpack_require__(2));
	    game.state.add('Game', __webpack_require__(3));

	    game.state.start('Boot');
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Phaser = __webpack_require__(4);
	var DataManager = __webpack_require__(8);

	function BootState () {}

	BootState.prototype = {
	    create: function onCreate (game) {
	        game.stage.backgroundColor = 0xFFFFFF;
	        game.stage.disableVisibilityChange = true;
	        game.physics.startSystem(Phaser.Physics.ARCADE);
	        game.plugins.juicy = game.plugins.add(__webpack_require__(9));

	        game.data = new DataManager();
	        game.data.set('score', 0);

	        game.state.start('Preload');
	    }
	};

	module.exports = BootState;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	function PreloadState () {}

	PreloadState.prototype = {
	    preload: function onPreload (game) {
	        game.load.image('bubble', __webpack_require__(13));
	        game.load.image('background', __webpack_require__(14));
	        game.load.audiosprite('bubble-pop', [
	            __webpack_require__(10),
	            __webpack_require__(11)
	        ], __webpack_require__(12));
	    },
	    create: function onCreate () {
	        this.state.start('Game');
	    }
	};

	module.exports = PreloadState;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Phaser = __webpack_require__(4);

	function GameState () {}

	GameState.prototype = {
	    spawnBubble: function (game) {
	        var bubble = this.bubblePool.getFirstDead();
	        if (bubble === null) {
	            console.log('bubble pool is empty');
	            return;
	        }

	        bubble.bringToTop();
	        bubble.alpha = game.rnd.realInRange(0.5, 0.9);

	        bubble.scale.setTo(game.rnd.realInRange(this.settings.minBubbleScale, this.settings.maxBubbleScale));
	        bubble.sizeScoreMod = 1 + (bubble.scale.x - this.settings.maxBubbleScale) / (this.settings.minBubbleScale - this.settings.maxBubbleScale);

	        bubble.tint = game.rnd.pick(this.settings.colors);

	        bubble.reset(game.rnd.realInRange(0 + bubble.width / 2, game.world.width - bubble.width / 2), game.world.height + bubble.height);

	        bubble.speed = game.rnd.realInRange(this.settings.floatTime * this.settings.floatTimeMinMod, this.settings.floatTime * this.settings.floatTimeMaxMod);
	        bubble.speedScoreMod = bubble.speed / this.settings.floatTime;

	        bubble.riseTween = game.add.tween(bubble).to({ y: 0 - bubble.height }, bubble.speed, 'Linear');
	        bubble.riseTween.onComplete.add(function (bubble, tween) {
	            bubble.kill();
	        }, this);
	        bubble.riseTween.start();
	    },
	    popBubble: function (bubble, pointer) {
	        this.bubblePop.play('pop' + this.game.rnd.integerInRange(0, this.settings.soundCount - 1));
	        bubble.riseTween.stop();

	        this.emitter.x = pointer.x;
	        this.emitter.y = pointer.y;
	        this.emitter.explode(this.settings.particleLifespan, 10);

	        this.game.data.increment('score', Math.floor(this.settings.baseScore * bubble.speedScoreMod));

	        bubble.kill();
	        this.game.plugins.juicy.shake(16, 5);
	        this.game.plugins.juicy.overScale(this.scoreText, 1.1);
	    },
	    levelEnd: function (game) {},

	    create: function onCreate (game) {
	        this.settings = {
	            baseScore: 100,
	            poolSize: 25,
	            levelDuration: 1000 * 90,
	            maxFloatTime: 5000,
	            floatTime: 5000,
	            minFloatTime: 2500,
	            floatTimeMinMod: 0.75,
	            floatTimeMaxMod: 1.25,
	            maxSpawnDelay: 1000,
	            minSpawnDelay: 250,
	            minBubbleScale: 2.5,
	            maxBubbleScale: 5,
	            soundCount: 11,
	            particleLifespan: 500,
	            colors: [ 0x1f77b4, 0xaec7e8, 0xff7f0e, 0xffbb78, 0x2ca02c, 0x98df8a, 0xd62728, 0xff9896, 0x9467bd, 0xc5b0d5, 0x8c564b, 0xc49c94, 0xe377c2, 0xf7b6d2, 0x7f7f7f, 0xc7c7c7, 0xbcbd22, 0xdbdb8d, 0x17becf, 0x9edae5 ]
	        };

	        this.background = game.add.sprite(-32, -32, 'background');
	        this.background.width = game.stage.width;
	        this.background.height = game.stage.height;

	        this.bubblePop = game.add.audioSprite('bubble-pop');

	        this.emitter = game.add.emitter(0, 0, 30);
	        this.emitter.makeParticles('bubble');
	        this.emitter.gravity = 500;
	        this.emitter.setAlpha(1, 0.1, this.settings.particleLifespan, Phaser.Easing.Quadratic.easeIn);
	        this.emitter.setScale(0.01, 0.33, 0.01, 0.33, this.settings.particleLifespan);

	        this.bubblePool = game.add.group(game.world, 'bubbles', false, true, Phaser.Physics.ARCADE);
	        this.bubblePool.createMultiple(this.settings.poolSize, 'bubble');
	        this.bubblePool.forEach(function (bubble) {
	            bubble.anchor.setTo(0.5);
	            bubble.inputEnabled = true;
	            bubble.events.onInputDown.add(this.popBubble, this);
	        }, this);

	        this.spawnTimer = game.time.create(false);
	        this.spawnEvent = this.spawnTimer.loop(this.settings.maxSpawnDelay, this.spawnBubble, this, game);
	        this.spawnTimer.start();

	        this.levelTimer = game.time.create(false);
	        this.levelTimer.add(this.settings.levelDuration, this.levelEnd, this, game);
	        this.levelTimer.start();

	        game.add.tween(this.spawnEvent)
	            .to({ delay: this.settings.minSpawnDelay }, this.settings.levelDuration, 'Linear', true);
	        game.add.tween(this.settings)
	            .to({ floatTime: this.settings.minFloatTime }, this.settings.levelDuration, 'Linear', true);

	        var style = {};
	        this.scoreText = game.add.text(25, game.world.height - 50, 'Score: ' + game.score, style);
	        this.timeText = game.add.text(25, game.world.height - 80, 'Time: ' + (this.levelTimer.duration / 1000), style);
	    },
	    update: function (game) {
	        this.scoreText.setText('Score: ' + Math.floor(game.data.get('score')));
	        this.timeText.setText('Time: ' + Math.floor(this.levelTimer.duration / 1000));
	    }
	};

	module.exports = GameState;


/***/ },
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	function DataManager (instanceMethods) {
	    var manager = new Map();
	    var prop;

	    for (prop in DataManager.prototype) {
	        if (DataManager.prototype.hasOwnProperty(prop)) {
	            manager[prop] = DataManager.prototype[prop];
	        }
	    }

	    instanceMethods = instanceMethods || {};
	    for (prop in instanceMethods) {
	        if (instanceMethods.hasOwnProperty(prop)) {
	            manager[prop] = instanceMethods[prop];
	        }
	    }

	    return manager;
	}

	DataManager.prototype = {
	    increment: function (key, by) {
	        var val = this.get(key) + by;
	        this.set(key, val);

	        return val;
	    }
	};

	module.exports = DataManager;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/*global Phaser */

	'use strict';


	/**
	* @author       Jeremy Dowell <jeremy@codevinsky.com>
	* @license      {@link http://www.wtfpl.net/txt/copying/|WTFPL}
	*/

	/**
	* Creates a new `Juicy` object.
	*
	* @class Phaser.Plugin.Juicy
	* @constructor
	*
	* @param {Phaser.Game} game Current game instance.
	*/
	Phaser.Plugin.Juicy = function (game) {

	    Phaser.Plugin.call(this, game);

	    /**
	    * @property {Phaser.Rectangle} _boundsCache - A reference to the current world bounds.
	    * @private
	    */
	    this._boundsCache = Phaser.Utils.extend(false, {}, this.game.world.bounds);

	    /**
	    * @property {number} _shakeWorldMax - The maximum world shake radius
	    * @private
	    */
	    this._shakeWorldMax = 20;

	    /**
	    * @property {number} _shakeWorldTime - The maximum world shake time
	    * @private
	    */
	    this._shakeWorldTime = 0;

	    /**
	    * @property {number} _trailCounter - A count of how many trails we're tracking
	    * @private
	    */
	    this._trailCounter = 0;

	    /**
	    * @property {object} _overScales - An object containing overscaling configurations
	    * @private
	    */
	    this._overScales = {};

	    /**
	    * @property {number} _overScalesCounter - A count of how many overScales we're tracking
	    * @private
	    */
	    this._overScalesCounter = 0;
	};


	Phaser.Plugin.Juicy.prototype = Object.create(Phaser.Plugin.prototype);
	Phaser.Plugin.Juicy.prototype.constructor = Phaser.Plugin.Juicy;



	/**
	* Creates a new `Juicy.ScreenFlash` object.
	*
	* @class Phaser.Plugin.Juicy.ScreenFlash
	* @constructor
	*
	* @param {Phaser.Game} game -  Current game instance.
	* @param {string} color='white' - The color to flash the screen.
	* @memberof Phaser.Plugin.Juicy
	*/
	Phaser.Plugin.Juicy.ScreenFlash = function(game, color) {
	    color = color || 'white';
	    var bmd = game.add.bitmapData(game.width, game.height);
	    bmd.ctx.fillStyle = color;
	    bmd.ctx.fillRect(0,0, game.width, game.height);

	    Phaser.Sprite.call(this, game, 0,0, bmd);
	    this.alpha = 0;
	};

	Phaser.Plugin.Juicy.ScreenFlash.prototype = Object.create(Phaser.Sprite.prototype);
	Phaser.Plugin.Juicy.ScreenFlash.prototype.constructor = Phaser.Plugin.Juicy.ScreenFlash;


	/*
	* Flashes the screen
	*
	* @param {number} [maxAlpha=1] - The maximum alpha to flash the screen to
	* @param {number} [duration=100] - The duration of the flash in milliseconds
	* @method Phaser.Plugin.Juicy.ScreenFlash.prototype.flash
	* @memberof Phaser.Plugin.Juicy.ScreenFlash
	*/
	Phaser.Plugin.Juicy.ScreenFlash.prototype.flash = function(maxAlpha, duration) {
	    maxAlpha = maxAlpha || 1;
	    duration = duration || 100;
	    var flashTween = this.game.add.tween(this).to({alpha: maxAlpha}, 100, Phaser.Easing.Bounce.InOut, true,0, 0, true);
	    flashTween.onComplete.add(function() {
	        this.alpha = 0;
	    }, this);
	};

	/**
	* Creates a new `Juicy.Trail` object.
	*
	* @class Phaser.Plugin.Juicy.Trail
	* @constructor
	*
	* @param {Phaser.Game} game -  Current game instance.
	* @param {number} [trailLength=100] - The length of the trail
	* @param {number} [color=0xFFFFFF] - The color of the trail
	* @memberof Phaser.Plugin.Juicy
	*/
	Phaser.Plugin.Juicy.Trail = function(game, trailLength, color) {
	    Phaser.Graphics.call(this, game, 0,0);

	    /**
	    * @property {Phaser.Sprite} target - The target sprite whose movement we want to create the trail from
	    */
	    this.target = null;
	    /**
	    * @property {number} trailLength - The number of segments to use to create the trail
	    */
	    this.trailLength = trailLength || 100;
	    /**
	    * @property {number} trailWidth - The width of the trail
	    */
	    this.trailWidth = 15.0;

	    /**
	    * @property {boolean} trailScale - Whether or not to taper the trail towards the end
	    */
	    this.trailScaling = false;

	    /**
	    * @property {Phaser.Sprite} trailColor - The color of the trail
	    */
	    this.trailColor = color || 0xFFFFFF;

	    /**
	    * @property {Array<Phaser.Point>} _segments - A historical collection of the previous position of the target
	    * @private
	    */
	    this._segments = [];
	    /**
	    * @property {Array<number>} _verts - A collection of vertices created from _segments
	    * @private
	    */
	    this._verts = [];
	    /**
	    * @property {Array<Phaser.Point>} _segments - A collection of indices created from _verts
	    * @private
	    */
	    this._indices = [];

	};

	Phaser.Plugin.Juicy.Trail.prototype = Object.create(Phaser.Graphics.prototype);
	Phaser.Plugin.Juicy.Trail.prototype.constructor = Phaser.Plugin.Juicy.Trail;

	/**
	* Updates the Trail if a target is set
	*
	* @method Phaser.Plugin.Juicy.Trail#update
	* @memberof Phaser.Plugin.Juicy.Trail
	*/

	Phaser.Plugin.Juicy.Trail.prototype.update = function() {
	    if(this.target) {
	        this.x = this.target.x;
	        this.y = this.target.y;
	        this.addSegment(this.target.x, this.target.y);
	        this.redrawSegments(this.target.x, this.target.y);
	    }
	};

	/**
	* Adds a segment to the segments list and culls the list if it is too long
	*
	* @param {number} [x] - The x position of the point
	* @param {number} [y] - The y position of the point
	*
	* @method Phaser.Plugin.Juicy.Trail#addSegment
	* @memberof Phaser.Plugin.Juicy.Trail
	*/
	Phaser.Plugin.Juicy.Trail.prototype.addSegment = function(x, y) {
	    var segment;

	    while(this._segments.length > this.trailLength) {
	        segment = this._segments.shift();
	    }
	    if(!segment) {
	        segment = new Phaser.Point();
	    }

	    segment.x = x;
	    segment.y = y;

	    this._segments.push(segment);
	};


	/**
	* Creates and draws the triangle trail from segments
	*
	* @param {number} [offsetX] - The x position of the object
	* @param {number} [offsetY] - The y position of the object
	*
	* @method Phaser.Plugin.Juicy.Trail#redrawSegment
	* @memberof Phaser.Plugin.Juicy.Trail
	*/
	Phaser.Plugin.Juicy.Trail.prototype.redrawSegments = function(offsetX, offsetY) {
	    this.clear();
	    var s1, // current segment
	    s2, // previous segment
	    vertIndex = 0, // keeps track of which vertex index we're at
	    offset, // temporary storage for amount to extend line outwards, bigger = wider
	    ang, //temporary storage of the inter-segment angles
	    sin = 0, // as above
	    cos = 0; // again as above

	    // first we make sure that the vertice list is the same length as we we want
	    // each segment (except the first) will create to vertices with two values each
	    if (this._verts.length !== (this._segments.length -1) * 4) {
	        // if it's not correct, we clear the entire list
	        this._verts = [];
	    }

	    // now we loop over all the segments, the list has the "youngest" segment at the end
	    var prevAng = 0;

	    for(var j = 0; j < this._segments.length; ++j) {
	        // store the active segment for convenience
	        s1 = this._segments[j];

	        // if there's a previous segment, time to do some math
	        if(s2) {
	            // we calculate the angle between the two segments
	            // the result will be in radians, so adding half of pi will "turn" the angle 90 degrees
	            // that means we can use the sin and cos values to "expand" the line outwards
	            ang = Math.atan2(s1.y - s2.y, s1.x - s2.x) + Math.PI / 2;
	            sin = Math.sin(ang);
	            cos = Math.cos(ang);

	            // now it's time to creat ethe two vertices that will represent this pair of segments
	            // using a loop here is probably a bit overkill since it's only two iterations
	            for(var i = 0; i < 2; ++i) {
	                // this makes the first segment stand out to the "left" of the line
	                // annd the second to the right, changing that magic number at the end will alther the line width
	                offset = ( -0.5 + i / 1) * this.trailWidth;

	                // if trail scale effect is enabled, we scale down the offset as we move down the list
	                if(this.trailScaling) {
	                    offset *= j / this._segments.length;
	                }

	                // finally we put to values in the vert list
	                // using the segment coordinates as a base we add the "extended" point
	                // offsetX and offsetY are used her to move the entire trail
	                this._verts[vertIndex++] = s1.x + cos * offset - offsetX;
	                this._verts[vertIndex++] = s1.y + sin * offset - offsetY;
	            }
	        }
	        // finally store the current segment as the previous segment and go for another round
	        s2 = s1.copyTo({});
	    }
	    // we need at least four vertices to draw something
	    if(this._verts.length >= 8) {
	        // now, we have a triangle "strip", but flash can't draw that without
	        // instructions for which vertices to connect, so it's time to make those

	        // here, we loop over all the vertices and pair them together in triangles
	        // each group of four vertices forms two triangles
	        for(var k = 0; k < this._verts.length; k++) {
	            this._indices[k * 6 + 0] = k * 2 + 0;
	            this._indices[k * 6 + 1] = k * 2 + 1;
	            this._indices[k * 6 + 2] = k * 2 + 2;
	            this._indices[k * 6 + 3] = k * 2 + 1;
	            this._indices[k * 6 + 4] = k * 2 + 2;
	            this._indices[k * 6 + 5] = k * 2 + 3;
	        }
	        this.beginFill(this.trailColor);
	        this.drawTriangles(this._verts, this._indices);
	        this.endFill();

	    }
	};






	/**
	* Add a Sprite reference to this Plugin.
	* All this plugin does is move the Sprite across the screen slowly.
	* @type {Phaser.Sprite}
	*/

	/**
	* Begins the screen shake effect
	*
	* @param {number} [duration=20] - The duration of the screen shake
	* @param {number} [strength=20] - The strength of the screen shake
	*
	* @method Phaser.Plugin.Juicy#redrawSegment
	* @memberof Phaser.Plugin.Juicy
	*/
	Phaser.Plugin.Juicy.prototype.shake = function (duration, strength) {
	    this._shakeWorldTime = duration || 20;
	    this._shakeWorldMax = strength || 20;
	    this.game.world.setBounds(this._boundsCache.x - this._shakeWorldMax, this._boundsCache.y - this._shakeWorldMax, this._boundsCache.width + this._shakeWorldMax, this._boundsCache.height + this._shakeWorldMax);
	};


	/**
	* Creates a 'Juicy.ScreenFlash' object
	*
	* @param {string} color - The color of the screen flash
	*
	* @type {Phaser.Plugin.Juicy.ScreenFlash}
	*/

	Phaser.Plugin.Juicy.prototype.createScreenFlash = function(color) {
	    return new Phaser.Plugin.Juicy.ScreenFlash(this.game, color);
	};


	/**
	* Creates a 'Juicy.Trail' object
	*
	* @param {number} length - The length of the trail
	* @param {number} color - The color of the trail
	*
	* @type {Phaser.Plugin.Juicy.Trail}
	*/
	Phaser.Plugin.Juicy.prototype.createTrail = function(length, color) {
	    return new Phaser.Plugin.Juicy.Trail(this.game, length, color);
	};


	/**
	* Creates the over scale effect on the given object
	*
	* @param {Phaser.Sprite} object - The object to over scale
	* @param {number} [scale=1.5] - The scale amount to overscale by
	* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
	*
	*/
	Phaser.Plugin.Juicy.prototype.overScale = function(object, scale, initialScale) {
	    scale = scale || 1.5;
	    var id = this._overScalesCounter++;
	    initialScale = initialScale || new Phaser.Point(1,1);
	    var scaleObj = this._overScales[id];
	    if(!scaleObj) {
	        scaleObj = {
	            object: object,
	            cache: initialScale.copyTo({})
	        };
	    }
	    scaleObj.scale = scale;

	    this._overScales[id] = scaleObj;
	};

	/**
	* Creates the jelly effect on the given object
	*
	* @param {Phaser.Sprite} object - The object to gelatinize
	* @param {number} [strength=0.2] - The strength of the effect
	* @param {number} [delay=0] - The delay of the snap-back tween. 50ms are automaticallly added to whatever the delay amount is.
	* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
	*
	*/
	Phaser.Plugin.Juicy.prototype.jelly = function(object, strength, delay, initialScale) {
	    strength = strength || 0.2;
	    delay = delay || 0;
	    initialScale = initialScale ||  new Phaser.Point(1, 1);

	    this.game.add.tween(object.scale).to({x: initialScale.x + (initialScale.x * strength)}, 50, Phaser.Easing.Quadratic.InOut, true, delay)
	    .to({x: initialScale.x}, 600, Phaser.Easing.Elastic.Out, true);

	    this.game.add.tween(object.scale).to({y: initialScale.y + (initialScale.y * strength)}, 50, Phaser.Easing.Quadratic.InOut, true, delay + 50)
	    .to({y: initialScale.y}, 600, Phaser.Easing.Elastic.Out, true);
	};

	/**
	* Creates the mouse stretch effect on the given object
	*
	* @param {Phaser.Sprite} object - The object to mouse stretch
	* @param {number} [strength=0.5] - The strength of the effect
	* @param {Phaser.Point} [initialScale=new Phaser.Point(1,1)] - The initial scale of the object
	*
	*/
	Phaser.Plugin.Juicy.prototype.mouseStretch = function(object, strength, initialScale) {
	    strength = strength || 0.5;
	    initialScale = initialScale || new Phaser.Point(1,1);
	    object.scale.x = initialScale.x + (Math.abs(object.x - this.game.input.activePointer.x) / 100) * strength;
	    object.scale.y = initialScale.y + (initialScale.y * strength) - (object.scale.x * strength);
	};

	/**
	* Runs the core update function and causes screen shake and overscaling effects to occur if they are queued to do so.
	*
	* @method Phaser.Plugin.Juicy#update
	* @memberof Phaser.Plugin.Juicy
	*/
	Phaser.Plugin.Juicy.prototype.update = function () {
	    var scaleObj;
	    // Screen Shake
	    if(this._shakeWorldTime > 0) {
	        var magnitude = (this._shakeWorldTime / this._shakeWorldMax) * this._shakeWorldMax;
	        var x = this.game.rnd.integerInRange(-magnitude, magnitude);
	        var y = this.game.rnd.integerInRange(-magnitude, magnitude);

	        this.game.camera.x = x;
	        this.game.camera.y = y;
	        this._shakeWorldTime--;
	        if(this._shakeWorldTime <= 0) {
	            this.game.world.setBounds(this._boundsCache.x, this._boundsCache.x, this._boundsCache.width, this._boundsCache.height);
	        }
	    }

	    // over scales
	    for(var s in this._overScales) {
	        if(this._overScales.hasOwnProperty(s)) {
	            scaleObj = this._overScales[s];
	            if(scaleObj.scale > 0.01) {
	                scaleObj.object.scale.x = scaleObj.scale * scaleObj.cache.x;
	                scaleObj.object.scale.y = scaleObj.scale * scaleObj.cache.y;
	                scaleObj.scale -= this.game.time.elapsed * scaleObj.scale * 0.35;
	            } else {
	                scaleObj.object.scale.x = scaleObj.cache.x;
	                scaleObj.object.scale.y = scaleObj.cache.y;
	                delete this._overScales[s];
	            }
	        }
	    }
	};

	// for browserify compatibility
	if(typeof module === 'object' && module.exports) {
	    module.exports = Phaser.Plugin.Juicy;
	}



	// Draw Triangles Polyfill for back compatibility
	if(!Phaser.Graphics.prototype.drawTriangle) {
	    Phaser.Graphics.prototype.drawTriangle = function(points, cull) {
	        var triangle = new Phaser.Polygon(points);
	        if (cull) {
	            var cameraToFace = new Phaser.Point(this.game.camera.x - points[0].x, this.game.camera.y - points[0].y);
	            var ab = new Phaser.Point(points[1].x - points[0].x, points[1].y - points[0].y);
	            var cb = new Phaser.Point(points[1].x - points[2].x, points[1].y - points[2].y);
	            var faceNormal = cb.cross(ab);
	            if (cameraToFace.dot(faceNormal) > 0) {
	                this.drawPolygon(triangle);
	            }
	        } else {
	            this.drawPolygon(triangle);
	        }
	        return;
	    };

	    /*
	    * Draws {Phaser.Polygon} triangles
	    *
	    * @param {Array<Phaser.Point>|Array<number>} vertices - An array of Phaser.Points or numbers that make up the vertices of the triangles
	    * @param {Array<number>} {indices=null} - An array of numbers that describe what order to draw the vertices in
	    * @param {boolean} [cull=false] - Should we check if the triangle is back-facing
	    * @method Phaser.Graphics.prototype.drawTriangles
	    */

	    Phaser.Graphics.prototype.drawTriangles = function(vertices, indices, cull) {

	        var point1 = new Phaser.Point(),
	        point2 = new Phaser.Point(),
	        point3 = new Phaser.Point(),
	        points = [],
	        i;

	        if (!indices) {
	            if(vertices[0] instanceof Phaser.Point) {
	                for(i = 0; i < vertices.length / 3; i++) {
	                    this.drawTriangle([vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]], cull);
	                }
	            } else {
	                for (i = 0; i < vertices.length / 6; i++) {
	                    point1.x = vertices[i * 6 + 0];
	                    point1.y = vertices[i * 6 + 1];
	                    point2.x = vertices[i * 6 + 2];
	                    point2.y = vertices[i * 6 + 3];
	                    point3.x = vertices[i * 6 + 4];
	                    point3.y = vertices[i * 6 + 5];
	                    this.drawTriangle([point1, point2, point3], cull);
	                }

	            }
	        } else {
	            if(vertices[0] instanceof Phaser.Point) {
	                for(i = 0; i < indices.length /3; i++) {
	                    points.push(vertices[indices[i * 3 ]]);
	                    points.push(vertices[indices[i * 3 + 1]]);
	                    points.push(vertices[indices[i * 3 + 2]]);
	                    if(points.length === 3) {
	                        this.drawTriangle(points, cull);
	                        points = [];
	                    }

	                }
	            } else {
	                for (i = 0; i < indices.length; i++) {
	                    point1.x = vertices[indices[i] * 2];
	                    point1.y = vertices[indices[i] * 2 + 1];
	                    points.push(point1.copyTo({}));
	                    if (points.length === 3) {
	                        this.drawTriangle(points, cull);
	                        points = [];
	                    }
	                }
	            }
	        }
	    };
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "e14b54730d3a6d14d46106aad3caaa0b.ogg"

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "d2607ff9c131212489688e10df63d054.mp3"

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "81195b9d233761fcee6be5ec68c5b40e.json"

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAoklEQVRYR+2XSw6AMAgF5f6H1mqCQYTSf1nQtfaN06Ty4KhcZ1q5VyCtmi2LHrZCtcASGBOgNRyhLAgVoDeYW9FARIDR4TkbP4BZ4RrEB2B2uAThB2DV13MLj4HV4RQiAGCX/vcYAiAMhIHtBuIqdmFgBwTOiH4GkpUW6ITsayjFX+Ssu0HqBj6LCW01vTaaq9kICCv8zjDLKe94lpGSULrnBUwQgAHoDBvgAAAAAElFTkSuQmCC"

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "63225d14e463cadf8ea45fa7b3d1a4d4.jpg"

/***/ }
]);