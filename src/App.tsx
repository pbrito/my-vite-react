import { stylePost } from './styles'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
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

// zustand------------------

type Todo = {
  id: number;
  title: string;
  body: string;
}
interface BearState {
  bears: number
  todoSelected: {id: number, title: string, body: string}
  increasePopulation: () => void
  setTodoSelected: (todo : Todo) => void
}

const useBearStore = create<BearState>(set => ({
  bears: 0,
  todoSelected: {id: 0, title: '', body: ''},
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  setTodoSelected: (todo:Todo) => set((state) => ({ todoSelected: todo })),
}))


function BearCounter() {
  const bears = useBearStore((state) => state.bears)
  //console.log(bears);
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
  return useQuery(['posts'],  () => todosServerAxios.get('/posts/').then((res) => res.data).then(/*teste latency*/wait(1110)), )
}



function useChangePost() {

  return useMutation(
    (newPost:Todo) => todosServerAxios
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
      },
    }
  )
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
  //     {
  //       defaultOptions: { queries: { retry: 2 } },
  //     }
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
        <p> As </p>
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
  const todoSelected = useBearStore((state) => state.todoSelected);
  const setTodoSelected = useBearStore((state) => state.setTodoSelected); 


  const { isLoading, isError, data, error } = usePosts();
  //const [createPost, createPostInfo] = useCreatePost();
  const changePost = useChangePost();


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
    data.map((post: { id:  number ; title: string; body: string }) => (
      <div style={stylePost} to={`./${post.id}`} key={post.id} >
        <h3>-{post.title}</h3>
        <p>{post.body}</p>
        <Button onPress={
          ()=>{
            console.log(post.id+ "... "+post.title+"... "+post.body);
            const umP= {id:post.id,title:post.title, body:post.body};
            setTodoSelected(umP);
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
                <input id="first-name" defaultValue={todoSelected.title}
                onBlur={(e)=>{
                  todoSelected.title=e.target.value;
                }}
                />
                <label htmlFor="last-name"  >Body:</label>
                <textarea id="last-name" defaultValue={todoSelected.body}
                 onBlur={(e)=>{
                  todoSelected.body=e.target.value;
                }}
                />
                <Button
                style={{ marginTop: 100 }} 
                  onPress={
                    ()=>{
                     // console.log(todoSelected);
                      changePost.mutate(todoSelected);  
                      state.close();
                    }
                  }              
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


function wait(ms) {
  return function(v) {
    return new Promise(resolve => setTimeout(() => resolve(v), ms));
  };
}

function wait2(ms: number | undefined, value: any): Promise<unknown> {
  return new Promise(resolve => setTimeout(resolve, ms, value));
}

export default App
