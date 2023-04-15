import React, { useContext, useState } from 'react';
import logo from './logo.svg';
import './App.css';

// import RegistrationForm from './components/RegistrationForm';

import MainPage from './components/Main';
// import LoginForm from './components/LoginForm';
// import { ScreenState } from './store/store';
import { Context } from "./index"

function App(/*{ status }: { status: ScreenState }*/) {
  // const { store } = useContext(Context)



  // changeState(ScreenState.Autorization)


  return (
    <div className="App">
      <MainPage />
    </div>
  );
}

export default App;
