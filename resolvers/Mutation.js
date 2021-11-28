const fetch = require('node-fetch')
const { authorizeWithGitHub } = require('../lib')
require('dotenv').config()

module.exports = {
    async postPhoto(parent, args, { db, currentUser }) {
        // コンテキストにユーザーがいなければエラーを投げる
        if (!currentUser) {
            throw new Error('only an authorized user can post a photo')
        }

        // 現在のユーザーのIDとphotoを保存する
        const newPhoto = {
            ...args.input,
            userID: currentUser.githubLogin,
            created: new Date()
        }

        // 新しいphotoを追加して、データベースが生成したIDを取得する
        const { insertedIds } = await db.collection('photos').insert(newPhoto)
        newPhoto.id = insertedIds[0]

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
        await db.collection('users').replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

        // ユーザーデータとトークンを返す
        return { user: latestUserInfo, token: access_token }
    }
}