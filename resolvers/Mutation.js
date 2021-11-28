const fetch = require('node-fetch')
const { authorizeWithGitHub } = require('../lib')

module.exports = {
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
    },

    async githubAuth(parent, { code }, { db }) {
        // GitHubからデータを取得する
        let {
            message,
            access_token,
            avatar_url,
            login,
            name
        } = await authorizeWithGitHub({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRETS,
            code
        })

        // メッセージがある場合は何らかのエラーが発生しているものと判断
        if (message) {
            throw new Error(message)
        }

        // データを一つのオブジェクトにまとめる
        let latestUserInfo = {
            name,
            githubLogin: login,
            githubToken: access_token,
            avatar: avatar_url
        }

        // 新しい情報をもとにレコードを追加したり更新する
        const { ops:[user] } = await db.collection('users').replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

        // ユーザーデータとトークンを返す
        return { user, token: access_token }
    }
}