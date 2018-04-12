define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil_15_s01", angularAMD.route({
                cache: false,
                url: "/fil_15_s01",
                params: {
                    'params': null
                },
                templateUrl: "views/app/fil_15/fil_15_s01/fil_15_s01.html",
                controllerUrl: "views/app/fil_15/fil_15_s01/fil_15_s01.js"
            }))
            .state("fil_15_s01.s02", {
                cache: false,
                url: "/fil_15_s02",
                views: {
                    'fil_15_s02': angularAMD.route({
                        templateUrl: "views/app/fil_15/fil_15_s02/fil_15_s02.html",
                        controllerUrl: "views/app/fil_15/fil_15_s02/fil_15_s02.js"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_15_s01.s03", {
                cache: false,
                url: "/fil_15_s03",
                views: {
                    'fil_15_s03': angularAMD.route({
                        templateUrl: "views/app/fil_15/fil_15_s03/fil_15_s03.html",
                        controllerUrl: "views/app/fil_15/fil_15_s03/fil_15_s03.js"
                    }),
                    'fil_15_s03_list@fil_15_s01.s03': angularAMD.route({
                        templateUrl: "views/app/fil_15/fil_15_s03/fil_15_s03_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_15_s01.s04", {
                cache: false,
                url: "/fil_15_s04",
                views: {
                    'fil_15_s04': angularAMD.route({
                        templateUrl: "views/app/fil_15/fil_15_s04/fil_15_s04.html",
                        controllerUrl: "views/app/fil_15/fil_15_s04/fil_15_s04.js"
                    }),
                    'fil_15_s04_list@fil_15_s01.s04': angularAMD.route({
                        templateUrl: "views/app/fil_15/fil_15_s04/fil_15_s04_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_15_s01.s05", {
                cache: false,
                url: "/fil_15_s05",
                views: {
                    'fil_15_s05': angularAMD.route({
                        templateUrl: "views/app/fil_15/fil_15_s05/fil_15_s05.html",
                        controllerUrl: "views/app/fil_15/fil_15_s05/fil_15_s05.js"
                    }),
                    'fil_15_s05_list@fil_15_s01.s05': angularAMD.route({
                        templateUrl: "views/app/fil_15/fil_15_s05/fil_15_s05_list.html"
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
