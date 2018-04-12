define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil_demo_s01", angularAMD.route({
                cache: false,
                url: "/fil_demo_s01",
                params: {
                    'params': null
                },
                templateUrl: "views/app/fil_demo/fil_demo_s01/fil_demo_s01.html",
                controllerUrl: "views/app/fil_demo/fil_demo_s01/fil_demo_s01.js"
            }))
            .state("fil_demo_s01.fil_demo_s02", {
                cache: false,
                url: "/fil_demo_s02",
                views: {
                    'fil_demo_s02': angularAMD.route({
                        templateUrl: "views/app/fil_demo/fil_demo_s02/fil_demo_s02.html",
                        controllerUrl: "views/app/fil_demo/fil_demo_s02/fil_demo_s02.js"
                    }),
                    'fil_demo_s02_list@fil_demo_s01.fil_demo_s02': angularAMD.route({
                        templateUrl: "views/app/fil_demo/fil_demo_s02/fil_demo_s02_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_demo_s01.fil_demo_s03", {
                cache: false,
                url: "/fil_demo_s03",
                views: {
                    'fil_demo_s03': angularAMD.route({
                        templateUrl: "views/app/fil_demo/fil_demo_s03/fil_demo_s03.html",
                        controllerUrl: "views/app/fil_demo/fil_demo_s03/fil_demo_s03.js"
                    }),
                    'fil_demo_s03_list@fil_demo_s01.fil_demo_s03': angularAMD.route({
                        templateUrl: "views/app/fil_demo/fil_demo_s03/fil_demo_s03_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            });
    };
    // return
    return registerRoutes;
});
