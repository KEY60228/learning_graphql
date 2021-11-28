const { ApolloServer } = require(`apollo-server-express`)
const express = require(`express`)
const expressPlayground = require('graphql-playground-middleware-express').default
const { readFileSync } = require('fs')

const typeDefs = readFileSync('./typeDefs.graphql', 'utf-8')
const resolvers = require('./resolvers')

// express()を呼び出しExpressアプリケーションを作成する
var app = express()

// サーバーのインスタンスを作成
// その際、typeDefs(スキーマ)とリゾルバを引数にとる
const server = new ApolloServer({
    typeDefs,
    resolvers
})

async function start() {
    await server.start()
    // applyMiddleware()を呼び出し、Expressにミドルウェアを追加する
    server.applyMiddleware({app})
}
start()

// ホームルートを作成する
app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
// GraphQL Playground用ルート
app.get('/playground', expressPlayground({ endpoint: '/graphql'}))

// 特定のポートでlistenする
app.listen({port: 4000}, () => console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`))
