import React from 'react';
import ClientProvider from 'components/ClientProvider';
import Spinner from 'components/Spinner';

const HOSTNAME = 'raven-ubuntu';
const PORT = 8000;

function App() {
  return (
    <div className="App">
      WirePlace
      <ClientProvider hostname={HOSTNAME} port={PORT} spinner={<Spinner />}>
        {({ client }) => (
          <div tabIndex={0} onKeyDown={client.handleKeyDown} onKeyUp={client.handleKeyUp}>
            <div>{client ? 'initialized' : 'uninitialized'}</div>
            <div>testing</div>
          </div>
        )}
      </ClientProvider>
    </div>
  );
}

export default App;
