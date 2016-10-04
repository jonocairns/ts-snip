module app.services {
    'use strict';
    export interface ITokenService {
        validate(): app.token.IToken;
        refresh(): void;
        login(): void;
        get(): app.token.IToken;
        logout(): void;
        clearClientCache(): void;
    }

    export class TokenService implements ITokenService {

        /* @ngInject */
        constructor(private $cookies: any, private $injector: any,
            private $location: ng.ILocationService, private apiEndpoint: app.common.IApiEndpointConfig,
            private $window: ng.IWindowService, private cacheService: ICacheService) {
        }

        public get(): app.token.IToken {
            var cookie = this.$cookies['ignite.token'];
            if (_.isUndefined(cookie)) {
                return app.token.Token.empty();
            }
            return new app.token.Token(cookie);
        }

        public validate(): app.token.IToken {
            var token = this.get();
            if (token.isEmpty()) {
                this.refresh();
            } else {
                // let the root scope know that the user has a token and the page can be displayed - this is picked up in the common.page.class.controller
                this.$injector.invoke([
                    '$rootScope', ($rootScope: IIgniteRootScope) => {
                        $rootScope.igniteAuthenticationLoaderFlag = false;
                    }
                ]);
            }
            return token;
        }

        public refresh(): void {
            this.$injector.invoke(['$http', '$rootScope', '$location', ($http: ng.IHttpService, $rootScope: IIgniteRootScope, $location: ng.ILocationService) => {
                var ret = $location.absUrl();
                var encoded = btoa(ret);

                $http.get(this.apiEndpoint.baseUrl + '/auth/request?request=' + encoded).then((urlRedirect: any) => {
                    if (!_.isUndefined(urlRedirect) && !_.isNull(urlRedirect) && !_.isEmpty(urlRedirect)) {
                        this.$window.location.href = urlRedirect.data.RedirectAddress;
                    }
                }, (resp: any) => {
                    $rootScope.igniteAuthenticationLoaderFlag = false;
                    if (resp.status !== 0) {
                        $location.path('/error');
                    }
                });
            }]);
        }

        public logout(): void {
            this.$injector.invoke(['$http', '$timeout', ($http: ng.IHttpService, $timeout: ng.ITimeoutService) => {
                $http.get(this.apiEndpoint.baseUrl + '/auth/logout').then((urlRedirect: any) => {
                    this.removeCookie();
                    this.cacheService.clearAll();
                    $timeout(() => {
                        this.$window.location.href = urlRedirect.data.RedirectAddress;
                    });
                }, () => {
                    this.clearClientCache();
                });
            }]);
        }

        public clearClientCache(): void {
            this.removeCookie();
            this.cacheService.clearAll();
            this.$location.path('/');
            this.$window.location.reload();
        }

        public login(): void {
            var absUrl = this.$location.absUrl();
            var baseurl = absUrl.substring(0, absUrl.length - this.$location.url().length);
            var encoded = btoa(baseurl + '/home');

            this.$injector.invoke(['$http', ($http: ng.IHttpService) => {
                $http.get(this.apiEndpoint.baseUrl + '/auth/request?request=' + encoded).then((urlRedirect: any) => {
                    this.$window.location.href = urlRedirect.data.RedirectAddress;
                }, () => {
                    this.$window.location.href = baseurl + 'home';
                    this.$window.location.reload();
                });
            }]);
        }

        public removeCookie() {
            this.$cookies['ignite.token'] = '';
            delete this.$cookies['ignite.token'];
            document.cookie = 'ignite.token=; domain=.' + this.$location.host() + ';expires=Wed, 31 Oct 2012 08:50:17 GMT;';
        }
    }

    angular
        .module('app.services')
        .service('tokenService', TokenService);
}
