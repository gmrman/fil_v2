// This function is called by the Genero Client Container
// so the web component can initialize itself and initialize
// the gICAPI handlers
isReady = false;
window.appUser = "";
window.appPlant = "";
window.accesstoken = "";
onICHostReady = function(version) {
    //alert("onICHostReady begin!");
    if (version != 1.0) {
        alert('Invalid API version');
        return;
    }
    gICAPI.onFocus = function(polarity) {
        if (polarity) {
            //alert("onFocus");
        }
    };
    gICAPI.onData = function(data) {
        // alert("onData");
    };
    gICAPI.onProperty = function(p) {
        // alert("onProperty");
    };

    if (!isReady) {
        isReady = true;
        setTimeout(function() {
            bridge().dispatchCustomEvent("deviceready");
        });
    }
};

bridge = function() {
    var service = {};
    service.dispatchCustomEvent = function(eventType, obj) {
        if (typeof CustomEvent === 'undefined') {
            CustomEvent = function(type, eventInitDict) {
                var event = document.createEvent('CustomEvent');
                event.initCustomEvent(type, eventInitDict['bubbles'], eventInitDict['cancelable'], eventInitDict['detail']);
                return event;
            };
        }
        var evt = new CustomEvent(eventType, {
            'detail': obj
        });
        document.dispatchEvent(evt);
    };

    service.callFunction = function(type, operation, param, success, fail, notify, startLoading, finishLoading) {
        ActionQueue.getInstance().add(type, operation, param, success, fail, notify, startLoading, finishLoading);
    };

    service.onSuccess = function(jsonStr) {
        var callback = ActionQueue.getInstance().getSuccessCallback();
        if (callback && typeof(callback) === "function") {
            var param;
            try {
                param = JSON.parse(jsonStr);
            } catch (e) {
                param = jsonStr;
            }

            callback(param);
        }
        return true;
    };

    service.onFail = function(jsonStr) {
        var callback = ActionQueue.getInstance().getFailCallback();
        if (callback && typeof(callback) === "function") {
            var param;
            try {
                param = JSON.parse(jsonStr);
            } catch (e) {
                param = jsonStr;
            }
            callback(param);
        }
        return true;
    };

    service.onNotify = function(jsonStr) {
        var callback = ActionQueue.getInstance().getNotifyCallback();
        if (callback && typeof(callback) === "function") {
            var param;
            try {
                param = JSON.parse(jsonStr);
            } catch (e) {
                param = jsonStr;
            }

            callback(param);
        }
        return true;
    };

    service.onAfterInput = function() {

        service.dispatchCustomEvent("afterinput");
    };

    service.exit = function() {
        setTimeout(function() {
            if (typeof(gICAPI) != 'undefined') {
                gICAPI.Action('exit');
            }
        });
    };

    return service;
};
//初始化回退按钮
onBack = (function() {
    var i = 2;
    init_counter = function() {
        i = 2;
    };
    add_counter = function() {
        i++;
    };
    sub_counter = function() {
        i--;
    };
    return function() {
        //单击触发backbutton事件
        sub_counter();
        setTimeout(add_counter, 500);
        if (document.getElementById('backdrop_dialogbutton') === null) {
            var sys_language = window.navigator.language.replace("-", "_");
            var message = "您確認要退出軟體嗎?";
            if (sys_language == 'zh_CN') {
                message = "您确认要退出软件吗?";
            }
            if (sys_language == 'en_US') {
                message = "Are you sure you want to exit the APP ?";
            }

            dialog('', {
                htmls: "<div style='height:80px;line-height: 80px;'>" + message + "<div>",
                btn_Ok: function() {
                    bridge().exit();
                },
                btn_Cancle: function() {}
            });
        }
        //双击触发exitapp事件
        if (i <= 0) {
            bridge().dispatchCustomEvent("exitapp");
        }　　　　
        return i;　　　　
    };
})();

onApiNotify = (function(chunk, action, count) {
    var contextChunks = [];

    return function(chunk, action, count) {
        switch (action) {
            case 'CHUNK':
                contextChunks[+(count)] = chunk;
                break;

            case 'CLEAR':
                contextChunks = [];
                break;

            default:
                var cb = ActionQueue.getInstance().getSuccessCallback();
                bridge().onNotify(contextChunks.join(''));
                break;
        }
    };
})();

