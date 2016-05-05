
(function (undefined) {
    "use strict";

    var stringEmpty = "",
        toString = Object.prototype.toString,
        core_hasOwn = Object.prototype.hasOwnProperty,
        noop = function () { },
        slice = Array.prototype.slice;

    var _htmlDivTarget = null,
    _getHtmlDivTarget = function () {
        return _htmlDivTarget || (_htmlDivTarget = document.createElement('div'));
    };

    var _makeAutoIdTemp = 0, _makeAutoIdTempPointer = 0;

    var _config = {};

    var bingo = window.bingo = {
        //主版本号.子版本号.修正版本号.编译版本号(日期)
        version: { major: 2, minor: 0, rev: 0, build: 'beta1', toString: function () { return [this.major, this.minor, this.rev, this.build].join('.'); } },
        _no_observe:true,//防止observe
        isDebug: false,
        prdtVersion: '',
        supportWorkspace: false,
        stringEmpty: stringEmpty,
        noop: noop,
        config: function (opt) {
            if (arguments.length == 0)
                return _config;
            this.extend(_config, opt);
            this.bgTrigger('config', [_config]);
        },
        hasOwnProp: function (obj, prop) {
            return core_hasOwn.call(obj, prop);
        },
        trace: function (e) {
            console.error && console.error(e.stack || e.message || e+'');
        },
        isType: function (typename, value) {
            //typename:String, Array, Boolean, Object, RegExp, Date, Function,Number //兼容
            //typename:Null, Undefined,Arguments    //IE不兼容
            return toString.apply(value) === '[object ' + typename + ']';
        },
        isUndefined: function (obj) {
            ///<summary>是否定义</summary>

            return (typeof (obj) === "undefined" || obj === undefined);
        },
        isNull: function (obj) {
            ///<summary>是否Null</summary>

            return (obj === null || this.isUndefined(obj));
        },
        isBoolean: function (obj) {
            return this.isType("Boolean", obj);
        },
        isNullEmpty: function (s) {
            return (this.isNull(s) || s === stringEmpty);
        },
        isFunction: function (fun) {
            return this.isType("Function", fun);
        },
        isNumeric: function (n) {
            //return this.isType("Number", n) && !isNaN(n) && isFinite(n);;
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        isString: function (obj) {
            return this.isType("String", obj);
        },
        isObject: function (obj) {
            return !this.isNull(obj) && this.isType("Object", obj)
                && !this.isElement(obj) && !this.isWindow(obj);//IE8以下isElement, isWindow认为Object
        },
        isPlainObject: function (obj) {
            if (!this.isObject(obj)) {
                return false;
            }
            try {
                // Not own constructor property must be Object
                if (obj.constructor &&
                    !core_hasOwn.call(obj, "constructor") &&
                    !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            var key;
            for (key in obj) { }

            return key === undefined || core_hasOwn.call(obj, key);
        },
        isArray: function (value) {
            return Array.isArray ? Array.isArray(value) : this.isType("Array", value);
        },
        isWindow: function (obj) { return !!(obj && obj == obj.window); },
        isElement: function (obj) { var t = obj && (obj.ownerDocument || obj).documentElement; return t ? true : false; },
        trim: function (str) {
            return this.isString(str) ? str.replace(/(^\s*)|(\s*$)|(^\u3000*)|(\u3000*$)|(^\ue4c6*)|(\ue4c6*$)/g, '') : this.isNull(str) ? '' : str.toString();
        },
        replaceAll: function (s, str, repl, flags) {
            if (this.isNullEmpty(s) || this.isNullEmpty(str)) return s;
            str = str.replace(/([^A-Za-z0-9])/g, "\\$1");
            s = s.replace(new RegExp(str, flags || "g"), repl);
            return s;
        },
        toStr: function (p) { return this.isNull(p) ? '' : p.toString(); },
        sliceArray: function (p, index, count) {
            if (!p) return [];
            var args = slice.call(arguments, 1);
            return slice.apply(p, args);
        },
        inArray: function (p, list) {
            var index = -1;
            if (this.isFunction(p))
                list.some(function (e, i) { if (p.apply(e, arguments) === true) { index = i; return true; } });
            else
                index = list.indexOf(p);
            return index;
        },
        removeArrayItem: function (ele, list) {
            var isF = bingo.isFunction(ele);
            return list.filter(function (item) { return isF ? !ele.apply(this, arguments) : item != ele; });
        },
        makeAutoId: function () {
            var time = new Date().valueOf();
            _makeAutoIdTempPointer = (time == _makeAutoIdTemp) ? _makeAutoIdTempPointer + 1 : 0;
            _makeAutoIdTemp = time;
            return [time, _makeAutoIdTempPointer].join('_');
        },
        each: function (list, callback, thisArg) {
            //callback(element, index, array){this === data;}
            //过程中改变list长度， 不会影响遍历长度, 但内容会变
            if (!list || !callback) return;
            bingo.isArray(list) || (list = this.sliceArray(list));
            list.some(function (item) {
                return (callback.apply(thisArg || item, arguments) === false);
            });
        },
        eachProp: function (obj, callback, thisArg) {
            /// <summary>
            /// eachProp({}, function(item, name, obj){}, thisArg);
            /// </summary>
            if (!obj || !callback) return;
            var item;
            this.each(Object.keys(obj), function (n) {
                item = this[n];
                return callback.call(thisArg || item, item, n, this);
            }, obj);
        },
        htmlEncode: function (str) {
            if (this.isNullEmpty(str)) return "";
            var node = _getHtmlDivTarget();
            node.textContent = str;
            return node.innerHTML;
        },
        htmlDecode: function (str) {
            if (this.isNullEmpty(str)) return "";
            var node = _getHtmlDivTarget();
            node.innerHTML = str;
            return node.textContent;
        },
        extend: function (obj) {
            var len = arguments.length;
            if (len == 1) {
                this.eachProp(obj, function (item, n0) {
                    this[n0] = item;
                }, this);
                return this;
            }
            var args = this.sliceArray(arguments, 1);
            bingo.each(args, function (ot) {
                ot && this.eachProp(ot, function (item, n) {
                    obj[n] = item;
                });
            }, this);
            return obj;
        },
        Class: function (fn) {
            var def = function () {
                var p = this._bgpro_;
                p && (this._bgpro_ = bingo.extend({}, p));
                this._bgpri_ = new pri();
                init && init.apply(this, arguments);
            }, prototype = def.prototype,
            init = null,
            pri = function () { }, pritype = pri.prototype,
                defObj = {
                    Prop: function (p) {
                        prototype._bgpro_ = bingo.extend(prototype._bgpro_ || {}, p);
                        bingo.eachProp(p, function (item, n) {
                            prototype[n] = function (val) {
                                if (arguments.length == 0)
                                    return this._bgpro_[n];
                                else {
                                    this._bgpro_[n] = val;
                                    return this;
                                }
                            };
                        }, this);
                    },
                    Event: function (s) { prototype.bgEventDef(s); },
                    Define: function (p) {
                        bingo.extend(prototype, p);
                    },
                    Private: function (p) {
                        bingo.extend(pritype, p);
                    },
                    Init: function (fn) { init = fn; }
                };
            fn.call(defObj);
            bingo.extend(prototype, {
                Extend: function (p) { bingo.extend(this, p); },
                Private: function (p) { bingo.extend(this._bgpri_, p); }
            });

            def.constructor = def;
            return def;
        },
        proxy: function (thisArg, fn) {
            return function() { return fn && fn.apply(thisArg, arguments); };
        },
        _splitEvName: function (eventName) {
            return bingo.isString(eventName)
                ? (bingo.isNullEmpty(eventName) ? null : bingo.trim(eventName).split(/\s+/g).map(function (item) { return bingo.trim(item); }))
                : eventName;
        }
    };

    var _getProp = function (p, writable) {
        return {
            configurable: false,
            enumerable: false,
            value: p,
            writable: writable !== false
        };
    };
    Object.defineProperties(Object.prototype,{
        "bgDefProp": _getProp(function (prop, val, writable) {
            Object.defineProperty(this, prop, _getProp(val, writable));
            return this;
        }),
        "bgDefProps":_getProp( function (p) {
            var def = {};
            bingo.eachProp(p, function (item, n) {
                def[n] = _getProp(item);
            }, this);
            Object.defineProperties(this, def);
            return this;
        })
    });

    //解决多版共存问题
    var majVer = ['bingoV' + bingo.version.major].join(''),
        minorVer = [majVer, bingo.version.minor].join('_');
    window[majVer] = window[minorVer] = bingo;

})();

(function (bingo, undefined) {
    "use strict";

    //Promises/A+

    var _fulfilled = 'fulfilled', _rejected = 'rejected', _pending = 'pending';

    var Promise = function (fn) {
        return new Promise.fn._init(fn);
    }, _isPromise = function (p) {
        return p && !!p.then;
    };
    Promise.fn = Promise.prototype = {
        constructor: Promise,
        _init : function (fn, fn1) {

            this.state = _pending;
            this._thenH = [];

            try {
                fn(function (result) {
                    this._doNext(result, _fulfilled);
                }.bind(this), function (result) {
                    this._doNext(result, _rejected);
                }.bind(this));
            } catch (e) {
                this._doNext(e, _rejected);
            }
            return this;
        },
        then: function (resolveFn, rejectFn) {
            if (this._thenH) {
                this._thenH.push([resolveFn, rejectFn]);
                if (this.state != _pending) {
                    this._doNext(this._result, this.state);
                }
            }
            return this;
        },
        _end: function () {
            this._thenH = null;
        },
        _doNext: function (res, type) {
            if (res && bingo.isFunction(res.then)) {
                if (res.state == _rejected && !res._thenH) {
                    this.state = type;
                    this._result = null;
                    this._end();
                    return;
                }
                this.state = _pending;
                this._result = undefined;
                res.then(function (res) {
                    this._doNext(res, _fulfilled);
                }.bind(this)).catch(function (res) {
                    this._doNext(res, _rejected);
                }.bind(this));
                return;
            } else {
                this.state = type;
                this._result = res;
            }
            if (this._thenH.length == 0) return;
            this._doThenNext(res, type);
        },
        _doThenNext: function (res, type) {
            var thenH = this._thenH.shift()[type == _fulfilled ? 0 : 1];

            switch (type) {
                case _fulfilled:
                    try {
                        res = bingo.isFunction(thenH) ? thenH(res) : res;
                    } catch (e) {
                        res = e;
                    }
                    if (res instanceof Error) {
                        this._doNext(res, _rejected);
                        bingo.trace(res);
                    } else
                        this._doNext(res, _fulfilled);
                    break;
                case _rejected:
                    if (bingo.isFunction(thenH)) {
                        this._end();
                        thenH(res);
                    } else
                        this._doNext(res, _rejected);
                    break;
            }
        },
        'catch': function (fn) {
            return this.then(null, fn);
        },
        'finally': function (fn) {
            return this.then(fn, fn);
        }
    };
    Promise.fn._init.prototype = Promise.fn;

    bingo.extend(Promise, {
        resolve: function (arg) {
            return Promise(function (resolve) { resolve(arg); });
        },
        reject: function (arg) {
            return Promise(function (resolve, reject) { reject(arg); });
        },
        //所有resolve才返回resolve, 否则返回reject
        //all([1, 2,...], function(p){ return bingo.Promise.resolve(p);}).then
        //all([promise1, promise1,...]).then
        all: function (args, fn, alway) {
            return Promise(function (resolve, reject) {
                var list = _makeArgs(args, fn);
                var resList = [], len = list.length;
                if (list.length > 0) {
                    bingo.each(list, function (item, index) {
                        if (_isPromise(item)) {
                            var tFn = function (res) {
                                resList[index] = res;
                                (--len) || resolve(resList);
                            };
                            item.then(tFn, alway ? tFn : reject);
                        } else {
                            resList[index] = item;
                            (--len) || resolve(resList);
                        }
                    });
                } else
                    resolve(resList);
            });
        },
        //有一个reject或resolve都返回reject或resolve
        //race([1, 2,...], function(p){ return bingo.Promise.resolve(p);}).then
        //race([promise1, promise1,...]).then
        race: function (args, fn) {
            return Promise(function (resolve, reject) {
                var list = _makeArgs(args, fn);
                if (list.length > 0)
                    bingo.each(list, function (item, index) {
                        if (_isPromise(item))
                            item.then(resolve, reject);
                        else
                            resolve(item);
                    });
                else
                    resolve();
            });
        },
        //执行全部promise无论成功失败
        always: function (args, fn) {
            return this.all(args, fn, true);
        }
    });
    var _makeArgs = function (args, fn) {
        args = bingo.sliceArray(args);
        args.length == 0 && (args = [args]);
        if (!fn) return args;
        var list = [];
        bingo.each(args, function (item, index) {
            list.push(fn(item, index));
        });
        return list;
    };
    Promise.when = Promise.all;

    Promise.isPromise = _isPromise;
    bingo.Promise = Promise;

    bingo.Deferred = function () {
        var deferred = {
            promise: function () {
                return promise;
            }
        };

        var promise = Promise(function (resolve, reject) {
            deferred.resolve = function (p) {
                /// <summary>
                /// 解决
                /// </summary>
                resolve(p);
            };
            deferred.reject = function (p) {
                /// <summary>
                /// 拒绝
                /// </summary>
                reject(p);
            };
        });
        return deferred;
    };

})(bingo);

//reverse,splice,push,pop

//every() 方法测试数组的所有元素是否都通过了指定函数的测试。

(function (bingo, undefined) {
    "use strict";

    var _bgevsn = '_bg_evs_', _noop = bingo.noop, _emptyEvent = {
        trigger: _noop, end: _noop, off: _noop
    }, _getEvent = function (o, eventName, isBuild) {
        var events = o[_bgevsn] || (o[_bgevsn] = {});
        return isBuild === true ? (events[eventName] || (events[eventName] = _defEvent()))
            : (events[eventName] || _emptyEvent);
    }, _defEvent = function () {
        return {
            isEnd: false,
            list: [],
            on: function (callback, owner, isOne) {
                if (callback) {
                    if (this.isEnd)
                        callback && callback.call(owner);
                    else
                        this.list.push({ one: isOne === true, callback: callback });
                }
            },
            off: function (callback) {
                if (!callback)
                    this.list = [];
                else
                    this.list = this.list.filter(function (item) {
                        return item.callback != callback;
                    });
            },
            end: function (owner) {
                try {
                    this.trigger(undefined, owner);
                    this.off();
                } finally {
                    this.isEnd = true;
                }
            },
            trigger: function (args, owner, isHandler) {
                var list = this.list, hasOne = false, ret;
                bingo.each(list, function (item) {
                    if (item.one === true)
                        hasOne = true;
                    if ((ret = item.callback.apply(owner, args || [])) === false) return false;
                    if (isHandler === true) return false;
                });
                if (hasOne)
                    this.list = list.filter(function (item) {
                        return !item.one;
                    });
                return ret;
            }
        };
    }, _splitEvName = bingo._splitEvName, _rmEvent = function (o) {
        var events = o[_bgevsn];
        if (events) {
            o.bgOff(Object.keys(events).join(' '));
            o[_bgevsn] = null;
        }
    };

    Object.prototype.bgDefProps({
        //bgOn('ready init', fn)
        bgOn: function (eventName, callback) {
            bingo.each(_splitEvName(eventName), function (item) {
                _getEvent(this, item, true).on(callback, this);
            }, this);
            return this;
        },
        //bgOn('ready init', fn)
        bgOne: function (eventName, callback) {
            bingo.each(_splitEvName(eventName), function (item) {
                _getEvent(this, item, true).on(callback, this, true);
            }, this);
            return this;
        },
        //bgOff() //删除所有事件
        //bgOff('ready init')
        //bgOff('ready init', fn)
        bgOff: function (eventName, callback) {
            if (arguments.length == 0)
                _rmEvent(this);
            else
                bingo.each(_splitEvName(eventName), function (item) {
                    _getEvent(this, item).off(callback);
                }, this);
            return this;
        },
        //bgEnd('ready init')
        bgEnd: function (eventName) {
            bingo.each(_splitEvName(eventName), function (item) {
                _getEvent(this, item, true).end(this);
            }, this);
            return this;
        },
        //bgTrigger('ready init')
        //bgTrigger('ready init', [arg1, arg2])
        //bgTrigger('ready init', [arg1, arg2], this)
        bgTrigger: function (eventName, args, thisArg) {
            var ret;
            bingo.each(_splitEvName(eventName), function (item) {
                ret = _getEvent(this, item).trigger(args, thisArg || this);
            }, this);
            return ret;
        },
        bgTriggerHandler: function (eventName, args, thisArg) {
            var ret;
            bingo.each(_splitEvName(eventName), function (item) {
                ret = _getEvent(this, item).trigger(args, thisArg || this, true);
            }, this);
            return ret;
        },
        //bgEventDef('ready init')
        bgEventDef: function (eventName) {
            /// <summary>
            /// bgEventDef('onOk onError')
            /// </summary>
            bingo.each(_splitEvName(eventName), function (item) {
                this[item] = function (callback) {
                    return this.bgOn(item, callback);
                };
            }, this);
            return this;
        },
        //bgDispose()
        //bgDispose(obj), 销毁时销毁obj
        bgDispose: function (obj) {
            if (this.bgIsDispose) {
                obj && obj.bgDispose();
                return;
            }
            if (arguments.length==1) {
                obj && obj.bgIsDispose || (this._bg_dispose || (this._bg_dispose = [])).push(obj);
                return;
            }
            this.bgIsDispose = true;
            try {
                this.bgDispose = bingo.noop;
                this.bgDisposeStatus = 1;
                this.bgTrigger('_bg_disp_');
                bingo.each(this._bg_dispose, function (item) { item.bgDispose(); });
            } finally {
                this._bg_clsobd();
                bingo.eachProp(this, function (item, n) {
                    if (item && item.bgAutoDispose === true)
                        item.bgDispose();
                    this[n] = null;
                }, this);
                this.bgDispose = bingo.noop;
                this.bgIsDispose = true;
                this.bgDisposeStatus = 2;
            }
        },
        bgOnDispose: function (callback) {
            return this.bgOn('_bg_disp_', callback);
        },
        bgIsDispose: false,
        bgDisposeStatus: 0,
        //自动销毁
        bgAutoDispose: false,
        //bgSync().done(function(){})
        bgSync: function (fn, callback) {
            var bgSync = this._bgSync_ || (this._bgSync_ = {
                _count: 0, _end: function () {
                    if (this._count == 0) return;
                    this._count--;
                    if (this._count == 0) {
                        $this._bgSync_ = null;
                        this.bgTrigger('done', [], $this);
                    }
                }
            }.bgEventDef('done')), $this = this;

            this.bgSyncAdd(1);
            callback && bgSync.done(callback);
            fn && fn.call(this);
            return bgSync;
        },
        //bgSyncAdd();
        //bgSyncAdd(1000); //超时1000ms
        bgSyncAdd: function (time) {
            (this._bgSync_ || this.bgSync())._count++;
            !!time && setTimeout(bingo.proxy(this, function () { this.bgSyncDec(); }), time);
        },
        bgSyncDec: function () {
            this._bgSync_ && this._bgSync_._end();
        }
    });

})(bingo);

//reverse,splice,push,pop

(function (bingo, undefined) {
    "use strict";

    var _act = '', _splitEvName = bingo._splitEvName, _obsDName = '_bg_obdata_',
        _isObsObj = function (o) { return bingo.isArray(o) || bingo.isObject(o); },
        _adList = [], _adTid,
        _defObserve = function (obj, props, deep) {
            if (!(_obsDName in obj)) {
                (function () {
                    var tid, changes = [];
                    obj.bgDefProp(_obsDName, {
                        deep: deep, obs: {}, sobs: [], sendObj: function (change) {
                            if (tid) clearTimeout(tid);
                            changes.push(change);
                            var ods = this.sobs;
                            if (ods.length > 0) {
                                tid = setTimeout(function () {
                                    try {
                                        bingo.each(ods, function (ob) {
                                            ob.fn && ob.fn.call(this, changes);
                                        }, obj);
                                    } finally {
                                        tid = 0;
                                        changes = [];
                                    }
                                }, 1);
                            }
                        }
                    }, false);
                })();
            }
            var obd = obj[_obsDName];
            deep = (deep !== false) || obd.deep;
            bingo.each(props, function (pname, index) {
                //如果以下划画开始， 认为私用变量， 不给予处理
                if (pname.indexOf('_') == 0) return;
                var item = obj[pname];
                if (!_isObserve(obj, pname)) {
                    //初始obs
                    obd.obs[pname] = []
                    var getting = false;
                    var _get = function () {
                        if (_obsList) {
                            //_obsList, bingo.observe收集时用， 其它时间不作用
                            _obsList.push({ name: pname, object: this, value: item, isChild: (_obsList[_obsList.length - 1] || {}).value == this, type: 'get' });
                        }
                        
                        return item;
                    }, _set = function (value) {
                        if (_obsList) {
                            //_obsList, bingo.observe收集时用， 其它时间不作用
                            _obsList.push({ name: pname, object: this, value: item, isChild: (_obsList[_obsList.length - 1] || {}).value == this, type: 'set' });
                        }

                        if (item != value) {
                            var old = item;
                            item = value;
                            deep && _isObsObj(item) && item.bgToObserve(null, deep);
                            _publish(this, pname, { name: pname, object: this, value: item, oldValue: old, type: 'update' });
                        };
                    };
                    Object.defineProperty(obj, pname, {
                        configurable: true,
                        enumerable: true,
                        get: _get,
                        set: _set
                    });
                    deep && _isObsObj(item) && item.bgToObserve(null, deep);
                }
            });
            return obj[_obsDName];
        }, _isObserve = function (obj, prop) {
            return !!_getObserveData(obj, prop);
        }, _getObserveData = function (obj, prop) {
            //取得observe数据
            var obd = obj[_obsDName];
            return obd && (bingo.isNull(prop) ? obd.sobs : obd.obs[prop]);
        }, _publish = function (obj, prop, change) {
            //发送请求Observe
            var ods = _getObserveData(obj, prop);
            bingo.each(ods, function (ob) {
                ob.fn && ob.fn.call(this, [change]);
            }, obj);


            var obd = obj[_obsDName];
            obd && obd.sendObj(change);
        }, _addObs = function (obj, prop, fn) {
            if (!_isObserve(obj, prop)) {
                _defObserve(obj, bingo.isNull(prop) ? null : [prop]);
            }
            var obs = _getObserveData(obj, prop);
            obs && obs.push({ fn: fn });
            return obs;
        }, _delObs = function (obj, prop, fn) {
            var obd;
            if (obd = obj[_obsDName]) {
                if (bingo.isNull(prop)) {
                    if (!fn)
                        obd.sobs = [];
                    else
                        obd.sobs = obd.sobs.filter(function (item) { return item.fn != fn; });
                } else if (obd.obs[prop]) {
                    if (!fn)
                        obd.obs[prop] = [];
                    else
                        obd.obs[prop] = obd.obs[prop].filter(function (item) { return item.fn != fn; });
                }
            }
        }, _resObs = function (obj) {
            var obd = obj[_obsDName];
            if (obd) {
                obd.obs = [];
            }
            obj.bgToObserve();
        };


    Object.prototype.bgDefProps({
        _bg_clsobd: function () {
            var de = this[_obsDName];
            if (de) {
                de.deep = false;
                de.obs = {};
                de.sobs = [];
            }
        },
        bgToObserve: function (prop, deep) {
            /// <summary>
            /// bgToObserve(true)<br/>
            /// bgToObserve('prop')<br/>
            /// bgToObserve('prop', true)
            /// </summary>
            /// <param name="deep">是否自动深toObserve</param>
            if (this._no_observe === true) return this;
            if (bingo.isBoolean(prop)) { deep = prop; prop = null; }
            _defObserve(this, prop ? [prop] : Object.keys(this), deep);
            return this;
        },
        bgObServe: function (prop, fn) {
            /// <summary>
            /// bgObServe(function(change){})<br/>
            /// bgObServe('prop', function(change){})
            /// </summary>
            if (this._no_observe === true) return this;
            if (bingo.isNull(prop) || bingo.isFunction(prop)) {
                this.bgToObserve();
                _addObs(this, null, prop || fn);
            } else {
                bingo.each(prop ? [prop] : Object.keys(this), function (item) {
                    _addObs(this, item, fn);
                }, this);
            }
            return this;
        },
        bgUnObServe: function (prop, fn) {
            /// <summary>
            /// bgUnObServe(fn)<br/>
            /// bgUnObServe('prop', fn)
            /// </summary>
            if (this._no_observe === true) return this;
            if (bingo.isNull(prop) || bingo.isFunction(prop)) {
                _delObs(this, null, prop || fn);
            } else {
                bingo.each(prop ? [prop] : Object.keys(this), function (item) {
                    _delObs(this, item, fn);
                }, this);
            }
            return this;
        },
        bgPublish: function (prop) {
            var val = prop ? this[prop] : this;
            _publish(this, prop, { name: prop, object: this, value: val, oldValue: val, type: 'publish' });
        },
        bgDataValue: function (prop, val) {
            /// <summary>
            /// 获取或设置属性<br />
            /// bgBuildProps('aaaa.bbb', 1)  ==> this.aaaa.bbb = 1
            /// </summary>
            var r = _splitProp(this, prop, false);
            arguments.length > 1 && (r[0][r[1]] = val);
            return r[0][r[1]];
        },
        bgTestProps: function (prop) {
            /// <summary>
            /// 生成属性<br />
            /// bgBuildProps('aaaa.bbb')  ==> [this, 'aaaa', false]
            /// </summary>
            return _splitProp(this, prop, true)[2];
        }
    });

    //数组观察方法， length不能观察有些浏览器会报错
    var _arrayProps = ['reverse', 'splice', 'push', 'pop', 'copyWithin', 'fill', 'shift', 'unshift', 'sort'];
    var _arrayDef = {}, _arrayProtoOld = {};
    bingo.each(_arrayProps, function (prop) {
        var oldPro = Array.prototype[prop];
        _arrayDef[prop] = function () {
            if (_isObserve(this)) {
                var old = this.slice();
                var ret = oldPro.apply(this, arguments);
                var noC = old.length == this.length && this.every(function (item, index) {
                    return item === old[index];
                });
                if (!noC) {
                    _resObs(this);
                    //this.bgToObserve();
                    _publish(this, prop, { name: prop, object: this, value: this, oldValue: old, type: 'update' });
                }
                return ret;
            } else
                return oldPro.apply(this, arguments);
        };
    });
    _arrayDef.size = function (size) {
        if (arguments.length == 0)
            return this.length;
        else {
            var old = this.length;
            if (this.length != size) {
                old = this.slice();
                this.length = size;
                this.bgToObserve();
                _publish(this, '', { name: '', object: this, value: this, oldValue: old, type: 'update' });
            }
        }
    };
    Array.prototype.bgDefProps(_arrayDef);

    var _ArrayEquals = function (arr1, arr2) {
        if (arr1 === arr2) { return true; }
        if (!bingo.isArray(arr2) || arr1.length != arr2.length) { return false; } // null is not instanceof Object.
        for (var i = 0, len = arr1.length; i < len; i++) {
            if (arr1[i] != arr2[i]) return false;
        }
        return true;
    },_ObjectEquals = function (obj1, obj2) {
        if (obj1 === obj2) return true;
        if (!bingo.isObject(obj2)) return false;

        var count = 0, ok = true;
        bingo.eachProp(obj1, function (item, n) {
            count++;
            if (obj2[n] !== item) { ok = false; return false; }
        });
        ok && bingo.eachProp(obj2, function () {
            count--;
        });
        return ok && (count === 0);
    };

    //observe fn时不能观观察root层
    bingo.extend({
        observe: function (obj, prop, fn) {
            if (bingo.isFunction(obj)) {
                var colFn = obj;
                fn = prop;
                var obs, tid, cList = [], old, publish = function (isPub, org) {
                    var val;
                    try {
                        val = colFn();
                        if (isPub || (bingo.isArray(old) ? !_ArrayEquals(old, val) : (bingo.isObject(old) ? !_ObjectEquals(old, val) : old != val))) {
                            //如果只是单个属性的情况, 如bingo.observe(obj, 'aaa.bbb', fn)
                            var cLTemp = cList.length == 1 ? cList[0] : null,
                                cObj = cLTemp && cLTemp.length == 1 ? cLTemp[0] : null;
                            return (org ? (fn.orgFn || fn) : fn).call(ret, { name: cObj ? cObj.name : '', value: val, oldValue: old, object: cObj ? cObj.object : (cLTemp || cList), type: 'bingo.observe' });
                        }
                    } finally {
                        old = bingo.isArray(val) ? bingo.sliceArray(val) : (bingo.isObject(val) ? bingo.extend({}, val) : val);
                        ret.value = val;
                        cList = []; tid = null;
                    }
                }, ft = function (change) {
                    change && cList.push(change);
                    if (!tid) {
                        //如果多次连续变动，统一为一次变动
                        tid = setTimeout(publish, 1);
                    }
                }, ftw = function (change) {
                    ret.refresh();
                    ft(change);
                }, done = function (refs) {
                    //收集绑定
                    obs = _collect(colFn);
                    //是否成功
                    ret.isSucc = _obsSucc && !_obsErr;
                    if (ret.isSucc) {
                        //观察绑定变量
                        bingo.each(obs.w, function (item) {
                            item.object.bgObServe(item.name, ft);
                        });
                        //是否有可观察变量
                        ret.isObs = obs.w.length > 0;
                        //观察绑定变量的父节点, 重新发现绑定
                        bingo.each(obs.p, function (item) {
                            if ('toObsObj' in item) {
                                item.value && item.value.bgObServe(ftw);
                            }
                            item.object.bgObServe(item.name, ftw);
                        });
                    }
                    if (refs !== true)
                        ret.value = old = obs.val;
                    else
                        ret.check();
                }, _unObserve = function () {
                    bingo.each(obs.w, function (item) {
                        item.object.bgUnObServe(item.name, ft);
                    });
                    bingo.each(obs.p, function (item) {
                        if ('toObsObj' in item) {
                            item.value && item.value.bgUnObServe(ftw);
                        }
                        item.object.bgUnObServe(item.name, ftw);
                    });
                    obs = null;
                };

                var ret = {
                    //重新检查值， 是否改变
                    check: function () { ft(null); },
                    //发布一个信息
                    publish: function (org) {
                        return publish(true, org);
                    },
                    unObserve: function () {
                        _unObserve();
                        this.bgDispose();
                    },
                    //刷新， 重新收集绑定
                    refresh: function () {
                        _unObserve();
                        done(true);
                    }
                };
                done();
                return ret;
            } else if (obj) {
                var bo = _splitProp(obj, prop, false),
                    obj = bo[0],pname = bo[1],
                    sFn = function () {
                        return obj[pname];
                    };
                return bingo.observe(sFn, fn);

            }
        },
        isObserve: function (obj, prop) {
            return _isObserve(obj, prop);
        }
    });
    bingo.observe.error = function () { _obsErr = true; };

    //收集存放数组
    var _obsList = null, _obsSucc, _obsErr;
    //收集观察变量
    var _collect = function (fn) {
        try {
            _obsList = [];
            _obsSucc = false, _obsErr = false;
            var value = fn();
            var ret = _analyze();
            _obsSucc = true;
            ret.val = value;
            return ret;
        } finally {
            _obsList = null;
        }
    }, _analyze = function () {
        //分析收集到的观察变量
        var list = [];
        //取出可观察的属性
        bingo.each(_obsList, function (item, index, array) {
            var nextIndex = index + 1, isEnd = array.length == nextIndex;
            if (isEnd) {
                list.push(item);
            } else {
                var next = array[nextIndex];
                if (!next.isChild)
                    list.push(item);
            }
        });
        //可观察的属性去重
        var wList = [];
        bingo.each(list, function (item) {
            var has = wList.some(function (item1) { return item.name == item1.name && item.object == item1.object; });
            has || wList.push(item);
        });

        //取出可观察的属性节点并去重， 用于变动
        var pList = [];
        bingo.each(_obsList, function (item) {
            var tmp = item.value;
            var hasU = true;
            if (bingo.isNull(tmp) || bingo.isArray(tmp)) {
                //如果value为null, array 返回到false, 用于下面属性观察
                //object暂时不处理
                item.toObsObj = true;
                hasU = false;
            }
            //是否已经存在wList
            hasU = hasU && wList.some(function (item1) {
                return item.name == item1.name && item.object == item1.object;
            });
            if (!hasU) {
                //去重
                var hasO = pList.some(function (item1) { return item.name == item1.name && item.object == item1.object; });
                hasO || pList.push(item);
            }
        });
        return { w: wList, p: pList };
    };

    var _splitProp = function (obj, prop, test) {
        if (!bingo.isString(prop)) return [obj, prop];
        var dot = '=bingo_dot=';
        prop = prop.replace(/\[(["']?)(.*?)\1\][.]?/g, function (find, b, con) {
            return ['.', con.replace('.', dot), '.'].join('');
        }).replace(/\.$/, '');
        var l = prop.split('.'), nreg = /[^0-9]/,
            end = l.length - 2, last = obj, name = prop, has = true;
        end >= 0 && bingo.each(l, function (item, index) {
            item = item.replace(dot, '.');
            //测试模式
            if (test && !_existProp(last, item)) { has = false; return false; }
            if (index <= end) {
                if (!last[item]) {
                    last = last[item] = (nreg.test(l[index + 1]) ? {} : []);
                } else
                    last = last[item];
            } else {
                name = item;
                if (!(name in last))
                    last[name] = null;
            }
        });
        return [last, name, end == -1 ? _existProp(last, name) : has];
    }, _existProp = function (o, name) {
        return bingo.isArray(o) || bingo.isObject(o)
            || bingo.isWindow(o) || bingo.isElement(o) || bingo.isFunction(o) ? (name in o) : false;
    };

})(bingo);


; (function (bingo) {
    "use strict";

    var _newApp = function (name) {
        return {
            name: name, _no_observe: true,
            controller: _controllerFn, _controller: {},
            service: _serviceFn, _service: {},
            component: _componentFn, _component: {},
            command: _commandFn, _command: {}
        };
    }, _getApp = function () {
        return bingo.app(this.app);
    }, _appMType = function (app, type, name, fn, isF) {
        var mType = app[type];
        if (arguments.length == 3)
            return mType[name] || (app != _defualtApp ? _defualtApp[type][name] : null);
        else {
            if (bingo.isObject(fn) && isF !== false) {
                var o = fn;
                fn = function () { return o; };
            }
            bingo.isObject(fn) || (fn = _makeInjectAttrs(fn));
            mType[name] = { name: name, fn: fn, app: app.name, getApp: _getApp, _no_observe: true };
        }
    }, _controllerFn = function (name, fn) {
        var args = [this, '_controller'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }, _serviceFn = function (name, fn) {
        var args = [this, '_service'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }, _componentFn = function (name, fn) {
        var args = [this, '_component'].concat(bingo.sliceArray(arguments));
        return _appMType.apply(this, args);
    }, _commandFn = function (name, fn) {
        var args = [this, '_command'].concat(bingo.sliceArray(arguments));
        var def = args[3];
        if (def) {
            var opt = {
                priority: 50,
                tmpl: '',
                tmplUrl: '',
                replace: false,
                include: false,
                view: false,
                compileChild: true
            };
            def = def();
            if (bingo.isFunction(def) || bingo.isArray(def)) {
                opt.link = _makeInjectAttrs(def);
            } else
                opt = bingo.extend(opt, def);
            args[3] = opt;
            args[4] = false;
        }
        return _appMType.apply(this, args);
    }

    var _app = {}, _defualtApp = _newApp('defualtApp'), _lastApp = null

    bingo.extend({
        app: function (name, fn) {
            var app = !!name ? (_app[name] || (_app[name] = _newApp(name))) : _defualtApp;
            if (!fn) return app;
            _lastApp = app;
            try {
                fn && fn.call(app, app);
                return app;
            } finally {
                _lastApp = null;
            }
        },
        controller: function (name, fn) {
            if (bingo.isFunction(name) || bingo.isArray(name)) {
                return name;
            } else {
                var app = (_lastApp || _defualtApp);
                return app.controller.apply(app, arguments);
            }
        },
        component: function (name, fn) {
            if (bingo.isFunction(name) || bingo.isObject(name)) {
                return name;
            } else {
                var app = (_lastApp || _defualtApp);
                return app.component.apply(app, arguments);
            }
        },
        command: function (name, fn) {
            var app = (_lastApp || _defualtApp);
            return app.command.apply(app, arguments);
        },
        service: function (name, fn) {
            var app = (_lastApp || _defualtApp);
            return app.service.apply(app, arguments);
        }
    });

    var _injectNoop = function () { };
    _injectNoop.$injects = [];

    var _makeInjectAttrRegx = /^\s*function[^(]*?\(([^)]+?)\)/i,
    _makeInjectAttrs = function (p) {
        if (p && (p.$injects || p.$fn)) return p.$fn || p;

        var fn = _injectNoop;
        if (bingo.isArray(p)) {
            var list = bingo.sliceArray(p);
            fn = p.$fn = list.pop();
            fn.$injects = list;
            fn.$owner = p.$owner;
        } else if (bingo.isFunction(p)) {
            fn = p;
            var s = fn.toString();
            var list = [];
            s.replace(_makeInjectAttrRegx, function (findText, find0) {
                if (find0) {
                    bingo.each(find0.split(','), function (item) {
                        item = bingo.trim(item);
                        item && list.push(item);
                    });
                }
            });
            fn.$injects = list;
        }
        return fn;
    };

    var _injectIn = function (fn, name, injectObj, thisArg) {
        if (!fn) throw new Error('not find inject: ' + name);
        var $injects = fn.$injects;
        var injectParams = [];
        if ($injects && $injects.length > 0) {
            var pTemp = null;
            bingo.each($injects, function (item) {
                if (item in injectObj) {
                    pTemp = injectObj[item];
                } else {
                    //注意, 有循环引用问题
                    pTemp = injectObj[item] = _inject(item, injectObj, thisArg);
                }
                injectParams.push(pTemp);
            });
        }

        var ret = fn.apply(thisArg|| window, injectParams);
        if (bingo.isString(name)) {
            injectObj[name] = ret;
        }

        return ret;
    }, _inject = function (p, injectObj, thisArg) {
        var fn = null, name = '';
        if (bingo.isFunction(p) || bingo.isArray(p)) {
            fn = _makeInjectAttrs(p);
        }
        else {
            name = p;
            var srv = injectObj.$view.$getApp().service(name);
            fn = srv ? srv.fn : null;
        }
        return _injectIn(fn, name, injectObj, thisArg);
    };

    bingo.inject = function (p, view, injectObj, thisArg) {
        view || (view = bingo.rootView());
        injectObj = bingo.extend({
            $view: view,
            node: view.$getNode()[0],
            $viewnode: view.$getViewnode(),
            $attr: null,
            $withData: null
        }, injectObj);
        return _inject(p, injectObj, thisArg || view);
    };

})(bingo);

; (function (bingo) {
    "use strict";

    //IE必须先添加到document才生效
    var _ev = 'DOMNodeRemoved', _aT,
        _queryNodes = function (e) {
            var r = [], o, s;
            s = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_DOCUMENT | NodeFilter.SHOW_DOCUMENT_FRAGMENT, null, null);
            while (o = s.nextNode()) r.push(o); //遍历迭代器
            return r;
        };
    //window.getCommentNodes = _getCommentNodes;
    document.documentElement.addEventListener(_ev, function (e) {
        var target = e.target;
        setTimeout(function () {
            var parentNode = target ? target.parentNode : null;
            if (!parentNode) {
                target.bgTrigger(_ev, [e]);
                _aT || (_aT = setTimeout(function () { _aT = null; _linkAll.bgTrigger('onLinkNodeAll'); }, 0));
                target.hasChildNodes() && bingo.each(_queryNodes(target), (function () {
                    this.bgTrigger(_ev, [e]);
                }));
            }
        }, 0);
    }, false);

    bingo.linkNode = function (node, callback) {
        if (callback) {
            if (!node) { callback(); return; }
            node.bgOne(_ev, callback);
        }
    };

    bingo.unLinkNode = function (node, callback) {
        if (node) {
            if (callback)
                node.bgOff(_ev, callback);
            else
                node.bgOff();
        }
    };

    Object.prototype.bgDefProps({
        bgLinkNode: function (node) {
            var fn = bingo.proxy(this, function () {
                this.bgDispose();
            });
            bingo.linkNode(node, fn);
            (this._linkNodeFn || (this._linkNodeFn = [])).push(fn);
            this.bgOnDispose(function () { this.bgUnLinkNode(node); });
            return this;
        },
        bgUnLinkNode: function (node) {
            var fnL = this._linkNodeFn;
            fnL && fnL.length > 0 && fnL.forEach(function (item) {
                bingo.unLinkNode(this, item);
            }, node);
            this._linkNodeFn = [];
            return this;
        },
        bgLinkNodeAll: function (fn) {
            if (fn) {
                var $this = this, fn1 = function () {
                    fn.apply($this, arguments);
                    $this.bgIsDispose && _linkAll.bgUnLinkNodeAll(fn1);
                };
                fn._bglfall_ = fn1;
                _linkAll.bgOn('onLinkNodeAll', fn1);
            }
        },
        bgUnLinkNodeAll: function (fn) {
            fn && _linkAll.bgOff('onLinkNodeAll', fn._bglfall_);
        }
    });
    var _linkAll = {};

})(bingo);


(function (bingo) {
    "use strict";
    var _Promise = bingo.Promise,
        doc = document,
        head = doc.head ||
          doc.getElementsByTagName('head')[0] ||
          doc.documentElement,
       baseElement = head.getElementsByTagName('base')[0],
       READY_STATE_RE = /loaded|complete|undefined/i;

    var _fetch = function (url, callback, charset) {

        //每一个async属性的脚本都在它下载结束之后立刻执行，同时会在window的load事件之前执行。
        //所以就有可能出现脚本执行顺序被打乱的情况；
        //每一个defer属性的脚本都是在页面解析完毕之后，按照原本的顺序执行，同时会在document的DOMContentLoaded之前执行。

        //但defer并不是所有浏览器都遵从
        var node = doc.createElement('script');
        node.type = 'text/javascript';
        node.charset = charset || 'utf-8';
        node.async = true;//'async';
        node.defer = false; //'defer';
        node.src = url;

        scriptOnload(node, callback || bingo.noop);


        // ref: #185 & http://dev.jquery.com/ticket/2709 
        // 关于base 标签 http://www.w3schools.com/tags/tag_base.asp
        baseElement ?
            head.insertBefore(node, baseElement) :
            head.appendChild(node);

    },
    scriptOnload = function (node, callback) {

        var loadedFun = function () {
            if (!node) return;
            //正则匹配node的状态
            if (READY_STATE_RE.test(node.readyState)) {

                node.onload = node.onerror = node.onreadystatechange = null;

                if (!bingo.isDebug && node.parentNode) {
                    node.parentNode.removeChild(node);
                }

                try {
                    callback && callback(node.src);
                } finally {
                    node = undefined;
                    callback = null;
                }
            }
        };

        node.onload = node.onerror = node.onreadystatechange = function () {
            loadedFun();
        };

    };

    var _loaded = [], _loading = [], _loadAll = [],
        _addAll = function (fn, lv) {
            _loadAll.push({ fn: fn, lv: lv });
            _loadAll.sort(function (item1, item2) { return item1.lv - item2.lv; });
            (!_isLoading()) && _checkEnd();
        },
        _exist = function (file) {
            if (bingo.isNullEmpty(file)) return true;
            return _loading.some(function (item) { return item.file == file; })
                || _isLoaded(file);
        },
        _isLoaded = function (file) {
            return _loaded.some(function (item) { return item == file; });
        },
        _isLoading = function () {
            return _loading.length > 0;
        },
        _getLoading = function (file) {
            var index = bingo.inArray(function (item) { return this.file == file; }, _loading);
            return index >= 0 ? _loading[index] : null;
        },
        _tid,
        _loadFile = function (file, fn) {
            if (_isLoaded(file)) {
                fn && fn(file);
            } else {
                var lf = _getLoading(file);
                if (lf) {
                    lf.fns.push(fn);
                } else {
                    _loading.push({ file: file, fns: [fn], status: 0 });
                    _tid || (_tid = setTimeout(_done, 0));
                }
            }
        },
        _done = function () {
            _tid = null;
            bingo.each(_loading, function (item) {
                if (item.status > 0) return;
                var file = item.file;
                item.status = 1;//加载中
                _fetch(file, function () {
                    _toLoad(_loading, item);
                });
            });
        },
        _toLoad = function (list, item) {
            var index = list.indexOf(item);
            //从loading删除
            index < 0 || list.splice(index, 1);
            //添加到loaded
            _loaded.push(item.file);
            bingo.each(item.fns, function (fn) {
                fn && fn(item.file);
            });
            _checkEnd();
        },
        _checkEnd = function () {
            var idEnd = !_isLoading();
            if (idEnd) {
                //debugger;
                //console.log('end');
                _loading = [];
                var all = _loadAll;
                _loadAll = [];
                bingo.each(all, function (item) {
                    item.fn();
                });
            } else
                _done();
        };

    var _usingDone = false;
    bingo.extend({
        using: function (url) {
            /// <summary>
            /// bingo.using('/js/file1.js').then <br />
            /// </summary>
            /// <param name="p">url</param>
            if (_usingDone) {
                _usingDone = false;
                return bingo.config().using(url);
            } else {
                try {
                    _usingDone = true;
                    return bingo.route(url).usingPromise();
                } finally {
                    _usingDone = false;
                }
            }
        },
        usingAll: function (lv) {
            bingo.isNumeric(lv) || (lv = bingo.using.Normal);
            return bingo.Promise(function (r) {
                _addAll(r, lv);
            });
        }
    });

    bingo.extend(bingo.using, {
        First: 0,
        NormalBefore: 45,
        Normal: 50,
        NormalAfter: 55,
        Last: 100
    });
    //end using===================================

    var _noop = bingo.noop, _htmlType = 'text/html',
        _textType = 'text/plain', _jsonType = 'application/json',
        _mimeToDataType = function (mime) {
        return mime && (mime == _htmlType ? 'html' :
          mime == _jsonType ? 'json' :
          /^(?:text|application)\/javascript/i.test(mime) ? 'script' :
          /^(?:text|application)\/xml/i.test(mime) && 'xml') || 'text';
    }, _appendQuery = function (url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    }, _serializeData = function (options) {
        if (!options.data) return;
        var p = [];
        if (bingo.isObject(options.data)){
            bingo.eachProp(options.data, function (item, name) {
                p.push(encodeURIComponent(name) + '=' + encodeURIComponent(bingo.isObject(item) || bingo.isArray(item) ? JSON.stringify(item): item));
            });
            options.data = p.join('&').replace('%20', '+');
        }
        if (!options.type || options.type.toUpperCase() == 'GET')
            options.url = _appendQuery(options.url, options.data);
    }, _ajaxOpt = {
        type: 'GET',
        beforeSend: _noop,
        success: _noop,
        error: _noop,
        complete: _noop,
        context: null,
        xhr: function () {
            return new window.XMLHttpRequest();
        },
        accepts: {
            script: 'text/javascript, application/javascript',
            json: _jsonType,
            xml: 'application/xml, text/xml',
            html: _htmlType,
            text: _textType
        },
        crossDomain: false,
        timeout: 0
    }, _ajax = function (options) {
        var settings = bingo.extend({}, options);
        for (var key in _ajaxOpt) if (settings[key] === undefined) settings[key] = _ajaxOpt[key];

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
          RegExp.$2 != window.location.host;

        var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url);
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) settings.url = _appendQuery(settings.url, 'callback=?');
            return _ajaxJSONP(settings);
        }

        if (!settings.url) settings.url = window.location.toString();
        _serializeData(settings);

        var mime = settings.accepts[dataType],
            baseHeaders = {},
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = _ajaxOpt.xhr(), abortTimeout;

        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';
        if (mime) {
            mime += ', */*; q=0.01';
            baseHeaders['Accept'] = mime;
            xhr.overrideMimeType && xhr.overrideMimeType(mime);
        }
        if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
            baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded; charset=UTF-8');
        settings.headers = bingo.extend(baseHeaders, settings.headers);

        var context = settings.context;

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                clearTimeout(abortTimeout);
                var result, error = false, cpType = '';;
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || _mimeToDataType(xhr.getResponseHeader('content-type'));
                    result = xhr.responseText;

                    try {
                        if (dataType == 'script') (1, eval)(result);
                        else if (dataType == 'xml') result = xhr.responseXML;
                        else if (dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result);
                    } catch (e) { error = e; }

                    if (error) {
                        cpType = 'parsererror';
                        settings.error.call(context, xhr, cpType, error);
                    } else {
                        cpType = 'success';
                        settings.success.call(context, result, cpType, xhr);
                    }
                } else {
                    cpType = 'error';
                    settings.error.call(context, xhr, cpType, xhr);
                }
                settings.complete.call(context, xhr, cpType)
            }
        };

        var async = 'async' in settings ? settings.async : true;
        xhr.open(settings.type, settings.url, async);

        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name]);

        if (settings.beforeSend.call(context, xhr, settings) === false) {
            xhr.abort();
            return false;
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = _noop;
            xhr.abort();
            settings.complete.call(context, xhr, 'timeout')
        }, settings.timeout);

        xhr.send(settings.data ? settings.data : null);
        return xhr;
    }, _ajaxJSONP = function (options) {
        var callbackName = 'jsonp' + bingo.makeAutoId(),
          script = document.createElement('script'),
          abort = function () {
              head.removeChild(script);
              if (callbackName in window) window[callbackName] = _noop
              options.complete.call(options.context, xhr, 'abort')
          },
          xhr = { abort: abort }, abortTimeout;

        if (options.error) script.onerror = function () {
            xhr.abort();
            options.error();
        };

        window[callbackName] = function (data) {
            clearTimeout(abortTimeout);
            head.removeChild(script);
            delete window[callbackName];
            settings.success.call(options.context, data, 'success', xhr);
        };

        _serializeData(options);
        script.src = options.url.replace(/=\?/, '=' + callbackName);
        head.appendChild(script);

        if (options.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.abort();
        }, options.timeout);

        return xhr;
    };

    var _ajaxDoing = false;
    bingo.ajax = function (url, p) {
        if (_ajaxDoing) {
            _ajaxDoing = false;
            return bingo.config().ajax(url, p);
        } else {
            try {
                _ajaxDoing = true;
                return bingo.route(url).ajaxPromise(p);
            } finally {
                _ajaxDoing = false;
            }
        }
    };

    var _tagTestReg = /^\s*<(\w+|!)[^>]*>/, _tmpling = false;
    bingo.tmpl = function (p, aP) {
        /// <summary>
        /// bingo.tmpl('tmpl/aaaa/user').then(...;<br />
        /// bingo.tmpl('#userTmplId').then(...;<br />
        /// bingo.tmpl(node).then(...;<br />
        /// </summary>
        var html = '', node = p;
        if (bingo.isString(p)) {
            if (p.indexOf('#') < 0) {
                if (!p || _tagTestReg.test(p)) {
                    return _Promise.resolve(p);
                } else {
                    if (_tmpling) {
                        _tmpling = false;
                        return bingo.config().tmpl(p, aP);
                    } else {
                        try {
                            _tmpling = true;
                            return bingo.route(p).tmplPromise(aP);
                        } finally {
                            _tmpling = false;
                        }
                    }
                }
            } else
                node = document.getElementById(p.substr(1));
        }
        if (node) {
            var cLen = node.children.length, first = node.firstElementChild;
            if (cLen == 1 && first.tagName.toLowerCase() == 'script')
                html = first.innerHTML;
            else
                html = node.innerHTML;
        }
        return _Promise.resolve(html);
    };

    var _cacheName = '_bg_cache2_';
    bingo.cache = function (owner, key, p, max) {
        var cache = owner[_cacheName];
        if (arguments.length == 2) {
            if (!cache) return undefined;
            var index = bingo.inArray(function (item) { return item[0] == key; }, cache);
            return index > -1 ? cache[index][1] : undefined;
        } else {
            arguments < 4 && (max = 20);
            cache || (cache = owner[_cacheName] = []);
            var index = bingo.inArray(function (item) { return item[0] == key; }, cache);
            var c = index > -1 ? cache[index] : null, t = new Date().valueOf();
            if (c) {
                c[1] = p, c[2] = t;
            } else {
                c = [key, p, t];
                cache.push(c);
                if (cache.length >= max + 5) {
                    cache.sort(function (item, item1) { return item1[2] - item[2]; });
                    owner[_cacheName] = bingo.sliceArray(cache, 0, cache.length - 5);
                }
            }
            return p;
        }
    };
    bingo.cacheRemove = function (owner, key) {
        var cache = owner[_cacheName];
        if (cache) {
            var index = bingo.inArray(function () { return this[0] == key; }, cache);
            return (index > -1) ? cache.splice(index, 1)[0] : undefined;
        }
    };


    //route=====================================================

    /*
        //1. 添加或设置路由'view'
        bingo.route('view', {
            //优先级, 越小越前, 默认100
            priority: 100,
            //路由地址
            url: 'view/{controller*}',
            //路由转发到地址（可以function(url, params)）
            to: 'modules/{controller*}.html',
            //第二种配置
            to: {
                //（可以function(url, params)）
                ajax:'modules/{controller*}.html',
                tmpl:'modules/{controller*}.html',
                using:''modules/{controller*}.html'
            },
            //默认
            promise:{
                ajax:function(p){
                    return bingo.config().tmpl(this.tmpl, p);
                },
                tmpl:function(p){
                    return bingo.config().ajax(this.ajax, p);
                },
                usin:function(p){
                    return _usingIn(this.using);
                }
            }
            //默认值
            defaultValue: { app: '', controller: 'user/list' }
        });

        //2. 根据url生成目标url;
            var url = bingo.route('view/user/list');
                返回结果==>{tmpl:'modules/user/list.html'}
    */
    //路由
    bingo.route = function (p, context) {
        if (arguments.length == 1)
            return bingo.routeContext(p).to;
        else
            p && context && _routes.add(p, context);
    };

    /*
        //根据url生成routeContext;
        var routeContext = bingo.routeContext('view/user/list');
            返回结果==>{
                url:'view/user/list',
                toUrl:'modules/user/list.html',
                params:{ app: '', controller: 'user/list' }
            }
    */
    //
    bingo.routeContext = function (url) {
        return _routes.getRouteByUrl(url);
    };

    /*
        //生成路由地址
        bingo.routeLink('view', { app: '', controller: 'user/list' });
            返回结果==>'view/user/list'
    */
    bingo.routeLink = function (name, p) {
        var r = _routes.getRuote(name);
        return r ? _paramToUrl(r.context.url, p, 1) : '';
    };

    /*
        //生成路由地址query
        bingo.routeLinkQuery('view/user/list', { id: '1111' });
            返回结果==>'view/user/list$id:1111'
    */
    bingo.routeLinkQuery = function (url, p) {
        url || (url = '');
        var urlPath = '';
        if (url.indexOf('$') >= 0 || url.indexOf('?') >= 0) {
            var routeContext = bingo.routeContext(url);
            p = bingo.extend({}, p, routeContext.params.queryParams);
            var sp = url.indexOf('$') >= 0 ? '$' : '?';
            url = url.split(sp)[0];
        }
        bingo.eachProp(p, function (item, n) {
            item = encodeURIComponent(item || '');
            //route参数形式, $aaa:1$bbb=2
            urlPath = [urlPath, '$', n, ':', item].join('');
        });
        return [url, urlPath].join('');
    };


    var _makeRegexPath = /(\W)/g,
        //查找query部分, ?aaa=111&b=222
        _urlQueryPart = /\?[^?=]+\=.*$/,
        _isRegexMapPath = function (path) {
            return (!bingo.isNullEmpty(path)
                    && /[?*]+/.test(path.replace(_urlQueryPart, '')));
        }, _makeRegexMapPath = function (path) {
            path = path.replace(_urlQueryPart, '');
            if (!_isRegexMapPath(path)) return null;

            _makeRegexPath.lastIndex = 0;
            var regS = path.replace(_makeRegexPath, "\\$1").replace(/\\\*\\\*/g, '(.*?)').replace(/(\\([?*]))/g, '([^./\]$2?)');
            regS = ['^', regS, '$'].join('');
            return new RegExp(regS);
        };


    var _tranAttrRex = /\{([^}]+)\}/gi,
        _makeRegexPathSS = /\*\*|[?*](?!})/g,//查找 ?和*符号
        _keyAll = /\*$/;
    var _urlToParams = function (url, routeContext) {
        //匹配url, 并生成url参数
        // 如'view/{app}/{contrller}' ==> {app:'', contrller:''}
        if (!url || !routeContext.url) return null;
        var matchUrl = routeContext.url;
        //todo:{name*}

        var pathReg = routeContext._reg;
        if (!pathReg) {
            //去除$后面部分内容, 作为查询条件
            var urlTest = matchUrl.indexOf('$') >= 0 ? matchUrl.split('$')[0] : matchUrl;
            _tranAttrRex.lastIndex = 0;
            urlTest = urlTest.replace(_tranAttrRex, function (find, name) {
                //console.log(name);
                return _keyAll.test(name) ? '**' : '*';
            });
            pathReg = routeContext._reg = (routeContext._reg = _makeRegexMapPath(urlTest));
        }
        //url参数部分由$分开， 如aaaa/ssss.html$aaa:1$bb:2
        var urlParams = url.split('$');
        if (!pathReg.test(urlParams[0])) return null;

        var matchUrlList = [];
        matchUrl.replace(_makeRegexPathSS, '{*}').replace(_tranAttrRex, function (find, key, item2) {
            //console.log(find, item1, item2);
            matchUrlList.push({ key: key, find: find });
        });

        var obj = {}, fKey;

        urlParams[0].replace(pathReg, function () {
            //console.log(arguments);
            var args = arguments;
            bingo.each(matchUrlList, function (item, index) {
                fKey = item.key;
                if (fKey != '*') {
                    obj[fKey.replace('*', '')] = args[index + 1];
                }
                //item.value = args[index + 1];
            });
        })
        //console.log(matchUrlList);

        var queryParams = obj.queryParams = {};

        //如果url匹配， 
        //生成多余参数
        if (urlParams.length > 1) {
            urlParams = bingo.sliceArray(urlParams, 1);
            bingo.each(urlParams, function (item, index) {
                var list = item.split(':'),
                    name = list[0],
                    val = decodeURIComponent(list[1] || '');
                name && (obj[name] = queryParams[name] = val);
            });
        }

        return obj;
    }, _getRouteContext = function () {
        var context = { app: null, controller: null, component: null };
        var params = this.params;
        if (params) {
            var appName = params.app;
            var app = bingo.app(appName);
            context.app = app;
            params.controller && (context.controller = app.controller(params.controller));
            context.controller && (context.controller = context.controller.fn);

            params.component && (context.component = app.component(params.component));
            context.component && (context.component = context.component.fn);
        }
        return context;
    }, _makeRouteContext = function (name, url, to, params) {
        //生成 routeContext
        return { name: name, params: params, url: url, to: to, context: _getRouteContext };
    },
    _passParam = ',component,controller,service,app,queryParams,',
    _paramToUrl = function (url, params, paramType) {
        //_urlToParams反操作, paramType:为0转到普通url参数(?a=1&b=2), 为1转到route参数($a:1$b:2)， 默认为0
        _tranAttrRex.lastIndex = 0;
        if (!url || !params) return url;
        var otherP = '', attr, attr1, val;
        bingo.eachProp(params, function (item, n) {
            attr = ['{', n, '}'].join('');
            attr1 = ['{', n, '*}'].join('');

            if (url.indexOf(attr) >= 0) {
                //如果是url变量参数， 如/{module}/{aciont}/aa.txt
                url = bingo.replaceAll(url, attr, item);
            } else if (url.indexOf(attr1) >= 0) {
                //如果是url变量参数， 如/{module}/{aciont}/aa.txt
                url = bingo.replaceAll(url, attr1, item);
            } else if (_passParam.indexOf(','+n+',') < 0) {
                val = encodeURIComponent(item || '');
                //如果是其它参数
                if (paramType == 1) {
                    //route参数形式, $aaa:1$bbb=2
                    otherP = [otherP, '$', n, ':', val].join('');
                } else {
                    //普通url参数， ?aaa=1&bbb=2
                    otherP = [otherP, '&', n, '=', val].join('');
                }
            }
        });

        if (otherP) {
            //如果有其它参数， 组装到url参数中
            if (paramType == 1) {
                url = [url, otherP].join('');
            } else {
                if (url.indexOf('?') >= 0)
                    url = [url, otherP].join('');
                else
                    url = [url, otherP.substr(1)].join('?');
            }
        }

        return url;
    };

    var _routes = {
        datas: [],
        defaultRoute: {
            url: '**',
            to: function (url, param) { return url; }
        },
        add: function (name, context) {
            var route = this.getRuote(name);
            if (bingo.isUndefined(context.priority))
                context.priority = 100;
            if (route) {
                route.context = context;
            } else {
                this.datas.push({
                    name: name,
                    context: context
                });
            }
            this.datas.sort(function (item1, item2) { return item1.context.priority - item2.context.priority; });
        },
        getRuote: function (name) {
            var item = null;
            bingo.each(this.datas, function () {
                if (this.name == name) { item = this; return false; }
            });
            return item;
        },
        getRouteByUrl: function (url) {
            if (!url) return '';


            var querys = url.split('?');
            if (querys.length > 1) url = querys[0];
            var routeContext = null, name='';
            var params = null;
            bingo.each(this.datas, function () {
                routeContext = this.context;
                params = _urlToParams(url, routeContext);
                //如果params不为null, 认为是要查找的url
                if (params) { name = this.name; return false; }
            });

            //再找组装参数
            if (!params){
                routeContext = _routes.defaultRoute;
                name = 'defaultRoute';
            }
            if (params || routeContext.defaultValue)
                params = bingo.extend({}, routeContext.defaultValue, params);

            //var toUrl = bingo.isFunction(routeContext.toUrl) ?
            //    routeContext.toUrl.call(routeContext, url, params)
            //    : routeContext.toUrl;

            if (querys.length > 1) {
                params || (params = {});
                querys[1].replace(/([^=&]+)\=([^=&]*)/g, function (find, name, value) {
                    (name in params) || (params[name] = value);
                });
            }

            var to = routeContext.to || '';

            if (!bingo.isObject(to)) {
                to = _routes.makeTo(to, routeContext, url, params);
                to = {
                    using: to,
                    ajax: to,
                    tmpl: to
                };
            } else {
                to = bingo.extend({}, routeContext.to);
                bingo.eachProp(to, function (item, n) {
                    to[n] = _routes.makeTo(item, routeContext, url, params);
                });
            }
            var promise = routeContext.promise || {};
            bingo.extend(to, {
                tmplPromise: promise.tmpl || _tmplPromise,
                ajaxPromise: promise.ajax || _ajaxPromise,
                usingPromise: promise.using || _usingPromise
            });
            //console.log(to);

            //var toUrl = _paramToUrl(toUrl, params);

            return _makeRouteContext(name, url, to, params);
        },
        makeTo: function (to, routeContext, url, params) {
            bingo.isFunction(to) && (to = to.call(routeContext, url, params));
            return _paramToUrl(to, params);
        }
    };

    var _tmplPromise = function (p) {
        return bingo.config().tmpl(this.tmpl, p);
    }, _ajaxPromise = function (p) {
        return bingo.config().ajax(this.ajax, p);
    }, _usingPromise = function (p) {
        return bingo.config().using(this.using);
    };

    //route=====================================================


    //bingo.config=====================================================
    bingo.config({
        using: function (url) {
            return bingo.Promise(function (r) {
                _loadFile(url, function (url) { r(url); });
            });
        },
        ajax: function (url, p) {
            return _Promise(function (resolve, reject) {
                _ajax(bingo.extend({ type: 'post', dataType: 'json' }, p, {
                    url: url,
                    success: function (res) {
                        try {
                            p && p.success && p.success.apply(this, arguments);
                            resolve(res);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    error: function () {
                        try {
                            p && p.error && p.error.apply(this, arguments);
                            reject(arguments[2]);
                        } catch (e) {
                            reject(e);
                        }
                    }
                }));
            });
        },
        tmpl: function (url, p) {
            var key = url;
            var cache = bingo.cache(_tmplCacheObj, key);
            if (bingo.isString(cache)) {
                return _Promise.resolve(cache);
            } else {
                var tFn = function (html) {
                    if (bingo.isString(html))
                        bingo.cache(_tmplCacheObj, key, html, 200);
                    return html;
                };

                return bingo.config().ajax(url, bingo.extend({
                    dataType: 'text', type: 'get'
                }, p)).then(tFn);
            }
        }
    });
    var _tmplCacheObj = {};
    //end bingo.config=====================================================

})(bingo);


