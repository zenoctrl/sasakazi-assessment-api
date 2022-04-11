import express from 'express'
import methodOverride from 'method-override'
import mysql from 'mysql'

const app = express()
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sasakazi_api_db'
})


const questions = []

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended: false}))

// get all questions
app.get('/questions', (req, res) => {

    connection.query(
        'SELECT * FROM questions',
        (error, results) => {
            res.send(results)
        }
    )

    // res.send(questions)
})

// get an individual question
app.get('/question/:id', (req, res) => {

    connection.query(
        'SELECT * FROM questions WHERE id = ?',
        [parseInt(req.params.id)],
        (error, results) => {
            res.send(results[0])
        }
    )

    // const question = questions.find(question => question.id === parseInt(req.params.id))
    // res.send(question)
})

// add a question - display form
app.get('/add', (req, res) => {
    res.render('add.ejs');
})

// add a question - submit form
app.post('/add', (req, res) => {
    let options = req.body.options
    for(let option of options) {
        // check for option type and replace
        if(!isNaN(Number(option))) {
            options.splice(options.indexOf(option), 1, Number(option))
        } else if(option.toLowerCase() === 'false' || option.toLowerCase() === 'true') {
            options.splice(options.indexOf(option), 1, JSON.parse(option.toLowerCase()))
        } else {
            continue
        }
    }

    let answer = req.body.answer
    // check for answer type and replace
    if(!isNaN(Number(answer))) {
        answer = Number(answer)
    } else if(answer.toLowerCase() === 'false' || answer.toLowerCase() === 'true') {
        answer = JSON.parse(answer.toLowerCase())
    }

    connection.query(
        'INSERT INTO questions (category, question, imageURL, options, answer) VALUES (?,?,?,JSON_ARRAY(?),?)',
        [req.body.category, req.body.question, req.body.imageURL, [...options], answer],
        (error, results) => {
            // res.send(results)
            if(error) {
                console.log(error)
            } else {
                console.log(results)
            }
        }
    )

    // const question = {
    //     id: questions.length + 1,
    //     category: req.body.category,
    //     question: req.body.question,
    //     imageURL: req.body.imageURL,
    //     options: options,
    //     answer: answer
    // }
    // questions.push(question);
    // res.send(question);
})

// edit a question - display form
app.get('/edit/:id', (req, res) => {
    const question = questions.find(question => question.id === parseInt(req.params.id))
    res.render('edit.ejs', {edit: true, question: question})
})

// edit a question
app.put('/edit/:id', (req, res) => {
    let options = req.body.options
    for(let option of options) {
        // check for option type and replace
        if(!isNaN(Number(option))) {
            options.splice(options.indexOf(option), 1, Number(option))
        } else if(option.toLowerCase() === 'false' || option.toLowerCase() === 'true') {
            options.splice(options.indexOf(option), 1, JSON.parse(option.toLowerCase()))
        } else {
            continue
        }
    }

    let answer = req.body.answer
    // check for answer type and replace
    if(!isNaN(Number(answer))) {
        answer = Number(answer)
    } else if(answer.toLowerCase() === 'false' || answer.toLowerCase() === 'true') {
        answer = JSON.parse(answer.toLowerCase())
    }

    const question = questions.find(question => question.id === parseInt(req.params.id))
    const edit = {
        id: parseInt(req.params.id),
        category: req.body.category,
        question: req.body.question,
        imageURL: req.body.imageURL,
        options: options,
        answer: answer
    }
    questions.splice(questions.indexOf(question), 1, edit)
    res.send(question);
})

// delete a question
app.delete('/delete-question/:id', (req, res) => {

    connection.query(
        'DELETE FROM questions WHERE id = ?',
        [parseInt(req.params.id)],
        (error, results) => {
            res.send(results)
        }
    )

    // const question = questions.find(question => question.id === parseInt(req.params.id))
    // const index = questions.indexOf(question);
    // questions.splice(index, 1);
    // res.send(question)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    `Server is up on PORT ${PORT}.`
})