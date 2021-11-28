const { ApolloServer } = require(`apollo-server`)
const { GraphQLScalarType } = require("graphql")

const typeDefs = `
    scalar DateTime

    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }

    # Photo型を定義
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
        created: DateTime!
    }

    # User型を定義
    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
        inPhotos: [Photo!]!
    }

    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    # allPhotosはPhotoを返す
    type Query {
        totalPhotos: Int!
        allPhotos(after: DateTime): [Photo!]!
    }

    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
    }
`

// ユニークIDをインクリメントするための変数
var _id = 0
// 写真を格納するための配列を定義する
// var photos = []

// テストデータ
var users = [
    {"githubLogin": "mHattrup", "name": "Mike Hattrup"},
    {"githubLogin": "gPlake", "name": "Glen Plake"},
    {"githubLogin": "sSchmidt", "name": "Scot Schmidt"}
]
var photos = [
    {
        "id": "1",
        "name": "Dropping the Hear Chute",
        "description": "The heart chute is one of my favorite chutes",
        "category": "ACTION",
        "githubUser": "gPlake",
        "created": "3-28-1977"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt",
        "created": "1-2-1985"
    },
    {
        "id": "3",
        "name": "Gunbarrel 25",
        "description": "25 laps on gunbarrel today",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt",
        "created": "2018-04-15T19:09:57.308Z"
    },
]
var tags = [
    {"PhotoID": "1", "userID": "gPlake"},
    {"PhotoID": "2", "userID": "sSchmidt"},
    {"PhotoID": "2", "userID": "mHattrup"},
    {"PhotoID": "2", "userID": "gPlake"}
]

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
                created: new Date(),
                ...args.input
            }
            photos.push(newPhoto)

            // 新しい写真を返す
            return newPhoto
        }
    },
    // マッピングするためのリゾルバ
    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(u => u.githubLogin === parent.githubUser)
        },
        taggedUsers: parent => {
            return tags
                // 対象の写真が関係しているタグの配列を返す
                .filter(tag => tag.PhotoID === parent.id)
                // タグの配列をユーザーIDの配列に変換する
                .map(tag => tag.userID)
                // ユーザーIDの配列をユーザーオブジェクトの配列に変換する
                .map(userID => users.find(u => u.githubLogin === userID))
        }
    },
    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin)
        },
        inPhotos: parent => {
            return tags
                // 対象のユーザーが関係しているタグの配列を返す
                .filter(tag => tag.userID === parent.id)
                // タグの配列を写真IDの配列に変換する
                .map(tag => tag.PhotoID)
                // 写真IDの配列を写真オブジェクトの配列に変換する
                .map(photoID => photos.find(p => p.id === photoID))
        }
    },
    DateTime: new GraphQLScalarType({
        name: `DateTime`,
        description: `A valid date time value`,
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
}

// サーバーのインスタンスを作成
// その際、typeDefs(スキーマ)とリゾルバを引数にとる
const server = new ApolloServer({
    typeDefs,
    resolvers
})

// WEBサーバーを起動
server.listen().then(({url}) => console.log(`GraphQL Service running on ${url}`))
