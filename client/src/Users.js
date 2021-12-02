import React from 'react'
import { Query } from 'react-apollo'
import { ROOT_QUERY } from './App'

const Users = () => {
    return (
        <Query query={ROOT_QUERY}>
            {result => {
                return (
                    <p>Users are loading: {result.loading ? "yes" : "no"}</p>
                )
            }}
        </Query>
    )
}

export default Users
