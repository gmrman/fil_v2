define(["app", "APP"], function(app) {
    /**
     * barcode掃描元件
     * 掃描字串會回傳在dg-scanned中的value
     * usage:
     * <input dg-scanned="scanned(value)" keep-data="expression" />
     */
    app.directive('dgScanned', function dgScanned($parse) {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                var scannedHandler = $parse(attrs.dgScanned);
                var onKeypress = function($event) {
                    if (13 === $event.which || 10 === $event.which) {
                        var value = $event.target.value;
                        $scope.$apply(function() {
                            scannedHandler($scope, {
                                value: value
                            });

                            var keepData = $parse(attrs['keepData'])($scope);

                            if (!keepData) {
                                $event.target.value = '';
                            }

                        });
                    }
                };

                // Event Handler
                var afterinput = function afterinput() {
                    if (document.activeElement === element[0]) {
                        var event = {
                            which: 13,
                            target: element[0]
                        };
                        onKeypress(event);
                    }
                };

                element.on('keypress', onKeypress);

                // Register afterinput event handler.
                var deregistration = $scope.$on('afterinput', afterinput);

                // Deregister event handler
                $scope.$on('$destroy', function() {
                    (deregistration || angular.noop)();
                });
            }
        };
    });

    //添加弹窗控件
    app.factory('$dgOptins', function($rootScope, $ionicPopup) {
        var factory = {};
        var $scope = $rootScope.$new(true);
        $scope.optionChange = function(ch) {
            $scope.str = ch.value;
        };

        // 傳入預設數量及設定(目前僅支援設定title)
        factory.show = function(name, options) {
            $scope.str = name;
            $scope.options = options;
            // 回傳promise
            return $ionicPopup.show({
                title: name, // String. The title of the popup.
                cssClass: 'dgNumPad', // String, The custom CSS class name
                templateUrl: 'templates/options.html', // String (optional). The URL of an html template to place in the popup   body.
                scope: $scope, // Scope (optional). A scope to link to the popup content.
                buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                    text: '取消'

                }, {
                    text: '确认',
                    type: 'button-positive',
                    onTap: function(e) {
                        // Returning a value will cause the promise to resolve with the given value.
                        return $scope.str;
                    }
                }]
            });
        };

        return factory;
    });

    app.directive('focusMe', function($timeout, $parse) {
        return {
            //scope: true,   // optionally create a child scope
            link: function(scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                var ngFocus = $parse(attrs.ngFocus);
                var unwatchModel = scope.$watch(model, function(value) {
                    if (value === true) {
                        $timeout(function() {
                            element[0].focus();
                        });
                        ngFocus(scope);
                    }
                });

                scope.$on('$destroy', unwatchModel);
            }
        };
    });

    app.directive('subView', function($ionicPosition, $timeout) {
        return {
            restrict: 'AC',
            priority: Number.MAX_VALUE,
            link: function($scope, element, attrs) {
                ionic.DomUtil.ready(function() {
                    var getHeight = (function() {
                        var parent = ionic.DomUtil.getParentWithClass(element[0], 'scroll-content') || ionic.DomUtil.getParentWithClass(element[0], 'pane');

                        return function() {
                            var height = 0;
                            var parentOffset = $ionicPosition.offset(angular.element(parent));
                            var offset = $ionicPosition.offset(element);

                            if (parent) {
                                // console.log(parentOffset.height);
                                height = parentOffset.top + parentOffset.height - offset.top;
                            }

                            return height;
                        };
                    })();

                    $timeout(function() {
                        element.css('height', getHeight() + 'px');
                    });
                });
            }
        };
    });

    app.directive('subViewParse', function($ionicPosition, $timeout, $parse) {
        return {
            restrict: 'AC',
            priority: Number.MAX_VALUE,
            link: function(scope, element, attrs) {
                var setHeight = function(value) {
                    var getHeight = (function() {
                        var parent = ionic.DomUtil.getParentWithClass(element[0], 'scroll-content') || ionic.DomUtil.getParentWithClass(element[0], 'pane');
                        return function() {
                            var height = 0;
                            var parentOffset = $ionicPosition.offset(angular.element(parent));
                            var offset = $ionicPosition.offset(element);

                            if (parent) {
                                height = parentOffset.top + parentOffset.height - offset.top;
                            }
                            return height;
                        };
                    })();

                    $timeout(function() {
                        element.css('height', getHeight() + 'px');
                    });
                };
                var model = $parse(attrs.subViewParse);
                var unwatchModel = scope.$watch(model, setHeight);
                scope.$on('$destroy', unwatchModel);
                // ionic.DomUtil.ready(setHeight);
            }
        };
    });

    app.directive('selectOnClick', function() {
        return {
            restrict: 'A',
            link: function(scope, element) {
                var focusedElement;
                element.on('click', function() {
                    if (focusedElement != this) {
                        this.select();
                        focusedElement = this;
                    }
                });
                element.on('blur', function() {
                    focusedElement = null;
                });
            }
        };
    });
    app.directive('stringToNumber', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function(value) {
                    return parseFloat(value);
                });
            }
        };
    });
    app.directive('onFinishRender', ['$timeout', '$parse', function($timeout, $parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                console.log(scope.$last);
                if (scope.$last === true) {
                    $timeout(function() {
                        scope.$emit('ngRepeatFinished');
                        if (!!attr.onFinishRender) {
                            $parse(attr.onFinishRender)(scope);
                        }
                    });
                }
            }
        };
    }]);
    app.directive('hideKeypad', function($timeout) {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                element[0].readOnly = true;
                element.on('click', function() {
                    $timeout(function() {
                        element[0].focus();
                    });
                });

                element.on('focus', function() {
                    $timeout(function() {
                        element[0].readOnly = false;
                    });
                });

                element.on('blur', function() {
                    $timeout(function() {
                        element[0].readOnly = true;
                    });
                });

                $scope.$on('$destroy', function() {
                    element.off('click');
                    element.off('focus');
                    element.off('blur');
                });
            }
        };
    });
    app.directive('nextOnEnter', function() {
        return {
            restrict: 'A',
            link: function($scope, selem, attrs) {
                selem.bind('keydown', function(e) {
                    var code = e.keyCode || e.which;
                    if (code === 13 || code === 10) {
                        e.preventDefault();
                        var pageElems = document.querySelectorAll('input, select, textarea'),
                            elem = e.srcElement,
                            focusNext = false,
                            len = pageElems.length;
                        for (var i = 0; i < len; i++) {
                            var pe = pageElems[i];
                            if (focusNext) {
                                if (pe.style.display !== 'none') {
                                    pe.focus();
                                    break;
                                }
                            } else if (pe === e.srcElement) {
                                focusNext = true;
                            }
                        }
                    }
                });
            }
        };
    });

    app.directive('chScanned', function chScanned($parse) {
        return {
            restrict: 'A',
            link: function($scope, element, attrs) {
                var scannedHandler = $parse(attrs.chScanned);
                var onKeypress = function($event) {
                    var code = $event.keyCode || $event.which;
                    if (13 === code || 10 === code) {
                        var value = $event.target.value;
                        $scope.$apply(function() {
                            var isSuccess = scannedHandler($scope, {
                                value: value
                            });
                            if (isSuccess) {
                                try {
                                    $event.preventDefault();
                                } catch (e) {}
                                var pageElems = document.querySelectorAll('input, select, textarea'),
                                    elem = $event.srcElement,
                                    focusNext = false,
                                    len = pageElems.length;
                                for (var i = 0; i < len; i++) {
                                    var pe = pageElems[i];
                                    if (focusNext) {
                                        if (pe.style.display !== 'none') {
                                            pe.focus();
                                            break;
                                        }
                                    } else if (pe === $event.srcElement) {
                                        focusNext = true;
                                    }
                                }
                            }
                        });
                    }
                };

                // Event Handler
                var afterinput = function afterinput() {
                    if (document.activeElement === element[0]) {
                        var event = {
                            which: 13,
                            target: element[0]
                        };
                        onKeypress(event);
                    }
                };

                element.on('keypress', onKeypress);

                // Register afterinput event handler.
                var deregistration = $scope.$on('afterinput', afterinput);

                // Deregister event handler
                $scope.$on('$destroy', function() {
                    (deregistration || angular.noop)();
                });
            }
        };
    });
});
