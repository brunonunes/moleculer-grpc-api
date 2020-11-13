"use strict"

const defaultsDeep = require('lodash.defaultsdeep')
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

const { createError } = require("./utils")

module.exports = function(mixinOptions) {

    mixinOptions = defaultsDeep(mixinOptions, {
        port: 50051
    })

    const server = new grpc.Server()

    const serviceSchema = {
        methods: {

            prepareGrpcServices() {
                try {
                    const aliases = mixinOptions.aliases
                    const directory = mixinOptions.directory
                    const authentication = mixinOptions.authentication
                    this.logger.info(`♻ Preparing gRPC aliases ${directory}`)
                    this.addGrpcServices({ directory, aliases, authentication })
                } catch (err) {
                    this.logger.error(err)
                    throw new Error(err)
                }
            },

            addGrpcServices({ directory, aliases, authentication }) {

                try {

                    for (const protoDef of Object.keys(aliases)) {

                        let actions = {}

                        const calls = aliases[protoDef]

                        const [protoFile, protoService] = protoDef.split('.')

                        for (const protoActionCall of Object.keys(calls)) {

                            const action = calls[protoActionCall]

                            this.logger.info(`gRPC ${protoFile}.${protoService}/${protoActionCall} => ${action}`)

                            actions[protoActionCall] = async (call, callback) => {
                                try {
                                    const params = call.request
                                    let meta = call.metadata

                                    if (authentication) {
                                        const authenticationParams = authentication.params
                                        const [tokenParam] = Object.keys(authenticationParams)
                                        const [data] = meta.get(tokenParam)

                                        let options = {}
                                        options[tokenParam] = data

                                        meta.user = await this.broker.call(authentication.action, options)
                                    }

                                    const response = await this.broker.call(
                                        action,
                                        params,
                                        { meta }
                                    )

                                    callback (null, response || {})
                                } catch (err) {
                                    this.logger.error(err)
                                    callback(createError(err.code, err.message, err.data), null)
                                }
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
