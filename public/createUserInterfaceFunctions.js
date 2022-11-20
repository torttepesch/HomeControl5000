function createElementAndAppend(mainGroup, middleGroup, groupAddress, elementToAppendTo) {
    var newElement = []
    if (groupAddress.displayElement == 'Button') {
        newElement = createButton(mainGroup, middleGroup, groupAddress, elementToAppendTo)
    }
    else if (groupAddress.displayElement == 'Card') {
        newElement = createCard(mainGroup, middleGroup, groupAddress, elementToAppendTo)
    }
    else if (groupAddress.displayElement == 'IncrementDecrement') {
        newElement = createIncrementDecrement(mainGroup, middleGroup, groupAddress, elementToAppendTo)
    }
    else if (groupAddress.displayElement == 'Slider') {
        newElement = createSlider(mainGroup, middleGroup, groupAddress, elementToAppendTo)
    }
    else if (groupAddress.displayElement == 'Impulse') {
        newElement = createImpulse(mainGroup, middleGroup, groupAddress, elementToAppendTo)
    }
    else { window.alert(`wrong display type set for group address ${groupAddress.address}`) }
    return newElement
}

function createButton(mainGroup, middleGroup, groupAddress, elementToAppendTo) {
    let btn = document.createElement("button");
    addKnxAttributes(mainGroup, middleGroup, groupAddress, btn)
    btn.classList.add("btn")
    btn.classList.add("btn-primary", "col-12")
    btn.style.marginBottom = "5px"
    btn.innerHTML = groupAddress.name
    btn.onclick = function () {
        $.post({
            url: '/groupAddressCall/button',
            data: JSON.stringify({ mainGroup: mainGroup.name, middleGroup: middleGroup.name, groupAddress: groupAddress.name }),
            contentType: 'application/json; charset=utf-8'
        })
            .then((status) => {
                setButtonStatus(status, btn)
            })
    };
    elementToAppendTo.appendChild(btn)
}

function createImpulse(mainGroup, middleGroup, groupAddress, elementToAppendTo) {
    let btn = document.createElement("button");
    addKnxAttributes(mainGroup, middleGroup, groupAddress, btn)
    btn.classList.add("btn")
    btn.classList.add("btn-secondary", "col-12")
    btn.style.marginBottom = "5px"
    btn.innerHTML = groupAddress.name
    btn.onclick = function () {
        $.post({
            url: '/groupAddressCall/impulse',
            data: JSON.stringify({ mainGroup: mainGroup.name, middleGroup: middleGroup.name, groupAddress: groupAddress.name }),
            contentType: 'application/json; charset=utf-8'
        })
            .then(() => {
                btn.classList.remove("btn-secondary")
                btn.classList.add("btn-primary")
                setTimeout(() => {
                    btn.classList.remove("btn-primary")
                    btn.classList.add("btn-secondary")
                }, 1000)
            })
    };
    elementToAppendTo.appendChild(btn)
}

function createIncrementDecrement(mainGroup, middleGroup, groupAddress, elementToAppendTo) {
    let card = document.createElement("div");
    let cardHeader = document.createElement("div");
    let cardBody = document.createElement("div")

    card.classList.add("card")
    cardHeader.classList.add("card-header")
    cardBody.classList.add("card-body")
    cardHeader.innerHTML = groupAddress.name

    let btnPlus = document.createElement("button");
    let btnMinus = document.createElement("button");
    addKnxAttributes(mainGroup, middleGroup, groupAddress, btnPlus)
    btnPlus.classList.add("btn")
    btnPlus.classList.add("btn-secondary")
    btnPlus.innerHTML = '+'
    btnPlus.onclick = function () {
        $.post({
            url: '/groupAddressCall/incrementDecrement',
            data: JSON.stringify({ mainGroup: mainGroup.name, middleGroup: middleGroup.name, groupAddress: groupAddress.name, changeDirection: 1 }),
            contentType: 'application/json; charset=utf-8'
        })
    };

    addKnxAttributes(mainGroup, middleGroup, groupAddress, btnMinus)
    btnMinus.classList.add("btn")
    btnMinus.classList.add("btn-secondary")
    btnMinus.innerHTML = '-'
    btnMinus.onclick = function () {
        $.post({
            url: '/groupAddressCall/incrementDecrement',
            data: JSON.stringify({ mainGroup: mainGroup.name, middleGroup: middleGroup.name, groupAddress: groupAddress.name, changeDirection: 0 }),
            contentType: 'application/json; charset=utf-8'
        })
    };
    elementToAppendTo.appendChild(card)
    card.appendChild(cardHeader)
    card.appendChild(cardBody)
    cardBody.appendChild(btnPlus)
    cardBody.appendChild(btnMinus)
}

