module app {
    'use strict';

    export class Argument {

        public static checkIfNullOrUndefined(value: any, argumentName: string): void {
            if (_.isUndefined(value) || _.isNull(value)) {
                throw new Error(argumentName + ' must be a defined and not null');
            }
        }

        public static checkIfUndefinedAndBoolean(value: any, argumentName: string) {
            if (_.isUndefined(value) || !_.isBoolean(value)) {
                throw new Error(argumentName + ' must be defined and a boolean');
            }
        }

        public static checkIfUndefinedAndString(value: any, argumentName: string) {
            if (_.isUndefined(value) || !_.isString(value)) {
                throw new Error(argumentName + ' must be defined and a string');
            }
        }

        public static defaultListIfNull(value: Array<any>, argumentName: string) {
            if (_.isUndefined(value) || _.isNull(value) || _.isEmpty(value)) {
                return [];
            } else {
                return value;
            }
        }

    }

}