import React from 'react'
import { Query } from 'react-apollo'
import { ROOT_QUERY } from './App'

const Photos = () => {
    return (
        <Query query={ROOT_QUERY}>
            {({loading, data}) => loading ?
                <p>loading...</p> :
                data.allPhotos.map(photo => {
                    return (
                        <img
                            key={photo.id}
                            src={photo.url}
                            alt={photo.name}
                            width={350}
                        />
                    )
                })
            }
        </Query>
    )
}

export default Photos
