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
//import { mountStoreDevtool } from 'simple-zustand-devtools';


// zustand------------------

type Todo = {
  id: number;
  title: string;
  body: string;
}
type page = {
  page: number;
  title: string;
}
interface GlobalAppState {
  currentPage: number;
  pages: page[];
  todoSelected: { id: number, title: string, body: string };
  setTodoSelected: (todo: Todo) => void;
  nextPage: () => void;
  prevPage: () => void;
}

const useBearStore = create<GlobalAppState>(set => ({
  currentPage: 0,
  pages: [{ page: 0, title: "page 0" }, { page: 1, title: "page 1" }],
  todoSelected: { id: 0, title: '', body: '' },
  setTodoSelected: (todo: Todo) => set((state) => ({ todoSelected: todo })),
  nextPage: () => set((state) => ({ currentPage: (state.currentPage < 1) ? state.currentPage + 1 : state.currentPage })),
  prevPage: () => set((state) => ({ currentPage: (state.currentPage > 0) ? state.currentPage - 1 : state.currentPage })),
}))

/*
if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool("BearStore", useBearStore);
}
*/

function TEST_nextPage() {
  const increasePopulation = useBearStore.getState().nextPage;
  increasePopulation();
}
function TEST_prevPage() {
  useBearStore.getState().prevPage();
}

window.TEST_nextPage = TEST_nextPage;
window.TEST_prevPage = TEST_prevPage;


//fim  zustand------------------


//npx json-server  -w data/db.json -p 5110
var todosServerAxios = axios.create({ baseURL: "http://localhost:5110" });

function usePosts() {
  return useQuery(['posts'], () => todosServerAxios.get('/posts/').then((res) => res.data).then(/*teste latency*/wait(1110)),)
}

const getUsers = async (): Promise<ResponseType | undefined> => {
  return await fetch('https://reqres.in/api/users').then(res => res.json())
}

function useUsers() {
  return useQuery(['people'], getUsers)
}

function useChangePost() {

  return useMutation(
    (newPost: Todo) => todosServerAxios
      .patch(`/posts/${newPost.id}`, newPost)
      .then((res) => res.data),
    {
      onMutate: (newPost) => {
        // update the data
        queryClient.setQueryData(['posts', newPost.id], newPost)
      },
      onSuccess: (newPost) => {
        queryClient.setQueryData(['posts', newPost.id], newPost)
        queryClient.invalidateQueries('posts');
      },
    }
  )
}

function TituloButtonModal() {
  let overlayState = useOverlayTriggerState({});
  const currentPage = useBearStore((state) => state.currentPage)
  const nextPage = useBearStore((state) => state.nextPage)
  const prevPage = useBearStore((state) => state.prevPage)
  const pages = useBearStore((state) => state.pages)
  return (
    <>
      <Button onPress={() => { overlayState.open() }}>altera titulo</Button>
      <h1>{pages[currentPage].title}</h1>
      <div style={{ paddingTop: 10 }}>
        <Button onPress={() => prevPage()} >{"<"} </Button>
        <Button onPress={() => nextPage()} > {">"}  </Button>
      </div>
      {overlayState.isOpen &&
        (
          <OverlayContainer>
            <ModalDialog
              title="Enter your name"
              isOpen
              onClose={overlayState.close}
              isDismissable
            >
              <form style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="first-name">Titulo:</label>
                <input id="first-name" defaultValue={pages[currentPage].title}
                  onBlur={(e) => { pages[currentPage].title = e.target.value; }}
                />
                <Button onPress={overlayState.close} style={{ marginTop: '10px' }} >
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
  console.log(props);

  return (
    <button {...buttonProps} ref={ref} style={props.style} >
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
      {/*       
      // Application must be wrapped in an OverlayProvider so that it can be
      // hidden from screen readers when a modal opens. 
      */}
      <OverlayProvider>
        <TituloButtonModal />
        <BodyPost />
      </OverlayProvider>
    </div>
  );

  function BodyPost() {
    const currentPage = useBearStore((state) => state.currentPage)
    return (
      <QueryClientProvider client={queryClient}>
        <p> Conteúdo </p>
        {(currentPage === 0) && <Todos />}
        {(currentPage === 1) && <UsersL />}
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    )
  }
}

const divStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center"
}
const divUserStyle = { margin: "0 1rem 2rem 1rem", textAlign: "center" }

const UsersL: React.FC = () => {
  const { isLoading, isError, data, error, } = useUsers();
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div style={divStyle}>
      {data?.data.map(user => (
        <div key={user.id} style={divUserStyle} >
          <p>
            <strong>{user.first_name}</strong>
          </p>
          <p>{user.email}</p>
          <img key={user.avatar} src={user.avatar} />
        </div>
      ))}
    </div>
  )
}

//const Component1 = ({ prop1, prop2 }): JSX.Element => { }
const Todos: React.FC<{}> = () => {
  let state = useOverlayTriggerState({});
  const todoSelected = useBearStore((state) => state.todoSelected);
  const setTodoSelected = useBearStore((state) => state.setTodoSelected);

  const { isLoading, isError, data, error } = usePosts();
  //const {isLoading:isLoadingUsers} = useUsers();//const [createPost, createPostInfo] = useCreatePost();
  const changePost = useChangePost();


  const postId = "a8nX64wMH";
  const onDelete = async () => {
    console.log('------------------------------/admin');
    // await savePost(postId)
  }

  if (isLoading) {
    return <span>
      <img src={reactLogo} className="logo react" alt="React logo" />
    </span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

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
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridGap: '1rem'
    }}>
      {
        data.map((post: { id: number; title: string; body: string }) => (
          <div style={stylePost} to={`./${post.id}`} key={post.id} >
            <h3>-{post.title}</h3>
            <p>{post.body}</p>
            <Button onPress={
              () => {
                console.log(post.id + "... " + post.title + "... " + post.body);
                const umP = { id: post.id, title: post.title, body: post.body };
                setTodoSelected(umP);
                state.open();
              }
            }>Modifica Post</Button>

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
                  onBlur={(e) => {
                    todoSelected.title = e.target.value;
                  }}
                />
                <label htmlFor="last-name"  >Body:</label>
                <textarea id="last-name" defaultValue={todoSelected.body}
                  onBlur={(e) => {
                    todoSelected.body = e.target.value;
                  }}
                />
                <Button
                  style={{ marginTop: 10 }}
                  onPress={
                    () => {
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


function wait(ms: number) {
  return function (v) {
    return new Promise(resolve => setTimeout(() => resolve(v), ms));
  };
}

export default App