(function (bingo) {

    /*
        与bg-route同用, 取bg-route的url等相关
        $location.href('view/system/user/list');
        var href = $location.href();
        var params = $location.params();
    
    */
    var _routeCmdName = 'bg-route',
        _dataKey = '_bg_location_',
        _documentElement = document.documentElement;

    //bingo.location('main') 或 bingo.location($('#id')) 或 bingo.location(docuemnt.body)

    bingo.location = function (p) {
        /// <summary>
        /// location 没有给删除如果dom在一直共用一个
        /// </summary>
        /// <param name="p">可选，可以是字串、jquery和dom node, 默认document.documentElement</param>
        /// <returns value='_locationClass.NewObject()'></returns>
        bingo.isString(p) && (p = '[bg-name="' + p + '"]');
        var node = null;
        if (bingo.isString(p))
            node = document.querySelectorAll(p)[0];
        else if (p)
            node = p;

        var isRoute = node ? true : false;
        if (!isRoute)
            node = _documentElement;

        var o = node[_dataKey];
        if (!o) {
            o = new _locationClass().ownerNode(node).isRoute(isRoute).name(node.getAttribute('bg-name') || '');
            o.bgLinkNode(node);
            o.bgOnDispose(function () {
                node[_dataKey] = null;
                this.bgTrigger('onClosed');

            });
            node[_dataKey] = o;
        }
        return o;
    };

    bingo.location.bgEventDef('onHref onHrefBefore onLoadBefore onLoaded');

    var _hashReg = /#([^#]*)$/,
        _hash = function (url) {
            return _hashReg.test(url) ? RegExp.$1 : '';
        };
    bingo.extend(bingo.location, {
        href: function (url, target) {
            var loc = target instanceof _locationClass ? target : bingo.location(target);
            if (loc.isRoute()) {
                loc.ownerNode().setAttribute(_routeCmdName, url);
                loc.bgTrigger('onHref', [url]);
            }
        },
        hash: function (url) {
            return _hash(url);
        }
    });

    var _locationClass = bingo.location.Class = bingo.Class(function () {

        this.Prop({
            ownerNode: null,
            //是否路由出来的, 否则为window
            isRoute: false,
            name:''
        });

        this.Define({
            //路由query部分参数
            queryParams: function () {
                return this.routeParams().queryParams
            },
            //路由参数
            routeParams: function () {
                var url = this.url();
                var routeContext = bingo.routeContext(url);
                return routeContext.params;
            },
            href: function (url, target) {
                bingo.location.href(url, bingo.isNullEmpty(target) ? this : target);
            },
            reload: function (target) {
                return this.href(this.url(), target);
            },
            onLoaded: function(callback){
                return this.on('onLoaded', callback);
            },
            url: function () {
                if (this.isRoute())
                    return this.ownerNode().getAttribute(_routeCmdName);
                else
                    return window.location + '';
            },
            hash: function () {
                return bingo.location.hash(this.url());
            },
            toString: function () {
                return this.url();
            },
            views: function () {
                return bingo.view(this.ownerNode())._bgpri_.children;
            },
            close: function () {
                if (!this.isRoute()) return;
                if (this.bgTrigger('onCloseBefore') === false) return;
                var node = this.ownerNode();
                node.parentNode.removeChild(node);
            }
        });

        this.Event('onHref onCloseBefore onClosed');

    });

    //$location.href('view/demo/userlist')
    //$location.href('view/demo/userlist', 'main')
    bingo.service('$location', ['node', function (node) {
        return function (targer) { return bingo.location(targer || node); };
    }]);

    /*
        使用方法:
        bg-route="system/user/list"
    
        连接到system/user/list, 目标:main
        <a href="#system/user/list" bg-target="main">在main加载连接</a>
        设置frame:'main'
        <div bg-route="" bg-name="main"></div>
    */
    var _tagRoute = 'bg-route', _tagCtrl = 'bg-controller';
    bingo.command(_tagRoute, function () {
        return {
            priority: 1000,
            replace: false,
            view: true,
            compileChild: false,
            compilePre: ['node', function (node) {
                this.tmpl = node.getAttribute(_tagRoute);
                node.setAttribute(_tagCtrl, this.tmpl);
            }],
            compile: ['$compile', 'node', '$attr', '$location', function ($compile, node, $attr, $location) {

                //只要最后一次，防止连续点击链接
                var _node = node.cloneNode(false), _last = null, _href = function (url) {
                    if (bingo.location.bgTrigger('onLoadBefore', [url, $location]) === false) return;
                    _last && !_last.bgIsDispose && _last.stop();
                    _last = $compile(_node.outerHTML).replaceTo(node);
                    return _last.compile().then(function () {
                        _last = null;
                        if ($attr.bgIsDispose) return;
                        $location.bgTrigger('onLoaded', [$location, url]);
                        bingo.location.bgTrigger('onLoaded', [$location]);
                    });
                };

                $location().onHref(function (url) {
                    _node.setAttribute(_tagCtrl, url);
                    _node.setAttribute(_tagRoute, url);
                    _href(url);
                });
                
                //console.log('bg-route init==============>');
                //return _href($attr.content, 0);
            }]
        };
    }); //end bg-route

})(bingo);