function createCard(mainGroup, middleGroup, groupAddress, elementToAppendTo) {
    let card = document.createElement("div");
    let cardHeader = document.createElement("div");
    let cardBody = document.createElement("div")
    addKnxAttributes(mainGroup, middleGroup, groupAddress, cardBody)
    card.classList.add("card")
    cardHeader.classList.add("card-header")
    cardBody.classList.add("card-body")
    cardHeader.innerHTML = groupAddress.name
    cardBody.innerHTML = "Temp"
    elementToAppendTo.appendChild(card)
    card.appendChild(cardHeader)
    card.appendChild(cardBody)
}

function createSlider(mainGroup, middleGroup, groupAddress, elementToAppendTo) {
    let card = document.createElement("div");
    let cardHeader = document.createElement("div");
    let cardBody = document.createElement("div")
    addKnxAttributes(mainGroup, middleGroup, groupAddress, cardBody)
    card.classList.add("card")
    cardHeader.classList.add("card-header")
    cardBody.classList.add("card-body")
    cardHeader.innerHTML = groupAddress.name
    //cardBody.innerHTML = "Brightness"
    elementToAppendTo.appendChild(card)

    let panel = document.createElement('input')
    panel.classList.add("form-control")
    panel.type = "text"
    panel.value = "brightness"
    cardBody.appendChild(panel)


    let slider = document.createElement("input")
    slider.type = "range"
    slider.classList.add("form-range")
    slider.onchange = function () {
        var scaledValue = slider.value / 100 * 255
        console.log(scaledValue)
        $.post({
            url: '/groupAddressCall/setAbsoluteValue',
            data: JSON.stringify({ mainGroup: mainGroup.name, middleGroup: middleGroup.name, groupAddress: groupAddress.name, value: scaledValue }),
            contentType: 'application/json; charset=utf-8'
        })
    }
    cardBody.appendChild(slider)

    card.appendChild(cardHeader)
    card.appendChild(cardBody)
}

function addKnxAttributes(mainGroup, middleGroup, groupAddress, element) {
    element.setAttribute('mainGroup', mainGroup.name)
    element.setAttribute('middleGroup', middleGroup.name)
    element.setAttribute('groupAddress', groupAddress.name)
    element.setAttribute('groupAdressNumber', groupAddress.address)
    element.setAttribute('displayElement', groupAddress.displayElement)
    element.classList.add('relevantForUpdate')
}

function createNavTabsAndTabContent(tabName, parentElement){
    var parent = document.getElementById(parentElement)
    console.log('addind')
    var navTab = $(`<ul class="nav nav-tabs" id="${tabName}_tab" role="tablist"></ul>`)
    navTab.appendTo(parent)
    $(`<div class="tab-content" id="${tabName}_content">`).insertAfter(navTab)

}

function appendTab(tabName, parentTab, parentTabContents) {
    var ul = document.getElementById(parentTab)
    var tabContents = document.getElementById(parentTabContents)
    $(`<li class="nav-item"> <a class="nav-link" data-bs-toggle="tab" href='#${tabName}'>${tabName}</a></li>`).appendTo(ul)
    $(`<div class="tab-pane" role="tabpanel" id=${tabName}>`).appendTo(tabContents)
}

function appendCardsToTab(tabName){
    createCardElement('Licht', tabName).appendTo(`#${tabName}`)
    createCardElement('Heizung', tabName).appendTo(`#${tabName}`)
    createCardElement('Szenen', tabName).appendTo(`#${tabName}`)
}


function setReadWriteProperties(domElement, groupAddress) {
    if (!groupAddress.isWrite) {
        domElement.setAttribute("readonly", "readonly")
        domElement.setAttribute('disabled', 'disabled');
    }
}

function createCardElement(functionGroup, tabName) {
    var cardElement = $(`<div class="card" style=margin-top:10px>
                    <div class="card-header">
                        ${functionGroup}
                    </div>
                    <div class="card-body" id=${tabName}_${functionGroup}>
                    </div>
                </div>`)
    return cardElement
}

function getLastRow(elementWithRows) {
    var allRows = elementWithRows.getElementsByClassName("row")
    var lastRow = allRows[allRows.length - 1]
    return lastRow
}

function setImpulseValue(btn) {
    btn.classList.remove("btn-secondary")
    btn.classList.add("btn-primary")
    setTimeout(() => {
        btn.classList.remove("btn-primary")
        btn.classList.add("btn-secondary")
    }, 1000)
}