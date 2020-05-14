"use strict"

const _ = require("lodash")
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

module.exports = function(mixinOptions) {

    mixinOptions = _.defaultsDeep(mixinOptions, {
        port: 50051
    })

    const server = new grpc.Server()

    const serviceSchema = {
        methods: {

            prepareGrpcServices() {
                try {
                    const aliases = mixinOptions.aliases
                    const directory = mixinOptions.directory
                    this.logger.info(`♻ Preparing gRPC aliases ${directory}`)
                    this.addGrpcServices(directory, aliases)
                } catch (err) {
                    this.logger.error(err)
                    throw new Error(err)
                }
            },

            addGrpcServices(directory, aliases) {

                try {

                    for (const protoDef of Object.keys(aliases)) {

                        let actions = {}

                        const action = aliases[protoDef]

                        const [protoFile, route] = protoDef.split('.')
                        const [protoService, protoActionCall] = route.split('/')

                        this.logger.info(`gRPC ${protoFile}.${protoService}/${protoActionCall} => ${action}`)

                        actions[protoActionCall] = async (call, callback) => {
                            try {
                                const params = call.request
                                callback (null, await this.broker.call(
                                    action,
                                    params
                                ))
                            } catch (err) {
                                callback(null, err)
                                throw new Error(err)
                            }
                        }

                        const PROTO_PATH = `${directory}/${protoFile}.proto`
                        const packageDefinition = protoLoader.loadSync(PROTO_PATH)
                        const proto = grpc.loadPackageDefinition(packageDefinition)[protoFile]

                        try {
                            server.addService(proto[protoService].service, actions)
                        } catch (err) {
                            this.logger.error(err)
                            throw new Error(err)
                        }

                    }

                    this.startGrpcServer()

                } catch (err) {
                    this.logger.error(err)
                    throw new Error(err)
                }
            },

            startGrpcServer() {
                server.bind(`0.0.0.0:${mixinOptions.port}`, grpc.ServerCredentials.createInsecure());
                server.start()
                this.logger.info(`🚀 gRPC server is available at ${mixinOptions.port}`)
            },

        },

        created() {
            this.prepareGrpcServices()
        },
    }

    return serviceSchema
}
