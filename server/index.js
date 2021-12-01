const { ApolloServer } = require(`apollo-server-express`)
const { MongoClient } = require('mongodb')
const express = require(`express`)
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')
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
    // Apolloサーバーのインスタンスを作成
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const githubToken = req.headers.authorization
            const currentUser = await db.collection('users').findOne({ githubToken })
            return { db, currentUser }
        }
    })

    await server.start()
    // applyMiddleware()を呼び出し、Expressにミドルウェアを追加する
    server.applyMiddleware({ app })

    // ホームルート
    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
    // GraphQL Playground用ルート
    app.get('/playground', (expressPlayground({ endpoint: '/graphql' })))

    // 特定のポートでlistenする
    app.listen({ port: 4000}, () => console.log(`GraphQL Server running at https://localhost:4000${server.graphqlPath}`))
}

start()
