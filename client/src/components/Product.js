import React from 'react'
import Modal from 'react-bootstrap/Modal'
import Cookie from 'js-cookie'
import axios from 'axios'

export default class Product extends React.Component
{
  constructor(props)
  {
    super(props)
    this.state = {show: false, product: "0"}
    this.imgs = this.imgs.bind(this)
    this.showModal = this.showModal.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.query = this.query.bind(this)
    this.updateCart = this.props.updateCart

    this.quantity = React.createRef()
  }

  imgs()
  {
    if (this.props.imgs !== undefined && this.props.imgs !== null)
    {
      let imgs = [...Array(this.props.imgs.length).keys()]
      .map(index => <img
        className="p-2 rounded img-thumbnail" 
        key={index} 
        style={{width: "200px", height: "200px"}} 
        src={`./images/${this.props.category}/${this.props.imgs[index]}`} 
        alt={index}></img>
      )
      let list = []
      let temp = []
      for(let i = 0; i < imgs.length; i++)
      {
        temp.push(<td onClick={this.showModal.bind(this,this.props.imgs[i])} key={i}>{imgs[i]}</td>)
        if ((i % 4 === 0 && i !== 0) || (imgs.length < 5 && i === imgs.length - 1) || (i === imgs.length - 1))
        {
          list.push(<tr key={i} className="d-flex justify-content-center">{temp}</tr>)
          temp = []
        }
      }
      return(
        <table style={{marginLeft: "auto", marginRight: "auto"}} className="table-borderless">
          <tbody>
            {list}
          </tbody>
        </table>
      )
    }
  }

  showModal(i)
  {
    this.setState({show: true, product: i})
  }

  hideModal()
  {
    this.setState({show: false})
  }

  query(type, query, variables)
  {
    let options
    if (type === 0)
    {
      options = {
        url: '/graphql',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          "query": query,
          "variables": variables
        }
      }
    }
    else {
      options = {
        url: '/graphql',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          "query": query,
        }
      }
    }
    axios(options)
  }

  addToCart(id, quantity)
  {
    try{
      let cookie = JSON.parse(Cookie.get('mi-armario'))
      if (cookie.username !== "")
      {
        cookie.cart[id] = isNaN(cookie.cart[id]) ? parseInt(quantity.current.value, 10) : cookie.cart[id] + parseInt(quantity.current.value, 10)
        Cookie.set('mi-armario', JSON.stringify(cookie))
        let products = this.props.product
        for(let i = 0; i < products.length; i++)
        {
          if (products[i].id === id)
          {
            products[i].quantity = products[i].quantity - parseInt(quantity.current.value, 10)
          }
        }
        this.updateCart(cookie.cart, products)
      }
    }catch (e) {}
    this.setState({show: false})
  }

  render()
  {
    let cookie
    try{ cookie = JSON.parse(Cookie.get('mi-armario')) } catch (e) {}
    let name
    let price
    let size
    let id
    let quantity
    if (this.props.product !== undefined && 'length' in this.props.product)
    {
      this.props.product.forEach(product => {
        if (product.id === this.state.product.replace(".png", ""))
        {
          name = 'name' in product ? product.name : "" 
          price = 'price' in product ? product.price : ""
          size = 'size' in product ? product.size : ""
          id = 'id' in product ? product.id : ""
          quantity = 'quantity' in product ? product.quantity : ""
        }
      })
      try{
        quantity = cookie.cart[id] === undefined ? quantity : quantity - cookie.cart[id]
      }
      catch (e) {}

      return (
        <div>
          {this.imgs()}
          <Modal show={this.state.show} onHide={this.hideModal} dialogClassName="modal-dialog modal-dialog-centered modal-lg">
            <Modal.Header style={{fontSize: "40px"}}>{name}</Modal.Header>
            <Modal.Body>
              <div className="container">
                <div className="row">
                  <div className="col">
                    <img 
                      src={`./images/${this.props.category}/${this.state.product}`}
                      style={{width: "500px", height: "500px"}}
                      alt="">
                    </img>
                  </div>
                  <div className="col pt-5">
                    <div style={ { fontSize: "25px" }} className="font-weight-bold text-primary">
                      {price} <small style={{fontSize: "20px"}} className="font-weight-bold">EGP</small>
                    </div><br/>
                    <label className="font-weight-bold" style={ { fontSize: "25px" }}>
                      Size: <br />
                      <button style={{fontSize: "20px"}} className="btn btn-outline-dark font-weight-bold text-capitalize">{size}</button>
                    </label><br/>
                    <label className="font-weight-bold" style={ { fontSize: "25px" }}>
                      Quantity:
                      <div className="input-group input-group-sm mb-3">
                        <input type="number" min="0" max={quantity} defaultValue="0" ref={this.quantity} className="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm"></input>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button 
              className="btn btn-outline-primary"
              onClick={this.addToCart.bind(this, id, this.quantity)}>Add to Cart</button>
            </Modal.Footer>
          </Modal>
        </div>
        )
    }
    return null
  }
}