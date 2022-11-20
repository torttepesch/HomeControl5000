const socket = io()

socket.on('updateGroupAddress', function (busUpdate) {
    console.log(busUpdate)
    var updatedElement = document.querySelector(`[groupAdressNumber="${busUpdate.groupAddress}"]`);
    var displayElement = updatedElement.getAttribute('displayElement')
    console.log(displayElement)
    if (displayElement == 'Button') {
        setButtonStatus(busUpdate.dataValue, updatedElement)
    }
    else if (displayElement == 'Card') {
        setPanelValue(busUpdate.dataValue, updatedElement)
    }
    else if (displayElement == 'Slider') {
        setSliderValue(busUpdate.dataValue, updatedElement)
    }
})

function setSliderValue(updateValue, panel) {
    console.log(updateValue)
    var slider = panel.querySelector(".form-range");
    var input = panel.querySelector(".form-control")
    var updateValueNumber = parseFloat(updateValue)
    var updateValueNumberRounded = round(updateValueNumber, 0)
    slider.value = updateValueNumberRounded
    input.value = updateValueNumberRounded + " %"
}

function setPanelValue(updateValue, panel) {
    console.log(updateValue)
    var updateValueNumber = parseFloat(updateValue)
    var updateValueNumberRounded = round(updateValueNumber, 1)
    panel.innerHTML = updateValueNumberRounded
}

async function readAndSetStatus(element) {
    var displayElement = element.getAttribute('displayElement')
    if (displayElement == 'Button') {
        await placePostRequest('/groupAddressValue', element, setButtonStatus)
    }
    else if (displayElement == 'Card') {
        await placePostRequest('/groupAddressValue', element, setPanelValue)
    }
}

async function placePostRequest(url, element, functionInThen) {
    return new Promise((resolve, reject) => {
        $.post({
            url: url,
            data: JSON.stringify({ mainGroup: element.getAttribute('mainGroup'), middleGroup: element.getAttribute('middleGroup'), groupAddress: element.getAttribute('groupAddress') }),
            contentType: 'application/json; charset=utf-8'
        })
            .then((updateValue) => {
                functionInThen(updateValue, element)
                resolve()
            })
            .catch((error) => { reject(error) })
    })
}

function setButtonStatus(status, btn) {
    console.log(status)

    if (status == '1') {
        btn.classList.remove("btn-secondary")
        btn.classList.add("btn-primary")
    }
    else if (status == '0') {
        btn.classList.remove("btn-primary")
        btn.classList.add("btn-secondary")
    }
    else {
        btn.classList.remove("btn-primary")
        btn.classList.remove("btn-secondary")
        btn.classList.add("btn-danger")
        btn.setAttribute('disabled', 'disabled');

        //window.alert(status)
        console.log(status)
    }
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}