/**
 * Created by davidlee on 16/3/12.
 */
// config
require.config({
    // paths
    paths: {
        // angular
        "angular": "angular/angular.min",
        "angular-animate": "angular/angular-animate.min",
        "angular-sanitize": "angular/angular-sanitize.min",
        "angular-resource": "angular/angular-resource.min",
        //angular-ui-router
        "angular-ui-router": "angular-ui-router/angular-ui-router.min",
        // angular-css
        "angular-css": "angular-css/angular-css.min",
        // angular-amd
        "angularAMD": "angular-amd/angularAMD.min",
        "ngload": "angular-amd/ngload.min",
        // ionic
        "ionic": "ionic/js/ionic.min",
        "ionicBundle": "ionic/js/ionic.bundle.min",
        "ionic-angular": "ionic/js/ionic-angular.min",
        "jquery": "jquery/jquery-2.1.4.min",
        //API&APP&widget
        "API": "api/APIBridge",
        "APIS": "api/APIService",
        "config": "api/config",
        "array": "api/array",
        "base64": "api/base64",
        "md5": "api/md5",

        "APP": "app/APPBridge",
        "AppLang": "AppLang",
        "Widget": "widget/js/widget",
        "Directives": "widget/js/directives",
        "ReqTestData": "../views/app/testData",
        "routertepe1": "../views/_routes",
        "routertepe2": "../views/app/_routes",

        "ionic-popup": "../views/app/common/js/ionicPopupService",
        "userInfoService": "../views/app/common/js/userInfoService",
        "circulationCardService": "../views/app/common/js/circulationCardService",
        "numericalAnalysisService": "../views/app/common/js/numericalAnalysisService",
        "FileTransferService": "widget/js/file-transfer-service",
        "scanTypeService": "../views/app/common/js/scanTypeService",
        "commonFactory": "../views/app/common/js/commonFactory",
        "commonService": "../views/app/common/js/commonService"
    },
    // shim
    shim: {
        // angular
        "angular": {
            exports: "angular"
        },
        "angular-animate": ["angular"],
        "angular-sanitize": ["angular"],
        "angular-resource": ["angular"],
        // angular-ui-router
        "angular-ui-router": ["angular"],
        // angular-css
        "angular-css": ["angular"],
        // angular-amd
        "angularAMD": ["angular"],
        "ngload": ["angularAMD"],
        //digiwin-gateway
        "digiwin-gateway": ["angular"],
        "simplehttp": ["angular"],

        // ionic
        "ionic": {
            exports: "ionic"
        },
        "ionic-angular": ["ionic", "angular", "angular-animate", "angular-sanitize", "angular-resource"],
        "jquery": {
            exports: "jquery"
        }
        //API&APP&widget
    }
});

// bootstrap

define(["angular", "angularAMD", "ionic", "routes", "angular-ui-router", "angular-css", "ionic-angular"],
    function(angular, angularAMD, ionic, registerRoutes) {
        // module
        var app = angular.module("app", ["ui.router", "door3.css", "ionic"]);
        app.config(["$ionicConfigProvider", function($ionicConfigProvider) {
            $ionicConfigProvider.templates.maxPrefetch(0);
            $ionicConfigProvider.tabs.position('top');
            $ionicConfigProvider.navBar.alignTitle('center');
        }]);
        app.config(["$stateProvider", "$urlRouterProvider", registerRoutes]);
        app.constant('$ionicLoadingConfig', {
            template: '<ion-spinner icon="ios"></ion-spinner>'
        });
        app.run(function($rootScope, $timeout, $document, $ionicPlatform) {
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                $timeout(function() {
                    // document.getElementById('maskview').style.visibility='hidden'
                }, 0);
            });
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                $timeout(function() {
                    //   document.getElementById('maskview').style.visibility='visible'
                }, 0);
            });
            $ionicPlatform.ready(function() {
                $document.on('afterinput', function() {
                    $rootScope.$broadcast('afterinput');
                });
            });
        });

        // bootstrap
        return angularAMD.bootstrap(app);
    });
