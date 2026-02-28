const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/themes/legal/data.json', 'utf8'));
const services = [...data.services];
services.sort((a, b) => {
  if (a.isPopular && !b.isPopular) return -1;
  if (!a.isPopular && b.isPopular) return 1;
  return (a.sortOrder || 0) - (b.sortOrder || 0);
});
console.log('Top 8 services (popular sort):');
services.slice(0, 8).forEach((s, i) => {
  console.log(`${i}: [${s.categorySlug}] ${s.name} (popular:${s.isPopular} sort:${s.sortOrder})`);
});

console.log('\nReference order needed:');
const ref = [
  'LLC Formation', 'EIN for Non-US Residents', 'Amazon Account Reinstatement',
  'Amazon Seller Account Setup', 'TikTok Shop US Setup', 'Form 5472 Filing',
  'US Business Bank Account', 'USPTO Trademark Registration'
];
ref.forEach((name, i) => {
  const found = data.services.find(s => s.name === name);
  console.log(`${i}: ${name} - ${found ? 'FOUND (popular:' + found.isPopular + ' sort:' + found.sortOrder + ')' : 'NOT FOUND'}`);
});
