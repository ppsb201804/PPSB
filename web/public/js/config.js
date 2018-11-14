/**
 * INSPINIA - Responsive Admin Theme
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/index/dashboard");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider

        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "views/common/content.html",
        })
        .state('index.dashboard', {
            url: "/dashboard",
            templateUrl: "views/dashboard.html"
        })
        .state('index.new', {
            url: "/new",
            templateUrl: "views/new.html"
        })
}
angular
    .module('SafeBrowsing')
    .config(config)
    .run(function ($rootScope, $state) {
        $rootScope.$state = $state;
    });
