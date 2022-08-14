CREATES

1.  INSERT INTO smart_card(student_id, card_no, balance, issue, expiry, pin) VALUES(
          1705033, 'hehe', 10.0, totimestamp('2022-01-01'), totimestamp('2022-01-01'), '1234')  IF NOT EXISTS;

    BEGIN BATCH
          INSERT INTO smart_card(student_id, card_no, balance, issue, expiry, pin) VALUES(
          1705037, 'hehe', 10.0, totimestamp('2022-01-01'), totimestamp('2022-01-01'), '1234')  IF NOT EXISTS;
    APPLY BATCH;

2.   INSERT INTO due_payment(student_id, id, amount, due_date, fine, ispaid, transaction, type, creation_date) VALUES(
           1705040, uuid(), 200, totimestamp(now()), 1, false, null, 'bleh', totimestamp(now())) IF NOT EXISTS;

3.  INSERT INTO transactions(id, student_id, card_no, amount, date, type, type_id, trx_id) VALUES(
           uuid(), 1705040, 'bleh', 100.0, totimestamp(now()), 'hehe', uuid(), 'hehe');



DELETES

1.   DELETE FROM due_payment WHERE student_id=1705041 AND id=14bb8afc-77ed-4d5a-a168-0b541e92756c;




UPDATES

1.  UPDATE smart_card SET balance=20, expiry=totimestamp('2022-01-01'), pin='1234' WHERE student_id=1705033;



READS


1. 
CREATE TABLE smart_card(
    student_id int, 
    card_no text, 
    pin text, 
    balance float, 
    issue timestamp, 
    expiry timestamp, 
    PRIMARY KEY(student_id, card_no)
);

INSERT INTO smart_card(student_id, card_no, pin, balance, issue, expiry) VALUES(
        1705041, 'dhummm', '1234', 500.5, totimestamp(now()), '2025-01-01');
INSERT INTO smart_card(student_id, card_no, pin, balance, issue, expiry) VALUES(
        1705031, 'dhummm', '1234', 500.5, totimestamp(now()), '2025-01-01');
INSERT INTO smart_card(student_id, card_no, pin, balance, issue, expiry) VALUES(
        1705034, 'dhummm', '1234', 500.5, totimestamp(now()), '2025-01-01');

"SELECT * FROM smart_card WHERE student_id=? and card_no=?"


2.
CREATE TABLE due_payment(
    id uuid,
    student_id int, 
    type text, 
    amount float, 
    fine float,
    due_date timestamp,
    isPaid boolean,
    creation_date timestamp, 
    PRIMARY KEY(student_id, id)
);

INSERT INTO due_payment(id, student_id, type, amount, fine, due_date, isPaid, creation_date)
    VALUES(uuid(), 1705041, 'scholarship', 5000, 0, NULL, FALSE, totimestamp(NOW()));
INSERT INTO due_payment(id, student_id, type, amount, fine, due_date, isPaid, creation_date)
    VALUES(uuid(), 1705041, 'course', 5000, 0, totimestamp(NOW()), FALSE, totimestamp(NOW()));
INSERT INTO due_payment(id, student_id, type, amount, fine, due_date, isPaid, creation_date)
    VALUES(uuid(), 1705041, 'library', 5000, 10, totimestamp(NOW()), FALSE, totimestamp(NOW()));
INSERT INTO due_payment(id, student_id, type, amount, fine, due_date, isPaid, creation_date)
    VALUES(uuid(), 1705041, 'medical', 5000, 0, totimestamp(NOW()), FALSE, totimestamp(NOW()));


SELECT * FROM due_payment WHERE student_id=1705041;
SELECT * FROM due_payment WHERE student_id=1705041 AND id= 20761a4e-8d2b-4764-b344-f7e3a4f4076b ;



3.
CREATE TABLE transactions(
    id uuid,
    student_id int,
    card_no text, 
    amount float,
    date timestamp,
    type text,              -> cash_in, cash_out, course, scholarship, library, medical 
    type_id uuid,
    trx_id text,
    PRIMARY KEY(student_id, id)
);

INSERT INTO transactions(id, student_id, card_no, amount, date, type, type_id, trx_id)
    VALUES(uuid(), 1705041, 'bleh', 5000, totimestamp(Now()), 'hoise', 20761a4e-8d2b-4764-b344-f7e3a4f4076b, 'hehe');
INSERT INTO transactions(id, student_id, card_no, amount, date, type, type_id)
    VALUES(uuid(), 1705041, 'bleh', 5000, totimestamp(Now()), 'hoise2', 20761a4e-8d2b-4764-b344-f7e3a4f4076b, 'hehe');

SELECT * FROM transactions WHERE student_id=1705041;
SELECT * FROM transactions WHERE student_id=1705041 AND id= 20761a4e-8d2b-4764-b344-f7e3a4f4076b ;



=>> due_payment table e custom type hishebe transaction dhukano

CREATE TYPE payment_transaction(
         id uuid,
         trx_id text,
         card_no text,
         date timestamp
         );

         







