javascript:(function () {

    const style = document.createElement("style");

    style.textContent = `
        #keybindsContainer {
            position: fixed;
            top: 10px;
            left: 10px;
            width: 250px;
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            transform: scale(0.95);
            transform-origin: top left;
        }

        #keybindsContainer h3 {
            margin: 0 0 10px;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            color: white;
            text-decoration: underline;
        }

        #keybindsContainer ul {
            list-style: none;
            padding: 0;
            margin: 0;
            line-height: 1.8;
            font-family: 'Courier New', monospace;
            font-size: 16px;
        }

        #keybindsContainer li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            margin-bottom: 4px;
        }

        #keybindsContainer li:nth-child(odd) {
            background-color: rgba(50, 50, 50, 0.2);
        }

        .keybind-action {
            color: lightgray;
            text-align: left;
        }

        .keybind-group-play {
            --background-color: #01987533;
            --foreground-color: #c8f7c5FF;
        }

        .keybind-group-com {
            --background-color: #2757d666;
            --foreground-color: #89CFF0FF;
        }

        .keybind-group-update {
            --background-color: #FFD70033;
            --foreground-color: #D4A017;
        }

        .keybind-group-reposition {
            --background-color: #b2353566;
            --foreground-color: #e4a4a4FF;
        }

        .keybind-group-deck {
            --background-color: #5a2c8566;
            --foreground-color: #C586E5;
        }

        .keybind-key {
            background-color: var(--background-color);
            color: var(--foreground-color);
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 6px;
            text-align: center;
            min-width: 30px;
            font-size: 20px;
            line-height: 1;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);

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
        { actions: playGroup, cssClass: "keybind-group-play" },
        { actions: comGroup, cssClass: "keybind-group-com" },
        { actions: onBoardUpdateGroup, cssClass: "keybind-group-update" },
        { actions: repositionGroup, cssClass: "keybind-group-reposition" },
        { actions: deckGroup, cssClass: "keybind-group-deck" },
    ];

    const actionToCssClass = {};
    actionGroups.forEach(({ actions, cssClass }) => {
        actions.flat().forEach((action) => {
            actionToCssClass[action] = cssClass;
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

    // Append container to body
    const keybindsContainer = document.createElement("div");
    keybindsContainer.id = "keybindsContainer";
    document.body.appendChild(keybindsContainer);

    function updateKeybindDisplay() {
        let html = `
            <h3>Keybinds</h3>
            <ul>
        `;
        currentMenu.forEach(({ action, key }) => {
            const cssClass = actionToCssClass[action] || "";
    
            html += `
                <li class="${cssClass}">
                    <span class="keybind-action">${action}</span>
                    <span class="keybind-key">${key}</span>
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
