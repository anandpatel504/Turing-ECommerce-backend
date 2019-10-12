var jwt = require("jsonwebtoken");
module.exports = (orders,knex)=>{

    function checktoken(req,res,next){
        var token = req.headers.cookie
        if (token!=undefined){
            token = token.split(" ")
            token = token[token.length-1]
            token = token.slice(0, -10)
            var tokendata = jwt.verify(token, "123",(err,tokendata) =>{
                // console.log(tokendata);
                if (!err){
                    knex
                    .select('*')
                    .from('customer')
                    .where('name',tokendata.name)
                    .then((tdata) =>{
                        if (tdata.length>0){
                            next()
                        }else{
                            res.send({
                                "error": {
                                    "status": 401,
                                    "code": "AUT_02",
                                    "message": "Access Unauthorized",
                                    "field": "NoAuth"
                                }
                            })
                        }
                    })
                }else{
                    res.send({
                        "error": {
                        "status": 401,
                        "code": "AUT_02",
                        "message": "Access Unauthorized",
                        "field": "NoAuth"
                        }
                    })
                }
            })
        }else{
            res.send({
                "error": {
                "status": 401,
                "code": "AUT_02",
                "message": "Access Unauthorized",
                "field": "NoAuth"
                }
            })
        }
    }

// Create a Order
orders.post("/orders",checktoken,(req,res)=>{
    var token = req.headers.cookie
    token = token.split(" ")
    token = token[token.length-1]
    token = token.slice(0, -10)
    var tokendata=jwt.verify(token,"123")
    knex
    .select("*")
    .from("shopping_cart")
    .where("cart_id",req.body.cart_id)
    .join("product",function(){
        this.on('shopping_cart.product_id','product.product_id')
    })
    .then((data)=>{
        knex("orders").insert({
            "total_amount":data[0].quantity*data[0].price,
            "created_on":new Date(),
            "customer_id":tokendata.customer_id,
            "shipping_id":req.body.shipping_id,
            "tax_id":req.body.tax_id
        })
        .then((result)=>{
            knex("order_detail").insert({
                "unit_cost":data[0].price,
                "quantity":data[0].quantity,
                "product_name":data[0].name,
                "attributes":data[0].attributes,
                "product_id":data[0].product_id,
                "order_id":result[0]
            })
            .then((detail)=>{
                knex.select("*").from("shopping_cart").where("cart_id",req.body.cart_id).delete()
                .then(()=>{
                    res.send({"order Id":result[0]})
                }).catch(()=>{
                    res.send({"error":"error in deleting data"})
                })
            }).catch(()=>{
                res.send({"error":"error in insserting data in orders detail."})
            })
        })
    }).catch((err)=>{
        res.send({"error":"cart id not found..."})
    })
})

// Get orders by customer
orders.get("/orders/inCustomer", checktoken, (req, res) =>{
    var token = req.headers.cookie;
    token = token.split(" ");
    token = token[token.length-1];
    token = token.slice(0, -10);
    jwt.verify(token, "123", (err, tokendata) =>{
        if (!err){
            // console.log(tokendata);
            knex
            .select('*')
            .from('orders')
            .where('customer_id', tokendata.customer_id)
            .then((data) =>{
                console.log("hello nav..")
                console.log(data);
                res.send(data);
            }).catch((err) =>{
                console.log(err);
            })
        }else{
            res.send({"Error": "please! do login"})
        }
    })
})

// Get info about Order
orders.get("/orders/:order_id", checktoken, (req, res) =>{
    var token = req.headers.cookie;
    token = token.split(" ")
    token = token[token.length-1]
    token = token.slice(0, -10)
    var tokendata = jwt.verify(token, '123')
    var order_id = req.params.order_id
    knex
    .select(
        'orders.order_id',
        'product.product_id',
        'order_detail.attributes',
        'product.name as product_name',
        'order_detail.quantity',
        'product.price',
        'order_detail.unit_cost'
    )
    .from('orders')
    .join('order_detail', function() {
        this.on('orders.order_id','order_detail.order_id')
    })
    .join('product', function() {
        this.on('order_detail.product_id','product.product_id')
    })
    .where('orders.order_id',order_id)
    .then((data) =>{
        var orders_data = [];
        for (let i of data){
            let subtotal = i.price * i.quantity;
            i.subtotal = subtotal;
            orders_data.push(i)
        }
        console.log(orders_data);
        res.send(orders_data);
    }).catch((err) =>{
        console.log(err);
    })
})

// Get shortDetails about orders
orders.get("/oders/shortDetails/:order_id", checktoken, (req, res) =>{
    var token = req.headers.cookie;
    token = token.split(" ")
    token = token[token.length-1]
    token = token.slice(0, -10)
    var tokendata = jwt.verify(token, "123")
    knex
    .select(
        'orders.order_id',
        'orders.total_amount',
        'orders.created_on',
        'orders.shipped_on',
        'orders.status',
        'order_detail.product_name as name'
    )
    .from('orders')
    .join('order_detail', function() {
        this.on('orders.order_id','order_detail.order_id')
    })
    .where('orders.order_id', req.params.order_id)
    .then((data) =>{
        console.log("data");
        res.send(data)
    }).catch((err) =>{
        console.log(err);
    })
})
}