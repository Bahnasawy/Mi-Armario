import React from 'react';
import ReactDOM from 'react-dom'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import Upload from './components/Upload'
import axios from 'axios'
import Login from './components/Login'
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";


class Root extends React.Component
{
  constructor(props) {
    super (props);
    this.state = {cart: {}, products: []}
    this.updateCart = this.updateCart.bind(this)
    this.clearCart = this.clearCart.bind(this)
  }

  updateCart(cart, products)
  {
    this.setState({cart: cart, products: products})
    ReactDOM.render(
      <Login cart={cart} clearCart={this.clearCart} products={products}/>,
      document.getElementById('login')
    )
  }

  clearCart() 
  {
    this.setState({cart: {}})
    ReactDOM.render(
      <Login cart={{}} clearCart={this.clearCart} products={this.state.products}/>,
      document.getElementById('login')
    )
  }

  async componentDidMount() {
    try
    {
      axios({
        url: 'http://localhost:5000/',
        method: 'GET',
        withCredentials: true
      })
    }
    catch (error) {
    }
    ReactDOM.render(
      <Login cart={this.state.cart} clearCart={this.clearCart} products={this.state.products}/>,
      document.getElementById('login')
    )
  };

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/"><Home {...this.state} updateCart={this.updateCart}/></Route>
          <Route path="/about"><About/></Route>
          <Route path="/contact"><Contact/></Route>
          <Route path="/upload"><Upload/></Route>
        </Switch>
      </Router>
    )
  }
}

ReactDOM.render(
  <Root />,
  document.getElementById('root')
)