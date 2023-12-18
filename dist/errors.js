"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = exports.writeErrorsJson = exports.storeError = exports.getErrors = void 0;
const node_fs_1 = require("node:fs");
const errors = [];
const getErrors = () => {
    return [...errors];
};
exports.getErrors = getErrors;
const storeError = (error) => {
    errors.push(error);
};
exports.storeError = storeError;
const writeErrorsJson = () => {
    (0, node_fs_1.writeFileSync)(__dirname + "/../errors.json", JSON.stringify(errors.map(exports.getErrorMessage), null, 2));
};
exports.writeErrorsJson = writeErrorsJson;
const getErrorMessage = (error) => {
    if (error instanceof Error) {
        return error.message;
    }
    return "" + error;
};
exports.getErrorMessage = getErrorMessage;
