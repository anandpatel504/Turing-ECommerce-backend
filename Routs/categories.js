
module.exports = (category, knex)=>{
// get categories data
category.get("/category", (req, res) =>{
    knex.select ('*').from ('category')
    .then((data) =>{
        console.log("get categories data....");
        res.send(data);
    }).catch((err) =>{
        console.log(err);
        res.send(err);
    })
})
// get categories data by ID
category.get("/category/:category_id", (req, res) =>{
    var category_id = req.params.category_id;
    knex.select ('*').from ('category').where ('category_id',category_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})

// get categories of a product
category.get("/category/inProduct/:product_id", (req, res) =>{
    var product_id = req.params.product_id;
    knex
    .select(
        'category.category_id',
        'department_id',
        'name'
    )
    .from('category')
    .join('product_category', function(){
        this.on('category.category_id', 'product_category.category_id')
    })
    .where('product_category.product_id', product_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// get categories of a department
category.get("/category/inDepartment/:department_id", (req, res) =>{
    var department_id = req.params.department_id;
    knex
    .select(
        'category_id',
        'name',
        'description',
        'department_id'
    )
    .from('category')
    .where('department_id', department_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
}
