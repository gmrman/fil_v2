define(["angularAMD"], function(angularAMD) {
   var registerRoutes = function($stateProvider, $urlRouterProvider) {

      $stateProvider
      //待出導引
         .state("kb_03_s01", angularAMD.route({
            "cache": false,
            "url": "/kb_03_s01",
            "params": {
               "params": null
            },
            "views": {
               "": angularAMD.route({
                  "templateUrl": "views/app/kb_03/kb_03_s01/kb_03_s01.html",
                  "controllerUrl": "views/app/kb_03/kb_03_s01/kb_03_s01.js"
               }),
               "kb_03_s01_list@kb_03_s01": angularAMD.route({
                  "templateUrl": "views/app/kb_03/kb_03_s01/kb_03_s01_list.html",
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/kb_03/kb_03_s01/css/style.css",
               "views/app/common/css/commonFormat.css"
            ]
         }))
      //待出導引-設定頁
         .state("kb_03_s02", angularAMD.route({
            "cache": false,
            "url": "/kb_03_s02",
            "params": {
               "params": null
            },
            "templateUrl": "views/app/kb_03/kb_03_s02/kb_03_s02.html",
            "controllerUrl": "views/app/kb_03/kb_03_s02/kb_03_s02.js",
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/kb_03/kb_03_s02/css/style.css"
            ]
         }))
         .state("kb_03_s03_01", angularAMD.route({
            "cache": false,
            "url": "/kb_03_s03_01",
            "params": {
               "params": null
            },
            "templateUrl": "views/app/kb_03/kb_03_s03/kb_03_s03_01/kb_03_s03_01.html",
            "controllerUrl": "views/app/kb_03/kb_03_s03/kb_03_s03_01/kb_03_s03_01.js"
         }))
         .state("kb_03_s03_01.kb_03_s03_02", {
            "cache": false,
            "url": "/kb_03_s03_02",
            "views": {
               "kb_03_s03_02": angularAMD.route({
                  "templateUrl": "views/app/kb_03/kb_03_s03/kb_03_s03_02/kb_03_s03_02.html",
                  "controllerUrl": "views/app/kb_03/kb_03_s03/kb_03_s03_02/kb_03_s03_02.js"
               }),
               "kb_03_s03_02_list@kb_03_s03_01.kb_03_s03_02": angularAMD.route({
                  "templateUrl": "views/app/kb_03/kb_03_s03/kb_03_s03_02/kb_03_s03_02_list.html"
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/common/css/commonFormat.css",
               "views/app/kb_03/kb_03_s03/css/style.css"
            ]
         })
         .state("kb_03_s03_01.kb_03_s03_03", {
            "cache": false,
            "url": "/kb_03_s03_03",
            "views": {
               "kb_03_s03_03": angularAMD.route({
                  "templateUrl": "views/app/kb_03/kb_03_s03/kb_03_s03_03/kb_03_s03_03.html",
                  "controllerUrl": "views/app/kb_03/kb_03_s03/kb_03_s03_03/kb_03_s03_03.js"
               }),
               "kb_03_s03_03_list@kb_03_s03_01.kb_03_s03_03": angularAMD.route({
                  "templateUrl": "views/app/kb_03/kb_03_s03/kb_03_s03_03/kb_03_s03_03_list.html"
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css"
            ]
         })
   }
   // return
   return registerRoutes
})
