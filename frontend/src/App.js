import logo from './logo.svg';

function App() {
  return (
    <div className="text-center bg-gray-800 min-h-screen flex flex-col items-center justify-center">
      <header className="text-white">
        <img src={logo} className="h-40 w-40 mx-auto animate-spin" alt="logo" />
        <p className="text-lg mt-4">
          Edit <code className="bg-gray-600 px-2 py-1 rounded">src/App.js</code> and save to reload.
        </p>
        <a
          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 inline-block mt-4"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
