import express from 'express'
import methodOverride from 'method-override'
import mysql from 'mysql'

const app = express()
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'api_test'
})


const questions = []

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended: false}))

const replaceOptionsAnswer = data => {
    let options 
    if(typeof data.options === 'string') {
        // options = data.options.substr(1, data.options.length - 2).split(', ') 
        options = JSON.parse(data.options)
    } else {
        options = data.options
    }

    for(let option of options) {
        // check for option type and replace
        if(!isNaN(Number(option)) && typeof option !== 'boolean') {
            options.splice(options.indexOf(option), 1, Number(option))
        } else if(option.toString().toLowerCase() === 'false' || option.toString().toLowerCase() === 'true') {
            options.splice(options.indexOf(option), 1, JSON.parse(option.toString().toLowerCase()))
        } else {
            if(option.includes('"')) {
                options.splice(options.indexOf(option), 1, option.substr(1, option.length - 2))
            } else {
                continue
            }
        }
    }

    let answer
    // check for answer type and replace
    if (data.answer.toLowerCase() === 'false' || data.answer.toLowerCase() === 'true') {
        answer = JSON.parse(data.answer.toLowerCase())
    } else if (!isNaN(Number(data.answer))) {
        answer = Number(data.answer)
    } else {
        answer = data.answer
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

                if (result.category === 'aptitude test') {
                    const question = {
                        id: result.id,
                        category: result.category,
                        question: result.question,
                        imageURL: result.imageURL,
                        options: options,
                        answer: answer
                    }
    
                    questions.push(question)
                } else {
                    const question = {
                        id: result.id,
                        category: result.category,
                        field: result.field,
                        question: result.question,
                        imageURL: result.imageURL,
                        options: options,
                        answer: answer
                    }
    
                    questions.push(question)
                }
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
            let result = results[0]
            let { options, answer } = replaceOptionsAnswer(results[0])
            if (results.category === 'aptitude test') {
                const question = {
                    id: result.id,
                    category: result.category,
                    question: result.question,
                    imageURL: result.imageURL,
                    options: options,
                    answer: answer
                }

                res.send(question)
            } else {
                const question = {
                    id: result.id,
                    category: result.category,
                    field: result.field,
                    question: result.question,
                    imageURL: result.imageURL,
                    options: options,
                    answer: answer
                }

                res.send(question)
            }
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
    
    const test = {
        category: req.body.category,
        field: req.body.field || null,
        question: req.body.question,
        imageURL: req.body.imageURL,
        options: options,
        answer: answer
    }

    connection.query(
        'INSERT INTO questions (category, field, question, imageURL, options, answer) VALUES (?,?,?,?,JSON_ARRAY(?),?)',
        [
            test.category, 
            test.field,
            test.question,
            test.imageURL, 
            [...test.options], 
            test.answer
        ],
        (error, results) => {
            if (error) {
                res.send(error)
            } else {
                res.redirect('/questions')
            } 
        }
    )
    
})

// edit a question - display form
app.get('/edit/:id', (req, res) => {
    connection.query(
        'SELECT * FROM questions where id = ?',
        [parseInt(req.params.id)],
        (error, results) => {
            let { options, answer } = replaceOptionsAnswer(results[0])
            const question = {
                id: results[0].id,
                category: results[0].category,
                field: results[0].field,
                question: results[0].question,
                imageURL: results[0].imageURL,
                options: options,
                answer: answer
            }
            res.render('edit.ejs', {question: question})
        }
    )
})

// edit a question
app.put('/edit/:id', (req, res) => {

    let { options, answer } = replaceOptionsAnswer(req.body)

    connection.query(
        'UPDATE questions SET category = ?, question = ? , imageURL = ?, options = JSON_ARRAY(?), answer = ? WHERE id = ?',
        [req.body.category, req.body.question, req.body.imageURL, [...options], answer, parseInt(req.params.id)],
        (error, results) => {
            res.redirect('/questions')
        }
    )
})

// delete a question
app.delete('/delete-question/:id', (req, res) => {
    connection.query(
        'DELETE FROM questions WHERE id = ?',
        [parseInt(req.params.id)],
        (error, results) => {
            res.redirect('/questions')
        }
    )
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    `Server is up on PORT ${PORT}.`
})