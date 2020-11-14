const fetch = require('node-fetch');
// Get environment suppliers
const { SUPPLIERS } = JSON.parse(process.env);

const ATTEMPTS = process.env || 2;
const SUPPLIER_TIMEOUT = process.env || 300000;

// List of valid suppliers
const ACTIVE_SUPPLIERS = [];

if (!SUPPLIERS) {
  console.error('No suppliers found in the enviorment.');
}

/**
 * Gets the best supplier for the requested location
 * @param location : User input of a target location
 */
async function serve(location) {
    const best = ACTIVE_SUPPLIERS.map(supplierData =>  {
        return { score : score(supplierData, location), 
                 supplierData };
    })
    .reduce((best, supplier) => {
        return (best.score || Number.MAX_SAFE_INTEGER) > supplier.score ? supplier : best ;
    })
    .supplierData.supplier;

    return best;
}

/**
 * Returns the score of a certain supplier for the target location
 * @param supplierData : A valid object from ACTIVE_SUPPLIERS
 * @param location : Target location
 */
function score(supplierData, location)
{
    const supplier = supplierData.supplier;
    const distance = getDistance(supplier.location, location);
    let score = distance / supplier.speed;

    if(supplierData.responseTime > 60000)
        score += parseInt(supplierData.responseTime / 1000 - 60) * 15;
    
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
    for (const supplier of SUPPLIERS) {
        try 
        {
          const responseTime = await statusCheck(supplier.supplierConnectUrl, 2);  

          ACTIVE_SUPPLIERS.push({
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
