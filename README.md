# moleculer-grpc-api

[Moleculer gRPC API](https://grpc.io/) mixin for [Moleculer API Gateway](https://github.com/moleculerjs/moleculer-web)

## Features

## Install
```
npm i moleculer-grpc-api moleculer-web
```

## Usage
This example demonstrates how to setup a Moleculer API Gateway with gRPC mixin in order to handle incoming gRPC requests.

```js
"use strict";

const ApiGateway 	= require("moleculer-web");
const { GrpcService } = require("moleculer-grpc-api");

module.exports = {
    name: "api",

    mixins: [
        // Gateway
        ApiGateway,

        // gRPC Server
        GrpcService({

            // Directory with you .proto files
            directory: `${dirname}/../protos`,

            // gRPC port. Default: 50051
            port: ``

            // List of actions available. ${protoPackage}.${protoService}/${serviceName}: ${moleculerService}.${moculerAction}
            aliases: {
                'helloworld.Greeter/sayHello': 'greeter.sayHello'
            }
        })
    ]
};

```

Start your Moleculer project and send gRPC requests.

# Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

# License
The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).
