import { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Store } from "./store/store"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/Login"
import RegistrationPage from "./pages/Registration"
import ChatsPage from "./pages/Chats"

const store = new Store()

interface LocalStore {
  store: Store,
}

export const Context = createContext<LocalStore>({
  store,
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegistrationPage />,
  },
  {
    path: "/x/",
    element: <ChatsPage />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <Context.Provider value={{ store }}>
    <RouterProvider router={router} />
  </Context.Provider>
);

reportWebVitals();
