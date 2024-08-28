import '@cypress/code-coverage/support';

Cypress.on('fail', (error, runnable) => {
  console.error('Test failed:', error);

  throw error;
});
