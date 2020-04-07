var myItems = {
    floorSpace: 2,
    availableFloorSpace: 2,
    availableEnergyStorage: 100,
    energy: 0,

    // // // ironOre: 99,
    // // energy: 100,

    // energy: 0,
    // solarPanels: 2,
    // nutrientStations: 2,
    // crewMembers: 2,
    // silicon: 100,
    // iron: 100,
    // // siliconOre: 10,
    // // ironOre: 10,
}

destroyableItems = [
    "cargoContainers",
    "ironOre",
    "siliconOre",
    "iron",
    "silicon",
    "solarPanels",
    "crewMembers",
    "deadBodies",
    "nutrientStations",
    "thrusters",
];

function haveItems() {
    for (item in this.args) {
        if (item != "customFunction") {
            if (this.args[item] < 0 && (myItems[item]?myItems[item]:0) < -this.args[item]) return false;
        }
    }
    return true;
}

function haveItems2(ok) {
    for (item in ok.args) {
        if (item != "customFunction") {
            if (ok.args[item] < 0 && (myItems[item]?myItems[item]:0) < -ok.args[item]) return false;
        }
    }
    return true;
}

var actions = [
    {
        name: "CrankGenerator",
        tooltip: "Effects: 1 energy",
        function: craft,
        args: {
            energy: 1,
        },
        duration: 2,
        enableOn: function() {return myItems.explore >= 1},
        usable: function() {return true},
    },
    {
        name: "MineAsteroid",
        tooltip: "Cost: 2 energy\n Effects: 1 iron ore or 1 silicon ore",
        function: search,
        args: {
            ironOre: 0.5,
            siliconOre: 0.5,
            // nickelOre: 0.1,
            // cobaltOre: 0.1,
        },
        duration: 4,
        enableOn: function() {return myItems.explore >= 2},
        usable: function() {
            updateCargoSpace();
            return myItems.energy >= 2 && myItems.availableCargoSpace >= 1
        },
    },
    {
        name: "SmeltIron",
        tooltip: "Cost: 2 iron ore, 1 energy\nEffects: 1 iron",
        function: craft,
        args: {
            ironOre: -2,
            energy: -1,
            iron: 1,
        },
        duration: 4,
        enableOn: function() {return myItems.explore >= 4},
        usable: haveItems,
    },
    {
        name: "SmeltSilicon",
        tooltip: "Cost: 2 silicon ore, 1 energy\nEffects: 1 silicon",
        function: craft,
        args: {
            siliconOre: -2,
            energy: -1,
            silicon: 1,
        },
        duration: 4,
        enableOn: function() {return myItems.explore >= 4},
        usable: haveItems,
    },
    {
        name: "BuildSolarPanel",
        tooltip: "Cost: 1 silicon, 1 iron, 1 floor space\nEffects: 1 energy per second",
        function: craft,
        args: {
            silicon: -1,
            iron: -1,
            availableFloorSpace: -1,
            solarPanels: 1,
        },
        duration: 8,
        enableOn: function() {return myItems.explore >= 5},
        usable: haveItems,
    },
    {
        name: "BuildNutrientStation",
        tooltip: "Cost: 5 iron, 1 floor space\nEffects: 2 food per second",
        function: craft,
        args: {
            iron: -5,
            availableFloorSpace: -1,
            nutrientStations: 1,
        },
        duration: 4,
        enableOn: function() {return myItems.explore >= 6},
        usable: haveItems,
    },
    {
        name: "ThawCrewMember",
        tooltip: "<i>Only slight freezerburn</i>",
        function: craft,
        args: {
            crewMembers: 1,
        },
        duration: 10,
        enableOn: function() {return myItems.explore >= 3},
        usable: function() {return true},
    },
    {
        name: "ExpandSpacecraft",
        tooltip: "Cost: 8 iron\nEffects: 1 floor space",
        function: craft,
        args: {
            iron: -8,
            floorSpace: 1,
        },
        duration: 10,
        enableOn: function() {return myItems.explore >= 8},
        usable: haveItems,
    },
    {
        name: "ManTheHelm",
        tooltip: "Cost: 10 energy per thruster\n Effects: Navigate forward thrusters/floorSpace",
        function: craft,
        args: {
            energy: -10,
            customFunction: function() {
                if (!myItems.distance) myItems.distance = 0;
                // if (typeof myItems.thrusters === "undefined") myItems.thrusters = 1;
                myItems.distance += myItems.thrusters / myItems.floorSpace;
            },
        },
        duration: 10,
        enableOn: function() {return myItems.explore >= 11},
        usable: function() {return haveItems2(this) && myItems.thrusters >= 1},
        maxWorkers: 1,
    },
    {
        name: "BuildCargoContainer",
        tooltip: "Cost: 10 iron, 1 floor space\nEffects: +100 cargo storage",
        function: craft,
        args: {
            iron: -10,
            availableFloorSpace: -1,
            cargoContainers: 1,
        },
        duration: 4,
        enableOn: function() {return myItems.explore >= 9},
        usable: haveItems,
    },
    {
        name: "BuildThruster",
        tooltip: "Cost: 10 iron, 30 silicon, 1 floor space\nEffects 1 thruster",
        function: craft,
        args: {
            iron: -10,
            silicon: -30,
            availableFloorSpace: -1,
            customFunction: function() {
                if (typeof myItems.thrusters === "undefined") myItems.thrusters = 0;
                myItems.thrusters += 1;
                actions[8].args.energy = -10 * myItems.thrusters;
            },
        },
        duration: 10,
        enableOn: function() {return myItems.explore >= 10},
        usable: haveItems,
    },
    {
        name: "ConvertMatterToEnergy",
        tooltip: "Cost: 1 item of your choice\nEffects: 1 energy",
        function: craft,
        args: {
            nothing: -1,
            energy: 1,
        },
        duration: 2,
        enableOn: function() {return myItems.explore >= 7},
        usable: haveItems,
    },
    {
        name: "ExploreShip",
        tooltip: "<i>These corridors go on forever</i>",
        function: craft,
        args: {
            explore: 1,
            customFunction: function() {
                actions[12].duration = 4 + 2 * (myItems.explore+1);
            },
        },
        duration: 4,
        enableOn: function() {return true},
        disableOn: function() {return myItems.explore >= 11},
        usable: function() {return (myItems.explore?myItems.explore:0) < 11},
    },
];

