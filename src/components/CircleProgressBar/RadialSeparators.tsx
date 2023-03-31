import React from "react";
import _ from "lodash";

function Separator({
  turns,
  style,
}: {
  turns: any;
  style: React.CSSProperties | undefined;
}) {
  return (
    <div
      style={{
        position: "absolute",
        height: "100%",
        transform: `rotate(${turns}turn)`,
      }}
    >
      <div style={style} />
    </div>
  );
}

function RadialSeparators({ count, style }: { count: number; style: any }) {
  const turns = 1 / count;
  return (
    <>
      {_.range(count).map((index) => (
        <Separator turns={index * turns} style={style} />
      ))}
    </>
  );
}

export default RadialSeparators;
