define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        // route
        $stateProvider

         .state("fil3_01_s01", {
                cache: false,
                url: "/fil3_01_s01",
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil3/fil3_01/fil3_01_s01/fil3_01_s01.html",
                        controllerUrl: "views/app/fil3/fil3_01/fil3_01_s01/fil3_01_s01.js"
                    }),
                    'fil3_01_s01_list@fil3_01_s01': angularAMD.route({
                        templateUrl: "views/app/fil3/fil3_01/fil3_01_s01/fil3_01_s01_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css",
                    "views/app/common/css/style_new.css"
                ]
            })

    };
    // return
    return registerRoutes;
});
