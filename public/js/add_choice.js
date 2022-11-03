let addChoice = document.querySelector('#add-choice')
let choices = document.querySelector('#choices')
let deleteChoiceBtns = document.querySelectorAll('.delete-choice')
let selectCategory = document.querySelector('#category')
let selectField = document.querySelector('#field')
let changePicDiv = document.querySelector('#change-pic')
let radioBtns = document.querySelectorAll('input[name="changePic"]')

const fields = [
    'AI, IoT, Cloud computing',
    'Data Science, Data Analytics',
    'Digital Marketing',
    'Graphic Design',
    'Tech Support',
    'Network Admin, Cyber Sec',
    'Software Development',
    'Video Editing'
]

selectCategory.addEventListener('change', () => {
    if (selectCategory.value === 'Skill-based Test') {
        let options = document.querySelectorAll('.field')
        options.forEach(option => selectField.removeChild(option))
        let option = document.createElement('option')
        option.className = 'field'
        option.textContent = '-- Please select field --'
        selectField.appendChild(option)
        fields.forEach(field => {
            let option = document.createElement('option')
            option.className = 'field'
            option.value = field
            option.textContent = field
            selectField.appendChild(option)
        })
        selectField.style.display = 'block'
    } else {
        selectField.style.display = 'none'
    }
})


const deleteChoice = (e) => {
    let choice = e.target.parentElement.parentElement
    choices.removeChild(choice)
}

const markCorrect = (e) => {
    e.preventDefault()
    let markBtn = e.target
    let markBtns = document.querySelectorAll('.markBtn')
    let answer = document.querySelector('#answer')
    if (markBtn.src.toString().endsWith('check-mark.png')) {
        markBtns.forEach(markBtn => markBtn.src = '/images/check-mark.png')
        markBtn.src = '/images/correct.png'
        answer.value = markBtn.parentElement.previousElementSibling.value
        console.log(`${answer.value} is marked as correct`)
    } else {
        markBtn.src = '/images/check-mark.png'
    }
}

addChoice.addEventListener('click', () => {
    let div = document.createElement('div')
    div.className = 'choice'
    let input = document.createElement("input")
    input.setAttribute('type', 'text')
    input.name = 'options'
    div.appendChild(input)

    let divBtns = document.createElement('div')

    // create button to mark correct choice
    let markBtn = document.createElement('img')
    markBtn.className = 'markBtn'
    markBtn.src= '/images/check-mark.png'
    markBtn.addEventListener('click', markCorrect)
    divBtns.appendChild(markBtn)

    // create button to delete a choice
    let deleteBtn = document.createElement('img')
    deleteBtn.className = 'delete-choice'
    deleteBtn.src = '/images/remove.png'
    deleteBtn.addEventListener('click', deleteChoice)
    divBtns.appendChild(deleteBtn)

    // add btns to the choice
    div.appendChild(divBtns)

    // add newly created choice to the choices collection
    choices.append(div)
})

document.querySelectorAll('.markBtn').forEach(markBtn => {
    markBtn.addEventListener('click', markCorrect)
})

deleteChoiceBtns.forEach(deleteBtn => {
    deleteBtn.addEventListener('click', deleteChoice)
})

radioBtns.forEach(radioBtn => {
    radioBtn.addEventListener('change', () => {
        if (radioBtn.value === 'Yes') {
            changePicDiv.nextElementSibling.style.display = 'block'
            changePicDiv.previousElementSibling.style.display = 'none'
        } else {
            changePicDiv.nextElementSibling.style.display = 'none'
            changePicDiv.previousElementSibling.style.display = 'block'
            
        }
    })
})