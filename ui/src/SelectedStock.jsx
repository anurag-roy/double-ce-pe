import React from "react";
import { Card, Typography } from "antd";

const SelectedStock = ({ input, data }) => {
  const { Title } = Typography;

  let body = <></>;

  if (!data) {
    body = <p>Not a Valid Stock</p>;
  } else {
    body = (
      <>
        <Title level={4}> {data.tradingsymbol}</Title>
        Name: {data.name} <br />
        Expiry Date: {data.expiry.replace("T00:00:00.000Z", "")} <br />
        Strike Price: {data.strike} <br />
        Lot Size: {data.lot_size} <br />
        Instrument Type: {data.instrument_type} <br />
        Exchange: {data.exchange} <br />
        Transaction: {data.transactionType} <br />
        Quantity: {data.quantity}
      </>
    );
  }

  return (
    <Card title={`Selected Stock ${input}:`} style={{ width: 400 }}>
      {body}
    </Card>
  );
};

export default SelectedStock;
