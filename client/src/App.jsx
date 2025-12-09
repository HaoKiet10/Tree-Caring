import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const App = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function getData() {
      const { data, error } = await supabase.from("Sensor_Data").select("*");

      if (error) console.log(error);
      else {
        console.log(data);
        setData(data);
      }
    }

    getData();
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-3">Sensor Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default App;
