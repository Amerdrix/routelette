export interface map {
    [name: string]: string;
}
export interface routeDidLeaveCallback {
    (): void;
}
export interface routeDidEnterCallback {
    (extractedVariables: map, nestedRouter: Router, path: string): routeDidLeaveCallback | void;
}
export declare const router: Router;
export declare function browserPathDidChange(path: string): void;
export interface Router {
    register: (route: string, routeDidEnterCallback: routeDidEnterCallback) => (map: map) => string;
}
