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

const replaceOptionsAnswer = data => {
    let options = data.options.substr(1, data.options.length - 2).split(', ')
    for(let option of options) {
        // check for option type and replace
        if(!isNaN(Number(option))) {
            options.splice(options.indexOf(option), 1, Number(option))
        } else if(option.toLowerCase() === 'false' || option.toLowerCase() === 'true') {
            options.splice(options.indexOf(option), 1, JSON.parse(option.toLowerCase()))
        } else {
            if(option.includes('"')) {
                options.splice(options.indexOf(option), 1, option.substr(1, option.length - 2))
            } else {
                continue
            }
        }
    }

    let answer = data.answer
    // check for answer type and replace
    if(!isNaN(Number(answer))) {
        answer = Number(answer)
    } else if(answer.toLowerCase() === 'false' || answer.toLowerCase() === 'true') {
        answer = JSON.parse(answer.toLowerCase())
    }
    return {options: options, answer: answer}
}

// get all questions
app.get('/questions', (req, res) => {
    connection.query(
        'SELECT * FROM questions',
        (error, results) => {
            const questions = []
            results.forEach(result => {

                let { options, answer } = replaceOptionsAnswer(result)
                const question = {
                    id: result.id,
                    category: result.category,
                    question: result.question,
                    imageURL: result.imageURL,
                    options: options,
                    answer: answer
                }

                questions.push(question)
            })
            res.send(questions)
        }
    )
})

// get an individual question
app.get('/question/:id', (req, res) => {
    connection.query(
        'SELECT * FROM questions WHERE id = ?',
        [parseInt(req.params.id)],
        (error, results) => {
            
            let { options, answer } = replaceOptionsAnswer(results[0])
            const question = {
                id: results[0].id,
                category: results[0].category,
                question: results[0].question,
                imageURL: results[0].imageURL,
                options: options,
                answer: answer
            }

            res.send(question)
        }
    )
})

// add a question - display form
app.get('/add', (req, res) => {
    res.render('add.ejs');
})

// add a question - submit form
app.post('/add', (req, res) => {

    let { options, answer } = replaceOptionsAnswer(req.body)

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
})

// edit a question - display form
app.get('/edit/:id', (req, res) => {
    // const question = questions.find(question => question.id === parseInt(req.params.id))
    connection.query(
        'SELECT * FROM questions where id = ?',
        [parseInt(req.params.id)],
        (error, results) => {
            let { options, answer } = replaceOptionsAnswer(results[0])
            const question = {
                id: results[0].id,
                category: results[0].category,
                question: results[0].question,
                imageURL: results[0].imageURL,
                options: options,
                answer: answer
            }
            res.render('edit.ejs', {edit: true, question: question})
        }
    )
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
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    `Server is up on PORT ${PORT}.`
})