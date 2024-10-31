import "./style.css";
import { $, $$ } from "./utils";

// Constants
const TierColorsVars = ["--color-s", "--color-a", "--color-b", "--color-c", "--color-d", "--color-e", "--color-f"];

// Elements
const $tierList = $(".list") as HTMLDivElement;
const $tiers = $$(".tier") as NodeListOf<HTMLDivElement>;
const $imageInput = $("#image-input") as HTMLInputElement;
const $selectionItems = $("#selection-items") as HTMLDivElement;
const $resetTiersButton = $("#reset-tiers") as HTMLButtonElement;

// Drag Behaviour
let draggedItem: HTMLLIElement | null = null;
let draggedPreview: HTMLLIElement | null = null;
let sourceContainer: HTMLDivElement | null = null;

/* -------------------------------- Functions ------------------------------- */
function start() {
    colorTiers();
    bindEvents();
}

function colorTiers() {
    $tiers.forEach(($tier, index) => {
        $tier.style.setProperty("--color", `var(${TierColorsVars[index]})`);
    });
}

function bindEvents() {
    // Input image load
    $imageInput.addEventListener("change", handleImageChange);

    // Tier row drag events
    $tiers.forEach(($tier) => {
        $tier.addEventListener("drop", handleTierDrop);
        $tier.addEventListener("dragover", handleTierDragOver);
        $tier.addEventListener("dragleave", handleTierDragLeave);
    });

    // Selection items drag events
    $selectionItems.addEventListener("drop", handleTierDrop);
    $selectionItems.addEventListener("dragover", handleTierDragOver);
    $selectionItems.addEventListener("dragleave", handleTierDragLeave);

    $selectionItems.addEventListener("drop", handleDropFromDesktop);
    $selectionItems.addEventListener("dragover", handleDragOverFromDesktop);
    $selectionItems.addEventListener("dragleave", handleDragLeaveFromDesktop);

    // Reset button
    $resetTiersButton.addEventListener("click", handleResetTiers);
}

function _createNewItem(src: string) {
    const $newLi = document.createElement("li");
    $newLi.classList.add("tier-li");

    const $newImg = document.createElement("img");
    $newImg.src = src;
    $newImg.alt = "Uploaded Image";
    // Draggable properties
    $newLi.draggable = true;
    $newLi.addEventListener("dragstart", handleItemDragStart);
    $newLi.addEventListener("dragend", handleItemDragEnd);

    $newLi.appendChild($newImg);

    return $newLi;
}

/* -------------------------------- Handlers -------------------------------- */
function handleImageChange(e: Event) {
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;

    createItemsFromFiles(target.files);
}

function createItemsFromFiles(files: FileList | null) {
    if (files) {
        [...files].forEach((file) => {
            const reader = new FileReader();

            reader.onload = (readerEvent) => {
                const result = readerEvent.target?.result;
                if (typeof result === "string") {
                    $selectionItems.appendChild(_createNewItem(result));
                }
            };

            reader.readAsDataURL(file);
        });
    }
}

function handleItemDragStart(e: DragEvent) {
    const target = e.target;
    if (!(target instanceof HTMLLIElement)) return;

    draggedItem = target;
    sourceContainer = target.parentElement as HTMLDivElement;

    // Get src from child img
    const img = target.querySelector("img");
    if (!img) return;

    e.dataTransfer?.setData("text/plain", img.src);
}

function handleItemDragEnd(e: DragEvent) {
    const target = e.target;
    if (!(target instanceof HTMLLIElement)) return;

    draggedItem = null;
    sourceContainer = null;
}

function handleTierDrop(e: DragEvent) {
    e.preventDefault();
    const target = e.target as HTMLDivElement;
    if (!target.getAttribute("data-droppable")) return;

    if (draggedItem && sourceContainer) {
        if (sourceContainer === target) return;

        sourceContainer.removeChild(draggedItem);

        const src = e.dataTransfer?.getData("text/plain");
        if (!src) return;
        const $newLi = _createNewItem(src);
        target.appendChild($newLi);

        target.classList.remove("drag-over");
    }

    if (draggedItem && draggedPreview) {
        target.querySelector(".drag-preview")?.remove();
        draggedPreview = null;
    }
}

function handleTierDragOver(e: DragEvent) {
    e.preventDefault();

    const target = e.target as HTMLDivElement;
    if (!target.getAttribute("data-droppable")) return;

    if (draggedItem && sourceContainer) {
        if (sourceContainer === target) return;

        target.classList.add("drag-over");
    }

    if (draggedItem && !draggedPreview) {
        draggedPreview = draggedItem.cloneNode(true) as HTMLLIElement;
        draggedPreview.classList.add("drag-preview");
        target.appendChild(draggedPreview);
    }
}

function handleTierDragLeave(e: DragEvent) {
    e.preventDefault();

    const target = e.target as HTMLDivElement;
    if (!target.getAttribute("data-droppable")) return;

    if (draggedItem && sourceContainer) {
        if (sourceContainer === target) return;

        target.classList.remove("drag-over");
    }

    if (draggedItem && draggedPreview) {
        target.querySelector(".drag-preview")?.remove();
        draggedPreview = null;
    }
}

function handleResetTiers() {
    const $items = $$(".tier-li") as NodeListOf<HTMLLIElement>;
    $items.forEach(($item) => {
        $item.remove();
        $selectionItems.appendChild($item);
    });
}

function handleDropFromDesktop(e: DragEvent) {
    e.preventDefault();

    if (e.dataTransfer?.types.includes("Files")) {
        $selectionItems.classList.remove("drag-over-desktop");

        createItemsFromFiles(e.dataTransfer.files);
    }
}

function handleDragOverFromDesktop(e: DragEvent) {
    e.preventDefault();

    if (e.dataTransfer?.types.includes("Files")) {
        $selectionItems.classList.add("drag-over-desktop");
    }
}

function handleDragLeaveFromDesktop(e: DragEvent) {
    e.preventDefault();
    $selectionItems.classList.remove("drag-over-desktop");
}

start();
