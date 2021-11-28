module.exports = {
    // 写真の数を返す
    totalPhotos: (parent, args, { db }) => {
        return db.collection('photos').estimateDocumentCount()
    },

    // 全ての写真を返す
    allPhotos: (parent, args, { db }) => {
        return db.collection('photos').find().toArray()
    },

    // ユーザー数を返す
    totalUsers: (parent, args, { db }) => {
        return db.collection('users').estimateDocumentCount()
    },

    // 全てのユーザーを返す
    allUsers: (parent, args, { db }) => {
        return db.collection('users').find().toArray()
    },

    // ログインしているユーザーの情報を返す
    me: (parent, args, { currentUser }) => currentUser
}