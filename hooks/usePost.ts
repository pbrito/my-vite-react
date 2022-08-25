import React from 'react'
import axios from 'axios'
import { useQuery , QueryClient } from 'react-query'

const queryClient = new QueryClient()

export const fetchPost = (postId) =>
  axios.get(`/api/posts/${postId}`).then((res) => res.data)

export default function usePost(postId) {
  return useQuery(
    ['posts', postId],
    () => fetchPost(postId), {
      initialData: () => { 
        return queryClient.getQueriesData('posts')?.find(d => d.id == postId)
      },
    staleTime:1000
    }
  )
}