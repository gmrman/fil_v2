define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state("fil_17_s01", angularAMD.route({
            cache: false,
            url: "/fil_17_s01",
            params: {
                'params': null
            },
            views: {
                '': angularAMD.route({
                    templateUrl: "views/app/fil_17/fil_17_s01/fil_17_s01.html",
                    controllerUrl: "views/app/fil_17/fil_17_s01/fil_17_s01.js",
                }),
                'fil_17_s01_list@fil_17_s01': angularAMD.route({
                    templateUrl: "views/app/fil_17/fil_17_s01/fil_17_s01_list.html",
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
