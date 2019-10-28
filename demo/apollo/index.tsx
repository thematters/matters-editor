import { useLazyQuery, useQuery, useMutation } from '@apollo/react-hooks'
import { createUploadLink } from 'apollo-upload-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import gql from 'graphql-tag'
import { ApolloProvider } from 'react-apollo'

/**
 * Template for ApolloGQL environment.
 *
 */

const DemoGQLQuery = gql`
  query DemoQuery() {

  }
`

const DemoGQLSearch = gql`
  query DemoSearch() {

  }
`

const DemoGQLUpdate = gql`
  mutation DemoUpdate() {

  }
`

const DemoGQLUpload = gql`
  mutation DemoUplod() {

  }
`

const DemoQuery = () => {
  const { data, loading, error } = useQuery(DemoGQLQuery, { variables: {} })
  if (!data || loading) {
    return null
  }
  return <></>
}

const DemoSearch = (props: any) => {
  const [search, searchResult] = useLazyQuery(DemoGQLSearch)
  const newProps = { ...props, search, searchResult }
  return <></>
}

const DemoMutation = (props: any) => {
  const [update] = useMutation(DemoGQLUpdate)
  const [upload] = useMutation(DemoGQLUpload)
  const newProps = { ...props, update, upload }
  return <></>
}

export const apollo = new ApolloClient({
  cache: new InMemoryCache(),
  link: createUploadLink({
    uri: 'http://localhost:4000/graphql',
    headers: {}
  })
})

export const ApolloDemoApp = ({ children }) => {
  return <ApolloProvider client={apollo}>{children}</ApolloProvider>
}
