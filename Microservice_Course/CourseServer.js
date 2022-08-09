const express = require('express')
const app = express()
const cors = require('cors')
var uuid = require('uuid')



app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true

}));




var cassandra = require('cassandra-driver');


var client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter:'datacenter1',
  keyspace: 'ums'
});

app.post('/addcourse', (req, res, next) => {
  console.log("helooooooooooooooo")
  var deptName = req.body.deptName;
  var courseName = req.body.courseName;
  var courseID = req.body.courseID;
  var creditHour = parseFloat(req.body.creditHour);
  var level = parseInt(req.body.level);
  var term = parseInt(req.body.term);
  var type = req.body.type;
  var uid1 = uuid.v4();

  console.log("uil gdgdg", typeof uid1);
  var uid2 = uuid.v4();
  console.log("deptName: ", deptName);
  console.log(typeof level);
  console.log("uuid: ", uid1);
  const query = 'SELECT * FROM Department_by_name WHERE name = ?';
  client.execute(query, [deptName], function(err, result){
    if(err){
      res.status(404).send({msg:err});
    }
    else{
      console.log(result.rows);
      if(result.rows.length > 0){
        uid2 = result.rows[0].id;

        console.log("deptID: ", uid2);
        console.log(typeof uid2);

        const query1 = 'INSERT INTO Course(id, course_label, course_title, level, term, credit, type, dept_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
        const query2 = 'INSERT INTO Course_by_level(id, course_label, course_title, level, term, credit, type, dept_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
        const query3 = 'INSERT INTO Course_by_dept_id(id, course_label, course_title, level, term, credit, type, dept_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
        const queries = [
              { query: query1, params: [uid1, courseID, courseName, level, term, creditHour, type, uid2] },
              { query: query2, params: [uid1, courseID, courseName, level, term, creditHour, type, uid2] } ,
              { query: query3, params: [uid1, courseID, courseName, level, term, creditHour, type, uid2] } ,
        ];
        // Promise-based call
        client.batch(queries, { prepare: true })
        .then(function() {
        // All queries have been executed successfully
          res.send({
            status: "yes",
            course_id: uid1,
          });
        })
        .catch(function(err) {
          console.log("errrrr:  ", err);
          res.send({
            status:"no",
          });
        });
      }
    }
  })
  
})


app.get('/courselist', (req, res, next)=>{
  var deptName = req.query.deptname;
  console.log(deptName);

  const query = 'SELECT id FROM Department_by_name WHERE name = ?';

  client.execute(query, [deptName], function(err, result){
    if(err){
      console.log(err);
      res.status(404).send({msg:err});
    }
    else{
      console.log(result.rows);
      var dept_id = result.rows[0].id;
      const query1 = 'SELECT * from course_by_dept_id where dept_id = ?';
      client.execute(query1, [dept_id], function(err, result){
        if(err){
          console.log(err);
          res.send({
            data: "invalid",
          })
        }
        else{
          console.log("resultttttttttttttt: ", result.rows);
          res.send({
            data: result.rows,
          })
        }
      })
      
    }
  })


})



app.get('/singlecourse', (req, res, next)=>{
  var course_id = req.query.courseId;
  console.log("course-id: ", course_id);

  const query = 'SELECT * from course where id = ?';
  client.execute(query, [course_id], function(err, result){
    if(err){
      console.log(err);
      res.status(404).send({msg:err});
    }
    else{
      var courseData = result.rows;
      
      const dept_id = result.rows[0].dept_id;
      console.log(dept_id);
      const query1 = 'SELECT name FROM Department where id = ?';
      client.execute(query1, [dept_id], function(err, result){
        if(err){
          console.log(err);
        }
        else{
          console.log("undefine value???: ", result.rows);
          for(let i  =0; i < courseData.length; i++){
            courseData[i]["dept_name"] = result.rows[0].name;
          }
          console.log(courseData);
          res.send({
              data: courseData,
              // dept_name: result.rows[0].name,
          })
        }
      })
    }
  })
})

app.get('/offeredcourse', (req, res, next)=>{
  //var course_id = req.query.courseId;
  //console.log("course-id: ", course_id);

  const query = 'SELECT * from offered_course';
  client.execute(query, [], function(err, result){
    if(err){
      console.log(err);
      res.status(404).send({msg:err});
    }
    else{
          console.log(result.rows)
          res.send({
              data: result.rows,
              // dept_name: result.rows[0].name,
          }) 
    }
  })
})

app.listen(5002, () => {
    console.log("Course server is connected on port 5002")
})