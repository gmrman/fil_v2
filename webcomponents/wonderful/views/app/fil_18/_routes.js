define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil_18_s01", angularAMD.route({
                cache: false,
                url: "/fil_18_s01",
                params: {
                    'params': null
                },
                templateUrl: "views/app/fil_18/fil_18_s01/fil_18_s01.html",
                controllerUrl: "views/app/fil_18/fil_18_s01/fil_18_s01.js",
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]				
            }));
    };
    // return
    return registerRoutes;
});