(function (bingo, undefined) {
    "use strict";

    //aFrame====================================

    var _rAFrame = window.requestAnimationFrame,
        _cAFrame = window.cancelAnimationFrame,
        _aFrame = function (fn, frN, obj) {
            /// <param name="fn" value="fn.call(obj, obj)"></param>
            obj.id = _rAFrame(function () {
                if (frN == 0)
                    fn.call(obj, obj);
                else
                    _aFrame(fn, frN - 1, obj);
            });
        };

    if (!_rAFrame) {
        var prefixes = ['webkit','moz','ms','o']; //各浏览器前缀
        bingo.each(prefixes, function (prefix) {
            _rAFrame = window[prefix + 'RequestAnimationFrame'];
            if (_rAFrame) {
                _cAFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
                return false;
            }
        });

        if (!_rAFrame) {
            _rAFrame = function (callback) {
                return window.setTimeout(callback, 10);
            };
            _cAFrame = function (id) {
                window.clearTimeout(id);
            };
        }
    }
    bingo.isAFrame = !!_rAFrame;

    bingo.aFrame = function (fn, frN) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="fn"></param>
        /// <param name="frN">第几帧， 默认0</param>
        (!bingo.isNumeric(frN) || frN < 0) && (frN = 0);
        var obj = {
            stop: function () { _cAFrame(this.id); },
            next: function (fn) { return bingo.aFrame(fn, frN); },
            frame:bingo.aFrame
        };
        _aFrame(fn, frN, obj);
        return obj;
    };
    bingo.aFramePromise = function (frN) {
        return _Promise(function (r) {
            bingo.aFrame(r, frN);
        });
    };
    bingo.aFrameProxy = function (fn, frN) {
        var doing = false;
        var fFn = function () {
            if (doing) return;
            doing = true;
            var args = arguments;
            bingo.aFrame(function () { doing = false; fn.apply(this, args); }.bind(this), frN);
        };
        //保存原来observe fn
        fFn.orgFn = fn;
        return fFn;
    };
    //end _rAFrame


    var _Promise = bingo.Promise,
        _isPromise = _Promise.isPromise, _promisePush = function (promises, p) {
            _isPromise(p) && promises.push(p);
            return p;
        }, _promisePushList = function (promises, list) {
            bingo.each(list, function (item) { _promisePush(promises, item); });
            return list;
        }, _retPromiseAll = function (promises) {
            return promises.length > 0 ? _Promise.always(promises) : undefined;
        }, _promiseAlways = function (promises, then) {
            return promises.length > 0 ? _Promise.always(promises).then(then) : then();
        };

    var _isLinkNodeType = function (type) {
        return type == 1 || type == 8;
    },
    _isRemoveAll = function (nodes) {
        return bingo.inArray(function (item, i) {
            return _isLinkNodeType(item.nodeType) ? !!item.parentNode : false;
        }, nodes) < 0;
    },
    _linkNodes = function (cacheName, nodes, callback) {
        bingo.each(nodes, function (item) {
            if (_isLinkNodeType(item.nodeType)) {
                var fn = function () {
                    //删除没用的node
                    nodes = bingo.removeArrayItem(function (item) {
                        return item == this || !item.parentNode;
                    }.bind(this), nodes);
                    if (callback && _isRemoveAll(nodes)) callback();
                };
                (item[cacheName] || (item[cacheName] = [])).push(fn);
                bingo.linkNode(item, fn);
            }
        });
    },
    _unLinkNodes = function (cacheName, nodes) {
        bingo.each(nodes, function (item) {
            item[cacheName] && bingo.each(item[cacheName], function (fn) {
                bingo.unLinkNode(item, fn);
            });
        });
    };

    var _vm = {
        _cacheName: '__contextFun__',
        bindContext: function (cacheobj, content, hasRet, view, node, withData) {

            var cacheName = [content, hasRet].join('_');
            var contextCache = (cacheobj[_vm._cacheName] || (cacheobj[_vm._cacheName] = {}));
            if (contextCache[cacheName]) return contextCache[cacheName];

            hasRet && (content = ['try { return ', content, ';} catch (e) {bingo.observe.error(e);}'].join(''));
            //console.log('bind', node || view);
            var fnDef = [
                        'with ($view) {',
                            //如果有withData, 影响性能
                            withData ? 'with ($withData) {' : '',
                                'return function (event) {',
                                    content,
                                '}.bind(_this_);',
                            withData ? '}' : '',
                        '}'].join('');
            try {
                return contextCache[cacheName] = (new Function('_this_', '$view', '$withData', 'bingo', fnDef))(node || view, view, withData, bingo);//bingo(多版本共存)
            } catch (e) {
                console.log(content);
                throw e;
            }
        }
    }; //end _vm

    //bingo.bindContext = function (owner, content, view, node, withData, event, hasRet) {
    //    var fn = _vm.bindContext(owner, content, hasRet, view, node, withData);
    //    return fn(event);
    //};


    var _newBase = function (p) {
        //基础
        var o = {
            $extend: function (p) {
                return bingo.extend(this, p);
            }
        };
        return o.$extend(p);
    }, _newBindContext = function (p) {
        //绑定上下文
        var _pri = {
            obsList: [],
            withData: {},
            valueObj: function ($this) {
                if (this.valueParams) return this.valueParams;
                var contents = $this.$contents, withData = this.withData,
                    view = $this.$view,
                    hasW = !!withData && withData.bgTestProps(contents),
                    hasView = hasW ? false : view.bgTestProps(contents),
                    hasWin = hasView ? false : window.bgTestProps(contents),
                    obj = hasW ? withData : hasW ? window : view;
                return (this.valueParams = [obj, hasW || hasView || hasWin]);
            }
        };
        var bind = _newBase({
            $view: null,
            $node: null,
            $contents: '',
            $withData: function (name, p) {
                _pri.withData[name] = p;
            },
            $bindContext: function (contents, isRet) {
                return _vm.bindContext(this, contents, isRet, this.$view, this.$node, _pri.withData);
            },
            $hasProps: function () {
                return _pri.valueObj(this)[0].bgTestProps(this.$contents);
            },
            $value: function (val) {
                var contents = this.$contents, obj = _pri.valueObj(this)[0];
                if (arguments.length == 0) {
                    return obj.bgDataValue(contents);
                } else {
                    this.$view.$updateAsync();
                    obj.bgDataValue(contents, val);
                }
            },
            $result: function (event) {
                /// <summary>
                /// 执行内容, 一定会返回结果, 不会报出错误, 没有经过过滤器
                /// 在执行之前可以改变contents
                /// </summary>
                /// <param name="event">可选, 事件</param>
                var fn = this.$bindContext(this.$contents, true);
                return fn(event);
            },
            $eval: function (event) {
                /// <summary>
                /// 执行内容, 根据执行返回结果, 会报出错误
                /// 在执行之前可以改变contents
                /// </summary>
                /// <param name="event">可选, 事件</param>
                var fn = this.$bindContext(this.$contents, false);
                return fn(event);
            },
            $layout: function (wFn, fn, num, init) {
                if (arguments.length == 1) {
                    fn = wFn;
                    wFn = function () {
                        return this.$result();
                    }.bind(this);
                }
                _cpInitList.push(function () {
                    var obs = this.$view.$layout(wFn, fn, num, this, true);
                    _pri.obsList.push(obs);
                    return (init !== false) ? obs.publish(true) : null;
                }.bind(this));
            },
            $layoutValue: function (fn) {
                this.$hasProps() || this.$value(undefined);
                return this.$layout(function () { return this.$value(); }.bind(this), fn);
            }
        }).$extend(p);

        bind.bgOnDispose(function () {
            bingo.each(_pri.obsList, function (obs) {
                obs.bgIsDispose || obs.unObserve();
            });
        });
        bind.bgDispose(_pri);
        return bind;

    }, _newView = function (p) {

        var _pri = {
            obsList: [],
            obsListUn: [],
            ctrls: [],
            inits: [],
            readys: [],
            readyAlls:[]
        };

        //新建view
        var view = _newBase({
            $controller: function (fn) {
                _pri.ctrls.push(fn);
            },
            $init: function (fn) {
                _pri.inits.push(fn);
            },
            $ready: function (fn) {
                _pri.readys.push(fn);
            },
            $readyAll: function (fn) {
                _pri.readyAlls.push(fn);
            },
            $observe: function (p, fn, dispoer, check) {
                var fn1 = function () {
                    //这里会重新检查非法绑定
                    //所以尽量先定义变量到$view, 再绑定
                    this.$updateAsync();
                    return fn.apply(this, arguments);
                }.bind(this);
                fn1.orgFn = fn.orgFn;//保存原来observe fn
                var obs = !bingo.isFunction(p) ? bingo.observe(this, p, fn1)
                    : bingo.observe(p, fn1);
                //check是否检查, 如果不检查直接添加到obsList
                if (!check || !obs.isObs)
                    (obs.isObs ? _pri.obsList : _pri.obsListUn).push([obs, dispoer, check]);
                return obs;
            },
            $layout: function (p, fn, fnN, dispoer, check) {
                return this.$observe(p, bingo.aFrameProxy(fn, fnN), dispoer, check);
            },
            $layoutAfter: function (p, fn, dispoer, check) {
                return this.$layout(p, fn, 1, dispoer, check);
            },
            $update: function (force) {
                if (!this.$isReady) return;
                this.bgToObserve(true);

                //检查非法观察者
                _pri.obsListUn = _pri.obsListUn.filter(function (item, index) {
                    var dispoer = item[1], obs = item[0], check = item[2];
                    if (dispoer && dispoer.bgIsDispose) {
                        obs.unObserve();
                        return false;
                    }
                    if (!obs.bgIsDispose) {
                        if (!obs.isSucc)
                            obs.refresh();
                        else if (!obs.isObs)
                            force ? obs.refresh() : obs.check();//check();

                        if (obs.isObs) {
                            //如果不是check, 添加到_obsList
                            if (!item[2]) _pri.obsList.push(item);
                            return false;
                        }
                    }
                    return true;
                }, this);
            },
            $updateAsync: function () {
                if (this._upastime_) clearTimeout(this._upastime_);
                this._upastime_ = setTimeout(function () { this.$update(); }.bind(this), 1);
            }
        }).$extend(p);

        view.bgOnDispose(function () {
            bingo.each(_pri.obsList, function (item) {
                item[0].bgIsDispose || item[0].unObserve();
            });

            bingo.each(_pri.obsList, function (item) {
                item[0].bgIsDispose || item[0].unObserve();
            });
            _removeView(this);
        });
        view.bgDispose(_pri);

        _viewCtrls.push(function () {
            if (this.bgIsDispose) return;
            var ctrls = _pri.ctrls;
            if (ctrls) {
                _pri.ctrls = [];
                bingo.each(ctrls, function (item) {
                    item && item.call(this, this);
                }, this);
            }
            this.bgToObserve();
        }.bind(view));
        _viewInitList.push(function () {
            if (this.bgIsDispose) return;
            var inits = _pri.inits, promises = [];
            if (inits) {
                _pri.inits = [];
                bingo.each(inits, function (item) {
                    _promisePush(promises,  item && item.call(this, this));
                }, this);
            }
            this.bgToObserve();
            return promises;
        }.bind(view));

        _viewReadyList.push(function () {
            if (this.bgIsDispose) return;
            var readys = _pri.readys, promises = [];
            if (readys) {
                _pri.readys = [];
                bingo.each(readys, function (item) {
                    _promisePush(promises, item && item.call(this, this));
                }, this);
            }
            this.bgToObserve();
            return promises;
        }.bind(view));
        _viewReadyAllList.push(function () {
            if (this.bgIsDispose) return;
            var readys = _pri.readyAlls, promises = [];
            if (readys) {
                _pri.readyAlls = [];
                bingo.each(readys, function (item) {
                    _promisePush(promises, item && item.call(this, this));
                }, this);
            }
            this.bgToObserve();
            return promises;
        }.bind(view));

        //编译时同步用
        _addView(view);
        return view;
    }, _newCP = function (p) {
        //todo asdfsf
        var _pri = {
            removeNodes: function (nodes) {
                if (nodes) {
                    _unLinkNodes('_cpLinkC', nodes);
                    bingo.each(nodes, function (item) {
                        _removeNode(item);
                    });
                }
            },
            clear: function (cp) {
                bingo.each(cp.$children, function (item) {
                    item.bgDispose();
                });
                bingo.each(cp.$virtualNodes, function (item) {
                    item.bgDispose();
                });
                if (cp.$childView)
                    cp.$childView.bgDispose();
                cp.$children = cp.$childView = null;
                cp.$virtualNodes = [];
            },
            getContent: function (cp) {
                if (cp._tmplFn)
                    return cp._tmplFn();
                else
                    return cp.$contents;
            },
            getPNode: function (cp) {
                var nodes = cp.$nodes;
                var index = bingo.inArray(function (item) { return !!item.parentNode; }, nodes);
                return index > -1 ? nodes[index] : null;
            }
        };

        //新建command的CP参数对象
        var cp = _newBindContext({
            $childView: null,
            $app: null,
            $cmd: '',
            $attrs: null,
            $nodes: null,
            $virtualNodes: [],
            $setNodes: function (nodes) {
                _pri.removeNodes(this.$nodes);
                this.$nodes = nodes;
                _linkNodes('_cpLinkC', nodes, function () {
                    this.bgDispose();
                }.bind(this));
            },
            $getAttr: function (name) {
                return this.$attrs.$getAttr(name);
            },
            $setAttr: function (name, contents) {
                this.$attrs.$setAttr(name, contents);
            },
            $parent: null,
            $children: null,
            $removeChild: function (cp) {
                this.$children = bingo.removeArrayItem(cp, this.$children);
            },
            $getChild: function (id) {
                var item;
                //console.log(id, this.$children);
                bingo.each(this.$children, function () {
                    if (this.$id == id) {
                        item = this;
                        return false;
                    }
                });
                return item;
            },
            $export:null,
            $html: function (s) {
                if (arguments.length > 0) {
                    _pri.clear(this);
                    this.$tmpl(s);

                    return _compile({ cp: this, context: _pri.getPNode(this) });
                } else {
                    var list = [];
                    bingo.each(this.$nodes, function (item) {
                        list.push(item.nodeType == 1 ? item.outerHTML : item.textContent);
                    });
                    return list.join('');
                }
            },
            $text: function (s) {
                if (arguments.length > 0) {
                    _pri.clear(this);
                    this.$contents = this.tmplTag = bingo.htmlEncode(s);

                    return _traverseCP(_pri.getPNode(this), this, 'insertBefore');
                } else {
                    var list = [];
                    bingo.each(this.$nodes, function (item) {
                        list.push(item.textContent);
                    });
                    return list.join('');
                }
            },
            $tmpl: function (fn) {
                this._tmplFn = bingo.isFunction(fn) ? fn : function () { return fn; };
                return this;
            },
            _render: function () {
                var ret = _pri.getContent(this);
                if (_isPromise(ret))
                    ret.then(function (s) {
                        _traverseCmd(s, this);
                    }.bind(this));
                else
                    _traverseCmd(ret, this);
                _promisePush(_renderPromise, ret)
                return this;
            },
            $render: function () {
                this._render();
                return _renderThread();
            },
            $controller: function (fn) {
                this._ctrl = fn;
            }
        }).$extend(p);

        cp.bgOnDispose(function () {
            var parent = this.$parent;
            if (parent && !parent.bgIsDispose) {
                parent.$removeChild(this);
            }
            bingo.each(this.$elseList, function (cp) {
                cp.bgIsDispose || cp.bgDispose();
            });
            this.$attrs.bgDispose();
            if (!parent || !parent.bgIsDispose) {
                _pri.removeNodes(this.$nodes);
            }
            _pri.clear(this);
        });
        cp.bgDispose(_pri);

        //编译时同步用
        _cpCtrls.push(function () {
            if (this.bgIsDispose) return;
            var ctrl = this._ctrl, view = this.$childView || this.$view;
            if (ctrl) {
                this._ctrl = null;
                ctrl.call(this, view);
            }
            if (this.$cmd != 'view' && this.$name) {
                this.$view[this.$name] = this.$export ? this.$export : view;
            }
        }.bind(cp));

        return cp;
    }, _newCPAttr = function (contents) {
        return _newBindContext({
            $contents: contents,
        });
    }, _newCPAttrs = function (contents) {
        var _names = [],
            _attrs = _newBindContext({
                $contents: contents,
                $getAttr: function (name) {
                    return this[name] ? this[name].$contents : '';
                },
                $setAttr: function (name, contents) {
                    if (this[name])
                        this[name].$contents = contents;
                    else {
                        _names.push(name);
                        this[name] = _newCPAttr(contents);
                    }
                },
                _setCP: function (cp) {
                    this.$view = cp.$view;
                    this.$cp = cp;
                    var aT;
                    bingo.each(_names, function (item) {
                        aT = this[item];
                        aT.$cp = cp;
                        aT.$app = cp.$app;
                        aT.$view = cp.$view;
                    }, this);
                }
            });
        _attrs.bgOnDispose(function () {
            bingo.each(_names, function (item) {
                this[item].bgDispose();
            }, this);
            console.log('dispose attrs');
        });
        return _attrs;
    }, _newVirtualNode = function (cp, node) {
        //如果是新view, 读取$childView
        var view = cp.$childView || cp.$view;
        var vNode = _newBase({
            $view: view,
            $app: view.app,
            $cp: cp,
            $node: node,
            $attrs: _newBase({}),
            _addAttr: function (name, contents) {
                return this.$attrs[name] = _newVirtualAttr(this, name, contents);
            }
        });
        _virtualAttrs(vNode, node);
        cp.$virtualNodes.push(vNode);
        vNode.bgOnDispose(function () {
            var attrs = this.$attrs;
            bingo.eachProp(attrs, function (item) {
                item.bgDispose();
            });
        });
        return vNode;
    }, _newVirtualAttr = function (vNode, name, contents) {
        var vAttr = _newBindContext({
            $cp: vNode.$cp,
            $vNode: vNode,
            $node: vNode.$node,
            $app: vNode.$app,
            $view: vNode.$view,
            $name: name,
            $contents: contents,
            $attr: function (val) {
                if (arguments.length == 0)
                    return this.$attrEx(this.$name);
                else
                    this.$attrEx(this.$name, val);
            },
            $prop: function (val) {
                if (arguments.length == 0)
                    return this.$propEx(this.$name);
                else
                    this.$propEx(this.$name, val);
            },
            $attrEx: function (name, val) {
                var node = this.$node,
                    aLen = arguments.length;
                switch (name) {
                    case 'class':
                        if (aLen == 1)
                            return node.className;
                        node.className = val;
                        break;
                    case 'value':
                        var isSelect = node.tagName.toLowerCase() == 'select';
                        if (aLen == 1)
                            return (isSelect ? _valSel : _val)(node);
                        else
                            (isSelect ? _valSel : _val)(node, val);
                        break;
                    default:
                        if (aLen == 1)
                            return _attr(node, name);
                        else
                            _attr(node, name, val);
                        break;
                }
            },
            $propEx: function (name, val) {
                if (arguments.length == 1)
                    return _prop(this.$node, name);
                else
                    _prop(this.$node, name, val);
            },
            $css: function (name, val) {
                if (arguments.length == 1)
                    return _css(this.$node, name);
                else
                    _css(this.$node, name, val);
            },
            $show: function () {
                _show(this.$node);
            },
            $hide: function () {
                _hide(this.$node);
            },
            $on: function (name, fn, useCaptrue) {
                _eventList.push(bingo.sliceArray(arguments));
                _on.apply(this.$node, arguments);
            },
            $one: function (name, fn, useCaptrue) {
                var args = bingo.sliceArray(arguments),
                    node = this.$node;
                args[2] = function () {
                    fn && fn.apply(this, arguments);
                    _off.apply(node, arguments);
                };
                _eventList.push(args);
                _on.apply(node, args);
            },
            $off: function (name, fn, useCaptrue) {
                _off.apply(this.$node, arguments);
            }
        });

        var _eventList = [];
        vAttr.bgOnDispose(function () {
            bingo.each(_eventList, function (item) {
                _off.apply(this.$node, item);
            }.bind(this));
        });

        var def = _defAttr(name);
        def(vAttr);

        return vAttr;
    };

    bingo.controller('view_test1', function ($view) {
        console.log('view controller', $view);
        //user.desc
        $view.user = {
            desc: 'asdfasdfasfdasdf11<br />asdfasdf<div>sdf</div> {{html "<div>div</div><div>div1</div>asdf" /}}sdfs{{html name /}}sdf',
            enabled: true,
            role: 'test'
        };

        window.view1 = $view;
    });



    var _commands = {}, _defCommand = function (name, fn) {

        if (arguments.length == 1)
            return _commands[name];
        else
            _commands[name] = fn;
    };

    _defCommand('view', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var ctrl = cp.$getAttr('controller');
        if (ctrl) {
            ctrl = bingo.controller(ctrl);
            ctrl && cp.$view.$controller(ctrl.fn);
        }

        return cp;
    });
    _defCommand('splice', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('<div class="splice">{{view /}} {{text title /}}==============================</div>');

        cp.$controller(function ($view) {
            $view.title = cp.$name;
        });

        //cp.$export = { test: '' };

        return cp;
    });

    _defCommand('controller', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('');

        cp.$view.$controller(function () {
            cp.$eval();
        });

        return cp;
    });


    _defCommand('for', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        var src = cp.$getAttr('src');

        var itemName = 'item', dataName = 'datas';
        cp.$contents = dataName;
        cp.$tmpl('');

        cp.$layout(function () {
            return cp.$result();
        }, function (c) {
            cp.$html(c.value);
        });

        return cp;
    });

    _defCommand('if', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl('');

        var _contents = cp.$contents,
            _elseList = cp.$elseList, _getContent = function (index, val) {
                if (index == -1 && val)
                    return _contents;
                else {
                    var ret = cp.$attrs.$result();
                    if (ret) return _contents;
                    var s;
                    bingo.each(_elseList, function (item, i) {
                        if (!item.$attrs.$contents || (index == i && val)
                            || item.$attrs.$result()) {
                            s = item.$contents
                            return false;
                        }
                    });
                    return s;
                }
            };

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            //console.log('if====>', cp.$contents);
            cp.$html(_getContent(-1, c.value));
        });

        bingo.each(_elseList, function (item, index) {
            item.$attrs.$contents && cp.$layout(function () {
                return item.$attrs.$result();
            }, function (c) {
                cp.$html(_getContent(index, c.value));
            }, 0, false);
        });

        return cp;
    });

    _defCommand('include', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$tmpl(function () {
            return bingo.tmpl(cp.$getAttr('src'));
        });

        return cp;
    });

    _defCommand('html', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            cp.$html(c.value);
        });

        return cp;
    });

    _defCommand('text', function (cp) {
        /// <param name="cp" value="_newCP()"></param>

        cp.$layout(function () {
            return cp.$attrs.$result();
        }, function (c) {
            cp.$text(c.value);
        });

        return cp;
    });

    _defCommand('select', function (cp) {
        /// <param name="cp" value="_newCP()"></param>
        cp.$tmpl('{{view /}}<select>{{for item in datas}}<option value="1"></option>{{/for}}</select>');

        cp.$controller(function ($view) {
            console.log('select1 controller');
            $view.idName = '';
            $view.textName = '';
            $view.id = '';
            $view.datas = '';
        });

        return cp;
    });



    //指令解释:
    //{{cmd /}}
    //{{cmd attr="asdf" /}}
    //{{cmd attr="asdf"}} contents {{/cmd}}
    var _commandReg = /\{\{\s*(\S+)\s*(.*?)\/\}\}|\{\{\s*(\S+)\s*?(.*?)\}\}((?:.|\n|\r)*)\{\{\/\3\}\}/gi,
        //解释else
        _checkElse = /\{\{\s*(\/?if|else)\s*(.*?)\}\}/gi,
        //解释指令属性: attr="fasdf"
        _cmdAttrReg = /(\S+)\s*=\s*(?:\"((?:\\\"|[^"])*?)\"|\'((?:\\\'|[^'])*?)\')/gi;

    //scriptTag
    var _getScriptTag = function (id) { return ['<', 'script type="text/html" bg-id="', id, '"></', 'script>'].join(''); };

    var _allViews = [],
        _addView = function (view) {
            _allViews.push(view);
        },
        _removeView = function (view) {
            _allViews = bingo.removeArrayItem(view, _allViews);
        },
        _getView = function (name) {
            var index = bingo.inArray(function (item) { return item.$name == name; }, _allViews);
            return index > -1 ? _allViews[index] : null;
        };


    var _tmplCmdReg = /\{\{\s*(\/?)\s*([^\s{}]+)\s*((?:(?:.|\n|\r)(?!\{\{|\}\}))*)(.?)\}\}/gi;

    var _traverseTmpl = function (tmpl) {
        var item, isSingle, isEnd, tag, attrs, find, contents,
            list = [], strAll = [], lastIndex = 0,
            strIndex = 0,
            index, lv = 0, id;
        _tmplCmdReg.lastIndex = 0;
        while (item = _tmplCmdReg.exec(tmpl)) {
            find = item[0];
            index = item.index;

            tag = item[2];
            isSingle = item[4] == '/' || tag == 'else' || tag == 'case';
            isEnd = isSingle || item[1] == '/';
            attrs = item[3];
            !isSingle && (attrs = attrs + item[4]);

            if (lv == 0) {
                if (isSingle || !isEnd) {

                    contents = tmpl.substr(lastIndex, index - lastIndex);
                    strAll.push(contents);

                    id = bingo.makeAutoId();
                    strAll.push(_getScriptTag(id));
                    list.push({
                        id: id,
                        //lv: lv,
                        index: index,
                        //find: find,
                        single: isSingle,
                        end: isEnd,
                        tag: tag,
                        attrs: attrs,
                        contents: ''
                    });
                }
                strIndex = index + find.length;
            }
            if (isEnd) {
                if (!isSingle) lv--;
                if (lv == 0)
                    list[list.length - 1].contents = tmpl.substr(strIndex, index - strIndex);
            } else {
                lv++;
            }
            lastIndex = index + find.length;
            //console.log(item);
        }
        strAll.push(tmpl.substr(lastIndex, tmpl.length - lastIndex))

        //console.log('list', list.length, list, strAll.join(''));
        return { contents: strAll.join(''), regs: list };
    };
    //var tmpl2 = document.getElementById('tmpl2').innerHTML;
    //_traverseTmpl(tmpl2);

    var _traverseCmd = function (tmpl, cp) {
        //_commandReg.lastIndex = 0;
        var list = [], view, app;
        //console.log(cp.cmd, cp)
        bingo.isString(tmpl) || (tmpl = bingo.toStr(tmpl));
        var tmplContext = _traverseTmpl(tmpl);

        tmpl = tmplContext.contents;
        bingo.each(tmplContext.regs, function (reg) {

            var elseList, whereList, item,
                cmd = reg.tag,
                contents = reg.contents;
            contents && (contents = bingo.trim(contents));
            if (cmd == 'if') {
                var elseContent = _traverseElse(contents);
                contents = elseContent.contents;
                elseList = elseContent.elseList;
                whereList = elseContent.whereList;
            }
            item = {
                $id: reg.id,
                $cmd: cmd,
                $attrs: _traverseAttr(reg.attrs),
                $contents: contents,
                $elseList: elseList,
                $whereList: whereList
            };
            (item.$cmd == 'view') && (view = item);
            list.push(item);

        });

        //tmpl = tmpl.replace(_commandReg, function (find, cmd, attrs, cmd1, attrs1, content1) {
        //    //console.log('_commandEx', arguments);
        //    var id = bingo.makeAutoId(), elseList, whereList, item;
        //    content1 && (content1 = bingo.trim(content1));
        //    if (cmd1 == 'if') {
        //        var elseContent = _traverseElse(content1);
        //        content1 = elseContent.contents;
        //        elseList = elseContent.elseList;
        //        whereList = elseContent.whereList;
        //    }
        //    item = {
        //        $id: id,
        //        $cmd: cmd1 || cmd,
        //        $attrs: _traverseAttr(attrs1 || attrs),
        //        $contents: content1 || '',
        //        $elseList: elseList,
        //        $whereList: whereList
        //    };
        //    (item.$cmd == 'view') && (view = item);
        //    list.push(item);

        //    return _getScriptTag(id);
        //});

        if (view) {
            app = bingo.app(view.$attrs.$getAttr('app'));
            view = _newView({
                $name: bingo.trim(view.$attrs.$getAttr('name')),
                $app: app
            });
            cp.$childView = view;
        } else {
            app = cp.$app;
            view = cp.$view;
        }

        var children = [], tempCP, cmdDef, elseList, whereList;
        bingo.each(list, function (item) {
            //console.log('cmd', item.$cmd, view);
            tempCP = _newCP(item);
            tempCP.$view = view;
            tempCP.$attrs._setCP(tempCP);
            tempCP.$app = app;
            tempCP.$parent = cp;
            tempCP.$name = bingo.trim(tempCP.$attrs.$getAttr('name'));
            cmdDef = _defCommand(item.$cmd);
            elseList = tempCP.$elseList;
            if (elseList) {
                var cpT, whereList = tempCP.$whereList;
                bingo.each(elseList, function (item, index) {
                    cpT = _newCP({
                        $app: app,
                        $attrs: _traverseAttr(whereList[index]),
                        $view: view, $contents: item
                    });
                    cpT.$attrs._setCP(cpT);
                    //cpT._render();
                    //_promisePush(promises, cpT.$render());
                    elseList[index] = cpT;
                });
                tempCP.$whereList = null;
            }
            cmdDef && cmdDef(tempCP);
            tempCP._render();
            //_promisePush(promises, tempCP.$render());
            children.push(tempCP);
        });
        cp.$children = children;
        cp.tmplTag = tmpl;
        //return _retPromiseAll(promises);
    }, _traverseElse = function (contents) {
        var lv = 0, item, cmd, index = -1, start = -1;
        _checkElse.lastIndex = 0;
        var elseList = [], whereList = [], wh;
        while (item = _checkElse.exec(contents)) {
            cmd = item[1];
            wh = bingo.trim(item[2]);
            switch (cmd) {
                case 'if':
                    lv++;
                    break;
                case 'else':
                    if (lv <= 0) {
                        whereList.push(wh);
                        if (start == -1) start = item.index;
                        if (index >= 0) {
                            elseList.push(contents.substr(index, item.index - index));
                        }
                        //查找到位置加查找的长度
                        index = item.index + item[0].length;
                    }
                    break;
                case '/if':
                    lv--;
                    break;
            }
        }
        if (lv <= 0) {
            elseList.push(contents.substr(index));
        }

        return { contents: start > -1 ? contents.substr(0, start) : contents, elseList: elseList, whereList: whereList };
    }, _traverseAttr = function (s) {
        _cmdAttrReg.lastIndex = 0;
        var item, attrs = _newCPAttrs(s);
        while (item = _cmdAttrReg.exec(s)) {
            attrs.$setAttr(item[1], item[2] || item[3]);
        }
        return attrs;
    }, _renderPromise = [], _renderThread = function () {
        var promises = _renderPromise;
        _renderPromise = [];
        return _Promise.always(promises).then(function () {
            if (_renderPromise.length > 0) return _renderStep();
        });
    }, _cpCtrls = [], _cpCtrlStep = function () {
        var ctrls = _cpCtrls;
        if (ctrls.length > 0) {
            _cpCtrls = [];
            bingo.each(ctrls, function (ctrl) {
                ctrl();
                _cpCtrlStep();
            });
        }
    }, _viewCtrls = [], _viewCtrlStep = function () {
        var ctrls = _viewCtrls;
        if (ctrls.length > 0) {
            _viewCtrls = [];
            bingo.each(ctrls, function (ctrl) {
                ctrl();
                _viewCtrlStep();
            });
        }
    }, _cpInitList = [], _cpInitStep = function () {
        var initList = _cpInitList;
        var promises = [];
        if (initList.length > 0) {
            _cpInitList = [];
            bingo.each(initList, function (fn) {
                _promisePush(promises, fn());
            });
        }
        return promises;
    }, _viewInitList = [], _viewInitStep = function () {
        var initList = _viewInitList;
        var promises = [];
        if (initList.length > 0) {
            _viewInitList = [];
            bingo.each(initList, function (fn) {
                _promisePushList(promises, fn());
            });
        }
        return promises;
    }, _viewReadyList = [], _viewReadyStep = function () {
        var initList = _viewReadyList;
        var promises = [];
        if (initList.length > 0) {
            _viewReadyList = [];
            bingo.each(initList, function (fn) {
                _promisePushList(promises, fn());
            });
        }
        return promises;
    }, _viewReadyAllList = [], _viewReadyAllStep = function () {
        var initList = _viewReadyAllList;
        var promises = [];
        if (initList.length > 0) {
            _viewReadyAllList = [];
            bingo.each(initList, function (fn) {
                _promisePushList(promises, fn());
            });
        }
        return promises;
    };

    /* 检测 scope */
    var _qScope = ":scope ";
    try {
        _docEle.querySelector(":scope body");
    } catch (e) {
        _qScope = '';
    }

    var _doc = document,
        _docEle = _doc.documentElement, _queryAll = function (selector, context) {
            context || (context = _docEle);
            return context.querySelectorAll(_qScope + selector);
        }, _query = function (selector, context) {
            context || (context = _docEle);
            return context.querySelector(_qScope + selector);
        };


    var _removeNode = function (node) {
        node.parentNode && node.parentNode.removeChild(node);
    }, _injWithName = 'bingo_cmpwith_';

    var _spTags = 'html,body,head', _wrapMap = {
        select: [1, "<select multiple='multiple'>", "</select>"],
        fieldset: [1, "<fieldset>", "</fieldset>"],
        table: [1, "<table>", "</table>"],
        tbody: [2, "<table><tbody>", "</tbody></table>"],
        tr: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
        colgroup: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
        map: [1, "<map>", "</map>"],
        div: [1, "<div>", "</div>"]
    }, _scriptType = /\/(java|ecma)script/i,
    _cleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g, _globalEval = function (node) {
        if (node.src) {
            bingo.using(node.src);
        } else {
            var data = (node.text || node.textContent || node.innerHTML || "").replace(_cleanScript, "");
            if (data) {
                (window.execScript || function (data) {
                    window["eval"].call(window, data);
                })(data);
            }
        }
    }, _parseSrcipt = function (container, script) {
        bingo.each(container.querySelectorAll('script'), function (node) {
            if (!node.type || _scriptType.test(node.type)) {
                _removeNode(node);
                script && _globalEval(node);
            }
        });
    }, _parseHTML = function (html, p, script) {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="html"></param>
        /// <param name="p">可以父节点或父节点tagName</param>
        /// <param name="script">是否运行script</param>
        /// <returns value=''></returns>
        var tagName = p ? (bingo.isString(p) ? p : p.tagName.toLowerCase()) : '';
        var wrap = _wrapMap[tagName] || _wrapMap.div, depth = wrap[0];
        html = wrap[1] + html + wrap[2];
        var container = _doc.createElement('div');
        container.innerHTML = html;
        while (depth--) {
            container = container.lastChild;
        }
        _parseSrcipt(container, script);
        return bingo.sliceArray(container.childNodes);
    }, _insertDom = function (nodes, refNode, fName) {
        //fName:appendTo, insertBefore
        var p;
        if (nodes.length > 1) {
            p = document.createDocumentFragment();
            bingo.each(nodes, function (item) {
                p.appendChild(item);
            });
        } else
            p = nodes[0];
        if (fName == 'appendTo')
            refNode.appendChild(p);
        else
            refNode.parentNode[fName](p, refNode);
    };

    //是否支持select注释
    var _isComment = (_parseHTML('<option>test</option><!--test-->', 'select').length > 1),
        _commentPrefix = 'bgcpid_',
        //取得cp空白节点
        _getCpEmptyNode = function (cp) {
            var html = (_isComment) ?
                ['<!--', _commentPrefix, cp.$id, '-->'].join('') :
                _getScriptTag(cp.$id);
            return _parseHTML(html)[0];
        },
        _isScriptTag = /script/i,
        //取得render cp标签节点
        _getEmptyRenderId = function (node) {
            return (_isScriptTag.test(node.tagName)) ?
                node.getAttribute('bg-id') : null;
        },//,
        //_getEmptyNodeId = function (node) {
        //    if (_isComment) {
        //        if (node.nodeType == 8) {
        //            var val = node.nodeValue;
        //            if (val.indexOf(_commentPrefix) == 0) {
        //                return val.replace(_commentPrefix, '');
        //            }
        //        }
        //    } else {
        //        return (_isScriptTag.test(node.tagName)) ?
        //            node.getAttribute('bg-id') : null;
        //    }
        //},

        //检查是否空内容（没有nodeType==1和8）, 如果为空， 添加一个临时代表
        _checkEmptyNodeCp = function (nodes, cp) {
            var empty = nodes.length == 0;
            if (!empty) {
                //是否有element节点, 注释节点不算
                empty = (bingo.inArray(function (item) {
                    return item.nodeType == 1;
                    //return _isLinkNodeType(item.nodeType);
                }, nodes) < 0);
            }
            empty && nodes.push(_getCpEmptyNode(cp));
        };

    var _traverseCP = function (refNode, cp, optName) {
        var tmpl = _renderAttr(cp.tmplTag);
        //console.log('tmpltmpltmpltmpl', tmpl);
        var nodes = _parseHTML(tmpl, optName == 'appendTo' ? refNode : refNode.parentNode, true);
        //console.log(cp.$cmd, nodes.length);
        if (nodes.length > 0) {
            var pNode = nodes[0].parentNode;
            _virtualNodes(cp, nodes);
            _traverseNodes(nodes, cp);
            nodes = bingo.sliceArray(pNode.childNodes);
        }

        _checkEmptyNodeCp(nodes, cp);
        _insertDom(nodes, refNode, optName);
        cp.$setNodes(nodes);
    }, _traverseNodes = function (nodes, cp) {

        var id, tempCP;
        bingo.each(nodes, function (item) {
            if (item.nodeType == 1) {
                id = _getEmptyRenderId(item);
                if (id) {
                    tempCP = cp.$getChild(id);
                    if (tempCP) {
                        //console.log('tempCP', tempCP);
                        _traverseCP(item, tempCP, 'insertBefore');
                        _removeNode(item);
                    }
                } else {
                    _traverseNodes(_queryAll('script', item), cp);
                }
            }
        });
    };

    //_compile({view:view, tmpl:tmpl, context:'#context1'});
    //_compile({cp:cp, context:node});
    var _compile = function (p) {
        var view = p.view;
        var cp = p.cp || _newCP({
            $app: view ? view.$app : null,
            $view: view, $contents: p.tmpl
        });
        return cp.$render().then(function () {
            console.log('compile', cp.$cmd, cp);
            _cpCtrlStep();
            _viewCtrlStep();
            var node, opName;
            if (p.cp) {
                node = p.context;
                opName = 'insertBefore';
            } else {
                node = bingo.isString(p.context) ? _query(p.context) : p.context;
                opName = 'appendTo';
            }
            var fr = _traverseCP(node, cp, opName);
            console.log('_traverseCP', node.innerHTML);
            //console.log('render End', new Date());
            return _complieInit();
        });
    }, _complieInit = function () {
        var deferred = bingo.Deferred(), has = false;
        _promiseAlways(_cpInitStep(), function (r) {
            has || (has = !!r);
            _promiseAlways(_viewInitStep(), function (r) {
                has || (has = !!r);
                _promiseAlways(_viewReadyStep(), function (r) {
                    has || (has = !!r);
                    _promiseAlways(_viewReadyAllStep(), function (r) {
                        has || (has = !!r);
                        deferred.resolve();
                    });
                });
            });
        });
        var promise = deferred.promise();
        has && promise.then(function () { return _complieInit(); });
        return promise;
    };

    //console.time('aaaa');
    //var _tranContext = _newTranContext(), cmdList = _traverseCmd(tmpl, _tranContext);
    //_tranContext.promise().then(function () {
    //    console.log('cmdList', cmdList);
    //    //console.timeEnd('aaaa');
    //});

    var _attrENode = document.createElement('div'),
        _attrEReg = /^.*encode=['"](.*)['"].*$/i,
        _attrEncode = function (s) {
            _attrENode.setAttribute('encode', s);
            return _attrENode.outerHTML.replace(_attrEReg, '$1');
        };

    bingo.attrEncode = _attrEncode;
    bingo.attrDecode = bingo.htmlDecode;


    //查找dom 节点 <div>
    var _domNodeReg = /\<.*?\[\[.*?\]\][^>]*\>/gi,
        //解释可绑定的节点属性: attr="fasdf[[user.name]]"
        _domAttrReg = /\s*(\S+)\s*=\s*((\")(?:\\\"|[^"])*?\[\[.+?\]\](?:\\\"|[^"])*\"|(\')(?:\\\'|[^'])*?\[\[.+?\]\](?:\\\'|[^'])*\')/gi,
        //用于解释节点属性时， 将内容压成bg-virtual
        //如:<div value="[user.name]" style="[[user.style]]"></div>
        //解释成<div  bg-virtual="{value:'user.name', style:'user.style'}"></div>
        _domNodeRPReg = /\s*(\/?\>)$/,
        //如果绑定纯变量时去除"', 如valu="[[user.name]]", 解释后value=[[user.name]]
        _domAttrPotReg = /^\s*['"](.*?)['"]\s*$/,
        //如果绑定纯变量时去除[], 如valu=[[user.name]], 解释后value=user.name
        _domAttrOnlyReg = /^\s*\[\[(.*?)\]\]\s*$/,
        //转义多个绑定时， 如果style="[[ok]]asdf[[false]]sdf", 解释后 style="''+ ok + 'asdf' + false + 'sdf"
        _domAttrMultReg = /\[\[(.*?)\]\]/g,
        _domAttrVirName = 'bg-virtual',
        _domAttrVirSt = [' ', _domAttrVirName, '="'].join(''),
        _domAttrVirEn = '" $1',
        _domAttrQuery = '[' + _domAttrVirName + ']';

    var _renderAttr = function (tmpl) {
        tmpl = tmpl.replace(_domNodeReg, function (find, pos, contents) {
            //console.log('domNodeReg', arguments);
            _domAttrReg.lastIndex = 0;
            var domAttrs = {}, has = false, isV = false;
            var findR = find.replace(_domAttrReg, function (findAttr, name, contents, dot, dot1) {
                //console.log('fndR', arguments);
                if (isV || name == 'bg-virtual') { has = false; isV = true; return; }
                dot = dot || dot1;
                contents = contents.replace(_domAttrPotReg, '$1')
                    .replace(_domAttrOnlyReg, '$1')

                _domAttrMultReg.lastIndex = 0;
                if (_domAttrMultReg.test(contents))
                    contents = dot + contents.replace(_domAttrMultReg, dot + ' + ($1) + ' + dot) + dot;
                //dot = dot || dot1;
                domAttrs[name] = contents;
                has = true;
                return '';// 'bg-' + findAttr;
            });
            if (has) {
                findR = findR.replace(_domNodeRPReg, [_domAttrVirSt, _attrEncode(JSON.stringify(domAttrs)), _domAttrVirEn].join(''));
                //console.log('findR', findR);
            }
            //virtual
            return isV ? find : findR;
        });
        return tmpl;
    }, _virtualNodes = function (cp, nodes) {
        var list = [], ltemp;
        bingo.each(nodes, function (item) {
            if (item.nodeType == 1) {
                if (item.hasAttribute(_domAttrVirName))
                    _newVirtualNode(cp, item);
                if (item.hasChildNodes) {
                    ltemp = _queryAll(_domAttrQuery, item);
                    if (ltemp.length > 0) {
                        bingo.each(ltemp, function (cItem) {
                            _newVirtualNode(cp, cItem);
                        });
                    }
                }
            }
        });

        if (cp && cp.$virtualNodes.length > 0)
            console.log('_virtualNodes', cp.$virtualNodes);
    },
    _virtualAttrs = function (vNode, node) {
        var attr = node.getAttribute(_domAttrVirName),
            context = JSON.parse(attr);

        var list = [];
        bingo.eachProp(context, function (item, n) {
            vNode._addAttr(n, item);
        });

    };

    var _attr = function (node, name, val) {
        if (arguments.length < 3)
            return node.getAttribute(name);
        else
            node.setAttribute(name, val)
    },
    _prop = function (node, name, val) {
        if (arguments.length < 3)
            return node[name];
        else
            node[name] = val;
    },
    _on = document.addEventListener,
    _off = document.removeEventListener,
    _val = function (node, val) {
        if (arguments.length < 2)
            return node.value;
        else
            node.value = val;
    },
    _valSel = function (node, val) {
        var one = node.type == 'select-one';
        if (one) {
            if (arguments.length < 2)
                return node.value;
            else
                node.value = val;
        } else {
            var options = node.options,
                ret = [];
            if (arguments.length < 2) {
                bingo.each(options, function (item) {
                    if (item.selected && !item.disabled)
                        ret.push(item.value);
                });
                return ret;
            } else {
                bingo.isArray(val) || (val = [val]);
                bingo.each(options, function (item) {
                    item.selected = (val.indexOf(item.value) >= 0);
                });
            }
        }
    };

    var _getComputedStyle = document.defaultView.getComputedStyle,
        _cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
        _dasherize = function (str) {
            return str.replace(/::/g, '/')
                   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                   .replace(/_/g, '-')
                   .toLowerCase();
        },
        _maybeAddPx = function (name, value) {
            return (bingo.isNumeric(value) && !_cssNumber[_dasherize(name)]) ? value + "px" : value;
        },
        _css = function (node, property, value) {
            var argLen = arguments.length;
            if (argLen < 3) {
                return argLen == 1 ? undefined : node.style[_dasherize(property)] || _getComputedStyle(node, '').getPropertyValue(_dasherize(property));
            }

            var css = null;
            property = _dasherize(property);
            if (value == '')
                node.style.removeProperty(property);
            else
                css = property + ":" + _maybeAddPx(property, value);

            css && (node.style.cssText += ';' + css);
        },
        _getshow = function (node) {
            var name = '_bgshow_';
            return name in node ? node[name] : (node[name] = _css(node, 'display'));
        },
        _show = function (node) {
            var sh = _getshow(node);
            _css(node, 'display', sh == 'none' ? 'block' : sh);
        },
        _hide = function (node) {
            _getshow(node);
            _css(node, 'display', 'none');
        },
        _spaceRE = /\s+/g,
        _getClass = function (node) {
            var cn = node.className;
            return cn ? cn.split(_spaceRE) : [];
        },
        _setClass = function (node, classNames) {
            var cn = classNames.join(' ');
            (cn == node.className) || (node.className = cn);
        },
        _hasClass = function (classNames, name) {
            return name ? classNames.indexOf(name) >= 0 : false;
        },
        _addClass = function (classNames, name) {
            _hasClass(classNames, name) || classNames.push(name);
        },
        _removeClass = function (classNames, name) {
            if (!_hasClass(classNames, name)) return classNames;
            return classNames.filter(function (item) {
                return item != name;
            });
        };

    var _vAttrDefaultName = 'bg_default_vattr', _vAttrs = {},
        _isEvent = /^\s*on/i, _defAttr = function (name, fn) {
            if (arguments.length == 1)
                return _vAttrs[name] || _vAttrs[_vAttrDefaultName];
            else
                _vAttrs[name] = fn;
        };
    _defAttr(_vAttrDefaultName, function (vAttr) {
        /// <param name="vAttr" value="_newVirtualAttr({}, 'name', 'value')"></param>

        var name = vAttr.$name, view = vAttr.$view;

        if (_isEvent.test(name)) {
            var eventName = name.replace(_isEvent, ''),
                bind = function (evName, callback) {
                    var fn = function () {
                        view.$updateAsync();
                        return callback.apply(this, arguments);
                    };
                    vAttr.$on(evName, fn);
                };

            var fn = /^\s*\[(.|\n)*\]\s*$/g.test(vAttr.$contents) ? vAttr.$result() : vAttr.$value();
            if (!bingo.isFunction(fn) && !bingo.isArray(fn))
                fn = function (e) { return vAttr.$eval(e); };
            bind(eventName, fn);
            return;
        }
        console.log('_vAttrDefaultName', name);
        vAttr.$layout(function (c) {
            console.log('_vAttrDefaultName $layout', name);
            vAttr.$attr(c.value);
        });

        return vAttr;
    });
    bingo.each('checked,unchecked,disabled,enabled,readonly'.split(','), function (attrName) {
        _defAttr(attrName, function (vAttr) {
            /// <param name="vAttr" value="_newVirtualAttr({}, 'name', 'value')"></param>

            var _set = function (val) {
                switch (attrName) {
                    case 'enabled':
                        vAttr.$propEx('disabled', !val);
                        break;
                    case 'unchecked':
                        vAttr.$propEx('checked', !val);
                        break;
                    default:
                        vAttr.$prop(val);
                        break;
                }
            };

            vAttr.$layout(function (c) {
                _set(c.value);
            });

            if (attrName == 'checked' || attrName == 'unchecked') {
                var fn = function () {
                    var value = vAttr.$propEx('checked');
                    vAttr.$value(attrName == 'checked' ? value : !value);
                };
                //如果是checked, unchecked, 双向绑定
                vAttr.$on('click', fn);
            }

            return vAttr;
        });
    });
    bingo.each('show,hide,visible'.split(','), function (attrName) {
        _defAttr(attrName, function (vAttr) {
            /// <param name="vAttr" value="_newVirtualAttr({}, 'name', 'value')"></param>
            var _set = function (val) {

                switch (attrName) {
                    case 'hide':
                        val = !val;
                    case 'show':
                        if (val) vAttr.$show(); else vAttr.$hide();
                        break;
                    case 'visible':
                        val = val ? 'visible' : 'hidden';
                        vAttr.$css('visibility', val);
                        break;
                }
            };

            $attr.$layout(function (c) {
                _set(c.value);
            });

            return vAttr;
        });
    });

    bingo.each('model,value'.split(','), function (attrName) {
        _defAttr(attrName, function (vAttr) {
            /// <param name="vAttr" value="_newVirtualAttr({}, 'name', 'value')"></param>

            var node = vAttr.$node, isVal = attrName == 'value';

            var _type = _attr(node, 'type'),
                _isRadio = _type == 'radio' && !isVal,
                _isCheckbox = _type == 'checkbox' && !isVal,
                _checkboxVal = _isCheckbox ? _val(node) : null,
                _isSelect = node.tagName.toLowerCase() == 'select';

            var _val = function (val) {
                if (arguments.length == 0)
                    return vAttr.$attrEx('value');
                else
                    vAttr.$attrEx('value', val);
            }

            var _getNodeValue = function () {
                return _isCheckbox ? (vAttr.$propEx("checked") ? _checkboxVal : '') : (_val());
            }, _setNodeValue = function (value) {
                value = _isSelect && bingo.isArray(value) ? value : bingo.toStr(value);
                if (_isCheckbox) {
                    vAttr.$propEx("checked", (_val() == value));
                } else if (_isRadio) {
                    vAttr.$propEx("checked", (_val() == value));
                } else if (_isSelect)
                    _val(value);
                else
                    _val(value);
            };

            var _eVal, eName, fn = function () {
                var value = _getNodeValue();
                if (_eVal != value || _isRadio) {
                    _eVal = value;
                    vAttr.$value(value);
                }
            };
            if (_isRadio) {
                eName = 'click';
            } else {
                eName = 'change';
            }
            if (eName) {
                vAttr.$on(eName, fn);
            }

            vAttr.$layoutValue(function (c) {
                var val = c.value;
                _setNodeValue(val);
            });

            return vAttr;
        });
    });

    //console.log(_renderAttr(tmpl));
    //console.log('domAttrReg', _domAttrList);

    bingo.view = function (name) {
        /// <summary>
        /// 获取view<br />
        /// bingo.view('main')
        /// </summary>
        return arguments.length == 0 ? _allViews : _getView(name);
    };

    bingo.rootView = function () { return _rootView; };

    var tmpl = _doc.getElementById('tmpl1').innerHTML;
    var _rootView = _newView({
        $name: '',
        $app: bingo.app('')
    });

    console.time('boot');
    _compile({
        tmpl: tmpl,
        view: _rootView,
        context: '#context1'
    }).then(function () {
        console.timeEnd('boot');
    });;

    bingo.compile = function (view) {
        return new _cmpClass().view(view);
    };


    bingo.bgEventDef('ready');

    (function () {
        return;
        //初始rootView
        _compiles.setCmpNode(_docEle);
        _rootView = new _viewClass(null, _docEle);
        new _viewnodeClass(_rootView, _docEle);

        //触发bingo.ready
        _rootView.$ready(function () {
            bingo.bgEnd('ready');
        });

        //DOMContentLoaded 时起动
        var _readyName = 'DOMContentLoaded', _ready = function () {
            doc.removeEventListener(_readyName, _ready, false);
            window.removeEventListener('load', _ready, false);
            //等待动态加载js完成后开始
            bingo.usingAll().then(function () {
                return;
                bingo.compile(_rootView).nodes(_docEle).compile().finally(function () {
                    return _rootView._bgpri_.sendReady();
                });
            });
        };
        
        doc.addEventListener(_readyName, _ready, false);
        window.addEventListener("load", _ready, false);

    })();

})(bingo);


