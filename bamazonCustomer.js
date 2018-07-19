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
table();
// function which prompts the user for what action they should take

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
function start() {
    inquirer
        .prompt([{
            name: "itemId",
            type: "input",
            message: "What is the item number of the product you would like to purchase?",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }},

            {
            name: "quantity",
            type: "input",
            message: "How many would you like?",
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
                if (parseInt(res[0].stock_quantity) < answer.quantity) {
                    console.log("Insufficient quantity! Please place a different order.");
                    table();
                }
                else {
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                          {
                            stock_quantity: parseInt(res[0].stock_quantity) - answer.quantity
                          },
                          {
                            item_id: answer.itemId
                          }
                        ],
                        function(error) {
                          if (error) throw err;
                          console.log("Your order has been placed!");
                          table();
                          
                        }
                      );
                }
            });
        });
};
