require('dotenv').config();
var mysql = require('mysql');
var express = require('express');
var fs = require('fs');
var session = require('express-session')

var con = mysql.createConnection(
    process.env
);

con.connect(async function (err) {
    if (err) throw err;
    console.log("Connected to database!");


    await new Promise(res => con.query('DROP TABLE customers;', function (err, result) {
        if (err) {
            console.log("Customer table does not exist");
        } else {
            console.log("Dropped Customer table");
        };
        res();
    }));

    await new Promise(res => con.query('DROP TABLE orders;', function (err, result) {
        if (err) {
            console.log("Orders table does not exist");
        } else {
            console.log("Dropped Orders table");
        };
        res();
    }));


    var sql = "CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), password VARCHAR(255))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Customer Table created");
        sql = "INSERT INTO customers (name, password) VALUES ?";
        var values = [
            ['John', '222222'],
            ['Peter', 'abcdef'],
            ['Amy', 'merlin'],
            ['Hannah', 'Ferrari'],
            ['Michael', 'Blahblah'],
            ['Sandy', 'master'],
            ['Betty', '121212'],
            ['Richard', 'donald'],
            ['Susan', 'loveme'],
            ['Vicky', '654321'],
            ['Ben', 'letmein'],
            ['William', '1qaz2wsx'],
            ['Chuck', '1q2w3e']
        ];

        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
    });

    var sql = "CREATE TABLE orders (id INT AUTO_INCREMENT PRIMARY KEY, customerName VARCHAR(255), product VARCHAR(255), address VARCHAR(255), cost float(15,2))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Customer Table created");
        sql = "INSERT INTO orders (customerName, address, product, cost) VALUES ?";
        var values = [
            ['John', 'Highway 71', 'Brush', 12.39],
            ['Peter', 'Lowstreet 4', 'Eggs', 182.35],
            ['Amy', 'Apple st 652', 'Car', 32.99],
            ['Hannah', 'Mountain 21', 'Dog', 9087.57],
            ['Michael', 'Valley 345', 'Computer', 57.93],
            ['Sandy', 'Ocean blvd 2', 'Mutual Fund', 23.52],
            ['Betty', 'Green Grass 1', 'Bond', 987.99],
            ['Richard', 'Sky st 331', 'Shirt', 579.87],
        ];

        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
        });
    });
});

const app = express();

app.use(express.static('public'))

var sess = {
    secret: 'fnr5e3iuypvh32erq78yochb3eiuypfvchbneui9',
    cookie: {}
}

app.use(session(sess))

app.get('/', async (req, res) => {
    const responsePage = await fs.promises.readFile('./login.html', { encoding: 'utf-8' });
    res.send(responsePage);
});

app.get('/login', (req, res) => {
    const name = req.query.uname;
    const password = req.query.psw;

    console.log(`Login: U: ${name} P: ${password}`);

    con.query(`SELECT * FROM customers WHERE name = '${name}' AND password = '${password}';`, function (err, result) {
        if (err) {
            console.log('ERROR');
            return res.redirect('/');
        }

        if (result.length == 0) {
            res.redirect('/?error=no_account')
        } else {
            req.session.user = result;
            res.redirect('/welcome')
        };
    });
});

app.get('/welcome', (req, res) => {
    if (req.session.user == null) return res.redirect('/');
    res.send(`<h1>Welcome back <ul>${req.session.user.map(e => '<li>' + Object.values(e).join(', ') + '</li>')}</ol></h1><a href="logout">logout</a>`);
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(3283, '0.0.0.0', () => {
    console.log("App is online");
});