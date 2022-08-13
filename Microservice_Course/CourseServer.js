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


app.get('/head/getTeacherList', async (req, res, next)=>{
  const dept_name = req.query.dept_name;

  console.log("printing ....   ", dept_name)

  result = await client.execute('SELECT id FROM Department_by_name WHERE name = ?', [dept_name])

  console.log(result.rows)
  const dept_id = result.rows[0].id
  teacherList = await client.execute('Select  username , personal_info_id from teacher_by_dept_id where dept_id = ?', [dept_id])
  console.log("tacher list: ", teacherList);

  // teacherInfo = await client.execute('Select name from personal_info where id = ?', [teacher])

  res.send({
    data: teacherList.rows,
  })
})


app.post('/head/singleoffercourse/saveteacher', async (req, res, next)=>{
  var teacher_name = req.body.teacher;

  console.log(teacher_name, " --------- ")
  var offer_course_id = req.body.offerCourseId;

  result = await client.execute('Insert into teacher_offerCourse(teacher_username, offerCourseId) values(?, ?)', [teacher_name, offer_course_id]);

  res.send({
    status: "success",
  })


})

app.get('/head/getCourse', (req, res, next)=>{
    var level = parseInt(req.query.level)
    var term = parseInt(req.query.term);
    const dept_name = req.query.dept_name;

    console.log("printing ....   ", level, term, dept_name)

    const query = "Select id from department_by_name where name = ?";
    client.execute(query, [dept_name], function(err, result){
      if(err){
        console.log(err)
        res.status(404);
      }
      else{
        var dept_id = result.rows[0].id;
        console.log(dept_id)
        const query2 = 'Select * from course_by_level_term where level = ? and term = ? and dept_id = ?';
        client.execute(query2, [level, term, dept_id], { hints : ['int', 'int'] }, function(err, result){
          if(err){
            console.log(err);
            res.status(404);
          }
          else{
            res.send({
              data: result.rows,
            })
          }
        })

      
      }
    })
})


app.post('/head/offercourse', (req, res, next)=>{
    var offerCourseList = req.body.offered_course_id;
    var level = req.body.level;
    var term = req.body.term;
    
    console.log(offerCourseList);
    for(var i = 0; i < offerCourseList.length; i++){
      var uid1 = uuid.v4();
      var uid2 = uuid.v4();
      const query1 = 'INSERT INTO offered_course(id, course_id, level, term, session_id) VALUES(?, ?, ?, ?, ?)';
      const query2 = 'INSERT INTO offered_course_by_level_term_session_id(id, course_id, level, term, session_id) VALUES(?, ?, ?, ?, ?)';
      const query3 = 'INSERT INTO offered_course_by_course_id(id, course_id, level, term, session_id) VALUES(?, ?, ?, ?, ?)';
      const queries = [
        { query: query1, params: [uid1, offerCourseList[i], level, term, '12953e05-e41e-45ad-a61f-5718cbc0e600'] },
        { query: query2, params: [uid1, offerCourseList[i], level, term, '12953e05-e41e-45ad-a61f-5718cbc0e600'] },
        { query: query3, params: [uid1, offerCourseList[i], level, term, '12953e05-e41e-45ad-a61f-5718cbc0e600'] },
        
      ];

      client.batch(queries, { prepare: true })
        .then(function() {
          console.log("i = ", i , "  done!");
        })
        .catch(function(err) {
          console.log("errrrr:  ", err);
        });
    }
    
    res.send({
      status: true,
    })



})


