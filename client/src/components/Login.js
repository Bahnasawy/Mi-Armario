import React from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'
import sha256 from 'js-sha256'
import crypto from 'crypto'

export default class Login extends React.Component 
{
    constructor(props) {
        super(props)
        this.state = {user_id: "", username: "", error:true, products: []}
        this.username = React.createRef()
        this.password = React.createRef()

        this.login = this.login.bind(this)
        this.getProucts = this.getProucts.bind(this)
        this.getCart = this.getCart.bind(this)
        this.logout = this.logout.bind(this)
        this.makeOrder = this.makeOrder.bind(this)
        this.clearCart = this.props.clearCart
    }

    async login() {
        if (this.username.current.value && this.password.current.value)
        {
            const password = sha256(this.password.current.value)
            const username = this.username.current.value
            const query = `{customer(input:{username: "${username}", password: "${password}", id:""}){id username}}`
            const options = {
                url: "http://localhost:8081/graphql",
                method: "POST",
                headers: {'Accept': 'application/json',
                'Content-Type': 'application/json'},
                data: {
                    "query": query
                }
            }
            const response = await axios(options)
            if (response.data.data.customer.length !== 0)
            {
                const cookie = JSON.parse(Cookies.get('mi-armario'))
                cookie.user_id = response.data.data.customer[0].id
                cookie.username = response.data.data.customer[0].username
                Cookies.set('mi-armario', cookie)
                this.setState({
                    user_id: response.data.data.customer[0].id, 
                    username: response.data.data.customer[0].username})
            }
            else{
                this.setState({ error: false })
            }
        }
        else {
            this.setState(
                {error:false}
            )
        }
    }

    async getProucts(){
        const query = `{product{id name}}`
        const options = {
            url: "http://localhost:8081/graphql",
            method: "POST",
            headers: {'Accept': 'application/json',
            'Content-Type': 'application/json'},
            data: {
                "query": query
            }
        }
        const response = await axios(options)
        this.setState({products: response.data.data.product})
    }

    logout()
    {
        const cookie = JSON.parse(Cookies.get('mi-armario'))
        cookie.cart = {}
        cookie.username = ""
        cookie.user_id = ""
        Cookies.set('mi-armario', cookie)
        this.clearCart()
        this.setState({
            user_id: "",
            username: "",
            cart: {}
        })
    }

    getCart()
    {
        const items = []
        if (Object.keys(this.props.cart).length > 0)
        {
            try{
                Object.keys(this.props.cart).map(key => {
                    return this.state.products.forEach(product => {
                        if (key === product.id)
                        {
                            items.push(
                                <div className="dropdown-item" key={key} onClick={this.getProucts}>
                                    {product.name}: {this.props.cart[key]}
                                </div>
                            )
                        }
                    })
                })
                return (<div>
                            <label className="font-weight-bold">Your Cart</label>
                            {items}
                            <button className="btn btn-outline-dark" onClick={this.makeOrder}>Order</button>
                        </div>)
            }
            catch (error) {return null}
        }
        else
        {
            return (<div>
                <label className="font-weight-bold">Your Cart is Empty</label>
            </div>)
        }
    }