(function (bingo) {
    "use strict";

    bingo.service('$rootView', function () { return bingo.rootView(); });
    bingo.service('$parentView', ['$view', function ($view) { return $view.$parentView(); }]);

    bingo.service('$inject', ['$view', '$attr', function ($view, $attr) {
        return function (p, withData) {
            return bingo.inject(p, $view, {
                node: $attr && $attr.node,
                $viewnode: $attr && $attr.viewnode,
                $attr: $attr,
                $withData: $attr ? bingo.extend({}, $attr.withData, withData) : withData
            }, $attr);
        };
    }]);

    bingo.service('$compile', ['$view', function ($view) { return function (p) { return bingo.compile($view).tmpl(p);  } }]);

    bingo.service('$ajax', ['$view', function ($view) {
        return function (p) { return bingo.ajax(p, $view); };
    }]);

    //$comp('select1');
    bingo.each(['$comp', '$component'], function (name) {
        bingo.service(name, ['$view', function ($view) {
            var fn = function (name) { return $view.$getComp(name); };
            fn.create = function (p) {
                return $view.$createComp(p);
            };

            return fn;
        }]);
    });

    //绑定内容解释器, var bind = $bindContext('user.id == "1"', document.body); var val = bind.getContext();
    bingo.each(['$bindContext', '$evalContext'], function (sName) {
        var hasRet = sName == '$bindContext';
        bingo.service(sName, ['$view', '$viewnode', '$withData', function ($view, $viewnode, $withData) {
            return function (content, node, withData, event) {
                node || (node = $viewnode.node);
                withData = bingo.extend({}, $withData, withData);
                return bingo.bindContext($viewnode, content, $view, node, withData, event, hasRet);
            };
        }]);
    });//end $bindContext;

    bingo.service('$observe', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$observe(p, fn, disposer);
        };
    }]);

    bingo.service('$layout', ['$view', function ($view) {
        return function (p, fn, disposer) {
            return $view.$layout(p, fn, 1, disposer);
        };
    }]);

    bingo.service('$tmpl', ['$view', function ($view) {
        return function (p, async) {
            return bingo.tmpl(p, async);
        };
    }]);

    var _cacheObj = {};
    bingo.service('$cache', function () {
        return function (key, value, max) {
            var args = [_cacheM].concat(bingo.sliceArray(arguments));
            return bingo.cache.apply(bingo, args);
        };
    });

    //参数，使用后，自动清除
    var _paramObj = {};
    bingo.service('$param', function () {
        return function (key, value) {
            if (arguments.length == 1)
                return bingo.cache(_paramObj, key);
            else
                return bingo.cache(_paramObj, key, value, 10);
        };
    });

})(bingo);


