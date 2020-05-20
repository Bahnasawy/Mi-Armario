import React from 'react'
import axios from 'axios'

export default class Upload extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state = { name: "" }
        this.name = React.createRef()        
        this.price = React.createRef()
        this.quantity = React.createRef()
        this.size = React.createRef()
        this.image = React.createRef()
        this.category = React.createRef()
        
        this.handleSubmit = this.handleSubmit.bind(this)
    }
    

    async handleSubmit(event)
    {
        event.preventDefault();
        const formData = new FormData();
        formData.append('name', this.name.current.value)
        formData.append('price', this.price.current.value)
        formData.append('quantity', this.quantity.current.value)
        formData.append('size', this.size.current.value)
        formData.append('category', this.category.current.value)
        formData.append('myImage', this.image.current.files[0])
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        };
        axios.post("/upload",formData,config)
            .then((response) => {
                alert("The file is successfully uploaded");
            }).catch((error) => {
        });
    }

    render()
    {
        return(
            <form onSubmit={this.handleSubmit}>
                <label>
                    Name:
                    <input type="text" ref={this.name}></input>
                </label>
                <br />
                <label>
                    Size:
                    <input type="text" ref={this.size}></input>
                </label>
                <br />
                <label>
                    Price:
                    <input type="text" ref={this.price}></input>
                </label>
                <br />
                <label>
                    Quantity:
                    <input type="text" ref={this.quantity}></input>
                </label>
                <br />
                <label>
                    Image:
                    <input type="file" ref={this.image} accept="image/*"></input>
                </label>
                <br />
                <label>
                    Category:
                    <select ref={this.category}>
                        <option value="0">tshirt</option>
                        <option value="1">shoes</option>
                        <option value="2">bags</option>
                        <option value="3">pants</option>
                        <option value="4">jacket</option>
                    </select>
                </label>
                <br />
                <input type="submit" value="Submit"></input>
            </form>
        )
    }
}