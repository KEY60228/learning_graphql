const fetch = require('node-fetch')

const authorizeWithGitHub = async credentials => {
    const { access_token } = await requestGitHubToken(credentials)
    const githubUser = await requestGitHubUserAccount(access_token)
    return { ...githubUser, access_token }
}

const requestGitHubToken = credentials => {
    return fetch(
        'https://github.com/login/oauth/access_token',
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: 'application/json'
            },
            body: JSON.stringify(credentials)
        }
    ).then(res => res.json())
    .catch(error => {
        throw new Error(JSON.stringify(error))
    })
}

const requestGitHubUserAccount = token => {
    return fetch(
        `https://api.github.com/user`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `token ${token}`
            }
        }
    ) .then(res => res.json())
    .catch(error => {
        throw new Error(JSON.stringify(error))
    })
}

module.exports = {authorizeWithGitHub}
