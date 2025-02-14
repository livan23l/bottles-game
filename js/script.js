const MINLIFES = 5
const MAXLIFES = 20
const MINBOTTLES = 3
const MAXBOTTLES = 10
let lifes = 5
let bottles = 4


// Elemental functions

let timeoutId = null


function showAlert(alertContent, alertType) {
    const alert = document.getElementById("alert")

    if (timeoutId != null) {
        clearTimeout(timeoutId)
        alert.classList.add("alert--hidden")

        setTimeout(() => {
            timeoutId = null
            showAlert(alertContent, alertType)
        }, 200)
    } else {
        alert.querySelector("p").innerText = alertContent

        alert.classList.remove("alert--success")
        alert.classList.remove("alert--danger")
        alert.classList.remove("alert--warning")
        alert.classList.add("alert--" + alertType)
        alert.classList.remove("alert--hidden")

        timeoutId = setTimeout(() => {
            alert.classList.add("alert--hidden")
            timeoutId = null
        }, 2000)
    }
}


function main() {
    const sectionMain = document.getElementById("main")
    const sectionGame = document.getElementById("game")
    const sectionConfiguration = document.getElementById("configuration")

    sectionGame.classList.add("main__section--hidden")
    sectionConfiguration.classList.add("main__section--hidden")
    sectionMain.classList.remove("main__section--hidden")
}


// Configuration functions

function configuration() {
    const sectionMain = document.getElementById("main")
    const sectionConfiguration = document.getElementById("configuration")
    const lifesP = document.getElementById("lifes")
    const bottlesP = document.getElementById("bottles")

    lifesP.innerText = lifes
    bottlesP.innerText = bottles
    sectionMain.classList.add("main__section--hidden")
    sectionConfiguration.classList.remove("main__section--hidden")
}


function changeSetting(setting, action) {
    let target, amount, amountMin, amountMax

    switch (setting) {
        case "life":
            target = document.getElementById("lifes")
            amountMin = MINLIFES
            amountMax = MAXLIFES
            break
        case "bottle":
            target = document.getElementById("bottles")
            amountMin = MINBOTTLES
            amountMax = MAXBOTTLES
            break
    }

    amount = Number(target.innerText)

    if (action == "add" && amount < amountMax) {
        amount += 1
    } else if (action == "remove" && amount > amountMin) {
        amount -= 1
    } else {
        showAlert("Límite alcanzado", "danger")
    }

    target.innerText = amount
}


function saveChanges() {
    const lifesP = Number(document.getElementById("lifes").innerText)
    const bottlesP = Number(document.getElementById("bottles").innerText)

    main()

    if (lifesP < MINLIFES || lifesP > MAXLIFES ||
        bottlesP < MINBOTTLES || bottlesP > MAXBOTTLES
    ) {
        showAlert("Ocurrió un error", "danger")
    } else {
        lifes = lifesP
        bottles = bottlesP
        showAlert("Configuraciones guardadas", "success")
    }
}


// Drag and drop functions
let bottle = null
let bottleIdx = null
let bottleYXInitials = []
let lastPosX = 0
let bottlesPlay = []
let bottlesOrder = []
let width = 0
let height = 0
let posYXInitial = []
let curretnLifes = 0
let type = ""


function mouseMove(event) {
    return [event.clientY, event.clientX]
}


function touchMove(event) {
    return [event.touches[0].clientY, event.touches[0].clientX]
}


function objectMove(event) {
    let pos
    if (type == "mouse") {
        pos = mouseMove(event)
    } else if (type == "touch") {
        event.preventDefault()
        pos = touchMove(event)
    }
    
    let posY = pos[0] + window.scrollY - posYXInitial[0]
    let posX = pos[1] - posYXInitial[1]
    let diffPosX = pos[1] - lastPosX

    // Moving animation
    bottle.style.transform = "rotate(" + diffPosX + "deg)"
    lastPosX = pos[1]

    // Change position
    bottle.style.top = posY + "px"
    bottle.style.left = posX + "px"
}


