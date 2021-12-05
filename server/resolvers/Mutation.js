const fetch = require('node-fetch')
const { authorizeWithGitHub } = require('../lib')
const { uploadStream } = require('../lib')
const path = require('path')
require('dotenv').config()

module.exports = {
    async postPhoto(root, args, { db, currentUser, pubsub }) {
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

        var toPath = path.join(
            __dirname, '..', 'assets', 'photos', `${photo.id}.jpg`
        )

        const stream = await args.input.file
        await uploadFile(input.file, toPath)

        pubsub.publish('photo-added', {newPhoto: photo})

        return photo
    },

    async githubAuth(parent, { code }, { db, pubsub }) {
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
        const {ops:[user], result} = await db.collection('users').replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })

        result.upserted && pubsub.publish('user-added', {newUser: user})

        // ユーザーデータとトークンを返す
        return { user: latestUserInfo, token: access_token }
    },

    async addFakeUsers(root, { count }, { db, pubsub }) {
        var randomUserApi = `https://randomuser.me/api/?results=${count}`

        var { results } = await fetch(randomUserApi).then(res => res.json())
        var users = results.map(r => ({
            githubLogin: r.login.username,
            name: `${r.name.first} ${r.name.last}`,
            avatar: r.picture.thumbnail,
            githubToken: r.login.sha1
        }))
        await db.collection('users').insert(users)

        var newUsers = await db.collection('users').find().sort({_id: -1}).limit(count).toArray()
        newUsers.forEach(newUser => pubsub.publish('user-added', {newUser}))

        return users
    },

    async fakeUserAuth(parent, { githubLogin }, { db }) {
        var user = await db.collection('users').findOne({ githubLogin })

        if (!user) {
            throw new Error(`Cannot find user with githubLogin ${githubLogin}`)
        }

        return {
            token: user.githubToken,
            user
        }
    }
}