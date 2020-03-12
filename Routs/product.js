
module.exports = (product, knex, jwt)=>{
// get all products
product.get("/product", (req, res) =>{
    knex
    .select('*')
    .from('product')
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// search products
product.get("/product/search", (req, res) =>{
    var search = req.query.search;
    knex
    .select(
        'product_id',
        'name',
        'description',
        'price',
        'discounted_price',
        'thumbnail' 
    )
    .from('product')
    .where('name','like','%'+search+'%')
    .orWhere('description', 'like', '%'+description+'%')
    .then((data) =>{
        console.log("data sent by search!")
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// get product by id
product.get("/product/:product_id", (req, res) =>{
    let product_id = req.params.product_id;
    knex
    .select('*')
    .from('product')
    .where('product_id', product_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// get a list of products of categories
product.get("/product/inCategory/:category_id", (req, res) =>{
    let category_id = req.params.category_id;
    knex
    .select(
       'product.product_id',
       'name',
       'description',
       'price',
       'discounted_price',
       'thumbnail'
    )
    .from('product')
    .join('product_category',function(){
        this.on('product.product_id', 'product_category.product_id')
    })
    .where('product.product_id', category_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// Get a list of products on department
product.get("/product/inDepartment/:department_id", (req, res) =>{
    let department_id = req.params.department_id;
    knex
    .select(
        'product.product_id',
        'product.name',
        'product.description',
        'product.price',
        'product.discounted_price',
        'product.thumbnail'
    )
    .from('product')
    .join('product_category', function(){
        this.on('product.product_id', 'product_category.product_id')
    })
    .join('category', function(){
        this.on('product_category.category_id', 'category.category_id')
    })
    .join('department', function(){
        this.on('category.department_id', 'department.department_id')
    })
    .where('department.department_id', department_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// get details of a product
product.get("/product/:product_id/details", (req, res) =>{
    let product_id = req.params.product_id;
    knex
    .select(
        'product_id',
        'name',
        'description',
        'price',
        'discounted_price',
        'image',
        'image_2'
    )
    .from('product')
    .where('product.product_id',product_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// get locations of a product
product.get("/product/:product_id/location", (req, res) =>{
    let product_id = req.params.product_id;
    knex
    .select(
        'category.category_id',
        'category.name as category_name',
        'category.department_id',
        'department.name as department_name'
    )
    .from('product')
    .join('product_category', function(){
        this.on('product.product_id', 'product_category.product_id')
    })
    .join('category', function(){
        this.on('product_category.category_id', 'category.category_id')
    })
    .join('department', function(){
        this.on('category.department_id', 'department.department_id')
    })
    .where('product.product_id', product_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})

// post reviews of a Product
product.post("/product/:product_id/reviews", (req, res) =>{
    var review = req.body.review;
    var rating = req.body.rating;
    var product_id = req.params.product_id;

    var token = req.headers.cookie;
    // console.log(token);
    token = token.slice(4)
    console.log(token);
    jwt.verify(token, "123" , (err, tokendata) =>{
        if (!err){
            knex
            .select('*')
            .from('customer')
            .where('customer.customer_id', tokendata.customer_id)
            .then((data) =>{
                // console.log(data);
               knex('review')
               .insert({
                   review: review,
                   rating: rating,
                   product_id: product_id,
                   created_on: new Date,
                   customer_id: data[0].customer_id
               }).then((insert) => {
                   console.log({"insert": "data inserted successfully!"})
                   res.send({"insert": "data inserted successfully!"})
               }).catch((err) =>{
                   console.log(err);
               })
            }).catch((err) =>{
                console.log(err);
            })
        }else{
            console.log({"Error": "Sorry you didn't login, first do login after that you can post review successfully!"})
        }
    })
    
})


// Get review of a product
product.get("/product/:product_id/reviews", (req, res) =>{
    var token = req.headers.cookie;
    token = token.split(" ");
    token = token[token.length-1]
    token = token.slice(0, -10);
    var tokendata = jwt.verify(token, "123")
    knex('review')
    .select(
        'customer.name',
        'review',
        'rating',
        'created_on'
    )
    .join('customer', function() {
        this.on('review.customer_id','customer.customer_id')
    })
    .where('product_id', req.params.product_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})

}