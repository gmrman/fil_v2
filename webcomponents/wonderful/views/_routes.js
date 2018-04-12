/**
 * Created by davidlee on 16/3/12.
 */


define(["angularAMD"], function (angularAMD) {

    // register
    var registerRoutes = function ($stateProvider, $urlRouterProvider) {

        // default

        $urlRouterProvider.otherwise("/fil_00_s01");


    };

    // return
    return registerRoutes;
});
