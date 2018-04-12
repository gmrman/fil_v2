/**
 * Created by davidlee on 16/3/12.
 */
define(["app","jquery"], function (app) {

    // service
    app.factory("APPBridge",  function ($q) {

            var APPBridge= {};

            // methods
            APPBridge.callAPI = function(operation, param, startLoading, finishLoading) {

               var deferred = $q.defer();

                bridge().callFunction('app', operation, param, deferred.resolve, deferred.reject,deferred.notify, startLoading, finishLoading);

                return deferred.promise;
            };
            // return
            return APPBridge;


    })
});



