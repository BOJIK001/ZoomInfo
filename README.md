Scenario
You have to implement a "supplier" module with one exported function "select". select - choose the best supplier and return his address.

Assumptions
Environment contains list of suppliers that can deliver the same product in the following format: SUPPLIERS = [...{supplierConnectUrl: "domain.com", location: {x: 5, y: 10}, speed: 40, name:"supplier"}]
Not all suppliers respond (and some take time).
The fastest supplier is the one with the shortest delivery time (factor of speed and distance from the input location).
As of a minute after checking availability  at "supplierConnectUrl", there is a penalty of 15 points every 1 second
Requirement
If the supplier does not respond in less than 5 minutes twice, remove it from the list
Find the best supplier by calculating the lowest score - the sum of these 2 variables:
1. fastest delivery.
2.responds in a reasonable time. A penalty of 15 points will be given for every second of waiting for response after the first minute.
Bonus
The serve function will log messages to the console: "Supplier supplier1 is the best"
The implementation should be written at the bonus section and not in the module.
example:

const {select} = require('./supplier');

async function main() {
    const serve = await select();

    // bonus section
    // serve = ....

    await serve({1, 70});
}