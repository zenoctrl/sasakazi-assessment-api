import express from 'express'
import methodOverride from 'method-override'
import mysql from 'mysql'
import fetch from 'node-fetch'
import session from 'express-session'

const app = express()
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'api_test'
})

app.use(session({
    secret: 'mtihani',
    resave: true,
    saveUninitialized: false
}))

app.use((req, res, next) => {
    if (req.session.user === undefined) {
        res.locals.isLoggedIn = false
    } else {
    res.locals.isLoggedIn = true
    }
    next()
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

    if (req.query.field) {

        fetch('http://localhost:3000/questions/fields').
        then((response) => response.json()).
        then((fields) => {
            if (fields.includes(req.query.field)) {
                connection.query(
                    'SELECT * FROM questions WHERE field = ?',
                    [req.query.field],
                    (error, results) => {
                        const questions = []
                        results.forEach(result => {
            
                            let { options, answer } = replaceOptionsAnswer(result)
            
                            const question = {
                                id: result.id,
                                category: result.category,
                                field: result.field,
                                question: result.question,
                                imageURL: result.imageURL,
                                options: options,
                                answer: answer
                            }
            
                            if (question.category === 'Aptitude Test') {
                                delete question.field
                            } 
                
                            questions.push(question)
                            
                        })
                        res.status(200).send(questions)
                    }
                )
            } else {
                res.status(404).send(`No questions found that belong to the field: ${req.query.field}`)
            }
        })

        
    } else {
        connection.query(
            'SELECT * FROM questions',
            (error, results) => {
                const questions = []
                results.forEach(result => {
    
                    let { options, answer } = replaceOptionsAnswer(result)
    
                    const question = {
                        id: result.id,
                        category: result.category,
                        field: result.field,
                        question: result.question,
                        imageURL: result.imageURL,
                        options: options,
                        answer: answer
                    }
    
                    if (question.category === 'Aptitude Test') {
                        delete question.field
                    } 
        
                    questions.push(question)
                    
                })
                res.status(200).send(questions)
            }
        )
    }

    
})

// get an individual question
app.get('/question/:id', (req, res) => {
    connection.query(
        'SELECT * FROM questions WHERE id = ?',
        [parseInt(req.params.id)],
        (error, results) => {
            if (results.length > 0) {
                let result = results[0]
                let { options, answer } = replaceOptionsAnswer(results[0])

                const question = {
                    id: result.id,
                    category: result.category,
                    field: result.field,
                    question: result.question,
                    imageURL: result.imageURL,
                    options: options,
                    answer: answer
                }

                if(question.category === 'Aptitude Test') {
                    delete question.field
                }

                res.status(400).send(question)
            } else {
                res.status(404).send(`No question has id: ${req.params.id}`)
            }
        }
    )
})

// add a question - display form
app.get('/add', (req, res) => {
    if (res.locals.isLoggedIn) {
        res.render('add.ejs');
    } else {
    res.redirect('/login')
    }
    
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
    if (res.locals.isLoggedIn) {
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
    } else {
        res.redirect('/login')
    }
})

// edit a question
app.put('/edit/:id', (req, res) => {

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
        'UPDATE questions SET category = ?, field = ?, question = ? , imageURL = ?, options = JSON_ARRAY(?), answer = ? WHERE id = ?',
        [
            test.category, 
            test.field, 
            test.question, 
            test.imageURL, 
            [...test.options], 
            test.answer, 
            parseInt(req.params.id)
        ],
        (error, results) => {
            res.redirect(`/question/${parseInt(req.params.id)}`)
        }
    )
})

// get available fields for the skill-based test 
app.get('/questions/fields', (req, res) => {
    let sql = 'SELECT DISTINCT(field) FROM questions'
    connection.query(
        sql, (error, results) => {
            const fields = []
            results.forEach(result => {
                if (result.field !== null) {
                    fields.push(result.field)
                }
            })
            res.send(fields)
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

// login
app.get('/login', (req, res) => {
    const user = {
        email: '',
        password: ''
    }
    res.render('login', { error: false, user })
})

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    let sql = 'SELECT * FROM user WHERE email = ?'
    connection.query(
        sql, [user.email], (error, results) => {
            if (results.length > 0) {
                if (user.password === results[0].password) {
                    req.session.userID = results[0].id
                    res.redirect('/')
                } else {
                    let message = 'Incorrect Password'
                    res.render('login', {error: true, message, user})
                }
            } else {
                let message = 'No account exist with the email provided'
                res.render('login', {error: true, message, user})
            }
        }
    )

})

// log out
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    `Server is up on PORT ${PORT}.`
})