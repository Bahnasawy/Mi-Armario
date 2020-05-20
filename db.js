import pg from 'pg'
import tables from './tables.js'
import fs from 'fs'

let client = new pg.Pool(
  {
    host     : 'store.c2lwg9ok3iyk.us-east-1.rds.amazonaws.com',
    user     : 'bahnasawy',
    password : '123456789',
    port     : 5432,
    database : 'store'
  }
)

client.connect()


async function select(columns){
  const table = columns.table
  let query;
  if (Object.keys(columns).length > 1)
  {
    const keys = Object.keys(columns.input).map(key => key)
    const where = keys.map(key => columns.input[key] != "" ? `${key} = '${columns.input[key]}'` : undefined).filter(item => item).join(" AND ")
    if (where.length != 0)
    {
      query =  `Select ${keys} from ${table} Where ${where};`
    }
    else
    {
      query =  `Select ${keys} from ${table};`
    }
  }
  else
  {
    query = `Select * from ${table}`
  }
  try{
    const response = await client.query({rowMode: 'json', text: query})
    return response.rows.map(row => new tables.tables[table](row))
  }
  catch(e){
    return e
  }
}

async function insert(columns){
  const table = Object.keys(columns.input).map(key => key)
  const keys = Object.keys(columns.input[table]).map(key => key)
  const values = keys.map(key => `'${columns.input[table][key]}'`)
  const query = `Insert Into ${table} (${keys.join(", ")}) Values (${values});`
  try
  {
    const response = await client.query(query)
    return "OK"
  }
  catch(e)
  {
    return e
  } 
}

async function update(columns){
  const table = Object.keys(columns.set).map(key => key)
  const set_keys = Object.keys(columns.set[table]).map(key => key)
  const set = set_keys.map(key => `${key} = '${columns.set[table][key]}'`)
  const where_keys = Object.keys(columns.where[table]).map(key => key)
  const where = where_keys.map(key => `${key} = '${columns.where[table][key]}'`)
  const query = `Update ${table} Set ${set.join(", ")} Where ${where.join(", ")};`
  try
  {
    const response = await client.query(query)
    return "OK"
  }
  catch(e)
  {
    return e
  } 
}

async function del(columns){
  const table = Object.keys(columns.del).map(key => key)
  const where = Object.keys(columns.del[table])
  .map(key => columns.del[table][key] != "" ? `${key} = '${columns.del[table][key]}'` : undefined).filter(item => item).join(", ")
  if (where != "")
  {
    const query = `Delete from ${table} where ${where}`
    try
    {
      const response = await client.query(query)
      return "OK"
    }
    catch(e)
    {
      return e
    }
  }
  else
  {
    return "Where clause empty"
  }
}

async function readDir(directory){
  try{
    const response = fs.readdirSync(`./public/images/${directory}`, (err, files) => files)
    return response.filter((item) => item !== ".hidden" ? item : null)
  }
  catch(e)
  {
    return e
  }
  
}

export default {select, insert, update, del, readDir}