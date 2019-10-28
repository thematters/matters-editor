import { useLazyQuery, useQuery, useMutation } from '@apollo/react-hooks'
import { createUploadLink } from 'apollo-upload-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import gql from 'graphql-tag'
import { ApolloProvider } from 'react-apollo'

const inMemoryCache = new InMemoryCache()

export const apollo = new ApolloClient({
  cache: inMemoryCache,
  link: createUploadLink({
    uri: 'localhost:4000',
    headers: {}
  })
})

export const DemoGQLQuery = gql`
  query DemoQuery() {

  }
`

export const DemoQuery = () => {
  const { data, loading, error } = useQuery(DemoGQLQuery, { variables: {} })
  if (!data || loading) {
    return null
  }
  return <DemoSearch data={data} />
}

export const DemoGQLSearch = gql`
  query DemoSearch() {

  }
`

export const DemoSearch = (props: any) => {
  const [search, searchResult] = useLazyQuery(DemoGQLSearch, { variables: {} })
  const newProps = { ...props, search, searchResult }
  return <DemoMutation {...newProps} />
}

export const DemoGQLUpdate = gql`
  mutation DemoMutation() {

  }
`

export const DemoGQLUpload = gql`
  mutation DemoUplod() {

  }
`

export const DemoMutation = (props: any) => {
  const [update] = useMutation(DemoGQLUpdate, { variables: {} })
  const [upload] = useMutation(DemoGQLUpload, { variables: {} })
  const newProps = { ...props, update, upload }
  return <>{() => newProps.children(newProps)}</>
}

export const ApolloDemoApp = ({ children }) => {
  return <ApolloProvider client={apollo}>{children}</ApolloProvider>
}
