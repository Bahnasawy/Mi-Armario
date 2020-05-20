class Customer
{
    constructor(params)
    {
      this.id = params.id;
      this.first_name = params.first_name;
      this.last_name = params.last_name;
      this.address = params.address;
      this.email = params.email;
      this.username = params.username;
      this.password = params.password;
      this.city = params.city;
    }
}

class Product
{
  constructor(params)
  {
    this.id = params.id;
    this.name = params.name;
    this.price = params.price;
    this.category_id = params.category_id;
    this.size = params.size;
    this.quantity = params.quantity;
  }
}

class Sale
{
  constructor(params)
  {
    this.id = params.id;
    this.status = params.status;
    this.order_date = params.order_date;
    this.shipping_date = params.shipping_date;
    this.customer_id = params.customer_id;
  }
}

class Sale_Item
{
  constructor(params)
  {
    this.quantity = params.quantity;
    this.product_id = params.product_id;
    this.customer_id = params.customer_id;
  }
}

class Category
{
  constructor(params)
  {
    this.id = params.id;
    this.name = params.name;
  }
}

const tables = {
  customer: Customer,
  product: Product,
  sale: Sale,
  sale_item: Sale_Item,
  category: Category
}

const vars = {

    customer: `id: String
    first_name: String
    last_name: String
    address: String
    email: String
    username: String
    password: String
    city: String`,

    product: `id: String
    name: String
    price: Int
    category_id: String
    size: String
    quantity: Int`,

    category: `id: String
    name: String`,

    sale: `id: String
    status: String
    customer_id: String`,

    sale_item: `quantity: Int
    product_id: String
    sale_id: String`
}

const buildSchema = `

# Mutation -----------------------------------------

input Customer{
  ${vars.customer}
}

input Product{
  ${vars.product}
}

input Category{
  ${vars.category}
}

input Sale{
  ${vars.sale}
}

input Sale_Item{
  ${vars.sale_item}
}

input Tables {
    customer: Customer
    product: Product
    category: Category
    sale: Sale
    sale_item: Sale_Item
}

type Mutation {
    insert(input: Tables!): String
    update(set: Tables!, where: Tables!): String
    del(del: Tables!): String
}


# Query -----------------------------------------

type customer {
    ${vars.customer}
}

type product {
    ${vars.product}
}

type category {
    ${vars.category}
}

type sale{
  ${vars.sale}
}

type sale_item{
  ${vars.sale_item}
}

type Query {
    customer(input: Customer, table: String = "customer"): [customer]
    product(input: Product, table: String = "product"): [product]
    category(input: Category, table: String = "category"): [category]
    sale(input: Sale, table: String = "sale"): [sale]
    sale_item(input: Sale_Item, table: String = "sale_item"): [sale_item]
    picture(directory: String): [String]
}
`

export default {tables, vars, buildSchema}