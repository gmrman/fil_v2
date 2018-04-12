define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil_16_02_s01", angularAMD.route({
                cache: false,
                url: "/fil_16_02_s01",
                params: {
                    'params': null
                },
                templateUrl: "views/app/fil_16/fil_16_02/fil_16_02_s01/fil_16_02_s01.html",
                controllerUrl: "views/app/fil_16/fil_16_02/fil_16_02_s01/fil_16_02_s01.js"
            }))
            .state("fil_16_02_s01.fil_16_02_s02", {
                cache: false,
                url: "/fil_16_02_s02",
                views: {
                    'fil_16_02_s02': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_02/fil_16_02_s02/fil_16_02_s02.html",
                        controllerUrl: "views/app/fil_16/fil_16_02/fil_16_02_s02/fil_16_02_s02.js"
                    }),
                    'fil_16_02_s02_list@fil_16_02_s01.fil_16_02_s02': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_02/fil_16_02_s02/fil_16_02_s02_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_16_02_s01.fil_16_02_s03", {
                cache: false,
                url: "/fil_16_02_s03",
                views: {
                    'fil_16_02_s03': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_02/fil_16_02_s03/fil_16_02_s03.html",
                        controllerUrl: "views/app/fil_16/fil_16_02/fil_16_02_s03/fil_16_02_s03.js"
                    }),
                    'fil_16_02_s03_list@fil_16_02_s01.fil_16_02_s03': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_02/fil_16_02_s03/fil_16_02_s03_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_16_02_s04", angularAMD.route({
                cache: false,
                url: "/fil_16_02_s04",
                params: {
                    'params': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_02/fil_16_02_s04/fil_16_02_s04.html",
                        controllerUrl: "views/app/fil_16/fil_16_02/fil_16_02_s04/fil_16_02_s04.js"
                    }),
                    'fil_16_02_s04_list@fil_16_02_s04': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_02/fil_16_02_s04/fil_16_02_s04_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil_16_03_s01", angularAMD.route({
                cache: false,
                url: "/fil_16_03_s01",
                params: {
                    'params': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_03/fil_16_03_s01/fil_16_03_s01.html",
                        controllerUrl: "views/app/fil_16/fil_16_03/fil_16_03_s01/fil_16_03_s01.js"
                    }),
                    'fil_16_03_s01_list@fil_16_03_s01': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_03/fil_16_03_s01/fil_16_03_s01_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil_16_03_s02", angularAMD.route({
                cache: false,
                url: "/fil_16_03_s02",
                params: {
                    'params': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_03/fil_16_03_s02/fil_16_03_s02.html",
                        controllerUrl: "views/app/fil_16/fil_16_03/fil_16_03_s02/fil_16_03_s02.js"
                    }),
                    'fil_16_03_s02_list@fil_16_03_s02': angularAMD.route({
                        templateUrl: "views/app/fil_16/fil_16_03/fil_16_03_s02/fil_16_03_s02_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }));
    };
    // return
    return registerRoutes;
});