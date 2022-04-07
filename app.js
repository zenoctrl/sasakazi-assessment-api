import express from 'express'
import methodOverride from 'method-override'

const app = express()
const questions = []

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended: false}))

// get all questions
app.get('/questions', (req, res) => {
    res.send(questions)
})

// get an individual question
app.get('/question:id', (req, res) => {
    const question = questions.find(question => question.id === parseInt(req.params.id))
    res.send(question)
})

// add a question - display form
app.get('/add', (req, res) => {
    res.render('add.ejs');
})

// add a question - submit form
app.post('/add', (req, res) => {
    const question = {
        id: questions.length + 1,
        category: req.body.category,
        question: req.body.question,
        imageURL: req.body.imageURL,
        options: req.body.options,
        answer: req.body.answer
    }
    questions.push(question);
    res.send(question);
})

// edit a question
app.put('/edit/:id', (req, res) => {
})

// delete a question
app.delete('/aptitude/:id', (req, res) => {
    const question = questions.find(question => question.id === parseInt(req.params.id))
    const index = questions.indexOf(question);
    questions.splice(index, 1);
    res.send(question)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    `Server is up on PORT ${PORT}.`
})