function getCurrentPosition(element) {
    return [
        element.getBoundingClientRect().top + window.scrollY,
        element.getBoundingClientRect().left
    ]
}


function saveInitialPositions() {
    bottleYXInitials = []

    document.getElementById("game").querySelector(".bottles__options")
        .querySelectorAll(".bottle").forEach((btl) => {
            btl.style.top = 0
            btl.style.left = 0
            let btlYX = getCurrentPosition(btl)

            bottleYXInitials.push(btlYX)
        })

    bottlesPlay = []
    for (let i = 0; i < bottles; i++) {
        bottlesPlay.push(false)
    }
}


function drag(event, tp) {
    bottle = event.currentTarget
    bottleIdx = Array.from(bottle.parentElement.children).indexOf(bottle)
    type = tp

    let bottleYXCurrent = getCurrentPosition(bottle)

    width = bottle.getBoundingClientRect().width
    height = bottle.getBoundingClientRect().height

    if (type == "mouse") {
        posYXInitial = [
            event.clientY + window.scrollY + (bottleYXInitials[bottleIdx][0] - bottleYXCurrent[0]),
            event.clientX + (bottleYXInitials[bottleIdx][1] - bottleYXCurrent[1])
        ]

        document.addEventListener("mousemove", objectMove)
    } else if (type == "touch") {
        posYXInitial = [
            event.touches[0].clientY + window.scrollY + (bottleYXInitials[bottleIdx][0] - bottleYXCurrent[0]),
            event.touches[0].clientX + (bottleYXInitials[bottleIdx][1] - bottleYXCurrent[1])
        ]
        document.addEventListener("touchmove", objectMove, { passive: false })
    }
}


function getBottle(idx) {
    return document.getElementById("game").querySelector(".bottles__options")
        .querySelectorAll(".bottle")[idx]
}


function bottleRestart(idx) {
    let element = getBottle(idx)
    element.style.top = 0
    element.style.left = 0
    bottlesPlay[idx] = false
}


function bottleInDestiny(idx, idxDestiny) {
    let bottle = getBottle(idx)
    let option = document.querySelector(".bottles__destiny").querySelectorAll(".bottle")[idxDestiny]
    let optionYX = getCurrentPosition(option)

    bottle.style.top = (optionYX[0] - bottleYXInitials[idx][0]) + "px"
    bottle.style.left = (optionYX[1] - bottleYXInitials[idx][1]) + "px"
}


function drop() {
    const bottlesDestiny = document.querySelector(".bottles__destiny").querySelectorAll(".bottle")
    let bottleYX = getCurrentPosition(bottle)
    const bottleHeight = bottle.getBoundingClientRect().height
    const bottleWidth = bottle.getBoundingClientRect().width
    let moved = true

    for (let i = 0; i < bottlesDestiny.length; i++) {
        if (moved) {
            let btl = bottlesDestiny[i]
            let btlYX = getCurrentPosition(btl)
            let btlHeight = btl.getBoundingClientRect().height
            let btlWidth = btl.getBoundingClientRect().width

            if (
                (bottleYX[0] < btlYX[0] + btlHeight && bottleYX[0] + bottleHeight > btlYX[0]) &&
                (bottleYX[1] < btlYX[1] + btlWidth && bottleYX[1] + bottleWidth > btlYX[1])
            ) {
                moved = false

                // Puts the bottle in the position
                bottleInDestiny(bottleIdx, i)

                // Save the current play
                let previousPlay = bottlesPlay[bottleIdx]
                bottlesPlay[bottleIdx] = i

                // Remove any other bottle from there
                for (let j = 0; j < bottles; j++) {
                    if (j != bottleIdx && bottlesPlay[j] === i) {
                        if (previousPlay === false) {
                            bottleRestart(j)
                        } else {
                            bottlesPlay[j] = previousPlay
                            bottleInDestiny(j, previousPlay)
                        }
                    }
                }
            }
        }
    }

    if (moved) {
        bottleRestart(bottleIdx)
    }

    bottle.style.transform = "rotate(0)"
    if (type == "mouse") {
        document.removeEventListener("mousemove", objectMove)
    } else if (type == "touch") {
        document.removeEventListener("touchmove", objectMove)
    }
}


