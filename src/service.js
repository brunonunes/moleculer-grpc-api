"use strict"

const _ = require("lodash")
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

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
                this.prepareGrpcServices()
            }
        },
        methods: {

            invalidateGraphQLSchema() {
			    this.shouldUpdateGraphqlSchema = true
			},

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

                                console.log(`service ${service.settings.grpc.service} added`, actions)
                                try {
                                    server.addService(proto[service.settings.grpc.service].service, actions)
                                } catch (err) {
                                    // console.log(err)
                                }

                            }

                        }

                    })

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

            startGrpcServer() {
                server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
                server.start()
                this.logger.info(`🚀 gRPC server is available at ${mixinOptions.routeOptions.path}`)
            }
        },
        created() {
            const route = _.defaultsDeep(mixinOptions.routeOptions, {
                aliases: {
                    "/"(req, res) {
                        try {
                            this.startGrpcServer()
                            return 'gRPC'
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
            if (process.env.NODE_ENV == "production") this.prepareGrpcServices()
            this.logger.info(`🚀 gRPC server is available at ${mixinOptions.routeOptions.path}`)
        },
    }

    return serviceSchema
}
