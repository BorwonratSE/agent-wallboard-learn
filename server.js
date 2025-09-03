// ขั้นที่ 1: Import Express
const express = require('express'); // เติมให้ถูก

// ขั้นที่ 2: สร้าง app  
const app = express(); // เติมให้ถูก

// ขั้นที่ 3: กำหนด PORT
const PORT = 3001;

app.use(express.json()); // สำคัญมาก!


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

// GET All Agents API
app.get('/api/agents', (req, res) => {
  res.json({
    success: true,
    data: agents,               
    count: agents.length,      
    timestamp: new Date().toISOString()  
  });
});

app.get('/api/agents/count', (req, res) => {
  res.json({
    success: true,
    count: agents.length,
    timestamp: new Date().toISOString()
  });
});

app.patch('/api/agents/:code/status', (req, res) => {
    const agentCode = req.params.code;
    const newStatus = req.body.status;

    const agent = agents.find(a => a.code === agentCode);
    if (!agent) {
        return res.status(404).json({
            success: false,
            message: "Agent not found"
        });
    }

    const validStatuses = ["Available", "Busy", "Break", "Logout", "Offline"];
    if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });
    }

    if (agent.status === "Busy" && newStatus === "Break") {
        return res.status(400).json({
            success: false,
            message: "Cannot change from Busy to Break directly"
        });
    }

    const oldStatus = agent.status;
    agent.status = newStatus;

    res.json({
        success: true,
        message: `Agent status updated from ${oldStatus} to ${newStatus}`,
        data: agent,
        timestamp: new Date().toISOString()
    });
});
