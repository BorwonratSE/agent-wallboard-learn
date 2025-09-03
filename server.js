// ขั้นที่ 1: Import Express
const express = require('express'); // เติมให้ถูก

// ขั้นที่ 2: สร้าง app  
const app = express(); // เติมให้ถูก

// ขั้นที่ 3: กำหนด PORT
const PORT = 3001;

// Agent sample data
let agents = [
  {
    code: "A001",
    name: "John Doe",
    status: "Available",
  },
  {
    code: "A002",
    name: "Alice Smith",
    status: "Busy",
  },
  {
    code: "A003",
    name: "Bob Lee",
    status: "Offline",
  }
];


// ขั้นที่ 4: สร้าง route แรก
app.get('/', (req, res) => {
    res.send("Hello Agent Wallboard!");
}); // เติม method และ response function

// ขั้นที่ 5: เริ่ม server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/health', (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString()
    });
});
