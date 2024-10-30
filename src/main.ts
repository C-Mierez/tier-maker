import "./style.css";

// Constants
const TierColorsVars = ["--color-s", "--color-a", "--color-b", "--color-c", "--color-d", "--color-e", "--color-f"];

// Elements
const $tierList = document.querySelector(".list") as HTMLDivElement;
const $tiers = document.querySelectorAll(".tier") as NodeListOf<HTMLDivElement>;

function start() {
    colorTiers();
}

function colorTiers() {
    $tiers.forEach(($tier, index) => {
        $tier.style.setProperty("--color", `var(${TierColorsVars[index]})`);
    });
}

start();
