
module.exports = (attribute, knex)=>{
// get attribute data
attribute.get("/attribute", (req, res) =>{
    knex
    .select('*')
    .from('attribute')
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// get attribute list by attribute_id
attribute.get("/attribute/:attribute_id", (req, res) =>{
    let attribute_id = req.params.attribute_id;
    knex
    .select('*')
    .from('attribute')
    .where('attribute_id',attribute_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// get Values attribute from atributes
attribute.get("/attribute/value/:attribute_value_id", (req, res) =>{
    let attribute_value_id = req.params.attribute_value_id;
    knex
    .select(
        'attribute_value_id',
        'value'
    )
    .from('attribute_value')
    .where('attribute_value_id', attribute_value_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
// get all attributes with product_id;
attribute.get("/attribute/inProduct/:product_id", (req, res) =>{
    let product_id = req.params.product_id;
    knex
    .select(
        '*'
    )
    .from('attribute')
    .join('attribute_value', function(){
        this.on('attribute.attribute_id','attribute_value.attribute_id')
    })
    .join('product_attribute', function(){
        this.on('attribute_value.attribute_value_id','product_attribute.attribute_value_id')
    })
    .where('product_attribute.product_id',product_id)
    .then((data) =>{
        // res.send(data);
        var data_list = [];
        for (var i of data){
            var Dict = {
                'attribute_name' : i.name,
                'attribute_value_id' : i.attribute_value_id,
                'attribute_value' : i.value
            }
            data_list.push(Dict); 
        }
        // console.log(data_list);
        res.send(data_list);
    }).catch((err) =>{
        console.log(err);
    })

})
}