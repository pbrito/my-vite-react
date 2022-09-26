import { stylePost } from './styles'
import create from 'zustand'
import reactLogo from './assets/react.svg'
import './App.css'
import {
  AriaButtonProps, useButton,
  OverlayContainer,
  OverlayProvider
} from 'react-aria';
import { useOverlayTriggerState } from 'react-stately';
import { ModalDialog } from './components/ModalDialog'

/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useState } from 'react'
import axios from "axios";
import {
  QueryCache, useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
/*

const queryCache = new QueryCache({
  onError: error => {
    console.log(error)
  },
  onSuccess: data => {
    console.log(data)
  }
})
function usePost(postId: number) {
  return useQuery(['posts', postId],
    () => todosServerAxios.get('/posts/' + postId).then((res) => res.data),
    {
      initialData: () => console.log(queryCache.get('posts'))
    }
  )


}

function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation(
    (values) => axios.post('/posts/', values).then((res) => res.data),
    {
      onMutate: (newPost) => {
        const oldPosts = queryCache.findAll('posts')

        if (queryCache.findAll('posts')) {
          queryCache.findAll('posts', (old) => [...old, newPost])
        }

        return () => queryClient.setQueryData('posts', oldPosts)
      },
      onError: (error, _newPost, rollback) => {
        console.error(error);
        if (rollback) rollback()
      },
      onSettled: () => {
        queryClient.invalidateQueries('posts');
      }
    }
  )
}
*/
// zustand------------------

const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))


function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  return <h1>{bears} bears around here ...</h1>
}

function Controls() {
  const increasePopulation = useBearStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}
//fim  zustand------------------


//npx json-server  -w data/db.json -p 5110
var todosServerAxios = axios.create({ baseURL: "http://localhost:5110" });


function usePosts() {
  return useQuery(['posts'],  () => todosServerAxios.get('/posts/').then((res) => res.data).then(/*teste latency*/wait(0)), )
}



function useDeletePost() {


  return useMutation(
    (newPost) => todosServerAxios
      .patch(`/posts/${newPost.id}`, newPost)
      .then((res) => res.data),
    {
      onMutate: (newPost) => {
        // update the data
        queryClient.setQueryData(['posts', newPost.id], newPost)
      },
      onSuccess: (newPost) => {
        queryClient.setQueryData(['posts', newPost.id], newPost)
        console.log("pppppp");
        queryClient.invalidateQueries('posts');

        /*
        if (queryClient.getQueryData('posts')) {
          console.log("33333");
          
          queryClient.setQueryData('posts', old => {
            return old.map(d => {
              if (d.id === newPost.id) {
                return newPost
              }
              return d
            })
          })
        } else {
          console.log("KKKKKKKK");
          
          queryClient.setQueryData('posts', [newPost])
          queryClient.invalidateQueries('posts')
        }*/
      },
    }
  )
  /*
  const [state, setState] = React.useReducer((_, action) => action, {
    isIdle: true,
  })
console.log("::::::::::::::::");

  const mutate = React.useCallback(async (postId) => {
    console.log("ÇÇÇÇÇÇÇÇÇÇÇ");
    
    setState({ isLoading: true })
    try {
      await todosServerAxios.delete(`/posts/${postId}`).then((res) => res.data)
      setState({ isSuccess: true })
    } catch (error) {
      setState({ isError: true, error })
    }
  }, [])

  return [mutate, state]
*/
}

function ExampleTituloModal() {
  let state = useOverlayTriggerState({});

  return (
    <>
      <Button onPress={state.open}>Open Dialog</Button>
      {state.isOpen &&
        (
          <OverlayContainer>
            <ModalDialog
              title="Enter your name"
              isOpen
              onClose={state.close}
              isDismissable
            >
              <form style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="first-name">First Name:</label>
                <input id="first-name" />
                <label htmlFor="last-name">Last Name:</label>
                <input id="last-name" />
                <Button
                  onPress={state.close}
                  style={{ marginTop: 10 }}
                >
                  Submit
                </Button>
              </form>
            </ModalDialog>
          </OverlayContainer>
        )}
    </>
  );
}

function Button(props: AriaButtonProps<React.ElementType<any>>) {
  let ref = React.useRef();
  let { buttonProps } = useButton(props, ref);

  return (
    <button {...buttonProps} ref={ref}>
      {props.children}
    </button>
  );
}


