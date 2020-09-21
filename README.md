# moleculer-grpc-api

[Moleculer gRPC API](https://grpc.io/) mixin for
[Moleculer API Gateway](https://github.com/moleculerjs/moleculer-web)

## Features

## Install

```script
npm i moleculer-grpc-api moleculer-web
```

## Usage

helloworld.proto

```proto
syntax = "proto3";
package helloworld;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```

This example demonstrates how to setup a Moleculer API Gateway with gRPC mixin in order to handle
incoming gRPC requests.

```js
"use strict";

const { GrpcService } = require("moleculer-grpc-api");

module.exports = {
    name: "greeter",

    mixins: [

        // gRPC Server
        GrpcService({

            // Directory with you .proto files
            directory: `${dirname}/../protos`,

            // gRPC port. Default: 50051
            port: `50051`,

            // List of actions available. ${protoPackage}.${protoService}/${serviceName}: ${moleculerService}.${moculerAction}
            aliases: {
                'helloworld.Greeter': {
                    'sayHello': 'greeter.sayHello'
                }
            },

            // Authentication action to populate ctx.user using header
            authentication: {
                action: "user.currentUser",
                params: {
                    accessToken: "12345"
                }
            },
        })
    ],

    actions: {
        sayHello: {
            async handler(ctx) {
                this.logger.info("[INFO]:::: handler -> ctx.params", ctx.params);
                this.logger.info("[INFO]:::: handler -> metadata", ctx.meta.user);
                return { message: `Hello ${ctx.params.name}` };
            },
        },

        currentUser: {
            async handler(ctx) {
                const accessToken = ctx.params["access-token"];

                if (accessToken) {
                    if (accessToken === "12345") {
                        // valid credentials
                        return { id: 1, username: "john.doe", name: "John Doe" };
                    } else {
                        // invalid credentials
                        throw new MoleculerError("Unauthorize user", 401, null, { accessToken });
                    }
                } else {
                    // anonymous user
                    return null;
                }
            },
        },
    },
};

```

Start your Moleculer project and send gRPC requests.

## Contribution

Please send pull requests improving the usage and fixing bugs, improving documentation and providing
better examples, or providing some testing, because these things are important.

## License

The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).
