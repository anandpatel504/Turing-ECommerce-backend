
module.exports = (shoppingcart,knex)=>{
// generate the unique CART ID
    shoppingcart.get("/shoppingcart/generateUniqueID", (req, res) =>{
        var text = "";
        var char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
        for(var i=0; i<11; i++){
            text += char_list.charAt(Math.floor(Math.random() * char_list.length))
        }
        var cart_id = {
            "cart_id": text
        }
        console.log("This is your cart_id");
        console.log(cart_id);
        res.send(cart_id);
    })

// Add the product in the CART
shoppingcart.post("/shoppingcart/add", (req, res) => {
    var cart_data = {
        'cart_id': req.body.cart_id,
        'product_id': req.body.product_id,
        'attributes': req.body.attributes,
        'quantity': 1,
        'added_on': new Date()
    }
    knex
    .select('quantity')
    .from('shopping_cart')
    .where('shopping_cart.cart_id', cart_data.cart_id)
    .andWhere('shopping_cart.product_id', cart_data.product_id)
    .andWhere('shopping_cart.attributes', cart_data.attributes)
    .then((data) =>{
        // console.log('quantity', data);
        if(data.length==0){
            // for quantity
            knex('shopping_cart')
            .insert({
                'cart_id': cart_data.cart_id,
                'product_id': cart_data.product_id,
                'attributes': cart_data.attributes,
                'quantity': 1,
                'added_on': new Date() 
            })
            .then(() =>{
                knex
                .select(
                    'item_id',
                    'name',
                    'attributes',
                    'shopping_cart.product_id',
                    'price',
                    'quantity',
                    'image'
                )
                .from('shopping_cart')
                .join('product',function(){
                    this.on('shopping_cart.product_id','product.product_id')
                })
                .then(data => {
                    let datas = []
                    for (let i of data){
                        let subtotal = i.price*i.quantity;
                        i.subtotal = subtotal;
                        // console.log(i);
                        datas.push(i);
                    }
                    console.log(datas)
                    res.send(data);
                }).catch(err => console.log(err));
            }).catch((err) => console.log(err))
        }else{
            // quantity increase
            let quantity = data[0].quantity+1;
            knex('shopping_cart')
            .update({quantity: quantity})
            .where('shopping_cart.cart_id', cart_data.cart_id)
            .andWhere('shopping_cart.product_id', cart_data.product_id)
            .andWhere('shopping_cart.attributes', cart_data.attributes)
            .then(() => {
                knex
                .select(
                    'item_id',
                    'name',
                    'attributes',
                    'shopping_cart.product_id',
                    'price',
                    'quantity',
                    'image'
                )
                .from('shopping_cart')
                .join('product', function() {
                    this.on('product.product_id', 'shopping_cart.product_id')
                })
                .then(updatedata => {
                    console.log('data updated!')

                    let updated_list = [];
                    for (let i of updatedata){
                        let subtotal = i.price* i.quantity;
                        i.subtotal = subtotal;
                        updated_list.push(i);
                    }
                    
                    res.send(updated_list);
                })
                .catch(err => console.log(err));
            })
        }
    })
})


// Get List of Products in Shopping Cart
shoppingcart.get("/shopping_cart/:cart_id", (req, res) =>{
    let cart_id = req.params.cart_id;
    knex
    .select(
        'item_id',
        'name',
        'attributes',
        'shopping_cart.product_id',
        'price',
        'quantity',
        'image'
    )
    .from('shopping_cart')
    .join('product', function(){
        this.on('shopping_cart.product_id', 'product.product_id')
    })
    .where('shopping_cart.cart_id', cart_id)
    .then((data) =>{
        let result = []
        for (var i of data){
            let subtotal = i.price*i.quantity;
            i.subtotal = subtotal;
            result.push(i);
        }
        console.log(result);
        res.send(result);
    }).catch(err=> console.log(err));
})

// Update the cart by item
shoppingcart.put("/shopping_cart/update/:item_id", (req, res) =>{
    let item_id = req.params.item_id;
    let quantity = req.body.quantity;
    knex('shopping_cart')
    .where('shopping_cart.item_id', item_id)
    .update({
        'quantity': req.body.quantity
    })
    .then(() =>{
        knex
        .select(
            'item_id',
            'product.name',
            'shopping_cart.attributes',
            'shopping_cart.product_id',
            'product.price',
            'shopping_cart.quantity',
            'product.image'
        )
        .from('shopping_cart')
        .where('shopping_cart.item_id', item_id)
        .join('product', function() {
            this.on('shopping_cart.product_id', 'product.product_id')
        })
        .then((data) =>{
            let result = [];
            for (let i of data){
                let subtotal = i.price * i.quantity;
                i.subtotal = subtotal;
                result.push(i);
            }
            console.log({"Great": "data updated!"});
            res.send(result);
        }).catch(err => console.log(err));
    }).catch((err) =>{
        console.log(err)
    })
})

// Empty cart
shoppingcart.delete("/shopping_cart/empty/:cart_id", (req, res) =>{
    let cart_id = req.params.cart_id;
    knex('*')
    .from('shopping_cart')
    .where('shopping_cart.cart_id', cart_id)
    .del()
    .then((data) =>{
        console.log("deleted data!")
        res.send({delete: 'data deleted successfully!!!'})
    }).catch(err => console.log(err));
})

// Move a product to cart
// First create a table "cart"
shoppingcart.get("/shopping_cart/moveToCart/:item_id", (req, res) =>{
    knex.schema.createTable('cart', function(table){
        table.increments('item_id').primary();
        table.string('cart_id');
        table.integer('product_id');
        table.string('attributes');
        table.integer('quantity');
        table.integer('buy_now');
        table.datetime('added_on');
     }).then(() => {
        console.log("cart table created successfully....")
     }).catch(() => {
        console.log("cart table is already exists!");
    })
    knex
    .select('*')
    .from('later')
    .where('item_id', req.params.item_id)
    .then((data) =>{
        // console.log(data);
        if (data.length>0){
            knex('cart')
            .insert(data[0])
            .then((result) =>{
                knex
                .select('*')
                .from('later')
                .where('item_id', req.params.item_id)
                .delete()
                .then((done) =>{
                    res.send({"Good": "data move from shopping_cart to cart successfully!"})
                })
            }).catch((err) =>{
                console.log(err);
            })

        }else{
            res.send({"Error": "this id is not available in shopping_cart"})
        }
    
    }).catch((err) => {
        console.log(err);
    })
})


// Return a total amount from Cart
shoppingcart.get("/shopping_cart/totalAmount/:cart_id", (req, res) =>{
    let cart_id = req.params.cart_id;
    knex
    .select(
        'price',
        'quantity'
    )
    .from('shopping_cart')
    .join('product', function(){
        this.on('shopping_cart.product_id', 'product.product_id')
    })
    .where('shopping_cart.cart_id', cart_id)
    .then((data) =>{
        // console.log(data);
        for (let i of data){
            let result = [];
            let total_Amount = i.quantity * i.price;
            i.total_Amount = total_Amount;
            // console.log(i);
            result.push(i);
            res.send(result);
        }
    }).catch((err) =>{
        console.log(err);
    })
})

// Save a Product for latter
shoppingcart.get("/shopping_cart/saveForLater/:item_id",(req, res) =>{
    knex.schema.createTable('later', function(table){
        table.increments('item_id').primary();
        table.string('cart_id');
        table.integer('product_id');
        table.string('attributes');
        table.integer('quantity');
        table.integer('buy_now');
        table.datetime('added_on');
    }).then(() =>{
        console.log("later table created successfully....!")
    }).catch((err) =>{
        console.log("later table is already exists")
    })
    knex
    .select('*')
    .from('shopping_cart')
    .where('item_id', req.params.item_id)
    .then((data) =>{
        // console.log(data);
        if (data.length>0){
            knex('later')
            .insert(data[0])
            .then((result) =>{
                knex
                .select('*')
                .from('shopping_cart')
                .where('item_id', req.params.item_id)
                .then((done) =>{
                    res.send({"Good": "data move from shopping_cart to later successfully!"})
                })
            }).catch((err) =>{
                console.log(err);
            })
        }else{
            res.send({"Error": "sorry! this item_id is not available in this table."})
        }
    })
});

// Get Products saved for latter
shoppingcart.get("/shopping_cart/getSaved/:cart_id", (req, res) =>{
    let cart_id = req.params.cart_id;
    knex
    .select(
        'item_id',
        'product.name',
        'shopping_cart.attributes',
        'product.price'
    )
    .from('shopping_cart')
    .join('product', function(){
        this.on('shopping_cart.product_id', 'product.product_id')
    })
    .where('shopping_cart.cart_id', cart_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})

// Remove a product in the cart
shoppingcart.delete("/shopping_cart/removeProduct/:item_id", (req, res) =>{
    let item_id = req.params.item_id;
    knex
    .select('*')
    .from('shopping_cart')
    .where('item_id', item_id)
    .delete()
    .then((data) =>{
        console.log("data delete successfully!")
        res.send("data delete successfully!")
    }).catch((err) =>{
        console.log(err);
    })
})
}
