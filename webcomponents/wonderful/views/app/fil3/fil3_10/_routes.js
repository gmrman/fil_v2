define(["angularAMD"], function(angularAMD) {
    var registerRoutes = function($stateProvider, $urlRouterProvider) {

        $stateProvider
          //   .state("fil3_10_s01", {
          //       cache: false,
          //       url: "/fil3_10_s01",
          //       views: {
          //           'fil3_10_s01': angularAMD.route({
          //  templateUrl: "views/app/fil3/fil3_10/fil3_10_s01/fil3_10_s01.html",
          //  controllerUrl: "views/app/fil3/fil3_10/fil3_10_s01/fil3_10_s01.js"
          //           })
          //       },
          //       css: [
          //           "views/app/css/style.css",
          //           "views/app/common/common.css"
          //       ]
          //   })
          .state("fil3_10_s01", angularAMD.route({
              cache: false,
              url: "/fil3_10_s01",
              params: {
                  'params': null
              },
              views: {
                  '': angularAMD.route({
                     templateUrl: "views/app/fil3/fil3_10/fil3_10_s01/fil3_10_s01.html",
                     controllerUrl: "views/app/fil3/fil3_10/fil3_10_s01/fil3_10_s01.js"
                  })
              },
              css: [
                  "views/app/common/css/style.css",
                  "views/app/common/css/common.css"
              ]
          }))
            ;
    };
    // return
    return registerRoutes;
});
