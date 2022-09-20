const Phobos = require("./Engine");
const express = require("express");
const app = express();

const Connection = new Phobos(process.env.idrac_hostname ||'192.168.1.75', process.env.idrac_username || 'root', process.env.idrac_password || 'calvin')

app.set('view engine', 'ejs');

app.use((req, res, next) => {
    next()
});

app.get('/', async(req, res) => {
    try {
        const status = await Connection.status();
        return res.render('index', { status: status, connection: Connection, servername: process.env.idrac_servername || "phobos"  });
    } catch(err){
        console.log(err)
        return res.send('es')
    }
})


app.get("/status", async(req, res) => {
    try {
        const status = await Connection.status();
        return res.json({ "online": status ? true : false });
    } catch(err){
        return res.sendStatus(400)
    }
});

app.get("/fanspeed/:val", async(req, res) => {
    try {
        const fanspeed = await Connection.fanspeed(req.params.val);
        return res.sendStatus(200)
    } catch(err){
        console.log(err)
        return res.sendStatus(400)
    }
})

app.get("/startup", async(req, res) => {
    try {

        if(!await Connection.status()){
            await Connection.start();
            await Connection.sleep(2000);
            await Connection.fanspeed(0);
            return res.json({ "success": true, "action": "startup"});
        }

        return res.json({ "success": false, "action": "startup", "err": 409, "reason": "already started" });
    } catch(err){
        return res.sendStatus(400);
    }
})

app.get("/shutdown", async(req, res) => {
    try {

        if(await Connection.status()){
            await Connection.shutdown();
            return res.json({ "success": true, "action": "shutdown" });
        }

        return res.json({ "success": false, "action": "shutdown", "err": 409, "reason": "already shutdown" });
    } catch(err){
        return res.sendStatus(400);
    }
})

const listened = app.listen(8080, () => { console.log(`[Express] started on port: ${listened.address().port}`) })
