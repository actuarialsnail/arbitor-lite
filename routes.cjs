const { symbols, exchanges } = require('./config/config.cjs')['scope'];


const expandPermute = (arr) => {
    let result = [];
    arr.forEach((i, idx, array) => {
        let curr = permutator(i);
        result = result.concat(curr);
    });

    return result;
}

const permutator = (inputArr) => {
    let result = [];
    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m)
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next))
            }
        }
    }
    permute(inputArr)
    return result;
}

const numberHopsFilter = (arr) => {
    const minNoHops = 1;
    const maxNoHops = 3;
    let result = [];
    arr.forEach((i, idx, array) => {
        if (i.length > minNoHops && i.length <= maxNoHops) {
            result.push(i);
        }
    })
    return result;
}

const getAllSubsets = theArray => theArray.reduce(
    (subsets, value) => subsets.concat(
        subsets.map(set => [value, ...set])
    ),
    [[]]
);

const symbolSets = expandPermute(numberHopsFilter(getAllSubsets(symbols)));

uniqueSet = []
for (set in symbolSets) {
    unique = true
    temp = symbolSets[set].slice()
    temp.unshift(temp.pop())
    for (let prev = 0; prev < set; prev++) {
        // console.log(symbolSets[prev], temp)
        JSON.stringify(temp) === JSON.stringify(symbolSets[prev]) ? unique = false : null
    }
    unique ? uniqueSet.push(symbolSets[set]) : null
}

// console.log(symbolSets)
// console.log(uniqueSet)

const generateRoutes = (symbols, exchanges, N, array = []) => {
    if (N == 0) {
        return array;
    } //final matrix

    const hops = symbols.length;
    let combined = [];
    const index = (N == 1) ? 0 : hops - N + 1;
    // console.log(symbols[hops - N], symbols[index]);

    for (let e in exchanges) {
        const eName = exchanges[e];
        const ePair = symbols[hops - N] + '-' + symbols[index];
        if (N == hops) {
            combined.push([ePair + '-' + eName]);
            // console.log('1', e, combined)
        } else {
            for (let i in array) {
                let temp = array[i].slice(); //shallow copy required
                // console.log('2', temp, array)
                unique = true
                for (step of temp) {
                    if (step.split('-')[2] == eName) {
                        // console.log('same exchange identified')
                        unique = false
                    }
                }
                temp.push(ePair + '-' + eName)
                unique ? combined.push(temp) : null
                // console.log('3', combined)

            }
        }
    }
    return generateRoutes(symbols, exchanges, N - 1, combined);
};

let routes = [];
uniqueSet.forEach(set => {
    routes.push(...generateRoutes(set, exchanges, set.length));
});

// console.log(routes)

module.exports = { routes };

