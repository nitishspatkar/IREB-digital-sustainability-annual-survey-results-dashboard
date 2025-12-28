interface ComparisonToggleProps {
  yearsToCompare: string[];
  selectedComparisonYear: string | null;
  onSelectComparisonYear: (year: string | null) => void;
}

const ComparisonToggle = ({
  yearsToCompare,
  selectedComparisonYear,
  onSelectComparisonYear,
}: ComparisonToggleProps) => {
  if (yearsToCompare.length === 0) {
    return null;
  }

  const handleToggle = (year: string) => {
    if (selectedComparisonYear === year) {
      onSelectComparisonYear(null);
    } else {
      onSelectComparisonYear(year);
    }
  };

  return (
    <div className="flex items-center gap-4 font-mori text-sm text-ireb-grey-01 bg-white px-4 py-3 border border-ireb-superlight-berry">
      <span className="text-sm font-bold text-ireb-grey-01">Compare:</span>

      {yearsToCompare.map((year) => (
        <label
          key={year}
          className="flex items-center gap-2 cursor-pointer select-none font-mori text-ireb-grey-01"
        >
          <input
            type="checkbox"
            checked={selectedComparisonYear === year}
            onChange={() => handleToggle(year)}
            className="w-5 h-5 border-2 border-ireb-berry text-ireb-berry focus:ring-ireb-light-berry focus:ring-offset-0 cursor-pointer"
          />
          {year}
        </label>
      ))}
    </div>
  );
};

export default ComparisonToggle;
