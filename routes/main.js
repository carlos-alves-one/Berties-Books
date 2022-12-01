// Goldsmiths University of London
// Author....: Carlos Manuel de Oliveira Alves
// Student...: cdeol003
// Created...: 21/11/2022
// Lab No....: 4

// declare variable for bcrypt
const bcrypt = require('bcrypt');

// declare variable for request
const request = require('request');

// --->>> Handle our routes .......................................................................................................................

// define the routes
module.exports = function (app, shopData) {
  // declare variable to validate email
  const { check, validationResult, Result } = require('express-validator');

  // declare variable to redirect login
  const redirectLogin = (req, res, next) => {
    // check the user didn't started a new session
    if (!req.session.userId) {
      // if not true redirect to login
      res.redirect('./login');
    }
    // user already started a new session
    else {
      next();
    }
  };

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
  app.get('/search', redirectLogin, function (req, res) {
    res.render('search.ejs', shopData);
  });

  // use the Express Router to handle our routes
  app.get(
    '/search-result',

    [check('keyword').isLength({ min: 3 })],
    [
      check('keyword')
        // use sanitize to trim the input
        .trim()
        // use sanitize to escape the input
        .escape()
        .isAlphanumeric()
        .withMessage('Book name must be alphanumeric'),
    ],

    function (req, res) {
      // store the errors in a dictionary
      const errors = validationResult(req);

      // check we have errors in the dictionary
      if (!errors.isEmpty()) {
        // print errors dictionary for debug purposes
        console.log(errors);

        // print error message
        console.log('>>> ERROR: Please enter again the data');

        // redirect to the search page
        res.redirect('/search');

        // exit the function
      } else {
        // searching in the database
        let sqlquery =
          "SELECT * FROM books WHERE name LIKE '%" +
          req.sanitize(req.query.keyword) +
          "%'";

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
      }
    }
  );

  // --->>> DELETE A USER ............................................................................................................................

  // use the Express Router to handle our routes
  app.get('/deleteUser', redirectLogin, function (req, res) {
    // render the deletion page
    res.render('deleteUser.ejs', shopData);

    // use the Express Router to handle our routes
    app.post(
      '/deleted',
      [check('keyword').isLength({ min: 3 })],
      [
        check('keyword')
          // use sanitize to trim the input
          .trim()
          // use sanitize to escape the input
          .escape()
          .isAlphanumeric()
          .withMessage('Username must be alphanumeric'),
      ],

      function (req, res) {
        // store the errors in a dictionary
        const errors = validationResult(req);

        // check we have errors in the dictionary
        if (!errors.isEmpty()) {
          // print errors dictionary for debug purposes
          console.log(errors);

          // print error message
          console.log('>>> ERROR: Please enter again the data');

          // redirect to the deletion page
          res.redirect('./deleteUser');
        } else {
          // query database to get the username to delete and sanitize it
          let sqlquery =
            "DELETE FROM users WHERE username='" +
            req.sanitize(req.body.keyword) +
            "'";

          // query database to get all the books
          deletedUser = req.sanitize(req.body.keyword);

          // execute sql query
          db.query(sqlquery, (err, result) => {
            // if error
            if (err || result.affectedRows == 0) {
              // throw error
              // render the delete error page
              res.render('deleteError.ejs', shopData);

              // print the error message
              console.log(
                '>>> ERROR: The username ' +
                  req.body.keyword +
                  ' does not exist'
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
        }
      }
    );
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

  // --->>> Helper function .........................................................................................................................

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
  app.post(
    '/registered',

    // check is a valid email
    [
      check('email')
        // use sanitize ensures the email address is in a safe and standard format
        .normalizeEmail(),
    ],

    // check if the password is not empty
    [check('password').not().notEmpty().withMessage('Password is required')],

    // check if the username is not empty and at least 5 characters
    [
      check('username')
        .notEmpty()
        // use sanitize to trim the username
        .trim()
        // use sanitize to escape the username
        .escape()
        .withMessage('Username is required')
        .isLength({ min: 5 })
        .withMessage('Username must be at least 5 characters long'),
    ],

    // check the password must be 8+ chars long and contain a number
    [
      check(
        'password',
        'The password must be 8+ chars long and contain a number'
      )
        // use sanitize to trim the password
        .trim()
        // use sanitize to escape the password
        .escape()
        .not()
        .isIn(['123', 'password', 'abc123'])
        .withMessage('Do not use a common word as the password. ')
        .isLength({ min: 8 })
        .matches(/\d/)
        .withMessage('Must contain a number. '),
    ],

    // call function request and response
    function (req, res) {
      // store the errors in a dictionary
      const errors = validationResult(req);

      // check we have errors in the dictionary
      if (!errors.isEmpty()) {
        // redirect to register page
        res.redirect('./register');

        // print errors dictionary for debug purposes
        console.log(errors);

        // check we have an invalid email
        if (errors.errors[0].param == 'email') {
          console.log(
            '>>> ERROR: Email is invalid. Please enter again the data'
          );
        }

        // check we have an invalid password length
        if (
          errors.errors[0].param == 'password' ||
          errors.errors[1].param == 'password'
        ) {
          console.log(
            '>>> ERROR: The password must be 8+ chars long and contain a number. Please enter again'
          );
        }

        // check username is different from password
        if (req.body.username == req.body.password) {
          console.log(
            '>>> ERROR: The password and username cannot be the same. Please enter again'
          );
        }

        // we have a valid input
      } else {
        // declare variables to use with the function hash of bcrypt
        const saltRounds = 10;
        const plainPassword = req.body.password;

        // hash the password
        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
          // sanitize the input
          let username = req.sanitize(req.body.username);
          let firstname = req.sanitize(req.body.firstname);
          let lastname = req.sanitize(req.body.lastname);
          let email = req.sanitize(req.body.email);

          // declare array initialvalues to store data
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
              // print welcome message on the console
              console.log(
                '# Hello ' +
                  req.body.firstname +
                  ' ' +
                  req.body.lastname +
                  ' you are now registered!'
              );

              // more print messages
              console.log(
                '# You will receive an email at..: ' + req.body.email
              );
              console.log(
                '# Your username is..............: ' + req.body.username
              );
              console.log(
                '# Your password is..............: ' + req.body.password
              );
              console.log(
                '# Hashed password is............: ' + hashedPassword
              );

              // store the username in a variable to be used with the EJS pages
              loggedinuser = req.body.username;

              // render the new user page
              res.render('newUser.ejs', shopData);
            }
          });
        });
      }
    }
  );

  // --->>> LIST ALL BOOKS ..........................................................................................................................

  // use the Express Router to handle our routes
  app.get('/list', redirectLogin, function (req, res) {
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
      // );
    });
  });

  // --->>> LIST ALL MY BOOKS WITH API .................................................................................................................

  // use the Express Router to handle our routes
  app.get('/api', function (req, res) {
    // Query database to get all the books
    let sqlquery = 'SELECT * FROM books';
    // Execute the sql query
    db.query(sqlquery, (err, result) => {
      if (err) {
        res.redirect('./');
      }
      // Return results as a JSON object
      res.json(result);
    });
  });

  // --->>> LIST MY FRIEND'S BOOKS WITH API .................................................................................................................

  // use the Express Router to handle our routes
  app.get('/friendBook-Search', function (req, res) {

    // render the friendBookSearch page
    res.render('friendBook-Search.ejs', shopData);

  });

  // use the Express Router to handle our routes
  app.post(
    '/friendBook-Search',
    function (req, res) {

      // store the errors in a dictionary
      const errors = validationResult(req);

      // check we have errors in the dictionary
      if (!errors.isEmpty()) {

        // print errors dictionary for debug purposes
        console.log(errors);

        // print error message
        console.log('>>> ERROR: Please enter again the data');

        // redirect to the search page
        res.redirect('/friendBook-Search');

        // we have a valid input
      } else {

        // store the book to search in the dictionary of books
        findBook = req.body.keyword;

        // declare the url to call the API using the local host
        // let url = `http://localhost:8000/api`;

        // declare the url to call the API from a friend
        let url = `https://www.doc.gold.ac.uk/usr/104/api`;

        // return the books data from the api
        request(url, function (err, response, body) {

          // if error
          if (err) {

            // print error message
            console.log('error:', error);

            // if no error
          } else {

            // convert the body to a JSON object
            var books = JSON.parse(body);

            // define the data to pass to the view
            if (books !== undefined) {

              // print data from my friend's books
              console.log(books);

              // variable to store the index of the book if found successfully
              var foundBook_index;

              // declare function to search for a book
              function checkBook(name) {

                return books.some(function (gfg, currElem) {

                  // store the index of the book if found successfully
                  // if not found it will store 9
                  foundBook_index = currElem;

                  // return true or false if found successfully
                  return gfg.name === name;
                });
              }
              // messages to print if the book is found and the index of the book
              console.log(checkBook(findBook));
              console.log(foundBook_index);

              // if the book is not found
              if (!checkBook(findBook)) {

                // print error message
                console.log('>>> ERROR: Book not found. Please enter again');

                // define the data to pass to the view
                let newData = Object.assign({}, shopData, { books: books });

                // render my friend's books' API page with all the books
                res.render('friendBooks.ejs', newData);
              } else {

                // define the data to pass to the view
                book_id = books[foundBook_index].id;
                book_name = books[foundBook_index].name;
                book_price = books[foundBook_index].price;

                // render my friend's books' API page with the book found
                res.render('friendBook-Found.ejs', shopData);
              }
              // if error
            } else {
              res.send('>>> ERROR: API not working. Please try again later');
            }
          }
        });
      }
    }
  );

  // --->>> LIST ALL USERS ..........................................................................................................................

  // use the Express Router to handle our routes
  app.get('/listusers', redirectLogin, function (req, res) {
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
  app.get('/addbook', redirectLogin, function (req, res) {
    // render the add book page
    res.render('addbook.ejs', shopData);
  });
  app.post(
    '/bookadded',
    [
      // validate the name with the check function
      check('name')
        // use sanitize to trim the name
        .trim()
        // use sanitize to escape the name
        .escape()
        .isAlphanumeric()
        .withMessage('Name of the book must be alphanumeric')
        .isLength({ min: 3 })
        .withMessage('Name the of the book must be at least 3 characters long'),
    ],
    [
      // validate the price with the check function
      check('price')
        // use sanitize to trim the price
        .trim()
        // use sanitize to escape the price
        .escape()
        .isLength({ min: 1 })
        .withMessage('Price must be at least 1 character long')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be at least 0.01'),
    ],

    function (req, res) {
      // store the errors in a dictionary
      const errors = validationResult(req);

      // check we have errors in the dictionary
      if (!errors.isEmpty()) {
        // print errors dictionary for debug purposes
        console.log(errors);

        // print error message
        console.log('>>> ERROR: Please enter again the data');

        res.redirect('./addbook');
      } else {
        // saving data in database
        let sqlquery = 'INSERT INTO books (name, price) VALUES (?,?)';

        // execute sql query and sanitize the input
        let newrecord = [
          req.sanitize(req.body.name),
          req.sanitize(req.body.price),
        ];

        // execute sql query
        db.query(sqlquery, newrecord, (err, result) => {
          // if error
          if (err) {
            // throw error
            return console.error(err.message);

            // if not error
          }

          // print message
          else
            res.send(
              ' This book is added to database, name: ' +
                req.body.name +
                ' price ' +
                req.body.price
            );
        });
      }
    }
  );

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
    let params = [
      req.sanitize(req.body.username),
      req.sanitize(req.body.password),
    ];

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
        db.query(sqlquery, [req.sanitize(req.body.username)], (err, result) => {
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
              loggedinuser = req.sanitize(req.body.username);

              // Save user session here, when login is successful
              req.session.userId = req.sanitize(req.body.username);

              // render the logged in page
              res.render('loggedin.ejs', shopData);

              // if error
            } else {
              // print message
              console.log('>>> Your password is incorrect');

              // store the username in a variable to be used with the EJS pages
              loggedinuser = req.sanitize(req.body.username);

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
        loggedinuser = req.sanitize(req.body.username);

        // render the logged out page
        res.render('loggedout.ejs', shopData);
      }
    });
  });

  // --->>> BARGAIN ...............................................................................................................................

  // use the Express Router to handle our routes
  app.get('/bargains', redirectLogin, function (req, res) {
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

  // --->>> LOGOUT ...............................................................................................................................

  // use the Express Router to handle our routes
  app.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.redirect('./');
      }
      res.send('you are now logged out. <a href=' + './' + '>Home</a>');
    });
  });

  // --->>> ADD A WEATHER ..........................................................................................................................

  // use the Express Router to handle our routes
  app.get('/weather', function (req, res) {
    // render the weather page
    res.render('weather.ejs', shopData);

    // use the Express Router to handle our routes
    app.post(
      '/weather',

      function (req, res) {
        // store the errors in a dictionary
        const errors = validationResult(req);

        // check we have errors in the dictionary
        if (!errors.isEmpty()) {
          // print errors dictionary for debug purposes
          console.log(errors);

          // print error message
          console.log('>>> ERROR: Please enter again the data');

          // render the weather page
          res.redirect('./weather');

          // if not error
        } else {
          // declare variables to access data remote server using api key
          let apiKey = '03ff526c9c64438e2583cd241976dbcc';
          let city = req.body.city;
          let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

          // return the weather data from the api
          request(url, function (err, response, body) {
            // if error
            if (err) {
              console.log('error:', error);

              // if not error
            } else {
              // declare variable to store data
              var weather = JSON.parse(body);

              // check if the city is not found
              if (weather !== undefined && weather.main !== undefined) {
                // print data from weather selected
                console.log(weather);

                // select and store data from weather
                country = weather.sys.country;
                citySelected = city;
                temp = weather.main.temp;
                tempMin = weather.main.temp_min;
                tempMax = weather.main.temp_max;
                feelsLike = weather.main.feels_like;
                description = weather.weather[0].description;
                cloudiness = weather.clouds.all;
                windSpeed = weather.wind.speed;
                groundLevel = weather.main.grnd_level;
                humidity = weather.main.humidity;

                // render the weather result page
                res.render('weatherSelected.ejs', shopData);

                // if error
              } else {
                // print error message
                res.send('>>> ERROR: City not found please try again');
              }
            }
          });
        }
      }
    );
  });

  // --->>> TV SHOWS ..........................................................................................................................

  // use the Express Router to handle our routes
  app.get('/tvShows', function (req, res) {
    // render the tv shows page
    res.render('tvShows.ejs', shopData);

    // use the Express Router to handle our routes
    app.post(
      '/tvShows',

      function (req, res) {
        // store the errors in a dictionary
        const errors = validationResult(req);

        // check we have errors in the dictionary
        if (!errors.isEmpty()) {
          // print errors dictionary for debug purposes
          console.log(errors);

          // print error message
          console.log('>>> ERROR: Please enter again the data');

          // render the TV Show page
          res.redirect('./tvShows');

          // if not error
        } else {
          // declare variables to access data remote server
          show = req.body.show;
          let url = `https://api.tvmaze.com/search/shows?q=${show}`;

          // return the tv shows data from the api
          request(url, function (err, response, body) {
            // if error
            if (err) {
              // print error message
              console.log('error:', error);

              // if not error
            } else {
              // store the data in a variable
              var tvShows = JSON.parse(body);

              // check if the data is not undefined
              if (tvShows.length > 0) {
                // print data from shows selected
                console.log(tvShows);

                // select and store data from tv shows
                showSelected = show;
                showName = tvShows[0].show.name;
                showLanguage = tvShows[0].show.language;
                showGenres = tvShows[0].show.genres;
                showStatus = tvShows[0].show.status;
                showRuntime = tvShows[0].show.runtime;
                showPremier = tvShows[0].show.premiered;
                showEnded = tvShows[0].show.ended;
                showOfficial = tvShows[0].show.officialSite;

                // render the TV Show result page
                res.render('showSelected.ejs', shopData);

                // if error
              } else {
                res.send('>>> ERROR: TV Show not found please try again');
              }
            }
          });
        }
      }
    );
  });
};
