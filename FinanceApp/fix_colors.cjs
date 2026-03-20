const fs = require('fs');

const files = [
  'src/components/Transactions/TransactionModal.jsx',
  'src/components/Settings/ProfileModal.jsx',
  'src/components/Onboarding/OnboardingView.jsx',
  'src/components/Debts/DebtsModule.jsx',
  'src/components/Debts/SimulatorView.jsx',
  'src/components/Debts/StrategyView.jsx',
  'src/components/Debts/DebtModal.jsx',
  'src/App.jsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Regex rules to target input/form CSS styles where color: 'white' is found next to glass border or outline
  content = content.replace(/color:\s*'white',\s*outline/g, "color: 'var(--text-main)', outline");
  content = content.replace(/border:\s*'1px solid var\(--glass-border\)',\s*color:\s*'white'/g, "border: '1px solid var(--glass-border)', color: 'var(--text-main)'");
  content = content.replace(/border: '1px solid var\(--glass-border\)', color: 'white', fontSize/g, "border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontSize");
  
  fs.writeFileSync(f, content);
  console.log('Processed', f);
});
