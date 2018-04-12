define(["angularAMD"], function(angularAMD) {
   var registerRoutes = function($stateProvider, $urlRouterProvider) {

      $stateProvider
      //收貨統計看板-圖表顯示
         .state("kb_02_s01", angularAMD.route({
            "cache": false,
            "url": "/kb_02_s01",
            "params": {
               "params": null
            },
            "views": {
               "": angularAMD.route({
                  "templateUrl": "views/app/kb_02/kb_02_s01/kb_02_s01.html",
                  "controllerUrl": "views/app/kb_02/kb_02_s01/kb_02_s01.js"
               }),
               "kb_02_s01_list@kb_02_s01": angularAMD.route({
                  "templateUrl": "views/app/kb_02/kb_02_s01/kb_02_s01_list.html",
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/kb_02/kb_02_s01/css/style.css",
               "views/app/common/css/commonFormat.css"
            ]
         }))
         .state("kb_02_s02", angularAMD.route({
            "cache": false,
            "url": "/kb_02_s02",
            "params": {
               "params": null
            },
            "templateUrl": "views/app/kb_02/kb_02_s02/kb_02_s02.html",
            "controllerUrl": "views/app/kb_02/kb_02_s02/kb_02_s02.js",
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/kb_02/kb_02_s02/css/style.css",
            ]
         }))
   }
   // return
   return registerRoutes
})
