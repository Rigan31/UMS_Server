const express = require('express')
const app = express()
const cors = require('cors')
var uuid = require('uuid');

app.use(express.json());
app.use(cors());

var cassandra = require('cassandra-driver');
var logged_in = ""

var client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter:'datacenter1',
  keyspace: 'ums'
});


  app.get('/get_sessions_depts', function(req, res, next) {
    var depts, sessions;
    const query = 'SELECT * FROM department';
      client.execute(query, [], function(err, result){
        if(err){
          console.log("error!", err)
          res.status(404).send({msg:err});
        }
        else{
          const query2 = 'SELECT * FROM session';
          client.execute(query2, [], function(err, result2){
          if(err){
            res.status(404).send({msg:err});
          }
          else{
            res.send({
              'depts': result.rows,
              'sessions': result2.rows,
            })
        }
      })
       }
      })
      
    });

    
    let session_id;
    app.get('/get_courses', function(req, res, next) {
      const dept_id = req.query.dept_id;
      session_id = req.query.session_id;
      //console.log("session id is : ", session_id)
      const query = 'SELECT * FROM offered_course_by_session_id WHERE session_id=? ALLOW FILTERING;';
        client.execute(query, [session_id], { prepare : true }, function(err, result){
          if(err){
            console.log("error!", err)
            res.status(404).send({msg:err});
          }
          else{
            
            
              var query2 = 'SELECT * FROM course WHERE id IN (' + result.rows[0].course_id;
              for(let i=1; i<result.rows.length; i++){
                query2 += ', ' + result.rows[i].course_id;
              }
              query2 += ')';
              //console.log("query 2 : ", query2)
              
              client.execute(query2, [], function(err, result2){
              if(err){
                res.status(404).send({msg:err});
              }
              else{
                //console.log("output2 : ", result2.rows)
                for(let i=0; i<result2.rows.length; i++){
                  if(result2.rows[i].dept_id != dept_id){
                    result2.delete(i);
                    i--;
                  }
                }
                //console.log("final result holo: ", result2.rows);
                res.send({
                  'courses': result2.rows,
                })
          }
        })
         }
        })
        
      });

app.get('/get_results', (req, res, next) => {
  res.send(result)
});
let result = [];

app.post('/result_file', (req, res, next) => {
  const array = req.body.data;
  const offered_course_id = req.body.course;
  const session = req.body.session;
  //console.log("array is: ", array)
  console.log("offered course id is: ", offered_course_id)
  console.log("session: ", session_id)
 
  const query = 'Select course_label FROM course WHERE id=?';
  client.execute(query, [offered_course_id], function(err, result){
      let course = result.rows[0].course_label;
      let course_name = course.replace('  ','_');
      let table_name = course_name + '_' + session_id;
      console.log(table_name)
      const query2 = 'CREATE TABLE (student_id text, grade text, gpa double, PRIMARY KEY(student_id))';
      client.execute(query2, [table_name], function(err2, result2){
        if(err2){
          console.log("table exists");
          res.status(404).send({msg:err});
        }
        else{
          console.log("table created");
        }
      })
  });
  
  
  for(let i=0; i<array.length-1; i++){
    result[i] = {};
    let student_id= array[i].ID;
    let attendance = parseFloat(array[0].Attendance);
    let ct1 = parseFloat(array[i].CT1);
    let ct2 = parseFloat(array[i].CT2);
    let ct3 = parseFloat(array[i].CT3);
    let ct4 = parseFloat(array[i].CT4);
    let secA =  parseFloat(array[i].SectionA);
    let secB =  parseFloat(array[i].SectionB);

    let ct_min = 0;
    if(ct1<=ct2&&ct1<=ct3&&ct1<=ct4){
      ct_min = ct1;
    }
    else if(ct2<=ct1&&ct2<=ct3&&ct2<=ct4){
      ct_min = ct2;
    }
    else if(ct3<=ct1&&ct3<=ct2&&ct3<=ct4){
      ct_min = ct3;
    }
    else{
      ct_min = ct4;
    }
    
    
    let ct_attnd = attendance + ct1 + ct2 + ct3 + ct4 - ct_min;
    let term_final_marks = secA + secB;
    let final_marks = ct_attnd*30/90 + term_final_marks*70/210;
    
    
    result[i]['student_id'] = student_id;
    result[i]['final_marks'] = final_marks;
    result[i]['ct'] = ct1 + ct2 + ct3 + ct4 - ct_min;
    result[i]['term_final_marks'] = term_final_marks;
    result[i]['attendance'] = attendance;
    
    if(final_marks >= 80){
      result[i]['grade'] = 'A+';
      result[i]['gpa'] = 4.00;
    }
    else if(final_marks < 80 && final_marks >=75){
      result[i]['grade'] = 'A';
      result[i]['gpa'] = 3.75;
    }
    else if(final_marks < 75 && final_marks >=70){
      result[i]['grade'] = 'A-';
      result[i]['gpa'] = 3.50;
    }
    else if(final_marks < 70 && final_marks >=60){
      result[i]['grade'] = 'B';
      result[i]['gpa'] = 3.25;
    }
    else if(final_marks < 60 && final_marks >=50){
      result[i]['grade'] = 'C';
      result[i]['gpa'] = 3.00;
    }
    else if(final_marks < 50 && final_marks >=40){
      result[i]['grade'] = 'D';
      result[i]['gpa'] = 2.70;
    }
    else{
      result[i]['grade'] = 'F';
      result[i]['gpa'] = 0.00;
    }
    
    // const query = ' ';
    //     client.execute(query, [session_id], function(err, result){
    //       if(err){
    //         console.log("error!", err)
    //         res.status(404).send({msg:err});
    //       }
    //       else{
    //         ;
    //       }
    //     });

  }
  //console.log("total marks : ", result);
  //console.log("course: ", offered_course_id)
  
  res.send(result);
});




app.listen(5004, () => {
    console.log("server is connected on port 5004")
})