const express = require('express')
const app = express()
const cors = require('cors')

app.use(express.json());
app.use(cors());

var cassandra = require('cassandra-driver');

var client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter:'datacenter1',
  keyspace: 'ums'
});


app.post('/save_book', (req, res, next) => {
  const book_name = req.body.book_name;
  const author_name = req.body.author_name;
  const quantity = req.body.quantity;
  console.log('dhuklam server e');
 
  const query = 'INSERT INTO books (id, name, author, quantity) VALUES (uuid(), ?, ?, ?)';
  client.execute(query, [book_name, author_name, quantity], { prepare : true }, function(err, result){
    if(err){
        console.log('I am in error');
        res.send(err);
    }
    else{
        console.log('Its working');
        res.send(result);
    }
  });
  
});

app.get('/get_books', (req, res, next) => {
    const query = "SELECT * FROM books;"
    client.execute(query, function(err, result){
        if(err){
            console.log("error e dhuksi")
        }
        else{
            res.send({
                'results': result.rows,
            })
        }
    });
    
  });

  app.get('/get_borrowed_books', (req, res, next) => {
    const query = "SELECT * FROM student_book_borrow;"
    client.execute(query, function(err, result){
        if(err){
            console.log("error e dhuksi")
        }
        else{
            res.send({
                'results': result.rows,
            })
        }
    });
    
  });

  app.get('/get_student_borrowed_books', (req, res, next) => {
    const student_id = req.query.logged_in;
    const query = "SELECT * FROM student_book_borrow;"
    client.execute(query, function(err, result){
        if(err){
            console.log("error e dhuksi")
        }
        else{
          const arr=[];
          console.log("get student borrowed books e dhuklum")
          for(let i=0; i<result.rows.length; i++){
            if(result.rows[i].student_id == student_id){
              arr.push(result.rows[i]);
              
            }
          }
          console.log(arr)
            res.send({
                'results': arr,
            })
        }
    });
    
  });

  app.post('/update_books', (req, res, next) => {
    const id = req.body.id;
    const quantity = req.body.quantity;
    console.log('id : ', id);
    console.log('quantity : ', quantity)
    const query = 'UPDATE BOOKS SET quantity=? where id=?;';
    client.execute(query, [quantity, id], { prepare : true }, function(err, result){
      if(err){
          console.log('I am in error');
          res.send(err);
      }
      else{
          console.log('Its working');
          res.send(result);
      }
    });
    
  });

  app.post('/update_borrow_info', (req, res, next) => {
    const id = req.body.id;
    let is_returned = req.body.is_returned;
    if(is_returned == 'on')
        is_returned = true;
    else
        is_returned = false;
    console.log('id : ', id);
    console.log('is_returned : ', is_returned)
    const query = 'UPDATE  student_book_borrow SET is_returned=? where id=?;';
    client.execute(query, [is_returned, id], { prepare : true }, function(err, result){
      if(err){
          console.log('I am in error');
          res.send(err);
      }
      else{
          console.log('Its working');
          res.send(result);
      }
    });
    
  });



  app.post('/grant_book', (req, res, next) => {
    const book_name = req.body.book_name;
    const student_id = req.body.student_id;
    const date = req.body.date;
    console.log('book id : ', book_name);
    console.log('due date : ', date)
    const query = 'INSERT INTO student_book_borrow (id, student_id, book_name, due_date, is_returned) VALUES (uuid(), ?, ?, ?, False)';
    client.execute(query, [student_id, book_name, date], { prepare : true }, function(err, result){
      if(err){
          console.log('I am in error');
          res.send(err);
      }
      else{
          console.log('Its working');
          res.send(result);
      }
    });
    
  });

app.listen(5009, () => {
    console.log("server is connected on port 5009")
})