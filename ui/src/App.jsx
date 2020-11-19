import React from "react";
import InputForm from "./InputForm";

import "antd/dist/antd.css";
import { Typography } from "antd";
import { blue } from "@ant-design/colors";

const App = () => {
  const { Title } = Typography;

  return (
    <div style={{ backgroundColor: blue[0], height: "100%" }}>
      <Title style={{ textAlign: "center", paddingTop: "1em" }}>Double CE/PE Entry</Title>
      <InputForm />
    </div>
  );
};

export default App;