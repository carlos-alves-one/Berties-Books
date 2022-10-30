// Goldsmiths University of London
// Author....: Carlos Manuel de Oliveira Alves
// Student...: cdeol003
// Created...: 27/10/2022
// Lab No....: 2 Part 1

// declare variable for bcrypt
const bcrypt = require('bcrypt');

// --->>> Handle our routes .......................................................................................................................

// define the routes
module.exports = function (app, shopData) {

  // use the Express Router to handle our routes
  app.get('/', function (req, res) {

    // render the index page
    res.render('index.ejs', shopData);
  });

  // use the Express Router to handle our routes
  app.get('/about', function (req, res) {

    
    res.render('about.ejs', shopData);
  });

  // --->>> SEARCH BOOK RESULT .......................................................................................................................

  // use the Express Router to handle our routes
  app.get('/search', function (req, res) {

    // get the search term from the URL
    res.render('search.ejs', shopData);
  });

  // use the Express Router to handle our routes
  app.get('/search-result', function (req, res) {

    // searching in the database
    let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'";

    // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {

      // if error
      if (err) {

        // throw error
        res.redirect('./');
      }

      // define the data to pass to the view
      let newData = Object.assign({}, shopData, { availableBooks: result });

      // print message
      console.log(newData);

      // render the list page
      res.render('list.ejs', newData);
    });
  });

  // --->>> DELETE A USER ............................................................................................................................

  // use the Express Router to handle our routes
  app.get('/deleteUser', function (req, res) {

    // render the deletion page
    res.render('deleteUser.ejs', shopData);

    // use the Express Router to handle our routes
    app.post('/deleted', function (req, res) {

      // query database to get the username to delete
      let sqlquery = "DELETE FROM users WHERE username='" + req.body.keyword + "'";

      // query database to get all the books
      deletedUser = req.body.keyword;

      // execute sql query
      db.query(sqlquery, (err, result) => {

        // if error
        if (err || result.affectedRows == 0) {

          // throw error
          // render the delete error page
          res.render('deleteError.ejs', shopData);

          // print the error message
          console.log(
            '>>> ERROR: The username ' + req.body.keyword + ' does not exist'
          );

        // if not error
        } else {

          // render the user deleted page
          res.render('userDeleted.ejs', shopData);

          // print the message
          console.log(
            '>>> The username ' + req.body.keyword + ' has been deleted'
          );
        }
      });
    });
  });

  // --->>> REGISTER NEW USER ........................................................................................................................

  // use the Express Router to handle our routes
  app.get('/register', function (req, res) {

    // declare array initialvalues to store data
    let initialvalues = {
      username: '',
      firstname: '',
      lastname: '',
      email: '',
      username: '',
      password: '',
    };

    // pass the data to the EJS page and view it
    return renderRegisteruser(res, initialvalues, '');
  });

  // --->>> Helper function

  // function to render the register user page
  function renderRegisteruser(res, initialvalues, errormessage) {

    // store the data in the shopData object
    let data = Object.assign({}, shopData, initialvalues, {
      errormessage: errormessage,
    });

    // render the register page
    res.render('register.ejs', data);

    // return the data
    return;
  }

  // use the Express Router to handle our routes
  app.post('/registered', function (req, res) {

    // declare variables to use with the function hash of bcrypt
    const saltRounds = 10;
    const plainPassword = req.body.password;

    // hash the password
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {

      // declare array params to store data
      var params = [
        req.body.username,
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        hashedPassword,
      ];

      // query database to create a new record
      sqlquery =
        'INSERT INTO users (username, firstname, lastname, email, hashedPassword) VALUES (?,?,?,?,?)';

      // execute sql query
      db.query(sqlquery, params, (err, result) => {

        // if error
        if (err) {

          // return error
          return console.error(err.message);
          
        // if not error
        } else {

          // initial code:
          // result =
          //   '>>> Hello ' +
          //   req.body.firstname +
          //   ' ' +
          //   req.body.lastname +
          //   ' you are now registered!' +
          //   ' >>> We will send an email to you at ' +
          //   req.body.email +
          //   ' >>> Your username is ' +
          //   req.body.username +
          //   ' >>> Your password is: ' +
          //   req.body.password +
          //   ' >>> Your hashed password is: ' +
          //   hashedPassword;
          // res.send(result);

          // new code:
          // print message
          console.log(
            '# Hello ' +
              req.body.firstname +
              ' ' +
              req.body.lastname +
              ' you are now registered!'
          );

          // more print messages
          console.log('# You will receive an email at..: ' + req.body.email);
          console.log('# Your username is..............: ' + req.body.username);
          console.log('# Your password is..............: ' + req.body.password);
          console.log('# Hashed password is............: ' + hashedPassword);
          
          // store the username in a variable to be used with the EJS pages
          loggedinuser = req.body.username;

          // render the new user page
          res.render('newUser.ejs', shopData);
        }
      });
    });
  });

  // --->>> LIST ALL BOOKS ..........................................................................................................................

  // use the Express Router to handle our routes
  app.get('/list', function (req, res) {

    // query database to get all the books
    let sqlquery = 'SELECT * FROM books';

    // query database to get all the books
    // execute sql query
    db.query(sqlquery, (err, result) => {
    
      // if error
      if (err) {

        // throw error
        res.redirect('./');
      }

      // define the data to pass to the view
      let newData = Object.assign({}, shopData, { availableBooks: result });

      // print message
      console.log(newData);

      // render the list page
      res.render('list.ejs', newData);
    });
  });

  // --->>> LIST ALL USERS ..........................................................................................................................

  // use the Express Router to handle our routes
  app.get('/listusers', function (req, res) {

    // query database to get all the books
    sqlquery = 'SELECT * FROM users';

    // query database to get all the users
    db.query(sqlquery, (err, result) => {

      // if error
      if (err) {

        // throw error
        res.redirect('./');
      }

      // define the data to pass to the view
      let newData = Object.assign({}, shopData, { userslist: result });

      // print message
      console.log(newData);

      // render the list users page
      res.render('listusers.ejs', newData);
    });
  });

  // --->>> ADD A NEW BOOK ..........................................................................................................................

  // use the Express Router to handle our routes
  app.get('/addbook', function (req, res) {

    // render the add book page
    res.render('addbook.ejs', shopData);
  });
  app.post('/bookadded', function (req, res) {

    // saving data in database
    let sqlquery = 'INSERT INTO books (name, price) VALUES (?,?)';

    // execute sql query
    let newrecord = [req.body.name, req.body.price];

    // execute sql query
    db.query(sqlquery, newrecord, (err, result) => {

      // if error
      if (err) {

        // throw error
        return console.error(err.message);

      // if not error
      } else

        // print message
        res.send(
          ' This book is added to database, name: ' +
            req.body.name +
            ' price ' +
            req.body.price
        );
    });
  });

  // --->>> LOGIN ...................................................................................................................................

  // use the Express Router to handle our routes
  app.get('/login', function (req, res) {

    // render the login page
    res.render('login.ejs', shopData);
  });

  // --->>> LOGGED IN ...............................................................................................................................

  // use the Express Router to handle our routes
  app.post('/loggedin', function (req, res) {

    // declare array params to store data
    let params = [req.body.username, req.body.password];

    // query database to get all the books
    sqlquery = 'SELECT username FROM users WHERE username = ? ';

    // execute sql query
    db.query(sqlquery, params, (err, result) => {

      // if error
      if (err) {

        // return console.error(err.message);
        res.render('login.ejs', shopData);
      }

      // if not error
      if ((username = result[0])) {

        // print message
        console.log('Your username is correct');

        // declare variable to store password
        let password = req.body.password;

        // query database to get all the books
        sqlquery = 'SELECT hashedPassword FROM users WHERE username = ?';

        // execute sql query
        db.query(sqlquery, [req.body.username], (err, result) => {

          // declare variable to store hashed password
          let hashedPassword = result[0].hashedPassword;

          // use function compare of bcrypt to compare the password with the hashed password
          bcrypt.compare(password, hashedPassword, function (err, result) {

            // if error
            if (err) {

              // throw error
              return console.error(err.message);
              
            // if not error
            } else if (result == true) {

              // print message
              console.log('>>> Your password is correct');

              // store the username in a variable to be used with the EJS pages
              loggedinuser = req.body.username;

              // render the logged in page
              res.render('loggedin.ejs', shopData);

            // if error
            } else {

              // print message
              console.log('>>> Your password is incorrect');

              // store the username in a variable to be used with the EJS pages
              loggedinuser = req.body.username;

              // render the wrong key page
              res.render('wrongKey.ejs', shopData);
            }
          });
        });

      // if error
      } else {
        
        // print message
        console.log('>>> This username does not exist.');

        // store the username in a variable to be used with the EJS pages
        loggedinuser = req.body.username;

        // render the logged out page
        res.render('loggedout.ejs', shopData);
      }
    });
  });

  // --->>> BARGAIN ...............................................................................................................................

  // use the Express Router to handle our routes
  app.get('/bargains', function (req, res) {

    // query database to get all the books less than £20
    let sqlquery = 'SELECT * FROM books WHERE price < 20';

    // execute sql query
    db.query(sqlquery, (err, result) => {

      // if error
      if (err) {

        // throw error
        res.redirect('./');
      }

      // define the data to pass to the view
      let newData = Object.assign({}, shopData, { availableBooks: result });

      // print message
      console.log(newData);

      // render the bargains page
      res.render('bargains.ejs', newData);
    });
  });
};
