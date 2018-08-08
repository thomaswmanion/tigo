const flags = [
  'directionWeight',
  'volatilityWeight',
  'popularityWeight',
  'relativeStrengthWeight',
  'kstWeight',
  'zachsRatingWeight'
];

flags.forEach(flag1 => {
  console.log(`--${flag1}=1`);
  flags.filter(f => f !== flag1).forEach(flag2 => {
    console.log(`--${flag1}=1 --${flag2}=0.1`);
  });
});

flags.forEach(flag1 => {
  flags.filter(f => f !== flag1).forEach(flag2 => {
    flags.filter(f => f !== flag1 && f !== flag2).forEach(flag3 => {
      console.log(`--${flag1}=1 --${flag2}=0.5 --${flag3}=0.1`);
    });
  });
});
