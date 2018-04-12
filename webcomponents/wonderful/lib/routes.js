/**
 * Created by davidlee on 16/3/12.
 */
define(
    // routes
    [
        "views/_routes.js",
        "views/app/fil3/fil3_common/_routes.js",
        "views/app/fil3/fil3_01/_routes.js",
        "views/app/fil3/fil3_10/_routes.js",
        "views/app/fil_00/_routes.js",
        "views/app/fil_common/_routes.js",
        "views/app/fil_02/_routes.js",
        "views/app/fil_09/_routes.js",
        "views/app/fil_10/_routes.js",
        "views/app/fil_14/_routes.js",
        "views/app/fil_15/_routes.js",
        "views/app/fil_16/_routes.js",
        "views/app/fil_17/_routes.js",
        "views/app/fil_18/_routes.js",
        "views/app/fil_19/_routes.js",
        "views/app/fil_23/_routes.js",
        "views/app/fil_24/_routes.js",
        "views/app/fil_25/_routes.js",
        "views/app/fil_print/_routes.js",
        "views/app/fil_file_transfer/_routes.js",
        "views/app/xcommon/routes/_routes.js",
    ],
    // register
    function() {
        // routes
        var routes = arguments;
        // register
        var registerRoutes = function($stateProvider, $urlRouterProvider) {
            for (var i = 0; i < routes.length; i++) {
                routes[i]($stateProvider, $urlRouterProvider);
            }
        };
        // return
        return registerRoutes;
    }
);