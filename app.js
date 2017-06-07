const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const Datastore = require('nedb')
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = 3000

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('add user', data => {
    io.emit('add user', data)
  });

  socket.on('update user', data => {
    io.emit('update user', data)
  });

  socket.on('remove user', _id => {
    io.emit('remove user', _id)
  });

  socket.on('update pie', data => {
    io.emit('update pie', data)
  });
});

// Database
const db = {};
db.employees = new Datastore({ filename: 'data/employees.db', autoload: true });
db.projects = new Datastore({ filename: 'data/projects.db', autoload: true });

// Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extender: false}))

// View Engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Static Path
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.get('/', (req, res) => {
    res.render('dashboard', {title: 'Dashboard'})
})

/* Render Employee View */
app.get('/employees', (req, res) => {
    res.render('employees', {title: 'Employees'})
})

/* Fetch All Employees */
app.get('/all_employees', (req, res) => {
    db.employees.find({}, (err, employees) => {
        if(err) {
            if(err) console.log(err)
            res.json({success: false, err})
        } else {
            res.json(employees)
        }
    });
})

/* Add New Employee */
app.post('/employees', (req, res) => {
    req.body.created_at = new Date().toLocaleString();
    const newEmployee = req.body;
    db.employees.insert(newEmployee, (err, doc) => {
        if(err) {
            if(err) console.log(err)
            res.json({success: false, err})
        } else {
            res.json({success: true, doc})
        }
        
    })
})

/* Update Employee */
app.patch('/employees', (req, res) => {
    const _id = req.body._id;
    console.log(_id)
    const employeeData = {
        agency_id: req.body.agency_id,
        name: req.body.name,
        status: req.body.status,
        created_at: req.body.created_at
    };
    db.employees.update({ _id }, employeeData, (err, numReplaced) => {
        if(err) {
            if(err) console.log(err)
            res.json({success: false, err})
        } else {
            res.json({success: true, doc: req.body})
        }
        
    })
})


/* Delete Employee */
app.delete('/employees/:_id', (req, res) => {
    const _id = req.params._id;
    db.employees.remove({ _id }, {}, (err, doc) => {
        if(err) {
            if(err) console.log(err)
            res.json({success: false, err})
        } else {
            res.json({success: true})
        }
    })
})

http.listen(port, () => {
    console.log(`Server started on port ${port} ...`)
})