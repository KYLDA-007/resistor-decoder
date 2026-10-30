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
    {name: "Black", digit: 0, multiplier: 1, tolerance: null, tempco: 250, hex: "#000000"}, 
    {name: "Brown", digit: 1, multiplier: 10, tolerance: 1, tempco: 100, hex: "#8B4513"},
    {name: "Red", digit: 2, multiplier: 100, tolerance: 2, tempco: 50, hex: "#E01010" },
    {name: "Orange", digit: 3, multiplier: 1e3, tolerance: 0.05, tempco: 15, hex: "#FF8C00" },
    {name: "Yellow", digit: 4, multiplier: 1e4, tolerance: 0.02, tempco: 25, hex: "#FFD700"},
    {name: "Green", digit: 5, multiplier: 1e5, tolerance: 0.5, tempco: 20, hex: "#228B22" },
    {name: "Blue", digit: 6, multiplier: 1e6, tolerance: 0.25, tempco: 10, hex: "#1E5BFF"},
    {name: "Violet", digit: 7, multiplier: 1e7, tolerance: 0.1, tempco: 5, hex: "#8A2BE2"},
    {name: "Grey" , digit: 8, multiplier: 1e8, tolerance: 0.01, tempco: 1, hex: "#808080"},
    {name: "White" , digit: 9, multiplier: 1e9, tolerance: null, tempco: null, hex: "#FFFFFF"},
    {name: "Gold" , digit: null, multiplier: 0.1, tolerance: 5, tempco: null, hex: "#CFB53B"},
    {name: "Silver" , digit: null, multiplier: 0.01, tolerance: 10, tempco: null, hex: "#C0C0C0"}
];

const bandLayouts = {
    4: ["digit", "digit", "multiplier", "tolerance"],
    5: ["digit", "digit", "digit", "multiplier", "tolerance"],
    6: ["digit", "digit", "digit", "multiplier", "tolerance", "tempco"]
};

const bandPositions = {
    4: [95, 118, 141, 200],
    5: [88, 108, 128, 148, 200],
    6: [85, 103, 121, 139, 183, 203]
};

const bandCount = document.getElementById("band-count");
const bandsBox = document.getElementById("bands");
const result = document.getElementById("result");
const resistorSvg = document.getElementById("resistor");

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
    if (value >= 1e9) return +(value / 1e9).toPrecision(2) + " G\u03A9";
    if (value >= 1e6) return +(value / 1e6).toPrecision(2) + " M\u03A9";
    if (value >= 1e3) return +(value / 1e3).toPrecision(2) + " K\u03A9";
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
    drawResistor();
}


function drawResistor() {
    const selects = bandsBox.querySelectorAll("select");
    const positions = bandPositions[selects.length];

    let svg = `<line x1="0" y1="40" x2="300" y2="40" stroke="#999" stroke-width="4" />`;
    svg += `<rect x="70" y="15" width="160" height="50" rx="20" fill="#E8D3A8" />`;

    selects.forEach((select, i) => {
        const color = colors[select.value];
        svg += `<rect x="${positions[i]}" y="15" width="12" height="50" fill="${color.hex}" />`;
    });

    resistorSvg.innerHTML = svg;
}

const smdInput = document.getElementById("smd-input");
const smdResult = document.getElementById("smd-result");

function decodeSmd(code) {
    code = code.trim().toUpperCase();

    if (/^0+$/.test(code)) return 0;
    if (/^\d{3}$/.test(code)) {
        return Number(code.slice(0, 2)) * 10 ** Number(code[2]);
    }
    if (/^\d{4}$/.test(code)) {
        return Number(code.slice(0, 3)) * 10 ** Number(code[3]);
    }
    if (/^\d*R\d*$/.test(code) && code.length > 1) {
        return Number(code.replace("R", "."));
    }
    const eia = code.match(/^(\d{2})([ZYRXSABHCDEF])$/);
    if (eia) {
    const index = Number(eia[1]);
    if (index >= 1 && index <= 96) {
        return e96[index - 1] * eiaMultipliers[eia[2]];
        }
    }   
    
    return null;
}

smdInput.addEventListener("input", () => {
    const value = decodeSmd(smdInput.value);

    if (smdInput.value.trim() === "") {
        smdResult.textContent = "Resistance: -";
    } else if (value === null) {
        smdResult.textContent = "Unknown code";
    } else {
        smdResult.textContent = "Resistance: " + formatOhms(value);
    }
});

const e96 = [
    100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130,
    133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174,
    178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232,
    237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309,
    316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412,
    422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549,
    562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732,
    750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976
];

const eiaMultipliers = {
    Z: 0.001,
    Y: 0.01, R: 0.01,
    X: 0.1, S: 0.1, 
    A: 1,
    B: 10, H: 10,
    C: 100,
    D: 1000,
    E: 10000,
    F: 100000
};