///fim aria -----------------------------------------------------------------------------------------------------



// Create a client
const queryClient = new QueryClient(
  //
  //     {
  //       defaultOptions: { queries: { retry: 2 } },
  //     }
  //
)
function App() {
  return (
    <div className="App">
      <OverlayProvider>
        <ExampleTituloModal />
        <BodyPost />
      </OverlayProvider>
      
    </div>
  );

  function BodyPost() {
    return (
      <QueryClientProvider client={queryClient}>
        <p>
          As
        </p>
        <Todos />
        <BearCounter></BearCounter>
        <Controls></Controls>
        <div>Bears</div>
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    )
  }
}


//const Component1 = ({ prop1, prop2 }): JSX.Element => { }
const Todos: React.FC<{}> = () => {
  let state = useOverlayTriggerState({});

  const { isLoading, isError, data, error } = usePosts();
  //const [createPost, createPostInfo] = useCreatePost();
  const deletePost = useDeletePost();


  const postId = "a8nX64wMH";
  const onDelete = async () => {
    console.log('------------------------------/admin');
    // await savePost(postId)
  }

  /*
  const { data: dd } = usePost(5);
  console.log(dd);
  */
  if (isLoading) {
    return <span>
      <img src={reactLogo} className="logo react" alt="React logo" />
    </span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }
  // useQuery('todos',  () =>
  //   fetch('https://reqres.in/api/posts').then(res =>
  //   wait(2000,res.json())
  //   )
  // )
  //const { data: dd } = usePost(5);
  console.log(data);

  if (isLoading) {
    return <span>
      <img src={reactLogo} className="logo react" alt="React logo" />
    </span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  // We can assume by this point that `isSuccess === true`
  return (
    <div  style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridGap: '1rem'
    }}>
    {
    data.map((post: { id: React.Key | null | undefined; userId : number ; title: string | null | undefined; body: string | null | undefined; }) => (
      <div style={stylePost} to={`./${post.id}`} key={post.id} >
        <h3>-{post.title}</h3>
        <p>{post.body}</p>
        <Button onPress={
          ()=>{
            console.log(post.id+ "... "+post.title+"... "+post.body);
            state.open();
          }
          }>Open Dialog</Button>
      
      </div>
    ))
    }
    {state.isOpen &&
        (
          <OverlayContainer>
            <ModalDialog
              title="Change your post:"
              isOpen
              onClose={state.close}
              isDismissable
            >
              <form style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="first-name">Titulo:</label>
                <input id="first-name" />
                <label htmlFor="last-name">Body:</label>
                <input id="last-name" />
                <Button
                  onPress={
                    state.close
                  
                  }
              
                  style={{ marginTop: 10 }}
                >
                  Submit
                </Button>
              </form>
            </ModalDialog>
          </OverlayContainer>
        )}
    </div>
  )


}



/*
function Posts() {
  const postsQuery = usePosts()
  const [createPost, createPostInfo] = useCreatePost()

  return (
    <section>
      <div>
        <div>
          {postsQuery.isLoading ? (
            <span>

            </span>
          ) : (
            <>
              <h3>Posts</h3>
              {
              // <ul>

              //   {postsQuery.data.map((post) => (
              //     <li key={post.id}>
              //       <Link to={`./${post.id}`}>{post.title}</Link>
              //     </li>
              //   ))}

                
              // </ul>
                }
              <br />
            </>
          )}
        </div>
      </div>
      <hr />
      <div>
        <h3>Create New Post</h3>
        <div>
          {
          
          // <PostForm
          //   onSubmit={createPost}
          //   clearOnSubmit
          //   submitText={
          //     createPostInfo.isLoading
          //       ? 'Saving...'
          //       : createPostInfo.isError
          //       ? 'Error!'
          //       : createPostInfo.isSuccess
          //       ? 'Saved!'
          //       : 'Create Post'
          //   }
          // />
          
          }
        </div>
      </div>
    </section>
  )
}
*/

function wait(ms) {
  return function(v) {
    return new Promise(resolve => setTimeout(() => resolve(v), ms));
  };
}

function wait2(ms: number | undefined, value: any): Promise<unknown> {
  return new Promise(resolve => setTimeout(resolve, ms, value));
}

export default App
