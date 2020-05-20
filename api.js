import graphql from 'graphql';
import db from './db.js'
import tables from './tables.js'
let buildSchema = graphql.buildSchema;

var schema = buildSchema(tables.buildSchema);

var root = {
    customer: (args) => db.select(args),
    product: (args) => db.select(args),
    category: (args) => db.select(args),
    picture: (args) => db.readDir(args.directory),
    sale: (args) => db.select(args),
    sale_item: (args) => db.select(args),
    insert: (args) => db.insert(args),
    update: (args) => db.update(args),
    del: (args) => db.del(args)
};

export default {schema, root}