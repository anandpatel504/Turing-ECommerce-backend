
module.exports = (customer,jwt,knex) =>{
// Put update a customer
customer.put("/customer",(req, res)=>{
    var token = req.headers.cookie
    console.log(token);
    
    if(token!=undefined){
        token = token.slice(4);
        // console.log(token);
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
                res.send({"Done": "data updated successfully!"})
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
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    if (name === undefined || email === undefined || password === undefined){
        console.log({"Suggetion": "name, email and password all are required"});
        res.send({"Suggetion": "name, email and password all are required"});
    }else{
        var accessToken = jwt.sign(req.body, "123",{expiresIn: "24h"})
        // console.log(accessToken );
        // res.send({"Token": accessToken})
        knex
        .select('*')
        .from('customer')
        .where({"name": name, "email": email, "password": password})
        .then((data) => {
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
                res.send({
                    "exist": "this user alredy exists.."
                })
            }
        })
    }
})

// Post Login for the shoping
customer.post("/customer/login", (req, res) =>{
    var email = req.body.email;
    var password = req.body.password;
    if (email === undefined || password === undefined){
        console.log({"Suggetion": "email and password both are require!"});
        res.send({"Suggetion": "email and password both are require!"})
    }else{
        knex.select('*')
        .from('customer')
        .where("email", email)
        .where("password", password)
        .then((data) => {
            // console.log(data);
            if (data.length>0){
                if (data[0].password === req.body.password){
                    var accessToken = jwt.sign({name:data[0].name,customer_id:data[0].customer_id}, "123",{expiresIn: "24h"})
                    // console.log(accessToken);
                    res.cookie("key", accessToken);
                    delete data[0].password;
                    // console.log(data);
                    let login_data = {"customer": {"schema":data[0]}, accessToken, expires_in: '24h'}
                    console.log(login_data);
                    res.send(login_data);
                }else{
                    res.send({
                        "Error": "Password is invalid"
                    })
                }
            }else{
                res.send({
                    "Error": "This user doesn't exists! please Signup....."
                })
            }
        }).catch((err) => {
            console.log(err);
        })
    }
})

// update the address from customer
customer.put("/customer/address", (req, res) =>{
    var token = req.headers.cookie;
    // console.log(token);
    if(token!=undefined){
        token = token.slice(4);
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
                res.send({"Done": "data updated successfully!"});
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
        token = token.slice(4);
        // console.log(token);
        jwt.verify(token, '123', (err, data) =>{
            var token_data = req.body;
            var customer_id = data.customer_id;
            knex('customer')
            .update({
                'credit_card': token_data.credit_card
            }).where('customer_id', customer_id)
            .then((data) =>{
                res.send({"Done": "data updated successfully!"})
            }).catch((err) =>{
                res.send({"Msg": "err check your data in your database."})
            })
        })
    }
})
}
 