const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});

const colors = [
    {name: "Black", digit: 0, multiplier: 1, tolerance: null, tempco: 250 },
    {name: "Brown", digit: 1, multiplier: 10, tolerance: 1, tempco: 100 },
    {name: "Red", digit: 2, multiplier: 100, tolerance: 2, tempco: 50 },
    {name: "Orange", digit: 3, multiplier: 1e3, tolerance: 0.05, tempco: 15 },
    {name: "Yellow", digit: 4, multiplier: 1e4, tolerance: 0.02, tempco: 25 },
    {name: "Green", digit: 5, multiplier: 1e5, tolerance: 0.5, tempco: 20 },
    {name: "Blue", digit: 6, multiplier: 1e6, tolerance: 0.25, tempco: 10 },
    {name: "Violet", digit: 7, multiplier: 1e7, tolerance: 0.1, tempco: 5 },
    {name: "Grey" , digit: 8, multiplier: 1e8, tolerance: 0.01, tempco: 1 },
    {name: "White" , digit: 9, multiplier: 1e9, tolerance: null, tempco: null },
    {name: "Gold" , digit: null, multiplier: 0.1, tolerance: 5, tempco: null },
    {name: "Silver" , digit: null, multiplier: 0.01, tolerance: 10, tempco: null }
];

const bandLayouts = {
    4: ["digit", "digit", "multiplier", "tolerance"],
    5: ["digit", "digit", "digit", "multiplier", "tolerance"],
    6: ["digit", "digit", "digit", "multiplier", "tolerance", "tempco"]
};

const bandCount = document.getElementById("band-count");
const bandsBox = document.getElementById("bands");
const result = document.getElementById("result");

function buildBands() {
    bandsBox.innerHTML = "";
    const layout = bandLayouts[bandCount.value];
    
    layout.forEach(role => {
        const select = document.createElement("select");
        select.dataset.role = role;

        colors.forEach((color, index) => {
            if (color[role] === null) return;
            const option = document.createElement("option");
            option.value = index;
            option.textContent = color.name;
            select.appendChild(option);
        });
        bandsBox.appendChild(select);
     });
     calculate();
}
bandCount.addEventListener("change", buildBands);
bandsBox.addEventListener("change", calculate);
buildBands();

function formatOhms(value) {
    if (value >= 1e9) return +(value / 1e9).toFixed(2) + " G\u03A9";
    if (value >= 1e6) return +(value / 1e6).toFixed(2) + " M\u03A9";
    if (value >= 1e3) return +(value / 1e3).toFixed(2) + " K\u03A9";
    return +value.toFixed(2) + " \u03A9";
}

function calculate() {
    const selects = bandsBox.querySelectorAll("select");
    let digits = "";
    let multiplier = 1;
    let tolerance = null;
    let tempco = null;

    selects.forEach(select => {
        const color = colors[select.value];
        const role = select.dataset.role;

        if (role === "digit") digits += color.digit;
        if (role === "multiplier") multiplier = color.multiplier;
        if (role === "tolerance") tolerance = color.tolerance;
        if (role === "tempco") tempco = color.tempco;
    });

    const value = Number(digits) * multiplier;
    let text = "Resistance: " + formatOhms(value) + " ±" + tolerance + "%";
    if (tempco !== null) text += ", " + tempco + " ppm/K";

    result.textContent = text;
}
