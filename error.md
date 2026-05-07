# Error en consola 
react-scripts start                                                                                                                          
[1]                                                                                             
[0] /home/hector/hub/Juego-Node opencode/server/socketHandlers.js:372                                                                              
[0]   });                                                                                                           
[0]    ^                                                                                                        
[0]                                                                                             
[0] SyntaxError: Unexpected token ')'                                                                                                              
[0]     at wrapSafe (node:internal/modules/cjs/loader:1472:18)
[0]     at Module._compile (node:internal/modules/cjs/loader:1501:20)
[0]     at Module._extensions..js (node:internal/modules/cjs/loader:1613:10)
[0]     at Module.load (node:internal/modules/cjs/loader:1275:32)
[0]     at Module._load (node:internal/modules/cjs/loader:1096:12)
[0]     at Module.require (node:internal/modules/cjs/loader:1298:19)
[0]     at require (node:internal/modules/helpers:182:18)
[0]     at Object.<anonymous> (/home/hector/hub/Juego-Node opencode/server/index.js:6:65)
[0]     at Module._compile (node:internal/modules/cjs/loader:1529:14)
[0]     at Module._extensions..js (node:internal/modules/cjs/loader:1613:10)
[0] 
[0] Node.js v20.19.2
[0] [nodemon] app crashed - waiting for file changes before starting...
[1] (node:12637) [DEP_WEBPACK_DEV_SERVER_ON_AFTER_SETUP_MIDDLEWARE] DeprecationWarning: 'onAfterSetupMiddleware' option is deprecated. Please use the 'setupMiddlewares' option.
[1] (Use `node --trace-deprecation ...` to show where the warning was created)
[1] (node:12637) [DEP_WEBPACK_DEV_SERVER_ON_BEFORE_SETUP_MIDDLEWARE] DeprecationWarning: 'onBeforeSetupMiddleware' option is deprecated. Please use the 'setupMiddlewares' option.


# Errores en el navegador

Uncaught ReferenceError: showCreate is not defined
    at HTMLButtonElement.onclick (lobby:162:61)Understand this error
lobby:182 Uncaught ReferenceError: createGame is not defined
    at HTMLButtonElement.onclick (lobby:182:95)


    lobby:163 Uncaught ReferenceError: showJoin is not defined
    at HTMLButtonElement.onclick (lobby:163:50)