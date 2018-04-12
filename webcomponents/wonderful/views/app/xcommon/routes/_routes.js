define(
    [
         "views/app/xyc_fil_01/_routes.js",
    ], function () {
        var routes = arguments;
        // register
        var registerRoutes = function($stateProvider, $urlRouterProvider) {
            for (var i = 0; i < routes.length; i++) {
                routes[i]($stateProvider, $urlRouterProvider);
            }
        };
        // return
        return registerRoutes;
});
