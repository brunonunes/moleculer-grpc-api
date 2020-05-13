"use strict"

const _ = require("lodash")
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')
const { MoleculerServerError } = require("moleculer").Errors

module.exports = function(mixinOptions) {
    mixinOptions = _.defaultsDeep(mixinOptions, {
        routeOptions: {
            path: '/grpc'
        },
    })

    const server = new grpc.Server()

    const serviceSchema = {
        events: {
            "$services.changed"() {

            }
        },
        methods: {

            prepareGrpcServices() {
                this.logger.info("♻ Preparing gRPC services")

                try {

                    const services = this.broker.registry.getServiceList({ withActions: true })

                    this.addGrpcServices(services)

                } catch (err) {
                    this.logger.error(err)
                    throw new Error(err)
                }
            },

            addGrpcServices(services) {
                try {

                    const processedServices = new Set()

                    services.forEach(service => {
                        const serviceName = this.getServiceName(service)
                        console.log('serviceName', serviceName)

                        // Skip multiple instances of services
						if (processedServices.has(serviceName)) return
                        processedServices.add(serviceName)

                        if (service.settings && service.settings.grpc) {

                            if (_.isObject(service.settings.grpc)) {

                                const def = service.settings.grpc

                                let actions = {}
                                Object.values(service.actions).forEach(action => {

                                    const actionName = action.name.split('.')[1]

                                    actions[actionName] = async (call, callback) => {

                                        const {
                                            params: staticParams = {},
                                        } = def

                                        try {
                                            const params = call.request
                                            const allParams = _.defaultsDeep({}, params, staticParams)

                                            callback (null, await this.broker.call(
                                                action.name,
                                                _.defaultsDeep(allParams)
                                            ))

                                        } catch (err) {
                                            callback(err)
                                            throw new Error(err)
                                        }

                                    }

                                })

                                const PROTO_PATH = __dirname + `../../../../protos/${service.settings.grpc.proto}.proto`

                                const packageDefinition = protoLoader.loadSync(PROTO_PATH)
                                const proto = grpc.loadPackageDefinition(packageDefinition)[service.settings.grpc.proto]

                                // server.forceShutdown(() => {

                                // })

                                console.log(`service ${service.settings.grpc.service} added`, actions)
                                server.addService(proto[service.settings.grpc.service].service, actions)

                            }

                        }

                    })

                    console.log('starting')
                    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
                    server.start()
                    this.logger.info(`🚀 gRPC server is available at ${mixinOptions.routeOptions.path}`)
                } catch (err) {
                    this.logger.error(err)
                    throw new Error(err)
                }
            },



			getServiceName(service) {
				if (service.fullName) return service.fullName;

				if (service.version != null)
					return (
						(typeof service.version == "number"
							? "v" + service.version
							: service.version) +
						"." +
						service.name
					);

				return service.name;
			},
        },
        created() {
            const route = _.defaultsDeep(mixinOptions.routeOptions, {
                aliases: {
                    "/"(req, res) {
                        try {
                            return this.prepareGrpcServices()
                        } catch (err) {
                            throw new Error(err)
                        }
                    }
                },

                mappingPolicy: "restrict",

            })

            // Add route
            this.settings.routes.unshift(route)
        },

        started() {
            // const PROTO_PATH = __dirname + '../../../../protos/helloworld.proto'
            // const packageDefinition = protoLoader.loadSync(PROTO_PATH)
            // var hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld

            // function sayHello(call, callback) {
            //     callback(null, {message: 'Hello ' + call.request.name});
            // }


            // server.addService(hello_proto.Greeter.service, {sayHello: sayHello});
            // server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
            // server.start();
            this.logger.info(`🚀 gRPC server is available at ${mixinOptions.routeOptions.path}`)
        },
    }

    return serviceSchema
}
