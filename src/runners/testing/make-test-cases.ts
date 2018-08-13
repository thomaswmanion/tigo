const flags = [
    '--directionWeight=0.1',
    '--volatilityWeight=0.1',
    '--popularityWeight=0.1',
    '--relativeStrengthWeight=0.1',
    '--kstWeight=0.1',
    '--zachsRatingWeight=0.2',
    '--directionWeight=0.2',
    '--volatilityWeight=0.2',
    '--popularityWeight=0.2',
    '--relativeStrengthWeight=0.2',
    '--kstWeight=0.2',
    '--zachsRatingWeight=0.2'
];

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


function isSameFlag(f1: string, f2: string): boolean {
    const p1 = f1.split('=')[0];
    const p2 = f2.split('=')[0];
    return p1 === p2;
}