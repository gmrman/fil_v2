define(["angularAMD"], function(angularAMD) {
   var registerRoutes = function($stateProvider, $urlRouterProvider) {

      $stateProvider
      //收貨統計看板-圖表顯示
         .state("kb_01_s01", angularAMD.route({
            "cache": false,
            "url": "/kb_01_s01",
            "params": {
               "params": null
            },
            "templateUrl": "views/app/kb_01/kb_01_s01/kb_01_s01.html",
            "controllerUrl": "views/app/kb_01/kb_01_s01/kb_01_s01.js",
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/kb_01/kb_01_s01/css/bootstrap.css",
               "views/app/kb_01/kb_01_s01/css/style.css"
            ]
         }))
         .state("kb_01_s02", angularAMD.route({
            "cache": false,
            "url": "/kb_01_s02",
            "params": {
               "params": null
            },
            "templateUrl": "views/app/kb_01/kb_01_s02/kb_01_s02.html",
            "controllerUrl": "views/app/kb_01/kb_01_s02/kb_01_s02.js",
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/kb_01/kb_01_s02/css/style.css"
            ]
         }))
   }
   // return
   return registerRoutes
})
