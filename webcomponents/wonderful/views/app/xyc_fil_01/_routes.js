define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("xyc_fil_01_s01", angularAMD.route({
                cache: false,
                url: "/xyc_fil_01_s01",
                params: {
                    'params': null
                },
                views: {
                    '': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s01/xyc_fil_01_s01.html",
                        controllerUrl: "views/app/xyc_fil_01/xyc_fil_01_s01/xyc_fil_01_s01.js"
                    }),
                    'xyc_fil_01_s01_list@xyc_fil_01_s01': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s01/xyc_fil_01_s01_list.html",
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            }))
            .state("xyc_fil_01_s02", angularAMD.route({
                cache: false,
                url: "/xyc_fil_01_s02",
                params: {
                    'params': null
                },
                templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s02/xyc_fil_01_s02.html",
                controllerUrl: "views/app/xyc_fil_01/xyc_fil_01_s02/xyc_fil_01_s02.js"
            }))
            .state("xyc_fil_01_s02.xyc_fil_01_s03", {
                cache: false,
                url: "/xyc_fil_01_s03",
                views: {
                    'xyc_fil_01_s03': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s03/xyc_fil_01_s03.html",
                        controllerUrl: "views/app/xyc_fil_01/xyc_fil_01_s03/xyc_fil_01_s03.js"
                    }),
                    'xyc_fil_01_s03_list@xyc_fil_01_s02.xyc_fil_01_s03': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s03/xyc_fil_01_s03_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css",
                    "views/app/xcommon/css/xcommon.css"
                ]
            })
            .state("xyc_fil_01_s02.xyc_fil_01_s04", {
                cache: false,
                url: "/xyc_fil_01_s04",
                views: {
                    'xyc_fil_01_s04': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s04/xyc_fil_01_s04.html",
                        controllerUrl: "views/app/xyc_fil_01/xyc_fil_01_s04/xyc_fil_01_s04.js"
                    }),
                    'xyc_fil_01_s04_list@xyc_fil_01_s02.xyc_fil_01_s04': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s04/xyc_fil_01_s04_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css",
                    "views/app/xcommon/css/xcommon.css",
                ]
            })
            .state("xyc_fil_01_s02.xyc_fil_01_s05", {
                cache: false,
                url: "/xyc_fil_01_s05",
                views: {
                    'xyc_fil_01_s05': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s05/xyc_fil_01_s05.html",
                        controllerUrl: "views/app/xyc_fil_01/xyc_fil_01_s05/xyc_fil_01_s05.js"
                    }),
                    'xyc_fil_01_s05_list@xyc_fil_01_s02.xyc_fil_01_s05': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s05/xyc_fil_01_s05_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("xyc_fil_01_s02.xyc_fil_01_s06", {
                cache: false,
                url: "/xyc_fil_01_s06",
                views: {
                    'xyc_fil_01_s06': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s06/xyc_fil_01_s06.html",
                        controllerUrl: "views/app/xyc_fil_01/xyc_fil_01_s06/xyc_fil_01_s06.js"
                    }),
                    'xyc_fil_01_s06_list@xyc_fil_01_s02.xyc_fil_01_s06': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s06/xyc_fil_01_s06_list.html"
                    })
                },
                css: [
                    "views/app/common/css/style.css",
                    "views/app/common/css/common.css"
                ]
            })
            .state("xyc_fil_01_s02.xyc_fil_01_s07", {
                cache: false,
                url: "/xyc_fil_01_s07",
                views: {
                    'xyc_fil_01_s07': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s07/xyc_fil_01_s07.html",
                        controllerUrl: "views/app/xyc_fil_01/xyc_fil_01_s07/xyc_fil_01_s07.js"
                    }),
                    'xyc_fil_01_s07_list@xyc_fil_01_s02.xyc_fil_01_s07': angularAMD.route({
                        templateUrl: "views/app/xyc_fil_01/xyc_fil_01_s07/xyc_fil_01_s07_list.html"
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

