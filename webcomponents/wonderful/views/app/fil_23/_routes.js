define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        // route
        $stateProvider

        .state("fil_23_s01", {
            cache: false,
            url: "/fil_23_s01",
            views: {
                '': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s01/fil_23_s01.html",
                    controllerUrl: "views/app/fil_23/fil_23_s01/fil_23_s01.js"
                }),
                'fil_23_s01_list@fil_23_s01': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s01/fil_23_s01_list.html"
                })
            },
            css: [
                "views/app/common/css/style.css",
                "views/app/common/css/common.css",
                "views/app/common/css/style_new.css"
            ]
        })

        .state("fil_23_s02", {
            cache: false,
            params: {
                'item':{},
                'qc_list':{},
                'reason_list':{}
            },
            url: "/fil_23_s02",
            views: {
                '': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s02/fil_23_s02.html",
                    controllerUrl: "views/app/fil_23/fil_23_s02/fil_23_s02.js"
                }),
                'fil_23_s02_list@fil_23_s02': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s02/fil_23_s02_list.html",
                })
            },
            css: [
                "views/app/common/css/style.css",
                "views/app/common/css/common.css",
                "views/app/common/css/style_new.css",
                "views/app/fil_23/fil_23_s02/fil_23_s02.css"
            ]
        })
        .state("fil_23_s03", {
            cache: false,
            params: {
                'param':{
                    test_name:'',
                    seq:'',
                    qc_seq:''
                }
            },
            url: "/fil_23_s03",
            views: {
                '': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s03/fil_23_s03.html",
                    controllerUrl: "views/app/fil_23/fil_23_s03/fil_23_s03.js"
                }),
                'fil_23_s03_list@fil_23_s03': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s03/fil_23_s03_list.html",
                })
            },
            css: [
                "views/app/common/css/style.css",
                "views/app/common/css/common.css",
                "views/app/common/css/style_new.css",
                "views/app/fil_23/fil_23_s03/fil_23_s03.css"
            ]
        })

        .state("fil_23_s05", {
            cache: false,
           params: {
                'item':{}
            },
            url: "/fil_23_s05",
            views: {
                '': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s05/fil_23_s05_01.html",
                    controllerUrl: "views/app/fil_23/fil_23_s05/fil_23_s05_01.js"
                }),
                'fil_23_s05_01_list@fil_23_s05': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s05/fil_23_s05_01_list.html",
                })
            },
            css: [
                "views/app/common/css/style.css",
                "views/app/common/css/common.css",
                "views/app/common/css/style_new.css",
                "views/app/fil_23/fil_23_s03/fil_23_s03.css",
                "views/app/fil_23/fil_23_s05/fil_23_s05.css",

            ]
        })

          .state("fil_23_s06", {
            cache: false,
          params: {
                'item':{}
            },
            url: "/fil_23_s06",
            views: {
                '': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s06/fil_23_s06_01.html",
                    controllerUrl: "views/app/fil_23/fil_23_s06/fil_23_s06_01.js"
                }),
                'fil_23_s06_01_list@fil_23_s06': angularAMD.route({
                    templateUrl: "views/app/fil_23/fil_23_s06/fil_23_s06_01_list.html",
                })
            },
            css: [
                "views/app/common/css/style.css",
                "views/app/common/css/common.css",
                "views/app/common/css/style_new.css",
                "views/app/fil_23/fil_23_s03/fil_23_s03.css",
                "views/app/fil_23/fil_23_s06/fil_23_s06.css",

            ]
        })
            // .state("fil_23_s01_01", angularAMD.route({
            //     cache: false,
            //     url: "/fil_23_s01",
            //     // params: {
            //     //     'params': null
            //     // },
            //     templateUrl: "views/app/fil_23/fil_23_s01/fil_23_s01_01.html",
            //     // controllerUrl: "views/app/fil_23/fil_23_s04/fil_23_s04.js",
            //     css: [
            //         "views/app/common/css/style.css",
            //         "views/app/common/css/common.css",
            //         "views/app/common/css/style_new.css"
            //     ]
            // }))

            // .state("fil_23_s01_02", angularAMD.route({
            //     cache: false,
            //     url: "/fil_23_s01",
            //     // params: {
            //     //     'params': null
            //     // },
            //     templateUrl: "views/app/fil_23/fil_23_s01/fil_23_s01_02.html",
            //     // controllerUrl: "views/app/fil_23/fil_23_s04/fil_23_s04.js",
            //     css: [
            //         "views/app/common/css/style.css",
            //         "views/app/common/css/common.css",
            //         "views/app/common/css/style_new.css"
            //     ]
            // }))


   //dont move
    };
    // return
    return registerRoutes;
});
