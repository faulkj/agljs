/*!
 * agljs
 * Author: Joshua Faulkenberry
 * License: Kopimi
 * Copyright 2025
 */
var agl = function() {
    "use strict";
    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
        }
        return t;
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P ? value : new P((function(resolve) {
                resolve(value);
            }));
        }
        return new (P || (P = Promise))((function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        }));
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), 
        value;
    }
    typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    var _AGL_instances, _a, _AGL_instance, _AGL_active, _AGL_debug, _AGL_timeout, _AGL_handshake, _AGL_queue, _AGL_processing, _AGL_details, _AGL_callbacks, _AGL_subscriptions, _AGL_defaultPrefix, _AGL_errorCodes, _AGL__do, _AGL_processor, _AGL_handle, _AGL__enqueue, _AGL_log;
    class AGL {
        constructor(config = {}) {
            _AGL_instances.add(this);
            _AGL_active.set(this, null);
            _AGL_debug.set(this, false);
            _AGL_timeout.set(this, 2e3);
            _AGL_handshake.set(this, null);
            _AGL_queue.set(this, []);
            _AGL_processing.set(this, false);
            _AGL_details.set(this, {
                availableActions: [],
                interfaceVersion: null,
                readOnly: false,
                token: null
            });
            _AGL_callbacks.set(this, {});
            _AGL_subscriptions.set(this, {});
            _AGL_defaultPrefix.set(this, "Epic.Clinical.Informatics.Web.");
            _AGL_errorCodes.set(this, {
                5: "Action in progress. This means that two messages were posted back-to-back without waiting for a response from the first.",
                7: "An action was posted which requires a token, but no token was provided.",
                9: "An action was attempted which does not exist.",
                15: "An action is not allowed during closing.",
                16: "An invalid SubscriptionRequest was sent.",
                18: "A browser launch was attempted for a URL that is not allowlisted."
            });
            const {debug: debug = __classPrivateFieldGet(this, _AGL_debug, "f"), timeout: timeout = __classPrivateFieldGet(this, _AGL_timeout, "f"), subscribe: subscribe = {}} = config, callbacks = __rest(config, [ "debug", "timeout", "subscribe" ]);
            let initial = true;
            if (!__classPrivateFieldGet(_a, _a, "f", _AGL_instance)) __classPrivateFieldSet(_a, _a, this, "f", _AGL_instance); else {
                console.warn("[AGL] Reconfiguring existing instance. Previous settings may be overwritten.");
                initial = false;
            }
            __classPrivateFieldSet(__classPrivateFieldGet(_a, _a, "f", _AGL_instance), _AGL_debug, debug, "f");
            __classPrivateFieldSet(__classPrivateFieldGet(_a, _a, "f", _AGL_instance), _AGL_timeout, timeout, "f");
            Object.keys(callbacks).forEach((key => {
                if (key.startsWith("on")) {
                    const eventName = key.replace(/^on/, "").toLowerCase();
                    __classPrivateFieldGet(__classPrivateFieldGet(_a, _a, "f", _AGL_instance), _AGL_callbacks, "f")[eventName] = callbacks[key];
                }
            }));
            if (initial) {
                __classPrivateFieldSet(this, _AGL_subscriptions, subscribe, "f");
                if (window !== window.parent) {
                    const args = {};
                    if (Object.keys(__classPrivateFieldGet(this, _AGL_subscriptions, "f")).length) {
                        args["SubscriptionRequests"] = [];
                        for (const [key, value] of Object.entries(__classPrivateFieldGet(this, _AGL_subscriptions, "f"))) args["SubscriptionRequests"].push({
                            EventName: key,
                            EventArgs: value
                        });
                    }
                    __classPrivateFieldSet(this, _AGL_handshake, __classPrivateFieldGet(this, _AGL_instances, "m", _AGL__do).call(this, "InitiateHandshake").then((() => {
                        __classPrivateFieldSet(this, _AGL_active, true, "f");
                        __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "Handshake complete, AGL is initialized");
                        console.log("[AGL] Initialized...");
                        return true;
                    })).catch((err => {
                        __classPrivateFieldSet(this, _AGL_active, false, "f");
                        console.error("[AGL] Handshake failed:", err.message);
                        return false;
                    })), "f");
                } else {
                    __classPrivateFieldSet(this, _AGL_active, false, "f");
                    console.log("[AGL] Not in Epic...");
                    __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "AGL is not initialized");
                }
            } else return __classPrivateFieldGet(_a, _a, "f", _AGL_instance);
        }
        get active() {
            return __classPrivateFieldGet(this, _AGL_active, "f") !== null ? __classPrivateFieldGet(this, _AGL_active, "f") : __classPrivateFieldGet(this, _AGL_handshake, "f");
        }
        get details() {
            return __classPrivateFieldGet(this, _AGL_details, "f");
        }
        set debug(value) {
            __classPrivateFieldSet(this, _AGL_debug, value, "f");
        }
        on(eventName, callback) {
            __classPrivateFieldGet(this, _AGL_callbacks, "f")[eventName] = callback;
            return this;
        }
        do(action_1) {
            return __awaiter(this, arguments, undefined, (function*(action, args = null, haltOnError = false) {
                return __classPrivateFieldGet(this, _AGL_active, "f") !== true ? Promise.resolve(false) : __classPrivateFieldGet(this, _AGL_instances, "m", _AGL__enqueue).call(this, (() => __classPrivateFieldGet(this, _AGL_instances, "m", _AGL__do).call(this, action, args)), haltOnError);
            }));
        }
    }
    _a = AGL, _AGL_active = new WeakMap, _AGL_debug = new WeakMap, _AGL_timeout = new WeakMap, 
    _AGL_handshake = new WeakMap, _AGL_queue = new WeakMap, _AGL_processing = new WeakMap, 
    _AGL_details = new WeakMap, _AGL_callbacks = new WeakMap, _AGL_subscriptions = new WeakMap, 
    _AGL_defaultPrefix = new WeakMap, _AGL_errorCodes = new WeakMap, _AGL_instances = new WeakSet, 
    _AGL__do = function _AGL__do(action, args = null) {
        const prefix = action.indexOf(".") === -1 ? __classPrivateFieldGet(this, _AGL_defaultPrefix, "f") : "";
        if (action !== "InitiateHandshake" && !__classPrivateFieldGet(this, _AGL_details, "f").availableActions.includes(prefix + action)) {
            const error = new Error(`Invalid action: ${action}`);
            if (__classPrivateFieldGet(this, _AGL_callbacks, "f").error) {
                __classPrivateFieldGet(this, _AGL_callbacks, "f").error({
                    message: error.message,
                    details: []
                });
                return Promise.resolve(false);
            }
            return Promise.reject(error);
        }
        return new Promise(((resolve, reject) => {
            const msg = {
                token: __classPrivateFieldGet(this, _AGL_details, "f").token,
                action: prefix + action
            };
            if (args) msg.args = args;
            const listener = event => {
                const {success: success, error: error} = __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_processor).call(this, event);
                window.removeEventListener("message", listener);
                if (success) resolve(true); else if (__classPrivateFieldGet(this, _AGL_callbacks, "f").error) {
                    __classPrivateFieldGet(this, _AGL_callbacks, "f").error(error || {
                        message: "Unknown error",
                        details: []
                    });
                    resolve(false);
                } else reject(new Error((error === null || error === undefined ? undefined : error.message) || "Unknown error occurred"));
            };
            window.addEventListener("message", listener);
            __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "Sending message:", msg);
            window.parent.postMessage(msg, "*");
            setTimeout((() => {
                window.removeEventListener("message", listener);
                const timeoutError = new Error("Timeout waiting for response");
                if (__classPrivateFieldGet(this, _AGL_callbacks, "f").error) {
                    __classPrivateFieldGet(this, _AGL_callbacks, "f").error({
                        message: "Timeout waiting for response",
                        details: [ `Action: ${msg.action}`, `Timeout: ${__classPrivateFieldGet(this, _AGL_timeout, "f")}ms` ]
                    });
                    resolve(false);
                } else reject(timeoutError);
            }), __classPrivateFieldGet(this, _AGL_timeout, "f"));
        }));
    }, _AGL_processor = function _AGL_processor(event) {
        var _b, _c;
        __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "Received message:", event.data);
        if (!event.data || typeof event.data !== "object" || !("token" in event.data || "actions" in event.data)) {
            __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "Invalid message received:", event.data);
            return {
                success: false,
                error: {
                    message: "Invalid message format",
                    details: []
                }
            };
        }
        let success = false, error;
        for (const type in event.data) {
            const res = __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_handle).call(this, type)(event.data[type], event.data);
            if (type === "actionExecuted") success = res; else if (type === "error") error = res;
        }
        if (error) {
            __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "Error received:", error);
            (_c = (_b = __classPrivateFieldGet(this, _AGL_callbacks, "f")).error) === null || _c === undefined ? undefined : _c.call(_b, error);
        }
        return {
            success: success,
            error: error
        };
    }, _AGL_handle = function _AGL_handle(type) {
        var _b;
        const handlers = {
            actionExecuted: (p, d) => "token" in d ? true : p,
            actions: (p, d) => {
                __classPrivateFieldGet(this, _AGL_details, "f").availableActions.push(...p);
            },
            error: (p, d) => {
                const error = {
                    message: p,
                    details: []
                };
                if (d.errorCodes && d.errorCodes.length) error.details = __classPrivateFieldGet(this, _AGL_callbacks, "f").error ? d.errorCodes : d.errorCodes.map((code => {
                    var _b;
                    return (_b = __classPrivateFieldGet(this, _AGL_errorCodes, "f")[code]) !== null && _b !== undefined ? _b : `Unknown error code: ${code}`;
                }));
                return error;
            },
            EventName: (p, d) => {
                var _b, _c, _d;
                __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "AGL event received:", p);
                (_c = (_b = __classPrivateFieldGet(this, _AGL_callbacks, "f")).aglEvent) === null || _c === undefined ? undefined : _c.call(_b, {
                    name: p,
                    args: (_d = d.EventArgs) !== null && _d !== undefined ? _d : null
                });
            },
            history: (p, d) => {
                var _b, _c;
                __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "History navigation event:", p);
                (_c = (_b = __classPrivateFieldGet(this, _AGL_callbacks, "f")).navigate) === null || _c === undefined ? undefined : _c.call(_b, {
                    direction: p
                });
            },
            historyPackage: (p, d) => {
                var _b, _c;
                __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "Received historyPackage:", p);
                const {state: state, fromHibernation: fromHibernation} = p;
                (_c = (_b = __classPrivateFieldGet(this, _AGL_callbacks, "f")).reload) === null || _c === undefined ? undefined : _c.call(_b, {
                    state: state,
                    fromHibernation: fromHibernation
                });
            },
            isContextReadOnly: (p, d) => {
                __classPrivateFieldGet(this, _AGL_details, "f").readOnly = p;
            },
            subscriptionResults: (p, d) => {
                var _b, _c;
                __classPrivateFieldGet(this, _AGL_instances, "m", _AGL_log).call(this, "Subscription results:", p);
                (_c = (_b = __classPrivateFieldGet(this, _AGL_callbacks, "f")).subscribed) === null || _c === undefined ? undefined : _c.call(_b, p);
            },
            token: (p, d) => {
                __classPrivateFieldGet(this, _AGL_details, "f").token = p;
            },
            version: (p, d) => {
                __classPrivateFieldGet(this, _AGL_details, "f").interfaceVersion = p;
            }
        };
        return (_b = handlers[type]) !== null && _b !== undefined ? _b : (p, d) => {
            __classPrivateFieldGet(this, _AGL_details, "f")[type] = p;
        };
    }, _AGL__enqueue = function _AGL__enqueue(action, haltOnError = false) {
        const processQueue = () => {
            if (__classPrivateFieldGet(this, _AGL_processing, "f") || __classPrivateFieldGet(this, _AGL_queue, "f").length === 0) return;
            __classPrivateFieldSet(this, _AGL_processing, true, "f");
            __classPrivateFieldGet(this, _AGL_queue, "f").shift()().finally((() => {
                __classPrivateFieldSet(this, _AGL_processing, false, "f");
                processQueue();
            }));
        };
        return new Promise(((resolve, reject) => {
            __classPrivateFieldGet(this, _AGL_queue, "f").push((() => __awaiter(this, undefined, undefined, (function*() {
                try {
                    const result = yield action();
                    resolve(result);
                } catch (error) {
                    reject(error);
                    if (haltOnError) {
                        console.warn("[AGL] Queue stopped due to error:", error);
                        __classPrivateFieldSet(this, _AGL_queue, [], "f");
                    }
                } finally {
                    processQueue();
                }
            }))));
            !__classPrivateFieldGet(this, _AGL_processing, "f") && processQueue();
        }));
    }, _AGL_log = function _AGL_log(...args) {
        __classPrivateFieldGet(this, _AGL_debug, "f") && console.debug("[AGL]", ...args);
    };
    _AGL_instance = {
        value: null
    };
    return AGL;
}();
//# sourceMappingURL=agl.js.map
