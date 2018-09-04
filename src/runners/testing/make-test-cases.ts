const flags = [
    '--directionWeight',
    '--volatilityWeight',
    '--popularityWeight',
    '--relativeStrengthWeight',
    '--kstWeight',
    '--zachsRatingWeight',
    '--directionWeight',
    '--volatilityWeight',
    '--popularityWeight',
    '--relativeStrengthWeight',
    '--kstWeight',
    '--zachsRatingWeight'
];

// Current Best
console.log('--zachsRatingWeight=0.1 --relativeStrengthWeight=0.1');
console.log('--relativeStrengthWeight=1 --kstWeight=0.01 --wprWeight=0.1');
for (let i = 0; i < 1000; i++) {
    const f1 = getRandomInArr(flags);
    const f2 = getRandomInArr(flags);
    const f3 = getRandomInArr(flags);
    const f4 = getRandomInArr(flags);
    const items = [f1, f2, f3, f4]
    const filtered = items.filter((item, index) => items.findIndex(i2 => isSameFlag(i2, item)) === index);
    console.log(filtered.map(f => `${f}=${Math.random().toFixed(3)}`).join(' '));
}

/*
flags.forEach(flag1 => {
    console.log(flag1);
    flags.filter(f => !isSameFlag(f, flag1)).forEach(flag2 => {
        // console.log(flag1 + ' ' + flag2);
    });
});

flags.forEach(flag1 => {
    flags.filter(f => !isSameFlag(f, flag1)).forEach(flag2 => {
        console.log(flag1 + ' ' + flag2);
        flags.filter(f => !isSameFlag(f, flag1) && !isSameFlag(f, flag2)).forEach(flag3 => {
            // console.log(`${flag1} ${flag2} ${flag3}`);
        });
    });
});
*/

function isSameFlag(f1: string, f2: string): boolean {
    const p1 = f1.split('=')[0];
    const p2 = f2.split('=')[0];
    return p1 === p2;
}

function getRandomInArr<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}
