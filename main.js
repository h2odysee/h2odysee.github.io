var itemsAtLocation = {
    iron: 0.8,
    nickel: 0.1,
    cobalt: 0.1,
};

var myItems = {
    hull: 5,
}

var actions = [
    {
        name: "Mine Asteroid",
        function: search,
        duration: 5,
    },
    {
        name: "Upgrade Hull",
        function: craft,
        args: {
            iron: -1,
            hull: 1,
        },
        duration: 10,
    },
];

var inventoryDiv = $( "#inventory" );
var actionsDiv = $( "#actions" );

var state = null;
var progress = 0;
var duration = 1;
var stateEndFunction = null;
var stateEndFunctionArgs = null;

updateInventory();
updateActions();

function updateInventory()
{
    inventoryDiv.empty();
    for (item in myItems) {
        inventoryDiv.append("<div>" + item + ": " + myItems[item] + "</div>");
    }
}

function updateActions()
{
    actionsDiv.empty();
    for (i in actions) {
        action = actions[i];
        let button = $("<a href='#' id='" + action.name + "Button' class='progress-button' data-loading='" + action.name + "' data-finished='" + action.name + "'>" + action.name + "</a>");
        let action2 = action;
        button.click(function(e){
            if (state != action2.name) {
                state = action2.name;
                progress = 0;
                duration = action2.duration;
                stateEndFunction = action2.function;
                stateEndFunctionArgs = action2.args;
            }
        });
        actionsDiv.append(button);
    }
}

function search()
{
    let r = Math.random();
    let r2 = 0;
    let item;
    for (item in itemsAtLocation) {
        r2 += itemsAtLocation[item];
        if (r < r2) break;
    }
    if (!myItems[item]) myItems[item] = 0;
    myItems[item] += 1;

    updateInventory();
}

function craft(items)
{
    // check if we have all the needed items
    for (item in items) {
        let amount = items[item];
        if (amount < 0 && !myItems[item] || myItems[item] < amount) return;
    }

    // update amounts in inventory
    for (item in items) {
        let amount = items[item];
        if (!myItems[item]) myItems[item] = 0;
        myItems[item] += amount;
    }

    updateInventory();
}

window.setInterval(function()
{
    if (state) {
        progress += 100 / duration;
        $("#" + state + "Button").progressSet(progress);
        if (progress >= 100) {
            progress = 0;
            stateEndFunction(stateEndFunctionArgs);
        }
    }
}, 1000);


$(document).ready(function()
{
    $('.progress-button').progressInitialize();

});
