var mysql = require('mysql');
var dotenv = require('dotenv');
const { createCanvas } = require('canvas');
const fs = require('fs');

dotenv.config();    


const host = process.env.HOST_IP;
const username = process.env.USER_NAME;
const password = process.env.PASSWORD;
const db_name = process.env.DB_NAME;

var con = mysql.createConnection({
  host: host,
  user: username,
  password: password,
  database: db_name
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

let sql = `
SELECT 
  SUM(status = 'Completed') AS completed_count,
  SUM(status = 'Cancelled') AS cancelled_count,
  SUM(status = 'Pending') AS pending_count
FROM 
  case_schedules
WHERE 
  updated_at > NOW() - INTERVAL 1 DAY;
`;


con.query(sql, (error, results) => {
    if (error) return console.error(error.message);
  
    const { completed_count, cancelled_count, pending_count } = results[0];
    generateReport(completed_count, cancelled_count, pending_count);
    console.log("Chart generated successfully.");
  });
  

  function generateReport(completedCount, cancelledCount, PendingCount) {
    const width = 800;
    const height = 500;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);

    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#2a769b');
    gradient.addColorStop(1, '#ec3a78');

    context.fillStyle = gradient;
    context.font = 'bold 20px Arial';
    context.fillText('Athulya Home Care Report', 280, 20);

    context.fillStyle = '#000';
    context.font = 'bold 16px Arial';
    context.fillText('Completed', 50, 100);
    context.font = '16px Arial';
    context.fillText(completedCount.toString(), 73, 125);

    context.font = 'bold 16px Arial';
    context.fillText('Cancelled', 50, 150);
    context.font = '16px Arial';
    context.fillText(cancelledCount.toString(), 83, 170);

    context.font = 'bold 16px Arial';
    context.fillText('Pending', 50, 200);
    context.font = '16px Arial';
    context.fillText(PendingCount.toString(), 75, 220);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./AthulyaHomeCareReport.png', buffer);
}



