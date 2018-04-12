define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil3_common_s01", angularAMD.route({
                cache: false,
                url: "/fil3_common_s01",
                params: {
                    'params': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil3/fil3_common/fil3_common_s01/fil3_common_s01.html",
                        controllerUrl: "views/app/fil3/fil3_common/fil3_common_s01/fil3_common_s01.js"
                    }),
                    'fil3_common_s01_list@fil3_common_s01': angularAMD.route({
                        templateUrl: "views/app/fil3/fil3_common/fil3_common_s01/fil3_common_s01_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil3_common_s02", angularAMD.route({
                cache: false,
                url: "/fil3_common_s02",
                params: {
                    'params': null
                },
                templateUrl: "views/app/fil3/fil3_common/fil3_common_s02/fil3_common_s02.html",
                controllerUrl: "views/app/fil3/fil3_common/fil3_common_s02/fil3_common_s02.js"
            }))
            .state("fil3_common_s02.fil3_common_s03", {
                cache: false,
                url: "/fil3_common_s03",
                views: {
                    'fil3_common_s03': angularAMD.route({
                        templateUrl: "views/app/fil3/fil3_common/fil3_common_s03/fil3_common_s03.html",
                        controllerUrl: "views/app/fil3/fil3_common/fil3_common_s03/fil3_common_s03.js"
                    }),
                    'fil3_common_s03_list@fil3_common_s02.fil3_common_s03': angularAMD.route({
                        templateUrl: "views/app/fil3/fil3_common/fil3_common_s03/fil3_common_s03_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("fil3_common_s02.fil3_common_s04", {
                cache: false,
                url: "/fil3_common_s04",
                views: {
                    'fil3_common_s04': angularAMD.route({
                        templateUrl: "views/app/fil3/fil3_common/fil3_common_s04/fil3_common_s04.html",
                        controllerUrl: "views/app/fil3/fil3_common/fil3_common_s04/fil3_common_s04.js"
                    }),
                    'fil3_common_s04_list@fil3_common_s02.fil3_common_s04': angularAMD.route({
                        templateUrl: "views/app/fil3/fil3_common/fil3_common_s04/fil3_common_s04_list.html"
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
