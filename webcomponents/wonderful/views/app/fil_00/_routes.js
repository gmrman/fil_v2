define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        // route
        $stateProvider

        // login
            .state("fil_00_s01", angularAMD.route({
            url: "/fil_00_s01",
            templateUrl: "views/app/fil_00/fil_00_s01/fil_00_s01.html",
            controllerUrl: "views/app/fil_00/fil_00_s01/fil_00_s01.js",
            css: [
                "views/app/fil_00/fil_00_s01/fil_00_s01.css",
                "views/app/common/css/common.css",
                "views/app/common/css/style.css"
            ]
        }))

        //setting
        .state("fil_00_s02", angularAMD.route({
            url: "/fil_00_s02",
            templateUrl: "views/app/fil_00/fil_00_s02/fil_00_s02.html",
            controllerUrl: "views/app/fil_00/fil_00_s02/fil_00_s02.js",
            css: [
                "views/app/fil_00/fil_00_s01/fil_00_s01.css",
                "views/app/common/css/common.css",
                "views/app/common/css/style.css"
            ]
        }))

        // menu
        .state("fil_00_s03", angularAMD.route({
            url: "/fil_00_s03",
            templateUrl: "views/app/fil_00/fil_00_s03/fil_00_s03.html",
            controllerUrl: "views/app/fil_00/fil_00_s03/fil_00_s03.js",
            css: [
                "views/app/fil_00/fil_00_s04/fil_00_s04.css",
                "views/app/common/css/style.css"
            ]
        }))

        .state("fil_00_s04", angularAMD.route({
            url: "/fil_00_s04",
            templateUrl: "views/app/fil_00/fil_00_s04/fil_00_s04.html",
            controllerUrl: "views/app/fil_00/fil_00_s04/fil_00_s04.js",
            css: [
                "views/app/fil_00/fil_00_s04/fil_00_s04.css",
                "views/app/common/css/style.css",
                "views/app/common/css/common.css"
            ]
        }));
    };
    // return
    return registerRoutes;
});