onApiSuccess = (function(chunk, action, count) {
    var contextChunks = [];

    return function(chunk, action, count) {
        switch (action) {
            case 'CHUNK':
                contextChunks[+(count)] = chunk;
                break;

            case 'CLEAR':
                contextChunks = [];
                break;

            default:
                var cb = ActionQueue.getInstance().getSuccessCallback();
                bridge().onSuccess(contextChunks.join(''));
                break;
        }
    };
})();

onApiFail = (function(chunk, action, count) {
    var contextChunks = [];

    return function(chunk, action, count) {
        switch (action) {
            case 'CHUNK':
                contextChunks[+(count)] = chunk;
                break;

            case 'CLEAR':
                contextChunks = [];
                break;

            default:
                var cb = ActionQueue.getInstance().getSuccessCallback();
                bridge().onFail(contextChunks.join(''));
                break;
        }
    };
})();

//初始化BDL ON ACTION队列
ActionQueue = (function() {
    var instance;
    var createActionQueue = function() {
        var successCallback = null;
        var failCallback = null;
        var notifyCallback = null;
        var queue = new Array();
        var isRunning = false;
        var isTiming = false;
        var defaultStartLoading = null;
        var defaultFinishLoading = null;

        var Action = function(type, operation, param, success, fail, notify, startLoading, finishLoading) {
            this.run = function() {
                if (startLoading && typeof(startLoading) === "function") {
                    startLoading();
                } else {
                    if (defaultStartLoading && typeof(defaultStartLoading) === "function") {
                        defaultStartLoading();
                    }
                }
                isRunning = true;
                setSuccessCallback(function(obj) {
                    if (success && typeof(success) === "function") {
                        success(obj);
                    }
                    finishCallBack();
                });

                setFailCallback(function(msg) {
                    if (fail && typeof(fail) === "function") {
                        fail(msg);
                    }
                    finishCallBack();
                });

                setNotifyCallback(function(obj) {
                    if (notify && typeof(notify) === "function") {
                        notify(obj);
                    }
                    //finishCallBack();
                });


                var finishCallBack = function() {
                    isRunning = false;
                    if (finishLoading && typeof(finishLoading) === "function") {
                        finishLoading();
                    } else {
                        if (defaultFinishLoading && typeof(defaultFinishLoading) === "function") {
                            defaultFinishLoading();
                        }
                    }
                    next();
                };

                var data = {
                    type: type,
                    operation: operation,
                    data: param
                };

                function utoa(str) {
                  return window.btoa(unescape(encodeURIComponent(str)));
                }

                if (typeof(gICAPI) != 'undefined') {
                    gICAPI.SetData(utoa(JSON.stringify(data)));
                    gICAPI.Action('controller');
                }
            };
        };

        var add = function(type, operation, param, success, fail, notify, startLoading, finishLoading) {
            var action = new Action(type, operation, param, success, fail, notify, startLoading, finishLoading);
            queue.push(action);
            if (!isRunning) {
                next();
            }
        };

        var next = function() {
            if (!isRunning) {
                var action = queue.shift();
                if (action) {
                    isRunning = true;
                    setTimeout(action.run);
                }
            } else {
                if (!isTiming) {
                    isTiming = true;
                    setTimeout(function() {
                        isTiming = false;
                        next();
                    });
                }
            }
        };

        var setSuccessCallback = function(callback) {
            successCallback = callback;
        };

        var setFailCallback = function(callback) {
            failCallback = callback;
        };

        var setNotifyCallback = function(callback) {
            notifyCallback = callback;
        };

        var setDefaultLoading = function(startLoading, finishLoading) {
            defaultStartLoading = startLoading;
            defaultFinishLoading = finishLoading;
        };

        return {
            add: add,
            getSuccessCallback: function() {
                return successCallback;
            },
            getFailCallback: function() {
                return failCallback;
            },
            getNotifyCallback: function() {
                return notifyCallback;
            },
            setDefaultLoading: setDefaultLoading
        };
    };

    return {
        getInstance: function() {
            if (!instance) {
                instance = createActionQueue();
            }
            return instance;
        }
    };
})();
