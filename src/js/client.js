import React from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { Router, Route, IndexRoute, hashHistory } from "react-router";
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import Layout from "./pages/Layout";

import store from "./store"

const app = document.getElementById('app')

ReactDOM.render(<Provider store={store}>
  <Layout />
</Provider>, app);
