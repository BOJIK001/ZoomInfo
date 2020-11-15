const fetch = require('node-fetch');
// Get environment suppliers
const SUPPLIERS = process.env.SUPPLIERS;

const ATTEMPTS = process.env.ATTEMPTS || 2;
const SUPPLIER_TIMEOUT = process.env.SUPPLIER_TIMEOUT || 300000;
const TIME_TO_PENALTY = process.env.TIME_TO_PENALTY || 60;
const PENALTY = process.env.PENALTY || 15;

// List of valid suppliers
const activeSuppliers = [];

/**
 * Gets the best supplier for the requested location
 * @param location : User input of a target location
 */
async function serve(location) {
    const best = activeSuppliers.map(supplierData =>
                                        {
                                            return { score : score(supplierData, location), 
                                                     supplierData };
                                        })
    .reduce((best, supplier) => 
        (best.score || Number.MAX_SAFE_INTEGER) > supplier.score ? supplier : best )
    .supplierData.supplier;

    return best;
}

/**
 * Returns the score of a certain supplier for the target location
 * @param supplierData : A valid object from activeSuppliers
 * @param location : Target location
 */
function score(supplierData, location)
{
    const supplier = supplierData.supplier;
    const distance = getDistance(supplier.location, location);
    
    let score = distance / supplier.speed;

    if(supplierData.responseTime > TIME_TO_PENALTY * 1000)
        score += parseInt(supplierData.responseTime / 1000 - TIME_TO_PENALTY) * PENALTY;
    
    return score;
}

/**
 * Gets the distance between 2 locaions
 */
function getDistance(loc1, loc2)
{
    const x = loc1.x - loc2.x;
    const y = loc1.y - loc2.y;

    return Math.sqrt(x*x + y*y);
}

/**
 * Checks which suppliers are available and their availability time
 * @param {sting} supplierUrl : supplierConnectUrl of a supplier
 */
async function statusCheck(supplierUrl) 
{
    //  Try at least 2 times with a 5 minutes timeout
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
        
        try {
          const requestTime = Date.now();
          await fetch(`http://${supplierUrl}`, { timeout: SUPPLIER_TIMEOUT });
          const fetchTime = Date.now();
          return (fetchTime - requestTime);
        } 
        catch (err) { }
    }

    throw new Error(`${supplierUrl} status check failed.`);
}

/**
 * Get all the active suppliers
 */
async function select() 
{
    if (!SUPPLIERS) 
        console.error('No suppliers found in the enviorment.');
    
    for (const supplier of JSON.parse(SUPPLIERS)) {
        try 
        {
          const responseTime = await statusCheck(supplier.supplierConnectUrl, 2);  

          activeSuppliers.push({
            supplier,
            responseTime
          });
        } 
        catch (err) {}
    }
    return serve;
}

module.exports = {
    select
  };
