
// const jwt = require("jsonwebtoken")

module.exports = (customer,jwt,knex) =>{
// Put update a customer
customer.put("/customer",(req, res)=>{
    var token = req.headers.cookie
    if(token!=undefined){
        token = token.split(" ")
        token = token[token.length-1]
        console.log(token);
        token = token.slice(0,-10)
        jwt.verify(token,"123", (err, data) =>{
            var token_data = req.body;
            var customer_id = data.customer_id;
            console.log(customer_id)
            knex('customer')
            .update({
                'name': token_data.name,
                'email': token_data.email,
                'password': token_data.password,
                'day_phone': token_data.day_phone,
                'eve_phone': token_data.eve_phone,
                'mob_phone': token_data.mob_phone
            }).where('customer_id', customer_id)
            .then((data) =>{
                res.send("Put data updated successfully")
            }).catch((err) =>{
                res.send({'Msg': 'err check your data'})
            })
        })
    }
})

// Get a customer by ID. The customer is getting by Token.
customer.get("/customer/:customer_id", (req, res) =>{
    var customer_id = req.params.customer_id;
    var accessToken = jwt.sign(req.body, "123",{expiresIn: "24h"})
    // console.log(accessToken)
    knex
    .select(
        'customer_id',
        'name',
        'email',
        'address_1',
        'address_2',
        'city',
        'region',
        'postal_code',
        'country',
        'shipping_region_id',
        'day_phone',
        'eve_phone',
        'mob_phone',
        'credit_card'
    )
    .from('customer')
    .where('customer_id', customer_id)
    .then((data)=>{
        console.log(data);
        res.send(data);
    }).catch((err) =>{
        console.log(err)
    })
})

// (post)resister a customer
customer.post("/customer", (req, res) =>{
    // console.log(req.body);
    var email = req.body.email;
    // console.log(email);
    var accessToken = jwt.sign(req.body, "123",{expiresIn: "24h"})
    // console.log(accessToken );
    knex
    .select('*')
    .from('customer')
    .where('customer.email', email)
    .then((data) =>{
        // console.log(data);
        if (data.length<1){
            knex('customer').insert(req.body)
            .then((result) =>{
                knex
                .select('*')
                .from('customer')
                .where('email',email)
                .then((user) =>{
                    // console.log(user);
                    userdata = {'customer': {'schema': user[0]}, accessToken, expires_in: '24h'}
                    res.send(userdata);
                })
                .catch((err) => {
                    console.log(err);
                })
            }).catch((err) =>{
                console.log(err);
            })
        }else{
            res.send({"Error":"this user already exist..."})
        }
    })
})

// Post Sign in in the shoping
customer.post("/customer/login", (req, res) =>{
    var email = req.body.email;
    var password = req.body.password;
    knex
    .select('*')
    .from('customer')
    .where("email",email)
    .where("password",password)
    .then((data) =>{
        console.log(data);
        var accessToken = jwt.sign({name:data[0].name,customer_id:data[0].customer_id}, "123",{expiresIn: "24h"})
        // console.log(accessToken)
        res.cookie(accessToken);
        if (data.length>0){
            // console.log(data)
            delete data[0].password;
            // res.send(data)
            let login_data = {"customer": {"schema":data[0]}, accessToken, expires_in: '24h'}
            res.send(login_data)
        }else{
            console.log("this email is not exists in you database!!!!")
            res.send("this email is not exists in you database!!!!")
        } 
    }).catch((err) =>{
        console.log(err);
    })
})

// update the address from customer
customer.put("/customer/address", (req, res) =>{
    var token = req.headers.cookie;
    // console.log(token);0
    if(token!=undefined){
        token = token.split(" ");
        token = token[token.length-1]
        // console.log(token);
        token = token.slice(0,-10);
        // console.log(token);
        jwt.verify(token,"123", (err, data) =>{
            // console.log(data);
            var token_data = req.body
            var customer_id = data.customer_id;
            console.log(customer_id);
            knex('customer')
            .update({
                'address_1': token_data.address_1,
                'address_2': token_data.address_2,
                'city': token_data.city,
                'region': token_data.region,
                'postal_code': token_data.postal_code,
                'country': token_data.country,
                'shipping_region_id': token_data.shipping_region_id
            }).where('customer_id', customer_id)
            .then((data) =>{
                res.send("PUT data updated successfully.")
            }).catch((err) =>{
                console.log(err);
                res.send({"Msg": "err check your data in you database."})
            })
        })
    }
})


// Update the credit card from customers
customer.put("/customer/creditCart", (req, res) =>{
    var token = req.headers.cookie;
    // console.log(token);
    if(token!=undefined){
        token = token.split(" ");
        token = token[token.length-1]
        // console.log(token);
        token = token.slice(0,-10);
        // console.log(token);
        jwt.verify(token, '123', (err, data) =>{
            var token_data = req.body;
            var customer_id = data.customer_id;
            knex('customer')
            // .select('customer')
            .update({
                'credit_card': token_data.credit_card
            }).where('customer_id', customer_id)
            .then((data) =>{
                res.send("PUT data updated successfully")
            }).catch((err) =>{
                res.send({"Msg": "err check your data in your database."})
            })
        })
    }
})
}
 