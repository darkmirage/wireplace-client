import React from 'react';
import ClientProvider from 'components/ClientProvider';

const HOSTNAME = 'raven-ubuntu';
const PORT = 8000;

function App() {
  return (
    <div className="App">
      WirePlace
      <ClientProvider hostname={HOSTNAME} port={PORT}>
        {({ client }) => (
          <>
            <div>{client ? 'initialized' : 'uninitialized'}</div>
            <div>testing</div>
          </>
        )}
      </ClientProvider>
    </div>
  );
}

export default App;
