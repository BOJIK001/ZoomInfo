const fetch = require('node-fetch');
// Get environment suppliers
const { SUPPLIERS } = JSON.parse(process.env);

const ATTEMPTS = process.env || 2;
const SUPPLIER_TIMEOUT = process.env || 5000;

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
    let best = ACTIVE_SUPPLIERS.map(supplier_data =>  {
        return { score : score(supplier_data, location), 
                 supplier_data };
    })
    .reduce((best, supplier) => {
        return (best.score || Number.MAX_SAFE_INTEGER) > supplier.score ? supplier : best ;
    })
    .supplier_data.supplier;

    return best;
}

/**
 * Returns the score of a certain supplier for the target location
 * @param supplier_data : A valid object from ACTIVE_SUPPLIERS
 * @param location : Target location
 */
function score(supplier_data, location)
{
    let supplier = supplier_data.supplier;
    let distance = get_distance(supplier.location, location);
    let score = distance / supplier.speed;

    if(supplier_data.responseTime > 60000)
        score += parseInt(supplier_data.responseTime / 1000 - 60) * 15;
    
    return score;
}

/**
 * Gets the distance between 2 locaions
 */
function get_distance(loc1, loc2)
{
    let x = loc1.x - loc2.x;
    let y = loc1.y - loc2.y;

    return Math.sqrt(x*x + y*y);
}

/**
 * Checks which suppliers are available and their availability time
 * @param {sting} supplier_url : supplierConnectUrl of a supplier
 */
async function status_check(supplier_url) 
{
    //  Try at least 2 times with a 5 seconds timeout
    for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
        
        try {

          const requestTime = Date.now();

          await fetch(`http://${supplier_url}`, { timeout: SUPPLIER_TIMEOUT });
        
          const fetchTime = Date.now();

          return (fetchTime - requestTime);
        } 
        catch (err) { }
    }

    throw new Error(`${supplier_url} status check failed.`);
}

/**
 * Get all the active suppliers
 */
async function select() 
{
    for (const supplier of SUPPLIERS) {
        try 
        {
          const responseTime = await status_check(supplier.supplierConnectUrl, 2);  

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
