const { ApolloServer, PubSub } = require(`apollo-server-express`)
const { MongoClient } = require('mongodb')
const express = require(`express`)
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')
const { createServer } = require('http')
const path = require('path')
const depthLimit = require('graphql-depth-limit')
require('dotenv').config()

const typeDefs = readFileSync('./typeDefs.graphql', 'utf-8')
const resolvers = require('./resolvers')

async function start() {
    // express()を呼び出しExpressアプリケーションを作成する
    const app = express()
    // MongoDBのホスト
    const MONGO_DB = process.env.DB_HOST
    // MongoDBクライアントのインスタンスを作成
    const client = await MongoClient.connect(MONGO_DB, { usenewUrlParser: true })
    const db = client.db()

    // Subscription
    const pubsub = new PubSub()

    // Apolloサーバーのインスタンスを作成
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        validationRules: [depthLimit(5)],
        context: async ({ req, connection }) => {
            const githubToken = req ?
                req.headers.authorization :
                connection.context.Authorization

            const currentUser = await db.collection('users').findOne({ githubToken })

            return { db, currentUser, pubsub }
        }
    })

    // applyMiddleware()を呼び出し、Expressにミドルウェアを追加する
    server.applyMiddleware({ app })

    // ホームルート
    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
    // GraphQL Playground用ルート
    app.get('/playground', (expressPlayground({ endpoint: '/graphql' })))

    app.use('/img/photos', express.static(path.join(__dirname, 'assets', 'photos')))

    // HTTPサーバー
    const httpServer = createServer(app)
    // WebSocketを動作させる
    server.installSubscriptionHandlers(httpServer)
    // タイムアウト設定
    httpServer.timeout = 5000

    // 特定のポートでlistenする
    httpServer.listen({ port: 4000 }, () => {
        console.log(`GraphQL Server running at https://localhost:4000${server.graphqlPath}`)
    })
}

start()
