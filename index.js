let express = require(`express`);
let app = express();
let port = 3002;

app.listen(port, function () {
    console.log(`http://localhost:${port}`);
})

//подключение статических данных
app.use(express.static('public'));

//подключение post запросов
app.use(express.urlencoded({ extended: true }));

//Подключение hbs
const hbs = require('hbs');
app.set('views', 'views');
app.set('view engine', 'hbs');

let mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/task-app');

let taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    isDone: Boolean,
}, {
    timestamps: true
});
let Task = mongoose.model('tasks', taskSchema);


app.get('/', async (req, res) => {
    let err = Boolean(req.query.err);
    let done = await Task.find({ isDone: true }).sort({ updatedAt: -1 });
    let todo = await Task.find({ isDone: false }).sort({ createdAt: 1 })
    res.render('index', {
        done: done,
        todo: todo,
        err: err
    });
});

app.get('/task-done', async (req, res) => {
    let id = req.query.id;
    let done = Number(req.query.done);
    let task = await Task.findOne({ _id: id });
    if (done == 1) {
        task.isDone = true;
    } else {
        task.isDone = false;
    }
    await task.save();
    res.redirect('back');
});

app.post('/task-create', async (req, res) => {
    let title = req.body.title;
    let task = await Task({
        title: title,
        isDone: false
    });
    try {
        await task.save();
        res.redirect('/')
    } catch (err) {
        res.redirect('/?err=1');
    }
});

app.get('/task-edit', async (req, res) => {
    let id = req.query.id
    let done = await Task.find({ isDone: true }).sort({ updatedAt: -1 });
    let todo = await Task.find({ isDone: false }).sort({ createdAt: 1 });
    let task = await Task.findOne({ _id: id });


    res.render('index', {
        done: done,
        todo: todo,
        task: task
    })
});

app.post('/task-edit', async (req, res) => {
    let id = req.query.id;
    let task = await Task.findOne({ _id: id });
    let isDone = req.body.isDone;
    let title = req.body.title;
    let description = req.body.description;
    console.log(isDone,title,description);

    //task.isDone = Boolean(req.body.isDone);
    task.title = title;
    task.description = description;

    try {
        task.save();
        res.redirect(`/edit?id=${id}&success=1`);
    } catch (err) {
        res.redirect(`/edit?id=${id}&error=1`);
    }
});