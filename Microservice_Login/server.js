const express = require('express')
const app = express()
const cors = require('cors')
const {v4 : uuidv4} = require('uuid')


const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')



app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true

}));


app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
  key: 'userID',
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 60*60*24
  },
}))


var cassandra = require('cassandra-driver');
var logged_in = ""

var client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter:'datacenter1',
  keyspace: 'ums'
});



app.get('/api', function(req, res, next) {
  const query = 'SELECT * FROM Student_by_student_id';
    client.execute(query, [], function(err, result){
      if(err){
        res.status(404).send({msg:err});
      }
      else{
        console.log("landing page result:", result);
        res.json({
          'results': result.rows,
        })
      }
    })
  });


app.post('/reg', (req, res, next) => {
  const student_id = req.body.usernameReg;
  const username = req.body.usernameReg;
  const password = req.body.passwordReg;

  const query = "INSERT INTO Student_by_student_id(student_id, username, password) VALUES (?, ?, ?)";
  client.execute(query, [student_id, username, password], function(err, result){
          console.log(err);
        })
})

app.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = "SELECT * from Student_by_student_id WHERE student_id = ?";
  client.execute(query, [username], function(err, result){
    if(err){
      res.status(404).send({msg:err});
    }
    else{
      console.log("inside the post login method:", result.rows);
      //console.log("database er password :", result.rows[0].password);
      if(result.rows.length > 0){
      if(result.rows[0].password === password){
        logged_in = result.rows[0].username
        
        req.session.user = result;
        console.log("after session: ", req.session.user)
        res.send({
          'result': "approved",
          'id': result.rows[0].username,
        })
      } else{
        res.send({
          'result': "declined",
        })
      }
      } else{
        res.send({
          'result': "declined",
        })
      }
    }
  })
})


app.get('/login', (req, res)=>{
  if(req.session.user){
    console.log("in login get")
    res.send({
      loggedIn: true,
      userID: req.session.user.rows[0].username,
    })
  }
  else{
    res.send({
      loggedIn: false,
    })
  }
})

app.post('/edit_profile', (req, res, next) => {
  var name = req.body.name;
  var birthCertificatNo = req.body.birthCertificatNo;
  var dob = req.body.dob;
  var gender = req.body.gender;
  var email = req.body.email;
  var nid = req.body.nid;
  var phone = req.body.phone;
  var religion = req.body.religion;
  var id = req.body.id;
  console.log("id = ", id, name, birthCertificatNo, phone);
  const query = "UPDATE Personal_info SET name = ?, birth_certificate_no = ?, dob = ?, gender = ?, gmail = ?, nid = ?, phone = ?, religion = ? WHERE id = ?";
  client.execute(query, [name, birthCertificatNo, dob, gender, email, nid, phone, religion, id], function(err, result){
    if(err){
      res.status(404).send({msg:err});
    }
    else{
        res.send({
          'result': "success",
        })
      
    }
  })
})


app.get('/profile', function(req, res, next) {
  var dict;
  const query = "SELECT * FROM Student_by_student_id WHERE student_id = ?";
  
  client.execute(query, [logged_in], function(err, result){
    if(err){
      console.log("i am in error")
      res.status(404).send({msg:err});
      dict = err
    }
    else{
      console.log("profile result:", result.rows);
      dict = result.rows;


      console.log("hello there")
      console.log("personal info id = ", dict[0].personal_info_id);
      const query2 = 'SELECT * FROM Personal_info WHERE id = ?';
      
      client.execute(query2, [dict[0].personal_info_id], function(err, result){
        if(err){
          console.log("inside err 2");
          res.status(404).send({msg:err});
        }
        else{
          console.log("result:", result);
          res.send({
            'results': result.rows,
            'student_id': logged_in,
          })
        }
      })
    }
  })
  
  

});

app.listen(5000, () => {
    console.log("server is connected on port 5000")
})