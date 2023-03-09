import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

export function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const checkApi = async () => {
      try {
        let res = await window.fetch("/api/v1/heartbeat", { method: "GET" });
        console.log(res);
        let json = await res.json();
        console.log(json);
        res = await window.fetch("/api/v1/another_route", { method: "GET" });
        console.log(res);
        json = await res.json();
        console.log(json);
      } catch (err) {
        ;
      }
    };
    checkApi();
  }, []);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
