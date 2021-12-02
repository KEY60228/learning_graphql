import React from 'react'
import { Query } from 'react-apollo'
import { ROOT_QUERY } from './App'

const Users = () => {
    return (
        <Query query={ROOT_QUERY}>
            {({ data, loading, refetch }) => 
                loading ? <p>loading users...</p> : <UserList count={data.totalUsers} users={data.allUsers} refetchUsers={refetch} />
            }
        </Query>
    )
}

const UserList = ({ count, users, refetchUsers }) => {
    return (
        <div>
            <p>{count} Users</p>
            <button onClick={() => refetchUsers()}>Refetch Users</button>
            <ul>
                {users.map(user =>
                    <UserListItem
                        key={user.githubLogin}
                        name={user.name}
                        avatar={user.avatar}
                    />
                )}
            </ul>
        </div>
    )
}

const UserListItem = ({ name, avatar }) => {
    return (
        <li>
            <img
                src={avatar}
                width={48}
                height={48}
                alt=""
            />
            {name}
        </li>
    )
}

export default Users
