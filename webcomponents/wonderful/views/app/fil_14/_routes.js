define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil_14_s01", angularAMD.route({
                cache: false,
                url: "/fil_14_s01",
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14/fil_14_s01/fil_14_s01.html",
                        controllerUrl: "views/app/fil_14/fil_14/fil_14_s01/fil_14_s01.js"
                    }),
                    'fil_14_s01_list@fil_14_s01': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14/fil_14_s01/fil_14_s01_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil_14_s02", angularAMD.route({
                cache: false,
                url: "/fil_14_s02",
                params: {
                    'params': null
                },
                templateUrl: "views/app/fil_14/fil_14/fil_14_s02/fil_14_s02.html",
                controllerUrl: "views/app/fil_14/fil_14/fil_14_s02/fil_14_s02.js"
            }))
            .state("fil_14_s02.fil_14_s03", angularAMD.route({
                cache: false,
                url: "/fil_14_s03",
                views: {
                    'fil_14_s03': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14/fil_14_s03/fil_14_s03.html",
                        controllerUrl: "views/app/fil_14/fil_14/fil_14_s03/fil_14_s03.js"
                    }),
                    'fil_14_s03_list@fil_14_s02.fil_14_s03': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14/fil_14_s03/fil_14_s03_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil_14_s02.fil_14_s04", angularAMD.route({
                cache: false,
                url: "/fil_14_s04",
                views: {
                    'fil_14_s04': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14/fil_14_s04/fil_14_s04.html",
                        controllerUrl: "views/app/fil_14/fil_14/fil_14_s04/fil_14_s04.js"
                    }),
                    'fil_14_s04_list@fil_14_s02.fil_14_s04': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14/fil_14_s04/fil_14_s04_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil_14_01_s01", angularAMD.route({
                cache: false,
                url: "/fil_14_01_s01",
                params: {
                    'params': null
                },
                templateUrl: "views/app/fil_14/fil_14_01/fil_14_01_s01/fil_14_01_s01.html",
                controllerUrl: "views/app/fil_14/fil_14_01/fil_14_01_s01/fil_14_01_s01.js"
            }))
            .state("fil_14_01_s01.s02", {
                cache: false,
                url: "/fil_14_01_s02",
                views: {
                    'fil_14_01_s02': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14_01/fil_14_01_s02/fil_14_01_s02.html",
                        controllerUrl: "views/app/fil_14/fil_14_01/fil_14_01_s02/fil_14_01_s02.js"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_14_01_s01.s03", {
                cache: false,
                url: "/fil_14_01_s03",
                views: {
                    'fil_14_01_s03': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14_01/fil_14_01_s03/fil_14_01_s03.html",
                        controllerUrl: "views/app/fil_14/fil_14_01/fil_14_01_s03/fil_14_01_s03.js"
                    }),
                    'fil_14_01_s03_list@fil_14_01_s01.s03': angularAMD.route({
                        templateUrl: "views/app/fil_14/fil_14_01/fil_14_01_s03/fil_14_01_s03_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            });

    };
    return registerRoutes;
});