(function (bingo) {
    "use strict";
    var _Promise = bingo.Promise,
        _attr = function (node, name, val) {
            if (arguments.length < 3)
                return node.getAttribute(name);
            else
                node.setAttribute(name, val)
        },
        _prop = function (node, name, val) {
            if (arguments.length < 3)
                return node[name];
            else
                node[name] = val;
        },
        _on = document.addEventListener,
        _off = document.removeEventListener,
        _val = function (node, val) {
            if (arguments.length < 2)
                return node.value;
            else
                node.value = val;
        },
        _valSel = function (node, val) {
            var one = node.type == 'select-one';
            if (one) {
                if (arguments.length < 2)
                    return node.value;
                else
                    node.value = val;
            } else {
                var options = node.options,
                    ret = [];
                if (arguments.length < 2) {
                    bingo.each(options, function (item) {
                        if (item.selected && !item.disabled)
                            ret.push(item.value);
                    });
                    return ret;
                } else {
                    bingo.isArray(val) || (val = [val]);
                    bingo.each(options, function (item) {
                        item.selected = (val.indexOf(item.value) >= 0);
                    });
                }
            }
        };


    var _getComputedStyle = document.defaultView.getComputedStyle,
        _cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1, 'opacity': 1, 'z-index': 1, 'zoom': 1 },
        _dasherize = function(str) {
            return str.replace(/::/g, '/')
                   .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                   .replace(/_/g, '-')
                   .toLowerCase();
        },
        _maybeAddPx=function(name, value) {
            return (bingo.isNumeric(value) && !_cssNumber[_dasherize(name)]) ? value + "px" : value;
        },
        _css = function (node, property, value) {
            var argLen = arguments.length;
            if (argLen < 3) {
                return argLen == 1 ? undefined : node.style[_dasherize(property)] || _getComputedStyle(node, '').getPropertyValue(_dasherize(property));
            }

            var css = null;
            property = _dasherize(property);
            if (value == '')
                node.style.removeProperty(property);
            else
                css = property + ":" + _maybeAddPx(property, value);

            css && (node.style.cssText += ';' + css);
        },
        _getshow = function (node) {
            var name = '_bgshow_';
            return name in node ? node[name] : (node[name] = _css(node, 'display'));
        },
        _show = function (node) {
            var sh = _getshow(node);
            _css(node, 'display', sh == 'none' ? 'block' : sh);
        },
        _hide = function (node) {
            _getshow(node);
            _css(node, 'display', 'none');
        },
        _spaceRE = /\s+/g,
        _getClass = function (node) {
            var cn = node.className;
            return cn ? cn.split(_spaceRE) : [];
        },
        _setClass = function (node, classNames) {
            var cn = classNames.join(' ');
            (cn == node.className) || (node.className = cn);
        },
        _hasClass = function (classNames, name) {
            return name ? classNames.indexOf(name) >= 0 : false;
        },
        _addClass = function (classNames, name) {
            _hasClass(classNames, name) || classNames.push(name);
        },
        _removeClass = function (classNames, name) {
            if (!_hasClass(classNames, name)) return classNames;
            return classNames.filter(function (item) {
                return item != name;
            });
        };

    /*
        使用方法:
        bg-controller="function($view){}"   //直接绑定一个function
        bg-controller="ctrl/system/user"    //绑定到一个url
    */

    bingo.each(['bg-controller', 'bg-controller-add'], function (cmdName) {
        var _isAdd = cmdName == 'bg-controller-add';

        bingo.command(cmdName, function () {

            return {
                //优先级, 越小越前, 默认50
                priority: _isAdd ? 5 : 1,
                //模板, 可以是引用id, url, html和node节点
                //tmpl:'#div1'
                //tmpl:'tmpl/test.thml'
                //tmpl:'<div>{{text1}}</div>'
                //tmpl:document.body  //==> document.body.innerHTML
                tmpl: '',
                //是否替换节点, 默认为false
                replace: false,
                //是否indclude, 默认为false, 模板内容要包函{{bg-include}}
                include: false,
                //是否新view, 默认为false
                view: !_isAdd,
                //是否编译子节点, 默认为true
                compileChild: _isAdd,
                //编译前, 主要用于dom的重新改造, 只能注入$view/node/$ajax...
                //如果view == true , 注入的view属于上层, 原因是新view还没解释出来, 还处于分析
                //compilePre还可以修改本定义属性
                compilePre: null,
                //controller
                compile: null,
                //link
                link: null,
                //编译, 这时还没有appendTo文档，最好不要处理事件之类的
                //compilePre编译前-->command.controller初始数据-->view.controller-->compile编译-->插入到document-->link连接command)-->init-->ready
                controller: ['$view', '$compile', 'node', '$attr', function ($view, $compile, node, $attr) {
                    var attrVal = $attr.content, val = null,
                        name = _attr(node, 'bg-name'),
                        pView = $view.$parentView();
                    if (!bingo.isNullEmpty(attrVal)) {
                        if (pView.bgTestProps(attrVal))
                            val = pView.bgDataValue(attrVal);
                        else if (window.bgTestProps(attrVal))
                            val = window.bgDataValue(attrVal);
                    }

                    var cmp = function () {
                        return !_isAdd && bingo.usingAll().then(function () {
                            return $view.bgIsDispose || $compile().nodes(node.childNodes).compile();
                        });
                    };

                    if (bingo.isNullEmpty(attrVal)
                        || bingo.isFunction(val) || bingo.isArray(val)) {
                        //如果是function或数组, 直接当action, 或是空值时
                        //添加controller
                        val && $view.$addController(val, name, attrVal);
                        //编译
                        return cmp();
                    } else {
                        //使用url方式, 异步加载action, 走mvc开发模式
                        var url = attrVal;

                        var routeContext = bingo.routeContext(url);
                        var context = routeContext.context();

                        if (context.controller) {
                            //如果controller不为空, 即已经定义controller
                            //设置app
                            $view.$setApp(context.app);
                            //添加controller
                            $view.$addController(context.controller, name, attrVal);
                            //编译
                            return cmp();
                        } else {
                            //如果找不到controller, 加载js
                            return bingo.using(url).then(function () {
                                if ($view.bgIsDispose) return;
                                var context = routeContext.context();
                                if (context.controller) {
                                    //设置app
                                    $view.$setApp(context.app);
                                    //添加controller
                                    $view.$addController(context.controller, name, attrVal);
                                    //编译
                                    return cmp();
                                }
                            });
                        }
                    }
                }]  //end controller
            };
        });
    }); // end bg-controller

    //bg-init初始数据用, bg-load节点准备好了。
    bingo.each(['bg-init', 'bg-load'], function (cName) {
        var priority = cName == 'bg-load' ? 999999 : 3;
        bingo.command(cName, function () {
            var cmd = {
                priority: priority
            };
            cmd[cName == 'bg-load' ? 'link' : 'compile'] = ['$attr', function ($attr) {
                $attr.$eval();
            }];
            return cmd;
        });
    }); //end bg-init

    bingo.command('bg-not-compile', function () {
        return {
            //是否编译子节点, 默认为true
            compileChild: false
        };
    });// end bg-not-compile

    bingo.command('bg-node', function () {
        return {
            compile: ['$attr', function ($attr) {
                $attr.$value($attr.node);
            }]
        };
    }); //end bg-node

    bingo.command('bg-text', function () {
        return {
            compile: ['$attr', 'node', function ($attr, node) {
                $attr.$layout(function (c) {
                    node.textContent = c.value;
                });
            }]
        };
    }); //end bg-text

    bingo.command('bg-html', function () {
        return {
            compile: ['$attr', '$viewnode', function ($attr, $viewnode) {
                $attr.$layout(function (c) {
                    return $viewnode.$html(c.value);
                });
            }]
        };
    }); //end bg-html

    bingo.command('bg-include', function () {
        return {
            compile: ['$attr', '$viewnode', '$tmpl', function ($attr, $viewnode, $tmpl) {

                var _html = function (p) {
                    return $tmpl(p).then(function (html) {
                       return $attr.bgIsDispose || $viewnode.$html(html);
                    });
                };

                if ($attr.$hasProps())
                    $attr.$layoutValue(function (c) {
                        return $viewnode.$html(c.value);
                    });
                else
                    return _html($attr.content);
            }]
        };
    }); //end bg-include

    bingo.command('bg-if', function () {
        return {
            compileChild: false,
            compile: ['$attr', '$viewnode', 'node', '$tmpl', function ($attr, $viewnode, node, $tmpl) {
                return $tmpl(node).then(function (html) {

                    var _set = function (value) {
                        if (value) {
                            return $viewnode.$html(html).then(function () { _show(node); });
                        } else
                            _hide(node);
                    };

                    $attr.$layout(function (c) {
                        return _set(c.value);
                    });
                });
            }]
        };
    }); //end bg-if

    /*
        使用方法:
        bg-attr="{src:'text.html', value:'ddd'}"
        bg-prop="{disabled:false, checked:true}"
        bg-checked="true" //直接表达式
        bg-checked="helper.checked" //绑定到变量, 双向绑定
    */
    bingo.each('attr,prop,src,checked,unchecked,disabled,enabled,readonly,class'.split(','), function (attrName) {
        bingo.command('bg-' + attrName, function () {

            return {
                compile: ['$view', '$attr', 'node', function ($view, $attr, node) {

                    var _set = function (val) {
                        switch (attrName) {
                            case 'attr':
                                //bg-attr="{src:'text.html', value:'ddd'}"
                                bingo.eachProp(val, function (item, n) {
                                    _attr(node, n, item);
                                });
                                break;
                            case 'prop':
                                bingo.eachProp(val, function (item, n) {
                                    _prop(node, n, item);
                                });
                                break;
                            case 'enabled':
                                _prop(node, 'disabled', !val);
                                break;
                            case 'unchecked':
                                _prop(node, 'checked', !val);
                                break;
                            case 'disabled':
                            case 'readonly':
                            case 'checked':
                                _prop(node, attrName, val);
                                break;
                            case 'class':
                                var classNames = _getClass(node);
                                if (bingo.isObject(val)) {
                                    bingo.eachProp(val, function (item, n) {
                                        if (bingo.isString(item))
                                            _addClass(classNames, item);
                                        else
                                            item ? _addClass(classNames, n) : (classNames = _removeClass(classNames, n));
                                    });
                                } else
                                    val && _addClass(classNames, val);
                                _setClass(node, classNames);
                                break;
                            default:
                                _attr(node, attrName, val);
                                break;
                        }

                    };

                    $attr.$layout(function (c) {
                        _set(c.value);
                    });

                    if (attrName == 'checked' || attrName == 'unchecked') {
                        var fn = function () {
                            var value = _prop(node, 'checked');
                            $attr.$value(attrName == 'checked' ? value : !value);
                        };
                        //如果是checked, 双向绑定
                        _on.call(node, 'click', fn);
                        $attr.bgOnDispose(function () {
                            _off.call(node, 'click', fn);
                        });
                    }

                }]
            };
        });
    }); //end attrs


    /*
        使用方法:
        bg-event="{click:function(e){}, dblclick:helper.dblclick, change:['input', helper.dblclick]}"
        bg-click="helper.click"     //绑定到方法
        bg-click="['input', helper.click]"     //绑定到数组, 等效于$().on('click', 'input', helper.click)
        bg-click="helper.click()"   //直接执行方法
    */
    bingo.each('event,click,blur,change,dblclick,focus,focusin,focusout,keydown,keypress,keyup,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,resize,scroll,select,submit,contextmenu'.split(','), function (eventName) {
        bingo.command('bg-' + eventName, function () {

            return ['$view', 'node', '$attr', function ($view, node, $attr) {

                var _bindList = [], bind = function (evName, callback) {
                    var fn = function () {
                        $view.$updateAsync();
                        return callback.apply(this, arguments);
                    };
                    _bindList.push([evName, fn]);
                    _on.call(node, evName, fn);
                };
                $attr.bgOnDispose(function () {
                    bingo.each(_bindList, function (item) {
                        _off.call(node, item[0], item[1]);
                    });
                });

                if (eventName != 'event') {
                    var fn = /^\s*\[(.|\n)*\]\s*$/g.test($attr.content) ? $attr.$results() : $attr.$value();
                    if (!bingo.isFunction(fn) && !bingo.isArray(fn))
                        fn = function (e) { return $attr.$eval(e); };
                    bind(eventName, fn);
                } else {
                    var evObj = $attr.$results();
                    if (bingo.isObject(evObj)) {
                        bingo.eachProp(evObj, function (fn, n) {
                            bind(n, fn);
                        });
                    }
                }

            }];

        });
    }); //end event

    /*
        使用方法:
        bg-style="{display:'none', width:'100px'}"
        bg-show="true"
        bg-show="res.show"
    */
    bingo.each('style,show,hide,visible'.split(','), function (attrName) {
        bingo.command('bg-' + attrName, function () {

            return {
                compile: ['$attr', 'node', function ($attr, node) {

                    var _set = function (val) {

                        switch (attrName) {
                            case 'style':
                                //bg-style="{display:'none', width:'100px'}"
                                bingo.eachProp(val, function (item, n) {
                                    _css(node, n, item);
                                });
                                break;
                            case 'hide':
                                val = !val;
                            case 'show':
                                if (val) _show(node); else _hide(node);
                                break;
                            case 'visible':
                                val = val ? 'visible' : 'hidden';
                                _css(node, 'visibility', val);
                                break;
                            default:
                                _css(node, attrName, val);
                                break;
                        }
                    };

                    $attr.$layout(function (c) {
                        _set(c.value);
                    });

                }]
            };

        });
    }); //end style

    bingo.command('bg-model', function () {

        return {
            compile: ['$view', 'node', '$attr', function ($view, node, $attr) {


                var _type = _attr(node, 'type'),
                    _isRadio = _type == 'radio',
                    _isCheckbox = _type == 'checkbox',
                    _checkboxVal = _isCheckbox ? _val(node) : null,
                    _isSelect = node.tagName.toLowerCase() == 'select';

                var _getElementValue = function () {
                    return _isCheckbox ? (_prop(node, "checked") ? _checkboxVal : '') : (_isSelect ? _valSel(node) : _val(node));
                }, _setElementValue = function (value) {
                    value = _isSelect && bingo.isArray(value) ? value : bingo.toStr(value);
                    if (_isCheckbox) {
                        _prop(node, "checked", (_val(node) == value));
                    } else if (_isRadio) {
                        _prop(node, "checked", (_val(node) == value));
                    } else if (_isSelect)
                        _valSel(node, value);
                    else
                        _val(node, value);
                };

                var _eVal, eName, fn = function () {
                    var value = _getElementValue();
                    if (_eVal != value || _isRadio) {
                        _eVal = value;
                        $attr.$value(value);
                    }
                };
                if (_isRadio) {
                    eName = 'click';
                } else {
                    eName = 'change';
                    _on.call(node, 'change', fn);
                }
                if (eName) {
                    _on.call(node, eName, fn);
                    $attr.bgOnDispose(function () {
                        _off.call(node, eName, fn);
                    });
                }

                $attr.$layoutValue(function (c) {
                    var val = c.value;
                    _setElementValue(val);
                });

            }]
        };

    });//end model


    /*
        使用方法:
        bg-for="item in user.list"

        例:
        <select bg-for="item in list">
            ${if item.id == 1}
            <option value="${item.id}">text_${item.text}</option>
            ${else}
            <option value="${item.id}">text_${item.text}eee</option>
            ${/if}
        </select>
    */

    //bg-for
    //bg-for="datas"  ==等效==> bg-render="item in datas"
    //bg-for="item in datas"
    //bg-for="item in datas tmpl=#tmplid"    //tmpl以#开头认为ID
    //bg-for="item in datas tmpl=view/user/listtmpl"  //tmpl不以#开头认为url, 将会异步加载
    //bg-for="item in datas | asc"
    //bg-for="item in datas | asc tmpl=#tmplid"
    bingo.command('bg-for', function () {
        return {
            priority: 10,
            compileChild: false,
            compile: ['$view', '$compile', 'node', '$attr', '$tmpl', function ($view, $compile, node, $attr, $tmpl) {

                var attrData = _makeBindContext($attr);

                if (!attrData) return;
                var _itemName = attrData.itemName,
                    _tmpl = attrData.tmpl;

                _tmpl || $tmpl(node).then(function (s) {
                    _tmpl = s;
                });

                var _render = function (tmpl, datas) {
                    return $view.bgIsDispose || $compile().render(tmpl, datas, _itemName, $attr.withData).htmlTo(node).compile().then(function () {
                        if ($view.bgIsDispose) return;
                        var m = $attr.viewnode.$getAttr('bg-model');
                        m && m.$publish();
                    });
                };
                $attr.$layout(function (c) {
                    var t = c.value,
                        isL  =bingo.isArray(t),
                        datas = isL ?t : bingo.sliceArray(t);
                    (!isL) && datas.length == 0 && (datas = t ? [t] : []);
                    return $tmpl(_tmpl).then(function (s) {
                        return _render(s, datas);
                    });
                    //return 'bg-for aaaaaaaaaaa';
                });

            }]
        };

    }); //end bg-for

    var _renderReg = /[ ]*([^ ]+)[ ]+in[ ]+(?:(.+)[ ]+tmpl[ ]*=[ ]*(.+)|(.+))/,
        _makeBindContext = function ($attr) {
            var code = $attr.content;
            if (bingo.isNullEmpty(code))
                code = 'item in {}';
            if (!_renderReg.test(code)) {
                code = ['item in ', code].join('');
            }
            var _itemName = '', _dataName = '', _tmpl = '';
            //分析item名称, 和数据名称
            code.replace(_renderReg, function () {
                _itemName = arguments[1];
                _dataName = arguments[2];
                _tmpl = bingo.trim(arguments[3]);

                if (bingo.isNullEmpty(_dataName))
                    _dataName = arguments[4];
            });

            $attr.content = _dataName;

            return {
                itemName: _itemName,
                dataName: _dataName,
                tmpl: _tmpl
            };
        }; //end _makeBindContext

    //end bg-for 

    bingo.each(['bg-component', 'bg:component'], function (cmdName) {
        var isInner = (cmdName == 'bg-component');
        bingo.command(cmdName, function () {

            return {
                priority: 3,
                view: true,
                compileChild: false,
                replace: true,
                include: false,
                compilePre: ['$view', 'node', '$inject', function (pView, node, $inject) {
                    var attrVal = _attr(node, isInner ? 'bg-component' : 'bg-src'),
                        val, compName = _attr(node, 'bg-name') || bingo.makeAutoId();

                    if (!bingo.isNullEmpty(attrVal)) {
                        if (pView.bgTestProps(attrVal))
                            val = pView.bgDataValue(attrVal);
                        else if (window.bgTestProps(attrVal))
                            val = window.bgDataValue(attrVal);
                    }
                    var init = function (def) {
                        def = bingo.isFunction(def) ? $inject(def) : def;
                        pView.$compileComp(def, node, compName);
                        //取得定义后， 得到$tmpl
                        this.tmpl = def.$tmpl || node;
                        this._bgcompdef_ = { def: def, name: compName };
                    }.bind(this);

                    if (val) {
                        return init(val);
                    } else {
                        //使用url方式, 异步加载action, 走mvc开发模式
                        var url = attrVal;

                        var routeContext = bingo.routeContext(url);
                        var context = routeContext.context();

                        if (context.component) {
                            return init(context.component);
                        } else {
                            return bingo.using(url).then(function () {
                                if (pView.bgIsDispose) return;
                                routeContext = bingo.routeContext(url);
                                context = routeContext.context();
                                if (context.component) {
                                    return init(context.component);
                                }
                            });
                        }
                    }
                }],
                controller: ['$view', '$compile', 'node', '$attr', function ($view, $compile, node) {
                    var pView = $view.$parentView(),
                        comdef = this._bgcompdef_,
                        def = comdef.def,
                        compName = comdef.name;
                   
                    $view.bgOnDispose(function () {
                        pView.$removeComp(compName);
                    });
                    if (def) {
                        var co = $view.$initComp(def, compName);
                        co.bgToObserve();
                        return $compile().nodes([node]).compile();
                    }

                }]  //end compile
            };

        }); //end bg-component

    });//end each bg-component

    
})(bingo);
