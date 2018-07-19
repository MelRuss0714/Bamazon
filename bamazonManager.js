var mysql = require("mysql");
var Table = require('cli-table');
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
});
function start() {
    inquirer
    .prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ["1: View Products for Sale", "2: View Low Inventory", "3: Add to Inventory", "4: Add New Product"],
            name: 'choice'
        },
    ]).then(function (inquirerResponse) {
        if(inquirerResponse.choice === '1: View Products for Sale') {
            table();
        }
        else if (inquirerResponse.choice === '2: View Low Inventory') {
            lowInventory();
        }
        else if (inquirerResponse.choice === '3: Add to Inventory') {
            addInventory();
        }
        else if (inquirerResponse.choice === '4: Add New Product') {
            newProduct();
        }
    })
}
start();
function table() {
    connection.query("SELECT * FROM products;", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        for (i = 0; i < res.length; i++) {
            var table = new Table({
                head: ['Item Id', 'Product', 'Department', 'Price', 'Quantity in Stock']
                , colWidths: [10, 25, 25, 10, 10]
            });

            // table is an Array, so you can `push`, `unshift`, `splice` and friends
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );

            console.log(table.toString());
            
        }
        start();
    });
};
function lowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 150;", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        for (i = 0; i < res.length; i++) {
            var table = new Table({
                head: ['Item Id', 'Product', 'Department', 'Price', 'Quantity in Stock']
                , colWidths: [10, 25, 25, 10, 10]
            });

            // table is an Array, so you can `push`, `unshift`, `splice` and friends
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
            );

            console.log(table.toString());
            
        }
        start();
    });
};
function addInventory() {
    inquirer
        .prompt([{
            name: "itemId",
            type: "input",
            message: "What is the item number of the product you would like to add inventory to?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }},

            {
            name: "quantity",
            type: "input",
            message: "How many would you like to add?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            
            }
            }])
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            connection.query("SELECT stock_quantity FROM products WHERE item_id =" + answer.itemId + ";", function (err, res) {
                if (err) throw err;
                // Log all results of the SELECT statement
                
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                          {
                            stock_quantity: parseInt(res[0].stock_quantity) + parseInt(answer.quantity)
                          },
                          {
                            item_id: answer.itemId
                          }
                        ],
                        function(error) {
                          if (error) throw err;
                          console.log("The inventory has been added!");
                          start();
                          
                        }
                      );
                
            });
        });
};
function newProduct() {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is your Product Name?"
        },
        {
            type: "input",
            name: "department",
            message: "What department does it belong to?"
        },
        {
            type: "input",
            name: "price",
            message: "What is the price?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            type: "input",
            name: "quantity",
            message: "How many are you adding to the inventory?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ])
    .then(function (answer) {  
        connection.query('INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ("' + answer.name + '", "' + answer.department + '", ' + answer.price + ', ' + answer.quantity + ' );', function (err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
                        console.log("The product has been added!");
            start();
            
        });
    });
    };