var inventoryDiv = $("#inventory");
var actionsDiv = $("#actions");

var state = null;
var progress = 0;
var workerAssignmentEnabled = false;

function countAssignedWorkers()
{
    let total = 0;
    for (i in actions) {
        action = actions[i];
        if (action.assignedWorkers) total += action.assignedWorkers;
    }
    return total;
}

var maxCargoSpace = 0;
function updateCargoSpace()
{
    maxCargoSpace = 30 + (myItems.cargoContainers?myItems.cargoContainers:0) * 100;
    myItems.availableCargoSpace = maxCargoSpace
        - (myItems.ironOre?myItems.ironOre:0)
        - (myItems.siliconOre?myItems.siliconOre:0)
        - (myItems.iron?myItems.iron:0)
        - (myItems.silicon?myItems.silicon:0)
        - (myItems.deadBodies?myItems.deadBodies:0);

    myItems.availableFloorSpace =
        (myItems.floorSpace?myItems.floorSpace:0)
        - (myItems.solarPanels?myItems.solarPanels:0)
        - (myItems.nutrientStations?myItems.nutrientStations:0)
        - (myItems.cargoContainers?myItems.cargoContainers:0)
        - (myItems.thrusters?myItems.thrusters:0);
}

function updateInventory()
{
    inventoryDiv.empty();
    if (myItems.explore >= 5) inventoryDiv.append("<div>floor space: " + (myItems.floorSpace - myItems.availableFloorSpace) + "/" + myItems.floorSpace + "</div>");
    if (myItems.explore >= 2) inventoryDiv.append("<div>cargo: " + (maxCargoSpace - myItems.availableCargoSpace) + "/" + maxCargoSpace + "</div>");
    if (myItems.explore >= 1) inventoryDiv.append("<div>energy: " + myItems.energy + "/" + myItems.availableEnergyStorage + "</div>");
    inventoryDiv.append("<br />");
    for (item in myItems) {
        if (item != "floorSpace" &&
            item != "availableFloorSpace" &&
            item != "availableEnergyStorage" &&
            item != "energy" &&
            item != "availableCargoSpace" &&
            item != "explore") {
            inventoryDiv.append("<div>" + item + ": " + myItems[item] + "</div>");
        }
    }
}

