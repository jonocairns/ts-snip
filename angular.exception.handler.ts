module app.exceptionOverride {
'use strict';

    angular.module('app.exception')
        .config(['$provide', ($provide: ng.auto.IProvideService) => {
        $provide.decorator('$exceptionHandler', ['$delegate', 'loggingService', '$injector',
            ($delegate: ng.IExceptionHandlerService, logger: app.services.ILoggingService, $injector: any) => (exception: any) => {
                var errorMessage = '';
                if (!_.isUndefined(exception) && !_.isNull(exception)) {
                    errorMessage = 'Exception name: ' + exception.name + '\n Exception message: ' + exception.message + '\n';
                } else {
                    errorMessage = 'An exception occured in the application but no usefull information has been caught from the exception itself - check location and current user for more information. \n\n';
                }
                errorMessage += getCurrentUserInfo() + getLocationInfo();

                if (!_.isUndefined(exception) && !_.isUndefined(exception.stack)) {
                    errorMessage += '\n StackTrace: ' + exception.stack;
                }

                logger.logError(errorMessage);
                $delegate(exception);

                function getLocationInfo() {
                    var info = '';
                    $injector.invoke([
                        '$location', ($location: any) => {
                            info = ' Route that error occured: ' + $location.path() + '\n Absolute Path: ' + $location.absUrl() + '\n';
                        }
                    ]);
                    return info;
                }

                function getCurrentUserInfo() {
                    var info = '';
                    $injector.invoke([
                        '$cookies', ($cookies: any) => {
                            var cookie = $cookies['ignite.token'];
                            if (!_.isUndefined(cookie)) {
                                var decodedToken = decodeToken(cookie);
                                info = ' Relating user: \n\t DisplayName: ' + decodedToken.name +
                                '\n\t CID: ' + decodedToken.cid +
                                '\n\t Registration Key ' + decodedToken.reg + ' \n';
                            } else {
                                info = '\n Could not retrieve the current users information as the cookie is not set. \n';
                            }
                        }
                    ]);
                    return info;
                }

                function decodeToken(token: string) {
                    var payload = token.split('.');
                    var decodedPayload = atob(payload[1]);
                    return angular.fromJson(decodedPayload);
                }
            }


        ]);
    }]);
}
