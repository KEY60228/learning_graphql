const { ApolloServer } = require(`apollo-server`)

const typeDefs = `
    # Photo型を定義
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
    }

    # allPhotosはPhotoを返す
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }

    type Mutation {
        postPhoto(name: String! description: String): Photo!
    }
`

// ユニークIDをインクリメントするための変数
var _id = 0
// 写真を格納するための配列を定義する
var photos = []

const resolvers = {
    Query: {
        // 写真を格納した配列の長さを返す
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },
    // postPhotoミューテーションと対応するリゾルバ
    Mutation: {
        postPhoto(parent, args) {
            // 新しい写真を作成し、idを生成する
            var newPhoto = {
                id: _id++,
                ...args
            }
            photos.push(newPhoto)

            // 新しい写真を返す
            return newPhoto
        }
    },
    // マッピングするためのリゾルバ
    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`
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
