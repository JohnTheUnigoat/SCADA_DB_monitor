const varialbeDataUrl = "/variableData";

(async () => {
    let variableDescriptions = await (await fetch(varialbeDataUrl)).json();

    console.log(variableDescriptions);

    generatePage(variableDescriptions);
})();

function generatePage(variableDescriptions) {
    let select = document.getElementById("chart-select");

    variableDescriptions.forEach(varDesc => {
        let option = document.createElement("option");
        option.value = varDesc.id;
        option.innerText = varDesc.name;
        select.appendChild(option);
    });

    select.children[0].setAttribute("selected", "selected");
}