function updateActions()
{
    for (i in actions) {
        action = actions[i];
        if (!action.enabled && action.enableOn()) action.enabled = true;
        if (action.enabled && !action.disabled && !action.button) {
            let button = $("<button>" + action.name + "</button>");
            actions[i].button = button;
            let action2 = action;
            button.click(function(e){
                if (state != action2) {
                    state = action2;
                    progress = 0;
                }
                updateProgressBar();
            });
            let actionDiv = $("<div class='action'></div>");
            let tooltipDiv = $("<div class='tooltip'><span class='tooltiptext'>" + action.tooltip + "</span></div>");
            actionDiv.append(tooltipDiv);
            tooltipDiv.append(button);
            action.plusButton = $("<button>+</button>");
            action.minusButton = $("<button>-</button>");
            action.workerCountSpan = $("<span>0</span>");
            if (!workerAssignmentEnabled) {
                action.plusButton.hide();
                action.minusButton.hide();
                action.workerCountSpan.hide();
            }
            tooltipDiv.append(action.plusButton);
            tooltipDiv.append(action.minusButton);
            tooltipDiv.append(action.workerCountSpan);
            actionsDiv.append(actionDiv);
            action.actionDiv = actionDiv;
            if (action.name == "ConvertMatterToEnergy") {
                convertDropdown = $("<select id='matter'></select>");
                actionsDiv.append(convertDropdown);
                convertDropdown.append($("<option value='nothing'>Select an item to destroy...</option>"));
                for (i in destroyableItems) {
                    item = destroyableItems[i];
                    convertDropdown.append($("<option value='" + item + "'>" + item + "</option>"));
                }
                convertDropdown.change(function() {
                    actions[11].args = {
                        energy: 1,
                    };
                    actions[11].args[convertDropdown.val()] = -1;
                    updateActions();
                });
            }
            // actionsDiv.append($("<br />"));
            if (!action.assignedWorkers) action.assignedWorkers = 0;
            action.plusButton.click(function(e){
                if (action2.maxWorkers) {
                    let workersPlusPlayer = action2.assignedWorkers;
                    if (state == action2) workersPlusPlayer += 1;
                    if (workersPlusPlayer >= action2.maxWorkers) return;
                }
                if (myItems.crewMembers > countAssignedWorkers()) {
                    action2.assignedWorkers += 1;
                    action2.workerCountSpan.text(action2.assignedWorkers)
                }
                updateActions();
            });
            action.minusButton.click(function(e){
                if (action2.assignedWorkers > 0) {
                    action2.assignedWorkers -= 1;
                    action2.workerCountSpan.text(action2.assignedWorkers)
                }
                updateActions();
            });
        }
            // console.log(action.enabled, action.disableOn);
        if (action.enabled && action.disableOn && action.disableOn()) {
            action.disabled = true;
            action.button = null;
            action.actionDiv.remove();
            action.assignedWorkers = 0;
        }
        if (action.button) {
            let disabled = !action.usable();
            if (action.maxWorkers && action.assignedWorkers >= action.maxWorkers) disabled = true;
            action.button.prop("disabled",disabled);
        }
    }
}

