module app {
    'use strict';

    export interface IGlobalResolve extends ng.IServiceProvider {
        addGlobalDependenciesTo(routeProvider: ng.route.IRouteProvider, dependencies: IGlobalResolveDependencies);
    }

    export interface IGlobalResolveDependencies {
        configService: Function;
    }

    class GlobalResolve implements ng.IServiceProvider {

        public addGlobalDependenciesTo(routeProvider: ng.route.IRouteProvider, dependencies: IGlobalResolveDependencies) {
            var when = routeProvider.when;
            routeProvider.when = decorate;

            function decorate(path, route) {
                var globalResolve = route.globalResolve || typeof route.globalResolve === 'undefined';
                if (globalResolve) {
                    route.resolve = angular.extend(dependencies, route.resolve || {});
                }
                return when.call(routeProvider, path, route);
            }
        }

        public $get(): GlobalResolve {
            return new GlobalResolve();
        }
    }

    angular
        .module('app')
        .provider('globalResolve', GlobalResolve);
}

/* @ngInject */
function routes($routeProvider, globalResolveProvider) {
    'use strict';

    globalResolveProvider.addGlobalDependenciesTo($routeProvider,
    {
        configService: [
            'configurationService', (configurationService: app.services.IConfigurationService) => {
                return configurationService.getConfig();
            }
        ]
    });
}

angular
    .module('app')
    .config(routes);