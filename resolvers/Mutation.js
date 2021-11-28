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
    }
}