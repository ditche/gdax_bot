import axios from 'axios'

export function verify(key, secret, passphrase) {
  return function(dispatch) {
    axios.post("http://localhost:8000/", {
      key: key,
      secret: secret,
      passphrase: passphrase,
    })
    .then((response) => {
      const {key, secret, passphrase, logged_in} = response.data;
      if (logged_in) {
        dispatch({type: "LOGIN_TRUE", payload: {key, secret, passphrase}})
      } else {
        dispatch({type: "LOGIN_FALSE", payload: 'Wrong login'})
      }
    })
    .catch((err) => {
      dispatch({type: "LOGIN_FALSE", payload: err})
    })
  }
}

export function trade(key, secret, passphrase) {
  return function(dispatch) {
    axios.post("http://localhost:8000/trade", {
      key: key,
      secret: secret,
      passphrase: passphrase,
    })
    .then((response) => {
      const {params, result} = response.data;
      if (result==='buy') {
        dispatch({type: "TRADE_RESULT", payload: 'you just bought'})
      } else if (result === 'sell') {
        dispatch({type: "TRADE_RESULT", payload: 'you just sold'})
      } else if (result === 'nothing') {
        dispatch({type: "TRADE_RESULT", payload: 'not suitable for trading right now'})
      }
    })
    .catch((err) => {
      dispatch({type: "TRADE_RESULT", payload: 'something went wrong'})
    })
  }
}