function updateProgressBar()
{
    if (!state) {
        $("#action").text("Resting");
    } else {
        $("#action").text(state.name);
    }
    $("#progress").val(progress);
}

function search(itemsAtLocation)
{
    if (myItems.energy < 2) return;
    updateCargoSpace();
    if (myItems.availableCargoSpace < 1) return;

    myItems.energy -= 2;

    let r = Math.random();
    let r2 = 0;
    let item;
    for (item in itemsAtLocation) {
        r2 += itemsAtLocation[item];
        if (r < r2) break;
    }
    if (!myItems[item]) myItems[item] = 0;
    myItems[item] += 1;
}

function craft(items)
{
    // check if we have all the needed items
    for (item in items) {
        if (item != "customFunction") {
            let amount = items[item];
            if (amount < 0 && !myItems[item] || myItems[item] < -amount) return;
        }
    }

    // update amounts in inventory
    for (item in items) {
        if (item != "customFunction") {
            let amount = items[item];
            if (!myItems[item]) myItems[item] = 0;
            myItems[item] += amount;
        }
    }

    if (items.customFunction) items.customFunction();
}

function killCrewMember()
{
    myItems.crewMembers -= 1;
    for (i in actions) {
        action = actions[i];
        if (action.assignedWorkers > 0) {
            action.assignedWorkers -= 1;
            action.workerCountSpan.text(action.assignedWorkers)
            return;
        }
    }
    if (!myItems.deadBodies) myItems.deadBodies = 0;
    myItems.deadBodies += 1;
}

function enableWorkerAssignment()
{
    workerAssignmentEnabled = true;
    for (i in actions) {
        action = actions[i];
        if (action.plusButton) action.plusButton.show();
        if (action.minusButton) action.minusButton.show();
        if (action.workerCountSpan) action.workerCountSpan.show();
    }
}

$(document).ready(function()
{
    updateInventory();
    updateActions();
    updateProgressBar();

    let intoSecond = 0;

    window.setInterval(function()
    {
        let needToUpdateScreen = false;

        // advance my action
        if (state) {
            progress += 20 / state.duration;
            if (progress >= 100) {
                progress = 0;
                state.function(state.args);
                if (!state.usable()) state = null;
                needToUpdateScreen = true;
            }
        }

        // advance worker actions
        for (i in actions) {
            action = actions[i];
            if (action.assignedWorkers > 0) {
                if (!action.workerProgress) action.workerProgress = 0;
                action.workerProgress += 20 * action.assignedWorkers / action.duration;
                if (action.workerProgress >= 100) {
                    action.workerProgress -= 100;
                    if (action.usable()) {
                        action.function(action.args);
                        needToUpdateScreen = true;
                    }
                }
            }
        }

        intoSecond += 1;
        if (intoSecond >= 5) {
            intoSecond = 0;

            if (myItems.solarPanels) {
                myItems.energy += myItems.solarPanels;
            }
            if (myItems.nutrientStations && myItems.energy >= myItems.nutrientStations) {
                myItems.energy -= myItems.nutrientStations;
                if (!myItems.food) myItems.food = 0;
                myItems.food += myItems.nutrientStations * 2;
            }
            if (myItems.energy > myItems.availableEnergyStorage) myItems.energy = myItems.availableEnergyStorage;
            if (myItems.crewMembers) {
                if (!myItems.food) myItems.food = 0;
                while (myItems.food < myItems.crewMembers) {
                    killCrewMember();
                }
                myItems.food -= myItems.crewMembers;
            }
            needToUpdateScreen = true;
        }

        if (myItems.crewMembers > 0 && !workerAssignmentEnabled) enableWorkerAssignment();

        if (needToUpdateScreen) {
            updateCargoSpace();
            updateInventory();
            updateActions();
        }
        updateProgressBar();
    }, 200);

});
