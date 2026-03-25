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
        alignItems: "center",
        gap: 15,
        padding: 10,
        marginTop: 10,
        marginBottom: 15,
        border: "1px solid grey",
        borderRadius: 10,
      }}
    >
      <button
        style={{ width: "80px" }}
        onClick={() => setOrientation("horizontal")}
      >
        Horizontal
      </button>
      <button
        style={{ width: "80px" }}
        onClick={() => setOrientation("vertical")}
      >
        Vertical
      </button>
    </div>
  );
}

export default FilterPanel;
