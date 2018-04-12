define(["angularAMD"], function (angularAMD) {
   var registerRoutes = function ($stateProvider, $urlRouterProvider) {

      $stateProvider
         .state("kb_04_s01_02", angularAMD.route({
            "cache": false,
            "url": "/kb_04_s01_02",
            "params": {
               "params": null
            },
            "templateUrl": "views/app/kb_04/kb_04_s01/kb_04_s01_02/kb_04_s01_02.html",
            "controllerUrl": "views/app/kb_04/kb_04_s01/kb_04_s01_02/kb_04_s01_02.js"
         }))
         .state("kb_04_s01_02.kb_04_s01_04", {
            "cache": false,
            "url": "/kb_04_s01_04",
            "views": {
               "kb_04_s01_04": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s01/kb_04_s01_04/kb_04_s01_04.html",
                  "controllerUrl": "views/app/kb_04/kb_04_s01/kb_04_s01_04/kb_04_s01_04.js"
               }),
               "kb_04_s01_04_list@kb_04_s01_02.kb_04_s01_04": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s01/kb_04_s01_04/kb_04_s01_04_list.html"
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/common/css/commonFormat.css",
               "views/app/kb_04/css/style.css"
            ]
         })
         .state("kb_04_s01_02.kb_04_s01_05", {
            "cache": false,
            "url": "/kb_04_s01_05",
            "views": {
               "kb_04_s01_05": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s01/kb_04_s01_05/kb_04_s01_05.html",
                  "controllerUrl": "views/app/kb_04/kb_04_s01/kb_04_s01_05/kb_04_s01_05.js"
               }),
               "kb_04_s01_05_list@kb_04_s01_02.kb_04_s01_05": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s01/kb_04_s01_05/kb_04_s01_05_list.html"
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/kb_04/css/style.css"
            ]
         })
         .state("kb_04_s02_04", angularAMD.route({
            "cache": false,
            "url": "/kb_04_s02_04",
            "params": {
               "params": null
            },
            "views": {
               "": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s02/kb_04_s02_04/kb_04_s02_04.html",
                  "controllerUrl": "views/app/kb_04/kb_04_s02/kb_04_s02_04/kb_04_s02_04.js"
               }),
               "kb_04_s02_04_list@kb_04_s02_04": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s02/kb_04_s02_04/kb_04_s02_04_list.html",
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/common/css/commonFormat.css",
               "views/app/kb_04/css/style.css"
            ]
         }))
         .state("kb_04_s03_02", angularAMD.route({
            "cache": false,
            "url": "/kb_04_s03_02",
            "params": {
               "params": null
            },
            "templateUrl": "views/app/kb_04/kb_04_s03/kb_04_s03_02/kb_04_s03_02.html",
            "controllerUrl": "views/app/kb_04/kb_04_s03/kb_04_s03_02/kb_04_s03_02.js"
         }))
         .state("kb_04_s03_02.kb_04_s03_04", {
            "cache": false,
            "url": "/kb_04_s03_04",
            "views": {
               "kb_04_s03_04": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s03/kb_04_s03_04/kb_04_s03_04.html",
                  "controllerUrl": "views/app/kb_04/kb_04_s03/kb_04_s03_04/kb_04_s03_04.js"
               }),
               "kb_04_s03_04_list@kb_04_s03_02.kb_04_s03_04": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s03/kb_04_s03_04/kb_04_s03_04_list.html"
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/common/css/commonFormat.css",
               "views/app/kb_04/css/style.css"
            ]
         })
         .state("kb_04_s03_02.kb_04_s03_05", {
            "cache": false,
            "url": "/kb_04_s03_05",
            "views": {
               "kb_04_s03_05": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s03/kb_04_s03_05/kb_04_s03_05.html",
                  "controllerUrl": "views/app/kb_04/kb_04_s03/kb_04_s03_05/kb_04_s03_05.js"
               }),
               "kb_04_s03_05_list@kb_04_s03_02.kb_04_s03_05": angularAMD.route({
                  "templateUrl": "views/app/kb_04/kb_04_s03/kb_04_s03_05/kb_04_s03_05_list.html"
               })
            },
            "css": [
               "views/app/common/css/style.css",
               "views/app/common/css/common.css",
               "views/app/kb_04/css/style.css"
            ]
         })
   }
   // return
   return registerRoutes
})