    async makeOrder()
    {
        let id = crypto.randomBytes(5).toString('hex')
        let query;
        let variables;
        let sale;
        let sale_item = [];
        let set = [];
        let where = [];
        let sale_item_id = []
        let product_sets = []
        let product_wheres = []
        let sale_items = []
        let product_set_vars = []
        let product_where_vars = []
        let sale_item_vars = []
        let updates = []
        let inserts = []

        let cookie = JSON.parse(Cookies.get('mi-armario'))

        for(let i = 0; i < this.props.products.length;i++)
        {
            Object.keys(this.props.cart).forEach(key => {
                if (this.props.products[i].id === key)
                {
                    set.push(`"quantity": ${this.props.products[i].quantity}`)
                    where.push(`"id": "${key}"`)
                    sale_item_id.push(`"product_id": "${key}"`)
                    sale_item.push(`"quantity": ${this.props.cart[key]}`)
                }
                
            })
        }

        sale = `
            "sale":{
                "sale": {
                    "id": "${id}",
                    "status": "pending",
                    "customer_id": "${cookie.user_id}"
                  }
            }`
            

        for (let i = 0; i < set.length; i++)
        {
            product_sets.push(`"product_set${i}": {
                "product": {
                    ${set[i]}
                }
            }`)
            product_wheres.push(`"product_where${i}": {
                "product": {
                    ${where[i]}
                }
            }`)

            sale_items.push(`"sale_item${i}": {
                "sale_item": {
                    ${sale_item[i]},
                    ${sale_item_id[i]},
                    "sale_id":"${id}"
                }
            }`)

            product_set_vars.push(`$product_set${i}: Tables!`)
            product_where_vars.push(`$product_where${i}: Tables!`)
            sale_item_vars.push(`$sale_item${i}: Tables!`)
        }

        variables = `{
            ${product_sets.join(",\n")},
            ${product_wheres.join(",\n")},
            ${sale},
            ${sale_items.join(",\n")}
        }`

        for(let i = 0; i < product_sets.length; i++){
            updates.push(`product${i}: update(set:$product_set${i} where:$product_where${i})`)
            inserts.push(`sale_item${i}: insert(input:$sale_item${i})`)
        }

        query = `mutation(
            ${product_set_vars.join(",\n")},
            ${product_where_vars.join(",\n")},
            ${sale_item_vars.join(",\n")}
            $sale: Tables!){
            sale: insert(input:$sale)
            ${updates.join(",\n")}
            ${inserts.join(",\n")}
          }`
        
        const options = {
            url: "http://localhost:8081/graphql",
            method: "POST",
            headers: {'content-type': 'application/json'},
            data: {
                "query": query,
                "variables": variables
            }
        }

        // console.log(options)
        const response = await axios(options)
        console.log(response)

        cookie.cart = {}
        Cookies.set('mi-armario', cookie)
        this.clearCart()
        this.setState({
            cart: {}
        })
    }

    componentDidMount() {
        try{
            const cookie = JSON.parse(Cookies.get('mi-armario'))
            if (cookie.username !== "")
            {
                this.setState({username: cookie.username})
            }
        }
        catch (e) {}
        this.getProucts()
    }

    render() {
        if (this.state.username === "")
        {
            return (
                <div className="d-flex btn-group dropdown container-fluid">
                    <button 
                    className="btn btn-light border border-light rounded-1 mr-2 dropdown-toggle"
                    type="button"
                    style={{fontFamily: 'DM Mono, monospace', fontSize: 'small', fontWeight: 500}}
                    data-toggle="dropdown">
                        Login
                    </button>
                    <div className="dropdown-menu dropdown-menu-right p-2" aria-labelledby="dropdownMenuButton" style={{width:"300px"}}>
                        <div className="form-group">
                            <label className="font-weight-bold">Username</label>
                            <input className="form-control" type="text" ref={this.username} autoComplete="off"/><small className="form-text text-muted">We'll never share your email with anyone else.</small>
                        </div>
                        <div className="form-group">
                            <label className="font-weight-bold">Password</label>
                            <input className="form-control" type="password" ref={this.password}/>
                        </div>
                        <button className="btn btn-outline-dark float-right" onClick={this.login}>Login</button>
                        <small className="text-danger" hidden={this.state.error}>*Wrong Username or Password</small>
                    </div>
                </div>
            )
        }
        else
        {
            return (
                <div className="d-flex btn-group dropdown container-fluid">
                    <button 
                    className="btn btn-light border border-light rounded-1 mr-2 dropdown-toggle"
                    type="button"
                    style={{fontFamily: 'DM Mono, monospace', fontSize: 'small', fontWeight: 500}}
                    data-toggle="dropdown">
                        {this.state.username}
                    </button>
                    <div className="dropdown-menu dropdown-menu-right p-2" aria-labelledby="dropdownMenuButton" style={{width:"300px"}}>
                        <div>
                            {this.getCart()}
                        </div>
                        <div role="separator" className="dropdown-divider"></div>
                        <button className="btn btn-outline-dark float-right" onClick={this.logout}>Logout</button>
                    </div>
                </div>
            )
        }
    }
} 