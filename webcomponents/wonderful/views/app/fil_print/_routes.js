define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil_print_s01", angularAMD.route({
                cache: false,
                url: "/fil_print_s01",
                params: {
                    'data': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_print/fil_print_s01/fil_print_s01.html",
                        controllerUrl: "views/app/fil_print/fil_print_s01/fil_print_s01.js",
                    }),
                    'fil_print_s01_list@fil_print_s01': angularAMD.route({
                        templateUrl: "views/app/fil_print/fil_print_s01/fil_print_s01_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil_print_s02", angularAMD.route({
                cache: false,
                url: "/fil_print_s02",
                params: {
                    'data': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_print/fil_print_s02/fil_print_s02.html",
                        controllerUrl: "views/app/fil_print/fil_print_s02/fil_print_s02.js",
                    }),
                    'fil_print_s02_list@fil_print_s02': angularAMD.route({
                        templateUrl: "views/app/fil_print/fil_print_s02/fil_print_s02_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
			.state("fil_print_s03", angularAMD.route({
                cache: false,
                url: "/fil_print_s03",
                params: {
                    'data': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_print/fil_print_s03/fil_print_s03.html",
                        controllerUrl: "views/app/fil_print/fil_print_s03/fil_print_s03.js",
                    }),
                    'fil_print_s03_list@fil_print_s03': angularAMD.route({
                        templateUrl: "views/app/fil_print/fil_print_s03/fil_print_s03_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("fil_print_s04", angularAMD.route({
                cache: false,
                url: "/fil_print_s04",
                params: {
                    'data': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/fil_print/fil_print_s04/fil_print_s04.html",
                        controllerUrl: "views/app/fil_print/fil_print_s04/fil_print_s04.js",
                    }),
                    'fil_print_s04_list@fil_print_s04': angularAMD.route({
                        templateUrl: "views/app/fil_print/fil_print_s04/fil_print_s04_list.html",
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
