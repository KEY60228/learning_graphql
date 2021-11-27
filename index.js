const { ApolloServer } = require(`apollo-server`)

const typeDefs = `
    type Query {
        totalPhotos: Int!
    }
`

const resolvers = {
    Query: {
        totalPhotos: () => 42
    }
}

// サーバーのインスタンスを作成
// その際、typeDefs(スキーマ)とリゾルバを引数にとる
const server = new ApolloServer({
    typeDefs,
    resolvers
})

// WEBサーバーを起動
server.listen().then(({url}) => console.log(`GraphQL Service running on ${url}`))