app.get('/head/showofferlist', async function(req, res, next){
  var filterResult = []

  var deptName = req.query.deptName;
  console.log(deptName);

  result = await client.execute('SELECT id FROM Department_by_name WHERE name = ?', [deptName])
 
  console.log(result.rows);
  var dept_id = result.rows[0].id;
  
  console.log("dept id : ", dept_id)
  courseList = await client.execute('SELECT * from course_by_dept_id where dept_id = ?', [dept_id]);
      
  console.log("course list: ", courseList.rows);

  var tmpResult = courseList.rows;

          
  for(let i = 0; i < tmpResult.length; i++){
    
    offerCourse = await client.execute('Select id from offered_course_by_course_id where course_id = ?', [tmpResult[i].id])

    console.log("res res res ", offerCourse.rows)

    if(offerCourse.rows.length > 0 ){
      tmpResult[i]["offer_course_id"] = offerCourse.rows[0].id
      filterResult.push(tmpResult[i])
    }
  }
        
  console.log("filter result : ", filterResult)

  res.send({
    data: filterResult,
  })
})


app.get('/head/singleoffercourse', async function(req, res, next){
  console.log("hello")
  var offer_course_id = req.query.offerCourseId;
  console.log("course-id: ", offer_course_id);

  result = await client.execute('SELECT course_id FROM offered_course WHERE id = ?', [offer_course_id])
 
  console.log(result.rows);
  var course_id = result.rows[0].course_id;
  
  console.log("course id : ", course_id)
  courseData = await client.execute('SELECT * from course WHERE id = ?', [course_id]);
      
  res.send({
    data: courseData.rows,
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

// app.get('/offeredcourse', (req, res, next)=>{
//   //var course_id = req.query.courseId;
//   //console.log("course-id: ", course_id);

//   const query = 'SELECT * from offered_course';
//   client.execute(query, [], function(err, result){
//     if(err){
//       console.log(err);
//       res.status(404).send({msg:err});
//     }
//     else{
//           console.log(result.rows)
//           res.send({
//               data: result.rows,
//               // dept_name: result.rows[0].name,
//           }) 
//     }
//   })
// })








app.get('/teacher/getassigncourse', async(req, res, next)=>{
  var teacher_name = req.query.username;
  var tmpList = []
  console.log(teacher_name);

  
  
  result = await client.execute('select offerCourseId from teacher_offercourse where teacher_username = ?', [teacher_name]);
  tmpList = result.rows

  console.log(tmpList);
  
  for(let i = 0; i < tmpList.length; i++){
    console.log("id --- - ", tmpList[i].offercourseid);
    courseId = await client.execute('select course_id from offered_course where id = ?', [tmpList[i].offercourseid])
    courseId = courseId.rows
    courseInfo = await client.execute('select course_title from course where id = ?', [courseId[0].course_id]);
    tmpList[i]["course_title"] = courseInfo.rows[0].course_title
  }

  res.send({
    data: tmpList,
  })
})


app.post('/teacher/addoutline/addtype', async(req, res, next)=>{
  var offer_course_id = req.body.offerCourseId;

  console.log("hahflafjlajf")
  console.log(offer_course_id)
  var name = req.body.name;
  var weight = parseFloat(req.body.weight);


  var uid1 = uuid.v4();
  
    const query1 = 'INSERT INTO Evaluation_item(id, name, weight, offered_course_id) VALUES(?, ?, ?, ?)';
    const query2 = 'INSERT INTO Evaluation_item_by_offered_course_id(id, name, weight, offered_course_id) VALUES(?, ?, ?, ?)';
    
    const queries = [
      { query: query1, params: [uid1, name, weight, offer_course_id] },
      { query: query2, params: [uid1, name, weight, offer_course_id] },
      
    ];

    client.batch(queries, { prepare: true })
      .then(function() {
        res.send({
          status: true,
        })
      })
      .catch(function(err) {
        console.log("errrrr:  ", err);
      });
  
})




app.post('/teacher/getevaluationitem', async(req, res, next)=>{
  var offered_course_id = req.body.offered_course_id;
  
  console.log(offered_course_id, " fadhfafdjalfjl  ")
  
  
  result = await client.execute('select * from Evaluation_item_by_offered_course_id where offered_course_id = ?', [offered_course_id]);
  console.log(result.rows)

  res.send({
    data: result.rows,
  })
})

app.listen(5002, () => {
    console.log("Course server is connected on port 5002")
})