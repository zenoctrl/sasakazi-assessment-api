let span = document.querySelector('#add-choice')
let choices = document.querySelector('#choices')
let deleteChoiceBtns = document.querySelectorAll('.delete-choice')

const deleteChoice = (e) => {
    let choice = e.target.parentNode.parentElement
    choices.removeChild(choice)
}

span.addEventListener('click', () => {
    let div = document.createElement('div')
    div.className = 'choice'
    let input = document.createElement("input")
    input.setAttribute('type', 'text')
    input.name = 'options'
    let span = document.createElement('span')
    span.className = 'delete-choice'
    span.innerHTML = '<img src="/images/x-circle.svg" alt="">'
    div.append(span)
    span.addEventListener('click', deleteChoice)
    div.append(input)
    choices.append(div)
})

deleteChoiceBtns.forEach(deleteChoiceBtn => {
    deleteChoiceBtn.addEventListener('click', deleteChoice)
})