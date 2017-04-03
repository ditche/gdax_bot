import React from "react";
import { connect } from "react-redux"
import {verify,trade} from "../actions/botAction"

@connect((store) => {
  return {
    state: store.botReducer
  };
})
export default class Layout extends React.Component {

  submitForm(e) {
    e.preventDefault()
    let {key, secret, passphrase}= this.refs
    this.props.dispatch(verify(key.value, secret.value, passphrase.value))
    key.value = ''
    secret.value = ''
    passphrase.value = ''
  }

  componentWillMount() {

    setInterval(() => {
      const {key,secret,passphrase}=this.props.state
      if (key!=='' && secret!=='' && passphrase!=='') {
        this.props.dispatch(trade(key, secret, passphrase))
      }
    }, 10000)
  }

  render() {
    const {key,secret,passphrase,messages}=this.props.state
    console.log('messages', messages)
    const messagesList = messages.map(x => <li>{x}</li>)
    return <div class= "text_box">
      <div class="header">
        <div class="banner">
        <h1 id="title">ETHER TRADING BOT</h1>
        </div>
      </div>
      <form class="content" onSubmit= {this.submitForm.bind(this)}>
        <div>
          <h3>Instructions:</h3>
          <ul>
            <li>1. Generate your API keys from the  <a href='https://www.gdax.com/settings/api'>GDAX API</a></li>
            <li>2. Enter your key, secret, and passphrase below</li>
            <li>This bot will trade 1 ether every 10 seconds if the conditions are optimal. You must have at least 1 ether to trade.</li>
            <li>Note: It takes the rolling average over the last 100 four-hour bars. If it goes over 0.5% above the average, it sells. If it goes over 0.5% below, it buys.</li>
          </ul>
        </div>
        <div className= "form-group">
          <label> Key </label>
          <input ref= 'key' type= 'text' className='form-control' id= "key" required/>
        </div>
        <div className= "form-group">
          <label> Secret </label>
          <input ref= 'secret' type= 'text' className='form-control' id= "secret" required/>
        </div>
        <div className= "form-group">
          <label> Passphrase </label>
          <input ref= 'passphrase' type= 'text' className='form-control' id= "passphrase" required/>
        </div>
        <button className="btn btn-default">Trade</button>
      </form>

      <ul>
        {messagesList}
      </ul>
    </div>
  }
}
