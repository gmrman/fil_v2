define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
        //FIL_09_01 入庫申請
            .state("fil_09_01_s01", angularAMD.route({
            cache: false,
            url: "/fil_09_01_s01",
            params: {
                'params': null
            },
            views: {
                '': angularAMD.route({
                    templateUrl: "views/app/fil_09/fil_09_01/fil_09_01_s01.html",
                    controllerUrl: "views/app/fil_09/fil_09_01/fil_09_01_s01.js",
                }),
                'fil_09_01_s01_list@fil_09_01_s01': angularAMD.route({
                    templateUrl: "views/app/fil_09/fil_09_01/fil_09_01_s01_list.html",
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
