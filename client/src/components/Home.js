import React from 'react'
import fetch from 'node-fetch'
import Product from './Product'

export default class Home extends React.Component
{
  constructor(props)
  {
    super(props)
    this.state = {category: 0}

    this.inactive = { fontFamily: 'Zilla Slab, serif', fontSize: 'large', fontWeight: 400 }
    this.active = { fontFamily: 'Zilla Slab, serif', fontSize: 'large', fontWeight: 600 }
    this.black = "btn btn-light border border-light rounded-1 mr-2 d-flex pl-5 pr-5"
    this.gray = "btn btn-outline-secondary border border-light rounded-1 mr-2 d-flex pl-5 pr-5"

    this.products = {
      0: "tshirts",
      1: "shoes",
      2: "bags",
      3: "pants",
      4: "jackets"
    }

    this.setActive = this.setActive.bind(this)
    this.setStyle = this.setStyle.bind(this)
    this.setClass = this.setClass.bind(this)
    this.categories = this.categories.bind(this)
    this.getProducts = this.getProducts.bind(this)
    this.updateCart = this.props.updateCart
  }

  async setActive(category)
  {
    const request = await fetch('/graphql', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      "query": `{picture(directory:"${this.products[category]}")}`
      })
    })
    const json = await request.json()
    this.setState({category: category, imgs: json.data.picture})
  }

  async getProducts()
  {
    const request = await fetch('/graphql', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
      "query": `{product {
        id
        name
        category_id
        price
        size
        quantity
      }}`
      })
    })
    const json = await request.json()
    this.setState({product: json.data.product})
  }

  setStyle(category)
  {
    return this.state.category === category ? this.active : this.inactive
  }

  setClass(category)
  {
    return this.state.category === category ? this.black : this.gray
  }

  categories()
  {
    const categories = {
      0: "T-Shirts",
      1: "Shoes",
      2: "Bags",
      3: "Pants",
      4: "Jackets"
    }
    return [...Array(5).keys()].map(index => <button type="button" key={index} className={this.setClass(index)} style={this.setStyle(index)} onClick={this.setActive.bind(this, index)}>{categories[index]}</button>)
  }

  async componentDidMount()
  {
    this.getProducts()
    this.setActive("0")
  }

  render()
  {
    return (
      <div className="text-center" style={{fontFamily: 'Playfair Display, serif'}}>
        <h1 style={{fontSize: "60px", fontWeight: "400", letterSpacing: "10px"}}>MI ARMARIO.</h1>
        <h3 className="text-secondary" style={{fontFamily: 'El Messiri, sans-serif', fontSize: "30px", fontWeight: "400"}}>YOUR FAVOURITE CUSTOMIZED CLOSET <br/> WITH UNIQUE EXCEPTIONAL DESIGNS</h3>
        <div className="row d-flex justify-content-center pt-4">
          {this.categories()}
        </div>
        <br />
        <Product imgs={this.state.imgs} category={this.products[this.state.category]} product={this.state.product}
        updateCart={this.updateCart}/>
      </div>
    )}
}
