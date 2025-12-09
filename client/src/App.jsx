import React from "react";
import { useEffect, useState } from "react";
import mqtt from "mqtt";
import { supabase } from "./lib/supabaseClient";

const App = () => {
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState("");

  async function getData() {
    const { data, error } = await supabase.from("Sensor_Data").select("*");

    if (error) console.log(error);
    else {
      console.log(data);
      setData(data);
    }
  }

  useEffect(() => {
    const client = mqtt.connect("ws://broker.hivemq.com:8000/mqtt");

    client.on("connect", () => {
      console.log("Connected to HiveMQ");
      client.subscribe("Yunetrea's ESP testing");
    });

    client.on("message", (topic, message) => {
      console.log(message.toString());
      setMsg(message.toString());
    });

    return () => client.end();
  }, []);

  return (
    // <div className="p-5">
    //   <h1 className="text-3xl font-bold mb-3">Sensor Data</h1>
    //   <pre>{JSON.stringify(data, null, 2)}</pre>
    // </div>
    <div style={{ padding: 20 }}>
      <h1>HiveMQ MQTT Data</h1>
      <p>Message: {msg}</p>
    </div>
  );
};

export default App;
