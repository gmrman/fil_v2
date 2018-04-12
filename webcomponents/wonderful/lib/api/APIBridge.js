/**
 * Created by davidlee on 16/3/12.
 */

define(["app", "jquery"], function(app) {
    app.factory("APIBridge", function($q) {
        var APIBridge = {};
        APIBridge.callAPI = function(operation, param, startLoading, finishLoading) {
            var deferred = $q.defer();
            bridge().callFunction('api', operation, param, deferred.resolve, deferred.reject, deferred.notify, startLoading, finishLoading);
            return deferred.promise;
        };
        return APIBridge;
    });
    // 弹窗选择
    app.factory('$dgOptins', function($rootScope, $ionicPopup) {
        var factory = {};
        var $scope = $rootScope.$new(true);
        $scope.optionChange = function(ch) {
            $scope.str = ch.value;
        };
        // 传如单选的options内容格式为[{text:'显示的文字',value:'选项的value值'}](目前僅支援設定title)
        factory.show = function(name, options) {
            $scope.str = name;
            $scope.options = options;
            // 回傳promise
            return $ionicPopup.show({
                title: name, // String. The title of the popup.
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
    })
});
