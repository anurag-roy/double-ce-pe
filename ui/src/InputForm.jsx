import React, { useState } from "react";
import { InputNumber, Button, Divider, Result, message } from "antd";
import StockInputForm from "./StockInputForm";
import SelectedStock from "./SelectedStock";
import axios from "axios";

import "./InputForm.css";
import "./StockInputForm.css";

const InputForm = () => {
  const [state, setState] = useState("initial");

  const [stockA, setStockA] = useState();
  const [stockB, setStockB] = useState();
  const [iType, setIType] = useState(localStorage.getItem("iType") || "CE");

  const [entryPrice, setEntryPrice] = useState();

  const proceedButton = () => {
    if (!stockA || !stockB) {
      message.error(
        "One or more invalid stocks selected. Please select valid stocks and try again.",
      );
    } else if (!entryPrice) {
      message.error("Missing entry price. Please input entry price and try again.");
    } else {
      axios
        .post("http://localhost:5000/doubleCEPE", { stockA, stockB, entryPrice })
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
      setState("done");
    }
  };

  if (state === "initial") {
    return (
      <>
        <div className="form_container">
          <Divider />
          <StockInputForm label="A" handleChange={setStockA} iType={iType} changeIType={setIType}/>
          <Divider />
          <StockInputForm label="B" handleChange={setStockB} iType={iType} changeIType={setIType}/>
          <Divider />
          <div className="input_container">
            <Button type="primary" size="large">
              ENTRY PRICE:
            </Button>
            <div className="input_element">
              <InputNumber
                size="large"
                style={{ width: 200 }}
                value={entryPrice}
                min={0}
                onChange={(newValue) => {
                  setEntryPrice(newValue);
                }}
              />
            </div>
          </div>
          <Divider />
        </div>
        <div className="input_container">
          <div className="input_element">
            <SelectedStock input={"A"} data={stockA} />
          </div>
          <div className="input_element">
            <SelectedStock input={"B"} data={stockB} />
          </div>
        </div>
        <div className="input_container">
          <Button type="primary" size="large" onClick={proceedButton}>
            Enter Market
          </Button>
        </div>
      </>
    );
  } else {
    return (
      <>
        <Result status="success" title="Program started." subTitle="Please check console." />
      </>
    );
  }
};

export default InputForm;