// Game functions

function removeAll(game) {
    game.querySelectorAll(".life").forEach(life => {
        life.remove()
    })
    game.querySelectorAll(".bottle").forEach(life => {
        life.remove()
    })
}


function setLifes(game) {
    const lifeTemplate = document.getElementById("life-template")
    let life = lifeTemplate.content.cloneNode(true).querySelector(".life")
    life.querySelector(".life__amount").innerText = "× " + curretnLifes

    game.querySelector(".lifes").appendChild(life)
}


function updateLifes() {
    document.getElementById("game").querySelector(".lifes")
        .querySelector(".life").querySelector(".life__amount").innerText = "× " + curretnLifes
}


function setBottles(game, colors) {
    const bottleTemplate = document.getElementById("bottle-template")
    const bottleDashedTemplate = document.getElementById("bottleDashed-template")

    // Dashed bottles
    for (let i = 0; i < bottles; i++) {
        let bottleDashed = bottleDashedTemplate.content.cloneNode(true).querySelector(".bottle")
        game.querySelector(".bottles__destiny").appendChild(bottleDashed)
    }

    // Normal bottles
    bottlesPlay = []
    for (let i = 0; i < bottles; i++) {
        let bottle = bottleTemplate.content.cloneNode(true).querySelector(".bottle")
        bottle.querySelector(".bottle__content").classList.add("bottle__content--" + colors[i])
        // Mouse events
        bottle.addEventListener("mousedown", function (event) {
            drag(event, "mouse")
        })
        bottle.addEventListener("mouseup", drop)
        bottle.addEventListener("dblclick", function () {
            bottleRestart(i)
        })

        // Touch events
        bottle.addEventListener("touchstart", function (event) {
            drag(event, "touch")
        })
        bottle.addEventListener("touchend", drop)

        game.querySelector(".bottles__options").appendChild(bottle)
        bottlesPlay.push(false)
    }
}


function game() {
    const sectionMain = document.getElementById("main")
    const sectionGame = document.getElementById("game")

    sectionMain.classList.add("main__section--hidden")
    sectionGame.classList.remove("main__section--hidden")

    removeAll(sectionGame)

    curretnLifes = lifes
    setLifes(sectionGame)

    bottlesOrder = []
    let colors = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = 0; i < bottles; i++) {
        bottlesOrder.push(i)
    }
    bottlesOrder.sort(() => Math.random() - 0.5)
    colors.sort(() => Math.random() - 0.5)

    setBottles(sectionGame, colors)

    saveInitialPositions()
    window.addEventListener("resize", function () {
        saveInitialPositions()
    });
}


function play() {
    let corrects = 0

    for (let i = 0; i < bottles; i++) {
        if (bottlesPlay[i] === false && curretnLifes > 0) {
            showAlert("Debes utilizar todas las botellas", "warning")
            return
        } else if (bottlesPlay[i] == bottlesOrder[i]) {
            corrects += 1;
        }
    }

    if (corrects == bottles && curretnLifes > 0) {
        main()
        showAlert("¡Felicidades, ganaste!", "success")
    } else {
        curretnLifes -= 1

        if (curretnLifes <= 0) {
            showAlert("Lo siento, has perdido", "danger")
            curretnLifes = 0
        } else {
            let message = "Tienes " + corrects
            if (corrects == 1) {
                message += " botella correcta"
            } else {
                message += " botellas correctas"
            }

            showAlert(message, "warning")
        }

        updateLifes()
    }
}