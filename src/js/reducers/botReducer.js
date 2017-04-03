export default function reducer(state= {
  messages: [],
  key:'',
  secret:'',
  passphrase:''
},action) {
  if (action.type==="LOGIN_TRUE") {
    const {key, secret, passphrase} = action.payload
    return {...state, key, secret, passphrase}
  }
  else if (action.type==="LOGIN_FALSE") {
    return {...state, key:'', secret:'', passphrase:'', messages: [...state.messages, action.payload]}
  }
  else if (action.type==="TRADE_RESULT") {
    return {...state, messages: [...state.messages, action.payload]}
  }

  return state
}
