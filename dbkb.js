javascript:(function () {
    // Utility function to evaluate XPath and return the first matching element
    function evaluateXPath(xpath) {
        try {
            return document.evaluate(
                xpath,
                document,
                null,
                XPathResult.ANY_TYPE,
                null
            ).iterateNext();
        } catch (e) {
            console.error(`Error evaluating XPath: ${xpath}`, e);
            return null;
        }
    }

    // Items used for bringing things into the game (summons, activations, etc)
    const playGroup = ["Normal Summon", ["S. Summon DEF", "SS DEF"],
        ["S. Summon ATK", "SS ATK"], "Set", ["Flip Summon", "Flip"], "Activate"];

    // Items used mainly for communication purposes.
    const comGroup = ["Declare", "Target", "Reveal"];

    // Items used for updating on-board monsters.
    const onBoardUpdateGroup = ["To DEF", "To ATK", "Overlay", "Attach", "Detach"];

    // Items used for moving cards to different locations.
    const repositionGroup = ["Move", "Banish", "Banish FD", "To S/T", "To Hand",
        ["To Grave", "To Graveyard"], "To Extra Deck FU", "To Extra Deck",
        ["To T. Deck", "To Top of Deck"], ["To B. Deck", "To Bottom of Deck"] ];

    // Items specific to the deck.
    const deckGroup = ["View", "Mill", "Draw", "Shuffle", "Banish T."];

    // This ranked list is used to order the display. It ensures that even when certain
    // items are not available, the order stays the same. Also allows for coloring groups.
    const rankingList = [
        ...playGroup,
        ...repositionGroup,
        ...onBoardUpdateGroup,
        ...comGroup,
        ...deckGroup,
    ];

// Define action groups with associated colors. The background and foreground are for the keybind display.
const actionGroups = [
    {
        actions: playGroup,
        // Green
        colors: { background: "#01987533", foreground: "#c8f7c5FF" },
    },
    {
        actions: comGroup,
        // Blue
        colors: { background: "#2757d666", foreground: "#89CFF0FF" },
    },
    {
        actions: onBoardUpdateGroup,
        // Gold
        colors: { background: "#FFD70033", foreground: "#D4A017" },
    },
    {
        actions: repositionGroup,
        // Red
        colors: { background: "#b2353566", foreground: "#e4a4a4FF" },
    },
    {
        actions: deckGroup,
        // Indigo
        colors: { background: "#5a2c8566", foreground: "#C586E5" },
    },
];

// Flatten actions and map them to their colors
const actionToColors = {};
actionGroups.forEach(({ actions, colors }) => {
    actions.flat().forEach((action) => {
        actionToColors[action] = colors;
    });
});

// Function to get colors for a specific action
function getActionColors(action) {
    return actionToColors[action] || { background: "rgba(0, 0, 0, 0.2)", foreground: "white" };
}
    const keyActions = {
        q: [
            '//*[@id="card_menu_content"]/div[. = "S. Summon DEF"]',
            '//*[@id="card_menu_content"]/div[. = "SS DEF"]',
            '//*[@id="card_menu_content"]/div[. = "To DEF"]',
            '//*[@id="card_menu_content"]/div[. = "Activate"]',
        ],
        w: [
            '//*[@id="card_menu_content"]/div[. = "Normal Summon"]',
            '//*[@id="card_menu_content"]/div[. = "To ATK"]',
            '//*[@id="card_menu_content"]/div[. = "Flip Summon"]',
            '//*[@id="card_menu_content"]/div[. = "Activate"]',
        ],
        e: [
            '//*[@id="card_menu_content"]/div[. = "S. Summon ATK"]',
            '//*[@id="card_menu_content"]/div[. = "SS ATK"]',
            '//*[@id="card_menu_content"]/div[. = "To ATK"]',
            '//*[@id="card_menu_content"]/div[. = "Flip Summon"]',
            '//*[@id="card_menu_content"]/div[. = "Activate"]',
        ],
        r: [
            '//*[@id="card_menu_content"]/div[. = "Banish"]',
            '//*[@id="card_menu_content"]/div[. = "Banish T."]',
        ],
        a: [
            '//*[@id="card_menu_content"]/div[. = "Reveal"]',
            '//*[@id="card_menu_content"]/div[. = "Overlay"]',
            '//*[@id="card_menu_content"]/div[. = "Attach"]',
            '//*[@id="card_menu_content"]/div[. = "Detach"]',
        ],
        s: [
            '//*[@id="card_menu_content"]/div[. = "Set"]',
            '//*[@id="card_menu_content"]/div[. = "Flip"]',
            '//*[@id="card_menu_content"]/div[. = "To S/T"]',
        ],
        d: [
            '//*[@id="card_menu_content"]/div[. = "Declare"]',
            '//*[@id="card_menu_content"]/div[. = "Target"]',
            '//*[@id="card_menu_content"]/div[. = "View"]',
        ],
        f: [
            '//*[@id="card_menu_content"]/div[. = "To Extra Deck FU"]',
            '//*[@id="card_menu_content"]/div[. = "To Grave"]',
            '//*[@id="card_menu_content"]/div[. = "Mill"]',
            '//*[@id="card_menu_content"]/div[. = "To Graveyard"]',
        ],
        z: [
            '//*[@id="card_menu_content"]/div[. = "To Hand"]',
            '//*[@id="card_menu_content"]/div[. = "To Extra Deck"]',
        ],
        x: [
            '//*[@id="card_menu_content"]/div[. = "Banish FD"]',
            '//*[@id="card_menu_content"]/div[. = "To Grave"]',
        ],
        c: [
            '//*[@id="card_menu_content"]/div[. = "To Top of Deck"]',
            '//*[@id="card_menu_content"]/div[. = "To T. Deck"]',
            '//*[@id="card_menu_content"]/div[. = "To Extra Deck"]',
            '//*[@id="card_menu_content"]/div[. = "Draw"]',
        ],
        v: [
            '//*[@id="card_menu_content"]/div[. = "To Bottom of Deck"]',
            '//*[@id="card_menu_content"]/div[. = "To B. Deck"]',
            '//*[@id="card_menu_content"]/div[. = "To Extra Deck"]',
            '//*[@id="card_menu_content"]/div[. = "Shuffle"]',
        ],
        m: ['//*[@id="card_menu_content"]/div[. = "Move"]'],
        " ": ['//*[@id="card_menu_content"]/div[. = "Target"]']
    };

    // Store current action-to-key mapping dynamically
    let currentMenu = [];

    function resolveKeybinds() {
        // We only want to show the best-match action available for this card.
        const visibleActions = new Map();
    
        // The key mappings are ordered such that the first we find is the one we should use, the rest are fallbacks.
        Object.entries(keyActions).forEach(([key, xpaths]) => {
            for (const xpath of xpaths) {
                const element = evaluateXPath(xpath);
                if (element) {
                    const actionName = xpath.match(/div\[\. = "(.*?)"]/)[1];
                    if (!visibleActions.has(key)) {
                        // Store the resolved action for the key
                        visibleActions.set(key, actionName);
                        break;
                    }
                }
            }
        });

        // Use the ranking list to order actions and eliminate duplicates
        const resolvedActions = new Set();
        currentMenu = rankingList
            .flatMap((item) =>
                Array.isArray(item) ? item.find((synonym) => [...visibleActions.values()].includes(synonym)) : item
            )
            .filter((action) => {
                if ([...visibleActions.values()].includes(action) && !resolvedActions.has(action)) {
                    resolvedActions.add(action);
                    return true;
                }
                return false;
            })
            .map((action) => {
                // Map the action back to its resolved key
                const key = [...visibleActions.entries()].find(([, value]) => value === action)?.[0] || "";
                return { action, key: key === " " ? "Space" : key.toUpperCase() };
            });
    
        console.log("Resolved Current Menu:", currentMenu);
    
        updateKeybindDisplay();
    }

    // Create the keybind display
    let keybindsContainer = document.createElement("div");
    keybindsContainer.style.position = "fixed";
    keybindsContainer.style.top = "10px";
    keybindsContainer.style.left = "10px";
    keybindsContainer.style.width = "250px";
    keybindsContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    keybindsContainer.style.color = "white";
    keybindsContainer.style.padding = "10px";
    keybindsContainer.style.borderRadius = "8px";
    keybindsContainer.style.fontFamily = "Arial, sans-serif";
    keybindsContainer.style.fontSize = "14px";
    keybindsContainer.style.zIndex = "10000";
    keybindsContainer.style.transform = "scale(0.95)";
    keybindsContainer.style.transformOrigin = "top left";

    document.body.appendChild(keybindsContainer);

    // Function to update the keybind display
    function updateKeybindDisplay() {
        let html = `
            <h3 style="
                margin: 0 0 10px;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                color: white;
                text-decoration: underline;
            ">
                Keybinds
            </h3>
            <ul style="
                list-style: none;
                padding: 0;
                margin: 0;
                line-height: 1.8;
                font-family: 'Courier New', monospace;
                font-size: 16px;
            ">
        `;
        currentMenu.forEach(({ action, key }, index) => {
            const { background, foreground } = getActionColors(action);

            // Better visual rows with alternating contrast.
            const rowBackground = index % 2 === 0 ? "rgba(255, 255, 255, 0.1)" : "rgba(50, 50, 50, 0.2)";
            html += `
                <li style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: ${rowBackground};
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-bottom: 4px;
                ">
                    <span style="color: lightgray; text-align: left;">${action}</span>
                    <span style="
                        background-color: ${background};
                        color: ${foreground};
                        font-weight: bold;
                        padding: 4px 8px;
                        border-radius: 6px;
                        text-align: center;
                        min-width: 30px;
                        font-size: 20px;
                        line-height: 1;
                        display: inline-block;
                    ">
                        ${key}
                    </span>
                </li>
            `;
        });
        html += `</ul>`;
        keybindsContainer.innerHTML = html;
    }

    function detectHoverChanges(mutationsList) {
        let hoverChanged = false;
        mutationsList.forEach((mutation) => {
            if (mutation.type === "childList") {
                if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                    hoverChanged = true;
                }
            }
        });
        if (hoverChanged) {
            resolveKeybinds();
        }
    }

    function observeCardMenu(targetNode) {
        const observer = new MutationObserver(detectHoverChanges);
        observer.observe(targetNode, { childList: true, subtree: true });
        console.log("Hover detection observer initialized.");
    }

    function waitForCardMenu() {
        const interval = setInterval(() => {
            const targetNode = document.querySelector("#card_menu_content");
            if (targetNode) {
                clearInterval(interval);
                console.log("Card menu container detected. Starting observer...");
                observeCardMenu(targetNode);
                resolveKeybinds();
            }
        }, 500); // 500ms
    }

    document.addEventListener("keypress", function (event) {
        const pressedKey = event.key === " " ? "Space" : event.key.toUpperCase();
    
        // Find the resolved action for the pressed key in `currentMenu`
        const menuEntry = currentMenu.find(({ key }) => key === pressedKey);

        if (menuEntry) {
            const action = menuEntry.action;
    
            // Retrieve the specific XPath for the action under the pressed key
            const xpaths = keyActions[event.key] || [];
            const xpath = xpaths.find((xp) => xp.includes(`"${action}"`));
    
            if (xpath) {
                const element = evaluateXPath(xpath);
                if (element) {
                    console.log("Clicking Element for Action:", action);
                    element.click();
                }
            }
        }
    });
    waitForCardMenu();
})();
