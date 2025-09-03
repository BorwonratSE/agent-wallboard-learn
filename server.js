// ขั้นที่ 1: Import Express
const express = require('express'); // เติมให้ถูก

// ขั้นที่ 2: สร้าง app  
const app = express(); // เติมให้ถูก

// ขั้นที่ 3: กำหนด PORT
const PORT = 3001;

app.use(express.json()); // สำคัญมาก!

const cors = require('cors');
app.use(cors());

// Agent sample data
let agents = [
  {
    code: "A001",
    name: "John Doe",
    status: "Active",
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

    const validStatuses = ["Available", "Busy", "Break", "Logout", "Offline", "Active"];
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

    
    console.log(`[${new Date().toISOString()}] Agent ${agentCode}: ${oldStatus} → ${newStatus}`);

    res.json({
        success: true,
        message: `Agent status updated from ${oldStatus} to ${newStatus}`,
        data: agent,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/dashboard/stats', (req, res) => {
    const totalAgents = agents.length;

    const available = agents.filter(a => a.status === "Available").length;
    const active = agents.filter(a => a.status === "Active").length;
    const wrapUp = agents.filter(a => a.status === "Wrap Up").length;
    const notReady = agents.filter(a => a.status === "Not Ready").length;
    const offline = agents.filter(a => a.status === "Offline").length;

    const calcPercent = (count) => totalAgents > 0 ? Math.round((count / totalAgents) * 100) : 0;

    res.json({
        success: true,
        data: {
            total: totalAgents,
            statusBreakdown: {
                available: { count: available, percent: calcPercent(available) },
                active: { count: active, percent: calcPercent(active) },
                wrapUp: { count: wrapUp, percent: calcPercent(wrapUp) },
                notReady: { count: notReady, percent: calcPercent(notReady) },
                offline: { count: offline, percent: calcPercent(offline) },
            },
            timestamp: new Date().toISOString()
        }
    });
});

app.post('/api/agents/:code/login', (req, res) => {
    const agentCode = req.params.code;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
    }

    let agent = agents.find(a => a.code === agentCode);

    if (!agent) {
        // ถ้ายังไม่มี agent นี้ → สร้างใหม่
        agent = {
            code: agentCode,
            name,
            status: "Available",
            loginTime: new Date().toISOString()
        };
        agents.push(agent);
    } else {
        // ถ้ามีอยู่แล้ว → อัปเดตสถานะ + เวลา
        agent.name = name; // อัปเดตชื่อเผื่อเปลี่ยน
        agent.status = "Available";
        agent.loginTime = new Date().toISOString();
    }

    console.log(`[${agent.loginTime}] Agent ${agentCode} logged in`);

    res.json({
        success: true,
        message: "Agent logged in",
        data: agent
    });
});

app.post('/api/agents/:code/logout', (req, res) => {
    const agentCode = req.params.code;
    const agent = agents.find(a => a.code === agentCode);

    if (!agent) {
        return res.status(404).json({ success: false, message: "Agent not found" });
    }

    agent.status = "Offline";
    delete agent.loginTime;

    console.log(`[${new Date().toISOString()}] Agent ${agentCode} logged out`);

    res.json({
        success: true,
        message: "Agent logged out",
        data: agent
    });
});

