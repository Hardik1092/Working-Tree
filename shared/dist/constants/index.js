"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FEED_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.POSTS = exports.USERS = exports.AUTH = void 0;
var endpoints_1 = require("../api/endpoints");
Object.defineProperty(exports, "AUTH", { enumerable: true, get: function () { return endpoints_1.AUTH; } });
Object.defineProperty(exports, "USERS", { enumerable: true, get: function () { return endpoints_1.USERS; } });
Object.defineProperty(exports, "POSTS", { enumerable: true, get: function () { return endpoints_1.POSTS; } });
exports.DEFAULT_PAGE_SIZE = 10;
exports.DEFAULT_FEED_PAGE_SIZE = 20;
