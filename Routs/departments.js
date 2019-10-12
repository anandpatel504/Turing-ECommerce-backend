
module.exports = (department, knex)=>{
// get departments data
department.get("/department", (req, res) =>{
    knex.select ('*').from ('department')
    .then((data) =>{
        console.log("done");
        res.send(data)
    }).catch((err) =>{
        console.log(err);
    })
})
// get departments data by {department_id}
department.get("/department/:department_id", (req, res) =>{
    var department_id = req.params.department_id;
    knex.select ('*').from ('department').where ('department_id',department_id)
    .then((data) =>{
        console.log("done");
        res.send(data);
    }).catch((err) =>{
        console.log(err);
    })
})
}
