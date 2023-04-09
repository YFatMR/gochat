import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Store from "./store/store"

const store = new Store()

interface LocalStore {
  store: Store,
}

export const Context = createContext<LocalStore>({
  store,

})


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Context.Provider value={{ store }}>
    <App />
  </Context.Provider>
  // <React.StrictMode>

  // </React.StrictMode>
);

reportWebVitals();
