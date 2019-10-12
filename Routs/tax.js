
module.exports = (tax, knex)=>{
    // Get all Taxes
    tax.get("/tax", (req, res) =>{
        knex
        .select('*')
        .from('tax')
        .then((data) =>{
            res.send(data);
        }).catch((err) =>{
            console.log(err);
        })
    })

// Get Tax by ID
tax.get("/tax/:tax_id", (req, res) =>{
    let tax_id = req.params.tax_id;
    knex
    .select('*')
    .from('tax')
    .where('tax_id', tax_id)
    .then((data) =>{
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
}