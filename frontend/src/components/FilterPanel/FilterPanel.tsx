type Props = {
  setOrientation: React.Dispatch<
    React.SetStateAction<"horizontal" | "vertical">
  >;
};

function FilterPanel({ setOrientation }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        alignItems: "center",
        gap: 15,
        padding: 10,
      }}
    >
      <button onClick={() => setOrientation("horizontal")}>Horizontal</button>
      <button onClick={() => setOrientation("vertical")}>Vertical</button>
    </div>
  );
}

export default FilterPanel;
