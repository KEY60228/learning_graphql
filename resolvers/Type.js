const { GraphQLScalarType } = require("graphql")

module.exports = {
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