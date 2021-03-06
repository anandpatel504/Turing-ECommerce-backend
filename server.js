// Turing ECommerce API link- ("https://turing.ly/dashboard/challenge")

const express = require("express");
const mysql = require("mysql");
const app = express();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken")
app.use(express.json())

var knex = require('knex')({
    client: "mysql",
    connection: {
        host : 'localhost',
        user : 'root',
        password : 'anandbabu',
        database : 'turingdb'
    }
})
// route to departments.js
var department = express.Router();
app.use("/", department);
require("./Routs/departments")(department,knex);

// route to categories.js
var category = express.Router();
app.use("/", category);
require("./Routs/categories")(category,knex);

// route to attribute.js
var attribute = express.Router();
app.use("/", attribute);
require("./Routs/attribute")(attribute,knex);

// route to product.js
var product = express.Router();
app.use("/", product);
require("./Routs/product")(product,knex);

// route to customer.js
var customer = express.Router();
app.use("/", customer);
require("./Routs/customer")(customer,jwt,knex);

// route to orders
var orders = express.Router();
app.use("/", orders);
require("./Routs/oders")(orders,knex);

// route to Shoppingcart.js
var shoppingcart = express.Router();
app.use("/", shoppingcart);
require("./Routs/shoppingcart")(shoppingcart, knex);

// route to tax.js
var tax = express.Router();
app.use("/", tax);
require("./Routs/tax")(tax, knex)

// route to Shipping.js
var shipping = express.Router();
app.use("/", shipping);
require("./Routs/shipping")(shipping, knex)

// the port listener
var server = app.listen(3000, function(){
    var host = server.address().address;
    var port = server.address().port;
    console.log(host, port);
    console.log("Success......!")
  });

