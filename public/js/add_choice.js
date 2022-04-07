let span = document.querySelector('span')
let choices = document.querySelector('#choices')

span.addEventListener('click', () => {
    let div = document.createElement('div')
    div.className = 'choice'
    let input = document.createElement('<input type="text" name="option[]" id="">')
    div.append(input)
    choices.append(div)
})