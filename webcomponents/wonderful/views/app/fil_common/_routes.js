define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil_common_s01", angularAMD.route({
                cache: false,
                url: "/fil_common_s01",
                params: {
                    'params': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s01/fil_common_s01.html",
                        controllerUrl: "views/app/fil_common/fil_common_s01/fil_common_s01.js"
                    }),
                    'fil_common_s01_list@fil_common_s01': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s01/fil_common_s01_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil_common_s02", angularAMD.route({
                cache: false,
                url: "/fil_common_s02",
                params: {
                    'params': null
                },
                templateUrl: "views/app/fil_common/fil_common_s02/fil_common_s02.html",
                controllerUrl: "views/app/fil_common/fil_common_s02/fil_common_s02.js"
            }))
            .state("fil_common_s02.fil_common_s03", {
                cache: false,
                url: "/fil_common_s03",
                views: {
                    'fil_common_s03': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s03/fil_common_s03.html",
                        controllerUrl: "views/app/fil_common/fil_common_s03/fil_common_s03.js"
                    }),
                    'fil_common_s03_list@fil_common_s02.fil_common_s03': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s03/fil_common_s03_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_common_s02.fil_common_s04", {
                cache: false,
                url: "/fil_common_s04",
                views: {
                    'fil_common_s04': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s04/fil_common_s04.html",
                        controllerUrl: "views/app/fil_common/fil_common_s04/fil_common_s04.js"
                    }),
                    'fil_common_s04_list@fil_common_s02.fil_common_s04': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s04/fil_common_s04_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_common_s02.fil_common_s05", {
                cache: false,
                url: "/fil_common_s05",
                views: {
                    'fil_common_s05': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s05/fil_common_s05.html",
                        controllerUrl: "views/app/fil_common/fil_common_s05/fil_common_s05.js"
                    }),
                    'fil_common_s05_list@fil_common_s02.fil_common_s05': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s05/fil_common_s05_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_common_s02.fil_common_s06", {
                cache: false,
                url: "/fil_common_s06",
                views: {
                    'fil_common_s06': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s06/fil_common_s06.html",
                        controllerUrl: "views/app/fil_common/fil_common_s06/fil_common_s06.js"
                    }),
                    'fil_common_s06_list@fil_common_s02.fil_common_s06': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s06/fil_common_s06_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil_common_s02.fil_common_s07", {
                cache: false,
                url: "/fil_common_s07",
                views: {
                    'fil_common_s07': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s07/fil_common_s07.html",
                        controllerUrl: "views/app/fil_common/fil_common_s07/fil_common_s07.js"
                    }),
                    'fil_common_s07_list@fil_common_s02.fil_common_s07': angularAMD.route({
                        templateUrl: "views/app/fil_common/fil_common_s07/fil_common_s07_list.html"
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
